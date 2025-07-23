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
  const pollingLogId = useRef(null);
  const hasShownToast = useRef(false);
  const isHandlingFlow = useRef(false);
  const debounceTimeout = useRef(null);
  const initialRun = useRef(false);

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
    hasShownToast.current = false;
    sessionStorage.removeItem('currentLogId');
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

  const initiateTryOn = useCallback(async (item_id) => {
    const res = await fetch('/api/tryon', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({ item_id }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Try-on failed.');
    }

    const { log_id } = await res.json();
    if (!log_id) throw new Error('Missing log ID.');
    sessionStorage.setItem('currentLogId', log_id);
    return log_id;
  }, [token]);

  const pollTaskStatus = useCallback((logId, controller) => {
    setIsPolling(true);
    let attempts = 0;
    const maxAttempts = 20;
    const max404Retries = 3;
    const interval = 5000;
    const signal = controller.signal;

    const poll = async () => {

      if (logId !== sessionStorage.getItem('currentLogId')) {
        console.warn('Stale task result, ignoring');
        return;
      }

      try {
        const res = await fetch(`/api/tryon/status?log_id=${logId}`, {
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
          if (!resultImageUrl) {
            setResultImageUrl(styling_image_url);
          };

          if (!hasShownToast.current) {
            toast.success("Style added to wardrobe!");
            hasShownToast.current = true;
          };

          setIsPolling(false);
          setLoading(false);        
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

  const handleFlow = useCallback(async (isManual = false) => {
    if (isHandlingFlow.current) {
      console.log("⛔ Blocked: already handling");
      return;
    }

    console.log("⚙️ Starting handleFlow");
    isHandlingFlow.current = true;
    setLoading(true);
    clearTimeout(debounceTimeout.current);

    try {
      controllerRef.current = new AbortController();
      const { plan, tryOnCount } = await fetchUserPlan();
      console.log("📦 Plan:", plan, "Try-on count:", tryOnCount);

      if (tryOnCount >= PLAN_LIMITS[plan].tryOn) {
        console.log("🚫 Plan limit reached");
        setShowPricingPlans(true);
        setLoading(false);
        return;
      }

      const recommendation = await fetchRecommendation();
      console.log("🧠 Recommendation received:", recommendation);

      const logId = await initiateTryOn(recommendation.productId);
      console.log("🪪 Try-on task started with logId:", logId);

      if (!logId) throw new Error("Try-on initiation failed");

      await new Promise(res => setTimeout(res, 1000));
      cleanupRef.current = pollTaskStatus(logId, controllerRef.current);
    } catch (err) {
      if (controllerRef.current?.signal.aborted) return;
      console.error("❌ handleFlow error:", err);
      setError(err.message || 'Unexpected error');
      setLoading(false);
    } finally {
      setIsPolling(false);
      isHandlingFlow.current = false; // ✅ CRUCIAL
    }
  }, [fetchUserPlan, fetchRecommendation, initiateTryOn, pollTaskStatus]);

  useEffect(() => {
    console.log("isLoading:", isLoading);
    console.log("token:", token);
    console.log("initialRun:", initialRun.current);

    if (isLoading) return;
    if (!token) return;
    if (initialRun.current) return;

    console.log("✅ Running handleFlow...");
    initialRun.current = true;

    controllerRef.current = new AbortController();
    const savedLogId = sessionStorage.getItem("currentLogId");
    const savedProduct = sessionStorage.getItem("recommendedProduct");

    if (savedProduct) setProduct(JSON.parse(savedProduct));

    if (savedLogId && pollingLogId.current !== savedLogId && !resultImageUrl) {
      pollingLogId.current = savedLogId;
      cleanupRef.current = pollTaskStatus(savedLogId, controllerRef.current);
    } else if (!savedLogId && !resultImageUrl) {
      debounceTimeout.current = setTimeout(() => {
        handleFlow();
      }, 300);
    }

    return () => {
      controllerRef.current?.abort();
      cleanupRef.current?.();
      clearTimeout(debounceTimeout.current);
    };
  }, [isLoading, token, handleFlow, pollTaskStatus, resultImageUrl]);

  // UI Rendering
  if (isLoading || loading)
    return <LoadingModalSpinner message="Styling..." subMessage="This process only takes 30 seconds." />;
  if (!product || !resultImageUrl) {
    return <LoadingModalSpinner message="Styling..." subMessage="Please wait..." />;
  }


  if (error && !product && !resultImageUrl)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="mb-6">{error}</p>
        <button onClick={() => router.push('/dashboard')} className="bg-primary text-white rounded-md">
          Back to Dashboard
        </button>
      </div>
    );

  if (showPricingPlans)
    return (
      <PricingPlans
        isOpen
        onClose={() => setShowPricingPlans(false)}
        sourcePage="resultPage"
      />
    );

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-b from-blue-50 to-white flex flex-col items-center">
      <Toaster position="top-center" />

      <div className="max-w-6xl w-full">
        <h1 className="text-3xl font-bold text-primary text-center mb-2">Your Perfect Look</h1>
        <p className="text-gray-600 text-center mb-8">This style has been added to your wardrobe</p>

        {/* Images */}
        <div className="flex flex-col md:flex-row gap-8 mb-12 items-stretch">
          {/* Left: Try-On Result */}
          <div className="md:w-1/2 w-full flex">
            <div className="relative rounded-2xl shadow-2xl overflow-hidden w-full aspect-[3/4]">
              {resultImageUrl ? (
                <Image
                  src={resultImageUrl}
                  alt="Try-On Result"
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex justify-center items-center bg-gray-100 text-sm text-gray-500">
                  Not available
                </div>
              )}
              <div className="absolute top-4 right-4 bg-white/90 text-primary px-3 py-1 rounded-full text-sm font-medium">
                Perfect Match
              </div>
            </div>
          </div>

          {product ? (
            <>
              {/* Product JSX block here */}
              {/* Right: Product Info */}
              <div className="md:w-1/2 w-full flex">
                <div className="rounded-2xl p-6 shadow-2xl w-full flex flex-col">

                  {/* Product Image */}
                  <div className="relative w-full aspect-[3/4]">
                    {product?.imageS3Url ? (
                      <Image
                        src={product.imageS3Url}
                        alt={product.productName || 'Product'}
                        fill
                        className="object-cover rounded-xl"
                        priority
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex justify-center items-center bg-gray-100 text-sm text-gray-500">
                        Loading product...
                      </div>
                    )}

                  </div>

                  {/* Product Detail */}
                  <div className="flex flex-col md:flex md:flex-row justify-between mt-4">

                    {/* Detail Info */}
                    <div className="flex flex-col text-left">
                      <div className="font-bold mb-4">
                        <h3>{product?.productName || "loading..."}</h3>
                      </div>
                      <div>
                        {product?.brand ? (
                          <Image
                            src={`/images/brand-logo/${product?.brand}.png`}
                            alt="Brand Icon"
                            width={64}
                            height={64}
                            className='inline-block mr-2 mb-4'
                          />
                        ) : (
                          <div className="text-sm text-gray-400">Loading...</div>
                        )}

                      </div>
                    </div>

                    {/* Product Links */}
                    <div className="flex flex-row md:flex md:flex-col text-left md:justify-center md:text-center gap-3">
                      
                      {/* Preview Button */}                
                      {product?.imageS3Url && (
                        <a
                          href={product.imageS3Url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary bg-white border border-primary hover:bg-primary/10 px-4 py-2 rounded-full"
                        >
                          Preview
                        </a>
                      )}                  

                      {/* Download Button */}
                      {resultImageUrl && (
                        <button
                          onClick={ async () => {
                            setIsDownloading(true);
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
                          className="w-full py-2 rounded-full text-primary bg-background hover:bg-primary/10 border border-primary"
                        >
                          {isDownloading ? 'Downloading...' : 'Download'}
                        </button>
                      )}

                      {/* Purchase Button */}
                      {product?.productLink && (
                        <a
                          href={product.productLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white bg-primary hover:bg-primary/80 px-4 py-2 rounded-full"
                        >
                          Purchase
                        </a>
                      )}
                    
                    </div>
                  
                  </div>

                </div>
              </div>              
            </>
          ) : (
            <div className="w-full text-center py-12 text-gray-500">Preparing your product...</div>
          )}

        </div>

        {/* Button */}
        <div className="w-full max-w-6xl mx-auto space-y-4">
          
          {/* Try Another Style Button */}
          <button
            disabled={loading}
            onClick={() => {
              if (loading) return;
              resetState();
              cleanupRef.current?.();
              debounceTimeout.current = setTimeout(() => {
                handleFlow(true);
              }, 300);
            }}
            className={`text-white bg-primary w-full py-3 rounded-full font-semibold ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'text-primary border-primary hover:bg-primary/80'
            }`}
          >
            {loading ? 'Loading...' : 'Try Another Style'}
          </button>
          
          {/* Back to Dashboard Button */}
          <button
            onClick={() => {
              resetState();
              setLoading(true);
              router.push('/dashboard');
            }}
            className={`w-full py-3 rounded-full font-semibold bg-white border text-primary ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'text-primary border-primary hover:bg-primary/10'
            }`}
          >
            Back to Dashboard
          </button>
        
        </div>
      </div>
    </div>
  );
}
