// app/personalized-styling/fashion-type/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import { motion } from 'framer-motion';
import Image from 'next/image';
import LoadingModalSpinner from '@/components/ui/LoadingState';
import { getOrCreateSessionId } from "@/lib/session"; 

export default function StylePreferencesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [clothingType, setClothingType] = useState('');
  const [fashionType, setFashionType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, isLoading, signinRedirect } = useAuth();
  const [pageLoadTime, setPageLoadTime] = useState(null);
  const sessionId = getOrCreateSessionId();
  
  // Set page load time on component mount
  useEffect(() => {
    setPageLoadTime(Date.now());
  }, []);

  // Helper function to send GA events using window.gtag
  const trackGAEvent = (eventName, eventParams = {}) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        ...eventParams,
      });
    } else {
      console.error('window.gtag is NOT available to track event:', eventName);
    }
  };

  // Define fashion types with descriptions and images
  const fashionTypes = {
    Casual: { desc: 'Relaxed everyday looks', image: '/styles/casual.png' },
    Formal: { desc: 'Elegant and professional', image: '/styles/formal.png' },
    Sporty: { desc: 'Athleisure and movement', image: '/styles/sporty.png' },
    Bohemian: { desc: 'Expressive, floral and earth tone', image: '/styles/boho.png' },
    Streetwear: { desc: 'Graphic tees and oversized fits', image: '/styles/streetwear.png' },
  };

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      signinRedirect();
      return;
    }
  }, [isLoading, user, signinRedirect]);

    
  // Handle form submission
  const handleSubmit = async () => {
    if (!user?.id_token) return;
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoading(true);

    // Calculate time to click submit
    let timeToClickSeconds = null;
    if (pageLoadTime) {
      const currentTime = Date.now();
      const durationMs = currentTime - pageLoadTime;
      timeToClickSeconds = Math.round(durationMs / 1000);
    } else {
      console.warn('pageLoadTime was not set for "Discover My Style" button, cannot calculate time to click.');
    }

    // Track the submit event
    trackGAEvent('submit_fashion_type', {
      fashion_type: fashionType,
      page_context: pathname,
      time_to_click_seconds: timeToClickSeconds,
      user_status: user ? 'authenticated' : 'unauthenticated',
    });

    await new Promise(resolve => setTimeout(resolve, 300));
        
    try {
      await fetch("/api/save-style-preference", {
        method: "POST",
        headers: {
          "x-session-id": sessionId,
          Authorization: `Bearer ${user.id_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fashion_type: fashionType,
        }),
      });

      const skipUpload = sessionStorage.getItem("skipUpload") === "true";
      if (skipUpload) {
        router.push("/personalized-styling/recommendation");
      } else {
        router.push("/personalized-styling/result");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setIsSubmitting(false);
      setLoading(false);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };


  // Show loading spinner while submitting
  if (loading) return <LoadingModalSpinner />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 relative">

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-primary" style={{ width: '75%' }}></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[24px] font-bold text-primary">Style Preferences</p>
          <p className="text-[16px] text-gray-600 mt-2 max-w-md mx-auto">
            Your preferences help us show you better outfits — tailored to your lifestyle, fit, and vibe.
          </p>
        </div>

        {/* Fashion Type Selection */}
        <div className="mb-10">
          <p className="text-[18px] font-semibold text-primary mb-3">Which style feels most like you?</p>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(fashionTypes).map(([style, { desc, image }]) => (
              <div
                key={style}
                onClick={() => setFashionType(style)}
                className={`rounded-2xl border-2 overflow-hidden shadow-sm transition-all cursor-pointer group
                  ${fashionType === style
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-gray-200 hover:shadow-md'}
                `}
              >
                <Image
                  src={image}
                  alt={style}
                  width={300}
                  height={300}
                  priority
                  className="w-full h-80 object-cover group-hover:scale-[1.01] transition-transform duration-300"
                />
                <div className="p-4">
                  <h4 className={`font-bold text-lg ${fashionType === style ? 'text-white' : 'text-primary'}`}>
                    {style}
                  </h4>
                  <p className={`text-sm ${fashionType === style ? 'text-white/90' : 'text-gray-600'}`}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={ !fashionType || isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
            fashionType && !isSubmitting
              ? 'bg-primary text-white hover:bg-[#0a1b56]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : 'Discover My Style'}
        </button>
      </motion.div>
    </div>
  );
}
