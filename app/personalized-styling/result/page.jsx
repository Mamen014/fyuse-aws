// app/personalized-styling/result/page.jsx

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';

import PricingPlans from '@/components/PricingPlanCard';
import LoadingModalSpinner from '@/components/ui/LoadingState';

const PLAN_LIMITS = {
  basic: { tryOn: 10 },
  elegant: { tryOn: 20 },
  glamour: { tryOn: 40 },
};

export default function AutoTryOnRecommendationPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const token = user?.id_token || user?.access_token;
  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  const controllerRef = useRef(null);
  const cleanupRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [, setIsPolling] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPricingPlans, setShowPricingPlans] = useState(false);
  const [product, setProduct] = useState(null);
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const resetState = () => {
    setProduct(null);
    setResultImageUrl(null);
    setError(null);
    setShowPricingPlans(false);
    setIsPolling(false);
    sessionStorage.removeItem('currentTaskId');
    sessionStorage.removeItem('recommendedProduct');
  };

  const fetchUserPlan = useCallback(async () => {
    try {
      const res = await axios.get('/api/subscription-status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { plan, successful_stylings } = res.data;
      return { plan, tryOnCount: successful_stylings };
    } catch (err) {
      console.error('Failed to fetch subscription plan:', err);
      return { plan: 'basic', tryOnCount: 0 };
    }
  }, [token]);

  const fetchRecommendation = useCallback(async () => {
    const res = await fetch('/api/recommend-product', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!data?.productId) throw new Error('No recommendation found.');
    setProduct(data);
    sessionStorage.setItem('recommendedProduct', JSON.stringify(data));
    return data;
  }, [token]);

  const initiateTryOn = useCallback(async () => {
    const res = await fetch('/api/tryon', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Try-on failed.');
    }

    const { task_id } = await res.json();
    if (!task_id) throw new Error('Missing task ID.');
    sessionStorage.setItem('currentTaskId', task_id);
    return task_id;
  }, [token]);

  const pollTaskStatus = useCallback((taskId, controller) => {
    setIsPolling(true);
    let attempts = 0;
    const maxAttempts = 20;
    const max404Retries = 3; // ✅ Soft retry for 404
    const interval = 5000;
    const signal = controller.signal;

    const poll = async () => {
      try {
        const res = await fetch(`/api/tryon/status?task_id=${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        });

        if (res.status === 404 && attempts < max404Retries) {
          console.warn("🔁 Got 404, retrying...");
          attempts++;
          return setTimeout(poll, interval);
        }

        if (!res.ok) {
          throw new Error(`Polling failed: ${res.status}`);
        }

        const data = await res.json();
        const { status, styling_image_url } = data;

        if (status === "succeed" && styling_image_url) {
          setResultImageUrl(styling_image_url);
          setIsPolling(false);
          setLoading(false);
          toast.success("Style added to wardrobe!");
          return;
        }

        if (++attempts < maxAttempts) {
          setTimeout(poll, interval);
        } else {
          setIsPolling(false);
          setLoading(false);
          toast.error("Try-on timed out.");
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Polling error:", err);
        setIsPolling(false);
        setLoading(false);
        toast.error("Polling failed.");
      }
    };

    poll();
  }, [token]);

  const track = async (action, metadata = {}) => {
    if (!userEmail) return;
    try {
      await axios.post(`${API_BASE_URL}/trackevent`, {
        userEmail,
        action,
        page: 'resultPage',
        timestamp: new Date().toISOString(),
        ...metadata,
      });
    } catch (err) {
      console.warn('Tracking failed:', err.message);
    }
  };

  const trackPersonalizeEvent = async ({ userId, itemId, eventType, liked }) => {
    try {
      await fetch(`${API_BASE_URL}/stylingRecTrack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId: `session-${Date.now()}`,
          itemId,
          eventType,
          liked,
        }),
      });
    } catch (err) {
      console.warn('Event track failed:', err);
    }
  };

  const handleFlow = useCallback(async () => {
    try {
      controllerRef.current = new AbortController();
      const { plan, tryOnCount } = await fetchUserPlan();

      if (tryOnCount >= PLAN_LIMITS[plan].tryOn) {
        toast('Monthly try-on limit reached. Please upgrade.', { icon: '⚠️' });
        setShowPricingPlans(true);
        setLoading(false);
        return;
      }

      const recommendation = await fetchRecommendation();
      const taskId = await initiateTryOn(recommendation.imageS3Url);

      // ✅ Delay before polling to let callback update DB
      await new Promise((res) => setTimeout(res, 1000));

      cleanupRef.current = pollTaskStatus(taskId, controllerRef.current);
    } catch (err) {
      if (controllerRef.current?.signal.aborted) return;
      setError(err.message || 'Unexpected error');
      setLoading(false);
    }
  }, [fetchUserPlan, fetchRecommendation, initiateTryOn, pollTaskStatus]);

  useEffect(() => {
    if (isLoading || !token) return;

    controllerRef.current = new AbortController();

    const savedTaskId = sessionStorage.getItem('currentTaskId');
    const savedProduct = sessionStorage.getItem('recommendedProduct');

    if (savedProduct) setProduct(JSON.parse(savedProduct));

    if (savedTaskId && !resultImageUrl) {
      cleanupRef.current = pollTaskStatus(savedTaskId, controllerRef.current);
    } else {
      handleFlow();
    }

    return () => {
      controllerRef.current?.abort();
      cleanupRef.current?.();
    };
  }, [isLoading, token, handleFlow, pollTaskStatus, resultImageUrl]);

  // UI Rendering
  if (isLoading || loading)
    return <LoadingModalSpinner message="Styling..." subMessage="This process only takes 30 seconds." />;

  if (error)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="mb-6">{error}</p>
        <button onClick={() => router.push('/dashboard')} className="bg-primary text-white">
          Back to Dashboard
        </button>
      </div>
    );

  if (showPricingPlans)
    return (
      <PricingPlans
        isOpen
        onClose={() => setShowPricingPlans(false)}
        onSelect={(plan) => console.log('Plan selected:', plan)}
        sourcePage="resultPage"
      />
    );

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-b from-blue-50 to-white flex flex-col items-center">
      <Toaster position="top-center" />

      <div className="max-w-6xl w-full">
        <h1 className="text-3xl font-bold text-primary text-center mb-2">Your Perfect Look</h1>
        <p className="text-gray-600 text-center mb-8">This style has been added to your wardrobe</p>

        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="md:w-1/2 w-full">
            <div className="relative rounded-2xl shadow-2xl overflow-hidden">
              {resultImageUrl ? (
                <Image
                  src={resultImageUrl}
                  alt="Try-On Result"
                  width={800}
                  height={600}
                  className="w-full object-cover max-h-[600px]"
                  priority
                  unoptimized
                />
              ) : (
                <div className="w-full h-96 flex justify-center items-center bg-gray-100 text-sm text-gray-500">
                  Generating your look...
                </div>
              )}
              <div className="absolute top-4 right-4 bg-white/90 text-primary px-3 py-1 rounded-full text-sm font-medium">
                Perfect Match
              </div>
            </div>
          </div>

          {product && (
            <div className="md:w-1/2 w-full">
              <h2 className="text-xl font-semibold text-primary mb-4 text-center md:text-left">Original Product</h2>
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <Image
                  src={product.imageS3Url}
                  alt={product.productName}
                  width={800}
                  height={600}
                  className="w-full max-h-[400px] object-contain rounded-xl mb-4"
                  unoptimized
                />
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-bold">{product.productName}</h3>
                  <p className="text-gray-600">{product.brand}</p>
                  {product.productLink && (
                    <a
                      href={product.productLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackPersonalizeEvent({
                          userId: userEmail,
                          itemId: product.productId,
                          eventType: 'view_product',
                          liked: true,
                        })
                      }
                      className="inline-block mt-3 text-white bg-primary hover:bg-[#0a1a57] px-4 py-2 rounded-full"
                    >
                      View Product
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-md mx-auto space-y-4">
          {resultImageUrl && (
            <button
              onClick={async () => {
                setIsDownloading(true);
                track('download_look', { selection: resultImageUrl });
                trackPersonalizeEvent({
                  userId: userEmail,
                  itemId: product?.productId,
                  eventType: 'download',
                  liked: true,
                });
                try {
                  const res = await fetch(resultImageUrl);
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'your-look.jpg';
                  a.click();
                  URL.revokeObjectURL(url);
                } catch {
                  toast.error('Download failed');
                } finally {
                  setIsDownloading(false);
                }
              }}
              className="w-full py-3 rounded-full text-white font-semibold bg-green-600 hover:bg-green-700"
            >
              {isDownloading ? 'Downloading...' : 'Download Your Look'}
            </button>
          )}

          <button
            disabled={loading}
            onClick={async () => {
              trackPersonalizeEvent({
                userId: userEmail,
                itemId: product?.productId,
                eventType: 'retry',
                liked: false,
              });
              setLoading(true);
              resetState();
              await handleFlow();
            }}
            className={`w-full py-3 rounded-full font-semibold border-2 ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'text-primary border-primary hover:bg-primary/10'
            }`}
          >
            {loading ? 'Loading...' : 'Try Another Style'}
          </button>

          <button
            onClick={() => {
              trackPersonalizeEvent({
                userId: userEmail,
                itemId: product?.productId,
                eventType: 'back_dashboard',
                liked: false,
              });
              resetState();
              setLoading(true);
              router.push('/dashboard');
            }}
            className="w-full py-3 rounded-full font-semibold bg-white border text-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
