// app/personalized-styling/recommendation/page.jsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import Image from 'next/image';
import toast from 'react-hot-toast';
import LoadingModalSpinner from '@/components/ui/LoadingState';
import { getOrCreateSessionId } from '@/lib/session';

export default function RecommendationPage() {
  const router = useRouter();
  const { user, isLoading, signinRedirect } = useAuth();
  const token = user?.access_token || user?.id_token || '';
  const sessionId = getOrCreateSessionId();
  const [redirecting, setRedirecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  // fetch recommendation only once
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      signinRedirect();
      return;
    }

    const fetchRecommendation = async () => {
      try {
        const res = await fetch('/api/product-only', {
          method: 'POST',
          headers: {
            "x-session-id": sessionId,
            Authorization: `Bearer ${token}`
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || `Request failed with status ${res.status}`);
        }

        if (!data?.productId) {
          throw new Error("Invalid recommendation response");
        }

        setProduct(data);
      } catch (err) {
        console.error("❌ Recommendation error:", err);
        setError(err.message || "Something went wrong");
        toast.error(err.message || "Failed to fetch recommendation");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [isLoading, user, signinRedirect, token, sessionId]);

  // Helper: safe GA tracking
  const trackGAEvent = (eventName, eventParams = {}) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, {
        ...eventParams,
      });
    } else {
      console.error("window.gtag is NOT available to track event:", eventName);
    }
  };

  const handlePurchaseClick = (product) => {
    // Fire GA event
    trackGAEvent("click_purchase", {
      product_id: product?.productId,
      product_name: product?.productName,
      brand: product?.brand,
      page_context: "recommendation",
      user_status: user ? "authenticated" : "unauthenticated",
    });

    // Navigate to product link
    if (product?.productLink) {
      window.open(product.productLink, "_blank");
    }
  };

  const handleBackToDashboard = () => {
    setRedirecting(true); // show spinner
    router.push('/dashboard');
  };

// Show spinner when redirecting
if (redirecting) {
  return (
    <LoadingModalSpinner
      message="Taking you back..."
      subMessage="Redirecting to your dashboard"
    />
  );
}

  // Loading state
  if (loading) {
    return <LoadingModalSpinner message="Fetching your style..." subMessage="This will just take a moment." />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="mb-6">{error}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-b from-blue-50 to-white flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-primary text-center mb-2">Your Personalized Outfit</h1>
        <p className="text-gray-600 text-center mb-8">This style has been added to your wardrobe</p>

        <div className="gap-8 items-center justify-center">

          {/* Product Info */}
          <div className="rounded-2xl p-6 shadow-2xl bg-white flex flex-col">
            <div className="relative w-full aspect-[3/4]  mb-4">
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
                  Product loading...
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-lg">{product?.productName || "Unnamed product"}</h3>
              {product?.brand ? (
                <Image
                  src={`/images/brand-logo/${product?.brand}.png`}
                  alt="Brand Icon"
                  width={64}
                  height={64}
                  className='inline-block ml-4 mb-4'
                />
              ) : (
                <div className="text-sm text-gray-400">Loading...</div>
              )}
            </div>

            {product?.productLink && (
              <button
                onClick={() => handlePurchaseClick(product)}
                className="mt-6 w-full text-center text-white bg-primary hover:bg-primary/80 px-4 py-2 rounded-full"
              >
                Purchase
              </button>
            )}
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 w-full px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition"
        >
          Get New Recommendation
        </button>

        {/* Back button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleBackToDashboard}
            className="px-6 py-3 rounded-full font-semibold bg-white border border-primary text-primary hover:bg-primary/10"
          >
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
