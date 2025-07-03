'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import PricingPlans from '@/components/PricingPlanCard';
import LoadingModalSpinner from '@/components/ui/LoadingState';

export default function RecommendedProductPage() {
  const router = useRouter();
  const auth = useAuth();
  const userEmail = auth?.user?.profile?.email;

  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;
  const PLAN_LIMITS = {
  Basic: { tryOn: 10, tips: 20 },
  Elegant: { tryOn: 20, tips: 40 },
  Pro: { tryOn: 40, tips: 60 },
  };

  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [subsDate, setSubsDate] = useState(null);
  const [product, setProduct] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPricingPlans, setShowPricingPlans] = useState(false);
  const [tryOnCount, setTryOnCount] = useState(0);
  const [tipsCount, setTipsCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/userPlan?userEmail=${userEmail}`);
        const planupdate = res.data.plan;
        const startsubs = res.data.subsDate;
        const updatedCount = res.data.tryOnCount || 0;
        const count = res.data.tipsCount || 0;
        setTipsCount(count);
        setTryOnCount(updatedCount);
        setSubscriptionPlan(planupdate);
        setSubsDate(startsubs);
      } catch (err) {
        console.error("Failed to fetch subscription plan:", err);
      }
    };

    if (userEmail && !hasFetchedRef.current) {
      fetchUserPlan();
    }
  }, [userEmail]);

  // Track user events
  const handleTrack = async (action, metadata = {}) => {
    if (!userEmail) return;
    
    const payload = {
      userEmail,
      action,
      timestamp: new Date().toISOString(),
      page: "RecommendedProductPage",
      ...metadata,
    };

    try {
      await axios.post(`${API_BASE_URL}/trackevent`, payload);
    } catch (err) {
      console.error("Failed to track event:", err);
    }
  };

  // ========== Utility Functions ==========

  const getActivePlan = () => {
    if (!subscriptionPlan || subscriptionPlan === "Basic" || !subsDate) {
      return "Basic";
    }

    const subscribedDate = new Date(subsDate);
    const now = new Date();
    const diffInDays = Math.floor((now - subscribedDate) / (1000 * 60 * 60 * 24));
    if (diffInDays > 30) {
      return "Basic";
    }

    return subscriptionPlan;
  };

  const updateTipsCount = async () => {
    try {
      await axios.post(`${API_BASE_URL}/postTIpsTrack`, {
        userEmail,
      });
    } catch (err) {
      console.error("Failed to update tips count", err);
    }
  }; 
  const fetchProduct = async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/StyleRec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: email }),
      });
      const data = await res.json();
      if (data && typeof data === 'object' && data.productId) {
        setProduct(data);
        await updateTipsCount();
      } else {
        setProduct(null);
        toast.error('No style recommendation found. Please update your preferences.', {
          duration: 3000,
        });
        setTimeout(() => {
          router.push('/style-discovery/personalized-styling/style-preferences');
        }, 3200);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTipsCountAndMaybeProduct = async (email) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/getTipsTrack?userEmail=${email}`);
      const count = res.data.tipsCount || 0;
      setTipsCount(count);

      const activePlan = getActivePlan();
      if (count >= PLAN_LIMITS[activePlan]?.tips) {
        setShowPricingPlans(true);
        setLoading(false);
        toast("You've reached monthly limit, please upgrade your plan", {
          icon: "⚠️",
          duration: 4000,
        });
      } else {
        await fetchProduct(email);
      }
    } catch (err) {
      console.error('Error fetching tips count:', err);
    }
  };

  const logAndStoreImageS3Url = (productObj) => {
    if (productObj?.imageS3Url) {
      localStorage.setItem('apparel_image', productObj.imageS3Url);
    }
  };

  const trackPersonalizeEvent = async ({ userId, itemId, eventType, liked }) => {
    const sessionId = `session-${Date.now()}`;
    try {
      await fetch(`${API_BASE_URL}/stylingRecTrack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId, itemId, eventType, liked }),
      });
    } catch (err) {
      console.error('Failed to track personalize event:', err);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const activePlan = getActivePlan();
    if (tryOnCount >= PLAN_LIMITS[activePlan]?.tryOn) {
      setShowPricingPlans(true);
      setLoading(false);
      setSubmitStatus('limit');
      toast("You've reached monthly limit, please upgrade your plan", {
        icon: "⚠️",
        duration: 4000,
      });
      return 'limit';
    }

    setIsSubmitting(true);
    setError(null);
    setSubmitStatus(null);
    logAndStoreImageS3Url(product);

    const userImage = localStorage.getItem('user_image');
    const apparelImage = localStorage.getItem('apparel_image');

    if (!userImage || !apparelImage) {
      setError('Missing user or apparel image.');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return 'error';
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/tryon-image`, {
        person_image_url: userImage,
        garment_image_url: apparelImage,
        userEmail,
      });

      if (response?.data?.taskId) {
        const taskId = response.data.taskId;
        setTaskId(taskId);
        localStorage.setItem('taskId', taskId);
        setSubmitStatus('success');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during virtual try-on.');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return 'error';
    }

    setIsSubmitting(false);
    return 'success';
  };

  // ========== Effect Hook ==========

  useEffect(() => {
    const init = async () => {
      if (!userEmail || !subscriptionPlan || hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      await fetchTipsCountAndMaybeProduct(userEmail);
    };

    init();
  }, [userEmail, subscriptionPlan]);


  // ========== JSX ==========

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      <main className="bg-background w-full max-w-4xl mx-auto px-6 pt-20 md:pt-24 pb-12 space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-100">Personalized Style</h1>
          <p className="text-primary-300 mt-2">Your style recommendation</p>
        </header>

        {showPricingPlans && (
          <PricingPlans
            isOpen={showPricingPlans}
            onClose={() => setShowPricingPlans(false)}
            sourcePage="StylingPage"
          />
        )}

        {!showPricingPlans && product && (
          <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-2xl mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="relative w-full h-96 rounded-xl overflow-hidden">
                  <img
                    src={product.imageS3Url}
                    alt={product.productName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 right-4 bg-white/90 text-[#0B1F63] px-3 py-1 rounded-full text-sm font-medium z-20">
                    Recommended For You
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.productName}</h2>
                    {product.brand && (
                      <p className="text-lg text-gray-600 mb-6">{product.brand}</p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {product.productLink && (
                      <a
                        href={product.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-full text-center text-white bg-[#0B1F63] hover:bg-[#0a1a57] px-6 py-3 rounded-full transition-colors font-medium"
                        onClick={() => handleTrack("Click Product Link", { 
                          selection: product.productLink || 'unknown'
                        })}
                      >
                        View Product
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

            <div className="flex flex-col md:flex-row gap-4 w-full max-w-md mx-auto">
              <button
                onClick={async () => {
                  if (isSubmitting) return;
                  setIsSubmitting(true);

                  try {
                    await trackPersonalizeEvent({
                      userId: userEmail,
                      itemId: product.productId,
                      eventType: 'tryon',
                      liked: true,
                    });
                  } catch (err) {
                    console.error('Error tracking personalize event:', err);
                  }
                  const result = await handleSubmit();
                  if (result === 'limit' || result === 'error') return;
                  // Save product data for the try-on result page
                  localStorage.setItem('tryonProduct', JSON.stringify({
                    imageS3Url: product.imageS3Url,
                    productName: product.productName,
                    brand: product.brand,
                    productLink: product.productLink
                  }));
                  router.push('/style-discovery/personalized-styling/tryon-result');
                }}
                disabled={isSubmitting}
                className={`py-3 px-6 rounded-full font-medium text-white transition-all ${
                  isSubmitting 
                    ? 'bg-[#0B1F63]/70 cursor-not-allowed' 
                    : 'bg-[#0B1F63] hover:bg-[#0a1a57] shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                }`}
              > Fitting
              </button>
              <button
                onClick=
                {async () => {

                  try {
                    await trackPersonalizeEvent({
                      userId: userEmail,
                      itemId: product.productId,
                      eventType: 'retry',
                      liked: false,
                    });
                  } catch (err) {
                    console.error('Error tracking personalize event:', err);
                  }
                  window.location.reload();
                }}
                className="py-3 px-6 rounded-full font-medium text-[#0B1F63] border-2 border-[#0B1F63] hover:bg-[#0B1F63]/5 transition-colors"
              >
                Try Another Style
              </button>
            </div>
          </div>
        )}

        {loading && (
          <LoadingModalSpinner />
        )}
      </main>
    </div>
  );
}
