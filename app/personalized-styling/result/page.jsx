'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import PricingPlans from '@/components/PricingPlanCard';
import LoadingModalSpinner from '@/components/ui/LoadingState';

export default function AutoTryOnRecommendationPage() {
  const router = useRouter();
  const auth = useAuth();
  const userEmail = auth?.user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  const [product, setProduct] = useState(null);
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [showPricingPlans, setShowPricingPlans] = useState(false);
  const [tryOnCount, setTryOnCount] = useState(0);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [subsDate, setSubsDate] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  const PLAN_LIMITS = {
    Basic: { tryOn: 5 },
    Elegant: { tryOn: 20 },
    Glamour: { tryOn: 40 },
  };

  const resetState = () => {
    setProduct(null);
    setResultImageUrl(null);
    setError(null);
    setShowPricingPlans(false);
    setIsPolling(false);
    sessionStorage.removeItem('currentTaskId');
    sessionStorage.removeItem('recommendedProduct');
  };

  const getActivePlan = () => {
    if (!subscriptionPlan || !subsDate) return 'Basic';
    const parsedDate = new Date(subsDate);
    if (isNaN(parsedDate)) return 'Basic';
    const diff = (Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 30 ? 'Basic' : subscriptionPlan;
  };

  const fetchUserPlan = async () => {
    const res = await axios.get(`${API_BASE_URL}/userPlan?userEmail=${userEmail}`);
    const { plan, subsDate, tryOnCount } = res.data;

    if (!plan || !subsDate) throw new Error("Invalid plan response");

    setSubscriptionPlan(plan);
    setSubsDate(subsDate);
    setTryOnCount(tryOnCount || 0);

    return {
      plan,
      subsDate,
      tryOnCount: tryOnCount || 0,
    };
  };

  const fetchRecommendation = async () => {
    const res = await axios.post(`${API_BASE_URL}/StyleRec`, { userEmail });
    const data = res.data;
    if (data?.productId) {
      setProduct(data);
      sessionStorage.setItem('recommendedProduct', JSON.stringify(data));
      return data;
    } else {
      throw new Error('No recommendation found.');
    }
  };

  const initiateTryOn = async (apparelImage) => {
    const userImage = localStorage.getItem('user_image');
    if (!userImage || !apparelImage) throw new Error('Missing images.');

    const res = await axios.post(`${API_BASE_URL}/tryon-image`, {
      person_image_url: userImage,
      garment_image_url: apparelImage,
      userEmail,
    });

    const taskId = res.data?.taskId;
    sessionStorage.setItem('currentTaskId', taskId);
    return taskId;
  };

  const pollTryOnResult = (taskId) => {
    setIsPolling(true);
    let attempts = 0;
    const maxAttempts = 12;

    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setIsPolling(false);
        toast.error("Try-on is taking too long. Please try again.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/process-tryon-result?taskId=${taskId}`);
        const data = res.data;
        if (data.status === 'succeed') {
          clearInterval(interval);
          setResultImageUrl(data.generatedImageUrl);
          setIsPolling(false);
          setLoading(false);
          toast.success('Style added to wardrobe!');
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setIsPolling(false);
          setError(data.errorMessage || 'Try-on failed.');
          setLoading(false);
          toast.error(data.errorMessage || 'Try-on failed.');
        }
      } catch (err) {
        clearInterval(interval);
        setIsPolling(false);
        setError(err.message || 'Polling failed.');
        setLoading(false);
        toast.error(err.message || 'Polling failed.');
      }
    }, 5000);
  };

  const handleFullFlow = async () => {
    try {
      const { plan, tryOnCount } = await fetchUserPlan();
      if (tryOnCount >= PLAN_LIMITS[plan].tryOn) {
        setShowPricingPlans(true);
        setLoading(false);
        toast('You have reached your monthly limit. Please upgrade.', {
          icon: '⚠️',
          duration: 6000,
        });
        return;
      }

      const recommendation = await fetchRecommendation();
      const taskId = await initiateTryOn(recommendation.imageS3Url);
      pollTryOnResult(taskId);
    } catch (err) {
      console.error('Retry flow error:', err);
      setError(err.message || 'Unexpected error occurred.');
      setLoading(false);
    }
  };

  const track = async (action, metadata = {}) => {
    if (!userEmail) return;
    try {
      await axios.post(`${API_BASE_URL}/trackevent`, {
        userEmail,
        action,
        timestamp: new Date().toISOString(),
        page: 'TryOnResult',
        ...metadata,
      });
    } catch (err) {
      console.error('Tracking failed:', err.message);
    }
  };

  const trackPersonalizeEvent = ({ userId, itemId, eventType, liked }) => {
    fetch(`${API_BASE_URL}/trackevent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: userId,
        action: `personalize-${eventType}`,
        itemId,
        liked,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  };

  useEffect(() => {
    if (!userEmail) {
      setError('You must be signed in to use this feature.');
      setLoading(false);
      return;
    }

    const startFlow = async () => {
      try {
        const { plan, tryOnCount } = await fetchUserPlan();
        if (tryOnCount >= PLAN_LIMITS[plan].tryOn) {
          setShowPricingPlans(true);
          setLoading(false);
          toast('You have reached your monthly limit. Please upgrade.', {
            icon: '⚠️',
            duration: 6000,
          });
          return;
        }

        const savedTaskId = sessionStorage.getItem('currentTaskId');
        const savedProduct = sessionStorage.getItem('recommendedProduct');

        if (savedProduct) {
          setProduct(JSON.parse(savedProduct));
        }

        if (savedTaskId && !resultImageUrl) {
          pollTryOnResult(savedTaskId);
        } else {
          const recommendation = await fetchRecommendation();
          const taskId = await initiateTryOn(recommendation.imageS3Url);
          pollTryOnResult(taskId);
        }
      } catch (err) {
        console.error('Flow error:', err);
        setError(err.message || 'Unexpected error occurred.');
        setLoading(false);
      }
    };

    startFlow();
  }, [userEmail]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !resultImageUrl && !loading && !isPolling) {
        window.location.reload();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [resultImageUrl, loading, isPolling]);

  if (loading) return <LoadingModalSpinner message="Styling..." subMessage="This process only takes 30 seconds." />;

  if (showPricingPlans && subscriptionPlan !== null && tryOnCount !== null) {
    return (
      <PricingPlans
        isOpen={showPricingPlans}
        onClose={() => setShowPricingPlans(false)}
        onSelect={(plan) => {
          console.log('Plan selected:', plan);
        }}
        sourcePage="result"
      />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <button onClick={() => router.push('/dashboard')} className="bg-primary text-white px-6 py-2 rounded-md">
          Back To Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8 flex flex-col items-center justify-center">
      <Toaster position="top-center" />

      <div className="w-full max-w-6xl mx-auto px-4">
        <h1 className="text-primary text-3xl font-bold mb-3 text-center">Your Perfect Look</h1>
        <p className="text-gray-600 text-center mb-8">This style has been added to your wardrobe</p>

        <div className="flex flex-col md:flex-row gap-8 w-full items-start mb-12">
          <div className="w-full md:w-1/2">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {resultImageUrl ? (
                <img
                  src={resultImageUrl}
                  alt="Try-On Result"
                  className="w-full object-cover max-h-[600px]"
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                  Generating your look...
                </div>
              )}
              <div className="absolute top-4 right-4 bg-white/90 text-primary px-3 py-1 rounded-full text-sm font-medium">
                Perfect Match
              </div>
            </div>
          </div>

          {product && (
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold text-primary mb-4 text-center md:text-left">Original Product</h2>
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <img
                  src={product.imageS3Url}
                  className="w-full max-h-[400px] object-contain rounded-xl mb-4"
                />
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-bold">{product.productName}</h3>
                  <p className="text-gray-600">{product.brand}</p>
                  {product.productLink && (
                    <a
                      href={product.productLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        trackPersonalizeEvent({
                          userId: userEmail,
                          itemId: product.productId,
                          eventType: 'view_product',
                          liked: true
                        });
                      }}
                      className="inline-block mt-3 text-white bg-[#0B1F63] hover:bg-[#0a1a57] px-4 py-2 rounded-full"
                    >
                      View Product
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-md space-y-4 mx-auto">
          {resultImageUrl && (
            <button
              onClick={async () => {
                setIsDownloading(true);
                track('Download Look', { selection: resultImageUrl });
                trackPersonalizeEvent({
                  userId: userEmail,
                  itemId: product?.productId,
                  eventType: 'download',
                  liked: true
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
                  toast.error("Download failed");
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
              if (loading) return;
              trackPersonalizeEvent({
                userId: userEmail,
                itemId: product?.productId,
                eventType: 'retry',
                liked: false
              });
              setLoading(true);
              resetState();
              await handleFullFlow();
            }}
            className={`w-full py-3 rounded-full font-semibold border-2 ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'text-primary border-primary hover:bg-primary/5'
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
                liked: false
              });
              sessionStorage.removeItem('currentTaskId');
              sessionStorage.removeItem('recommendedProduct');
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
