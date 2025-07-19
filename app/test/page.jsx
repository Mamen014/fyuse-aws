// app/test/page.jsx

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import html2canvas from 'html2canvas';

import ShareCanvas from '@/components/ui/ShareCanvas';
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
  const pollingTaskId = useRef(null);
  const hasShownToast = useRef(false);
  const shareRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [profileRaw, setProfileRaw] = useState([]);
  const [, setIsPolling] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPricingPlans, setShowPricingPlans] = useState(false);
  const [product, setProduct] = useState(null);
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    const canvasEl = document.getElementById('share-canvas');
    if (!canvasEl) {
      toast.error("Share canvas not found");
      return;
    }

    setIsSharing(true);

    try {
      const canvas = await html2canvas(canvasEl, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#fff',
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Failed to generate image");
          setIsSharing(false);
          return;
        }

        const file = new File([blob], 'fyuse-look.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'My Style from FYUSE',
            text: 'Check out my style from fyuse.org!',
            files: [file],
          });
        } else {
          toast("Sharing not supported on this device", { icon: "⚠️" });
        }
      });
    } catch (err) {
      console.error("Share failed", err);
      toast.error("Failed to share.");
    } finally {
      setIsSharing(false);
    }
  };

  const resetState = () => {
    setProduct(null);
    setResultImageUrl(null);
    setError(null);
    setShowPricingPlans(false);
    setIsPolling(false);
    hasShownToast.current = false;
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
    const res = await fetch('/api/test/recommend-product', {
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
    const res = await fetch('/api/test/tryon', {
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

      if (taskId !== sessionStorage.getItem('currentTaskId')) {
        console.warn('Stale task result, ignoring');
        return;
      }

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

  const handleFlow = useCallback(async (isManual = false) => {
    
      try {
        controllerRef.current = new AbortController();
        const { plan, tryOnCount } = await fetchUserPlan();

        if (tryOnCount >= PLAN_LIMITS[plan].tryOn) {
          setShowPricingPlans(true);
          setLoading(false);
          return;
        }
        const lastStart = Number(sessionStorage.getItem("lastTryonStart") || "0");
        const now = Date.now();  

        if (!isManual && now - lastStart < 60_000) {
          console.log("Skipping re-trigger: recently started");
          toast("Too frequent. Please try again later", { duration: 3000, icon: '⚠️' });
          setLoading(false);
          setTimeout(() => {
            setLoading(true);
            router.push('/dashboard');
          }, 3000);          
          return;
        }

        sessionStorage.setItem("lastTryonStart", String(now));

        const recommendation = await fetchRecommendation();
        const taskId = await initiateTryOn(recommendation.imageS3Url);
        const delay = ms => new Promise(res => setTimeout(res, ms));

        // ✅ Delay before polling to let callback update DB
        await delay(10000);

        cleanupRef.current = pollTaskStatus(taskId, controllerRef.current);
      } catch (err) {
        if (controllerRef.current?.signal.aborted) return;
        setError(err.message || 'Unexpected error');
        setLoading(false);
      } finally {
        setIsPolling(false);
      }
  }, [fetchUserPlan, fetchRecommendation, initiateTryOn, pollTaskStatus]);

  useEffect(() => {
    if (isLoading || !token) return;

    controllerRef.current = new AbortController();
    const savedTaskId = sessionStorage.getItem('currentTaskId');
    const savedProduct = sessionStorage.getItem('recommendedProduct');

    if (savedProduct) setProduct(JSON.parse(savedProduct));

    if (savedTaskId && pollingTaskId.current !== savedTaskId) {
      pollingTaskId.current = savedTaskId;
      cleanupRef.current = pollTaskStatus(savedTaskId, controllerRef.current);
    } else if (!savedTaskId && !resultImageUrl){
      handleFlow();
    }

    return () => {
      controllerRef.current?.abort();
      cleanupRef.current?.();
    };
  }, [isLoading, token, handleFlow, pollTaskStatus, resultImageUrl]);

  useEffect(() => {
    if (!shareRef.current || !resultImageUrl || !product) return;

    (async () => {
      const canvas = await html2canvas(shareRef.current, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#fff',
        scale: 2,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], 'fyuse-look.png', { type: 'image/png' });
        setShareFile(file);
      });
    })();
  }, [resultImageUrl, product]);

  // Load profile display data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = user?.id_token || user?.access_token;
        if (!token) return;

        const res = await axios.get("/api/user-profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { skin_tone, body_shape, gender, nickname } = res.data;
        setProfileRaw({ skin_tone, body_shape, gender, nickname });

      } catch (err) {
        console.error('Error loading profile data:', err);
        setProfileRaw([]);
      }
    }
    
    if (user) {
      fetchUserProfile();
    }    
  }, [user]);

  // UI Rendering
  if (isLoading || loading)
    return <LoadingModalSpinner message="Styling..." subMessage="This process only takes 30 seconds." />;

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
      <Toaster
        position="top-center"
        toastOptions={{
          style: { zIndex: 9999 },
        }}
      />

      <div className="absolute left-[-9999px] top-0">
        <ShareCanvas
          resultImageUrl={resultImageUrl}
          productImageUrl={product.imageS3Url}
          productName={product.productName}
          brand={product.brand}
          fashionType={product.fashionType}
          nickname={profileRaw.nickname}
          skinToneLabel={profileRaw.skin_tone}
          bodyShape={profileRaw.body_shape}
          gender={profileRaw.gender}
        />
      </div>

      <div className="max-w-6xl w-full">
        <h1 className="text-3xl font-bold text-primary text-center mb-2">Your Perfect Look</h1>
        <p className="text-gray-600 text-center mb-8">This style has been added to your wardrobe</p>

        {/* Images */}
        <div className="bg-white p-4 rounded-xl">        
          <div className="flex flex-col md:flex-row gap-8 mb-12 items-stretch">
            
            {/* Left: Try-On Result */}
            <div className="md:w-1/2 w-full flex">
              <div className="relative rounded-2xl shadow-2xl overflow-hidden w-full aspect-[3/4]">
                {resultImageUrl ? (
                  <img
                    src={resultImageUrl}
                    crossOrigin="anonymous"
                    alt="Try-On Result"
                    className="w-full h-auto object-cover"
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

            {/* Right: Product Info */}
            <div className="md:w-1/2 w-full flex">
              <div className="bg-white rounded-2xl p-6 shadow-2xl w-full flex flex-col">
                <div className="relative w-full aspect-[3/4]">
                  <img
                    src={product.imageS3Url}
                    crossOrigin="anonymous"
                    alt={product.productName}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="mt-4 text-center md:text-left">
                  <h3 className="text-lg font-bold">{product.productName}</h3>
                  <p className="text-gray-600">{product.brand}</p>
                  {product.productLink && (
                    <a
                      href={product.productLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-white bg-primary hover:bg-primary/80 px-4 py-2 rounded-full"
                    >
                      View Product
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Button */}
        <div className="w-full max-w-6xl mx-auto space-y-4">
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
              className="w-full py-3 rounded-full text-white font-semibold bg-green-600 hover:bg-green-700"
            >
              {isDownloading ? 'Downloading...' : 'Download Your Look'}
            </button>
          )}
          {/* Share Button */}
          {resultImageUrl && (
            <button
              onClick={handleShare}
              disabled={isSharing}
              className={`w-full py-3 rounded-full font-semibold text-white bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] hover:opacity-90 transition-all duration-300 ${
                isSharing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSharing ? 'Preparing Share...' : 'Share to My Friends'}
            </button>
          )}
          {/* Try Another Style Button */}
          <button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              resetState();
              await handleFlow(true);
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
