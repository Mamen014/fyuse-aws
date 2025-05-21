'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import PricingPlans from '@/components/PricingPlanCard';

export default function RecommendedProductPage() {
  const router = useRouter();
  const auth = useAuth();
  const userEmail = auth?.user?.profile?.email;

  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

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

  // ========== Utility Functions ==========

  const refreshTryOnCount = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/getrack?userEmail=${userEmail}`);
      const updatedCount = res.data.tryOnCount || 0;
      console.log('count:', updatedCount);
      setTryOnCount(updatedCount);
      sessionStorage.setItem('tryOnCount', updatedCount);
    } catch (err) {
      console.error('Error updating try-on count:', err);
    }
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
      const res = await fetch(`${API_BASE_URL}/stylingRecommendation`, {
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
          router.push('/onboarding/physical-attributes/step-1');
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
      sessionStorage.setItem('tipsCount', count);

      if (count >= 20) {
        setShowPricingPlans(true);
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
      await fetch(`${API_BASE_URL}/trackRec`, {
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
    if (tryOnCount >= 10) {
      setShowPricingPlans(true);
      setSubmitStatus('limit');
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

    await refreshTryOnCount();
    setIsSubmitting(false);
    return 'success';
  };

  // ========== Effect Hook ==========

  useEffect(() => {
    if (auth.isLoading || hasFetchedRef.current || !userEmail) return;

    hasFetchedRef.current = true;

    refreshTryOnCount();
    fetchTipsCountAndMaybeProduct(userEmail);
    const storedTipsCount = sessionStorage.getItem('tipsCount');
    if (storedTipsCount !== null) {
      const count = parseInt(storedTipsCount);
      setTipsCount(count);
      if (count >= 20) {
        setShowPricingPlans(true);
        setLoading(false);
        return;
      }
    }
  }, [userEmail]);

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
            onSelectPlan={(planName) => alert(`You selected: ${planName}`)}
          />
        )}

        {!showPricingPlans && product && (
          <div className="flex flex-col items-center space-y-4">
            <img
              src={product.imageS3Url}
              alt={product.productName}
              className="w-48 rounded-md object-cover"
            />
            {product.modelRef?.length > 0 && (
              <img
                src={product.modelRef}
                alt="Model Preview"
                className="w-48 rounded-md object-cover"
              />
            )}
            <div className="text-center">
              <h2 className="font-semibold text-primary-100">{product.productName}</h2>
              <p className="text-sm text-primary-300">{product.brand}</p>
              <a
                href={product.productLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cta underline"
              >
                View Product
              </a>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex flex-col gap-4 w-full md:w-1/2">
              <button
                onClick={async () => {
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
                  router.push('/onboarding/virtual-tryon-result');
                }}
                disabled={isSubmitting}
                className={`py-2 px-4 rounded-lg ${
                  isSubmitting ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary'
                } text-white`}
              >
                {isSubmitting ? 'Styling...' : 'Style Me'}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-white text-primary-100 border border-primary-100 py-2 px-4 rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loading && (
          <p className="text-center text-primary-100">Loading recommendation...</p>
        )}
      </main>
    </div>
  );
}
