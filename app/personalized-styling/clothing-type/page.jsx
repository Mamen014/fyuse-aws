// app/personalized-styling/style-preferences/clothing-type/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import Image from 'next/image';
import TopActive from '/public/images/cloth-fitting/cloth-active.png';
import TopInactive from '/public/images/cloth-fitting/cloth-inactive.png';
import BottomActive from '/public/images/cloth-fitting/short-active.png';
import BottomInactive from '/public/images/cloth-fitting/short-inactive.png';
import LoadingModalSpinner from '@/components/ui/LoadingState';
import { getOrCreateSessionId } from "@/lib/session";

export default function ClothingTypePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, signinRedirect } = useAuth();
  const [clothingType, setClothingType] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pageLoadTime, setPageLoadTime] = useState(null);
  const sessionId = getOrCreateSessionId();

  const clothingOptions = [
    { label: 'Top', activeIcon: TopActive, inactiveIcon: TopInactive },
    { label: 'Bottom', activeIcon: BottomActive, inactiveIcon: BottomInactive },
  ];

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

  useEffect(() => {
    if (!isLoading && !user) signinRedirect();
  }, [isLoading, user, signinRedirect]);

  const handleNext = async () => {
    if (!user?.id_token || !clothingType) return;
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

    try {
      await fetch("/api/save-style-preference", {
        method: "POST",
        headers: {
          "x-session-id": sessionId,
          Authorization: `Bearer ${user.id_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clothing_category: clothingType }),
      });
      setShowModal(true);
    } catch (err) {
      console.error("Error saving clothing type:", err);
    } finally {
      setLoading(false);
    }
  };

    const handleDecision = (willingToUpload) => {
      trackGAEvent('photo_upload_decision', {
        decision: willingToUpload ? 'upload' : 'skip',
        page_context: pathname,
        clothing_type: clothingType,
        user_status: user ? 'authenticated' : 'unauthenticated',
      });    
      setShowModal(false);
      setLoading(true); 

      if (willingToUpload) {
          router.push("/personalized-styling/physical-appearances");
      } else {
          sessionStorage.setItem("skipUpload", "true");
          router.push("/personalized-styling/physical-appearances/manual/step-1");
      }
    };

  if (loading) return <LoadingModalSpinner />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-primary" style={{ width: '25%' }}></div>
      </div>        
      <h2 className="text-xl font-bold mb-6">What are you looking for?</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {clothingOptions.map(({ label, activeIcon, inactiveIcon }) => {
          const isSelected = clothingType === label;
          return (
            <button
              key={label}
              onClick={() => setClothingType(label)}
              className={`flex flex-col items-center gap-6 px-5 py-4 border border-primary/50 rounded-2xl transition-all w-full
                ${isSelected ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200'}`}
            >
              <Image
                src={isSelected ? inactiveIcon : activeIcon}
                alt={label}
                width={240}
                height={240}
              />
              <span className='text-2xl'>{label}</span>
            </button>
          );
        })}
      </div>
      <button
        onClick={handleNext}
        disabled={!clothingType}
        className={`w-full py-3 rounded-lg font-medium ${
          clothingType ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        Next
      </button>

      {/* Confirmation Modal */}
        {showModal && (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
        >
            <div
            className="flex flex-col bg-white p-6 rounded-xl shadow-lg 
                max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
            >
            <h1 className="text-2xl font-bold text-center mt-4">
                Are you willing to upload a photo of yourself?
            </h1>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                <div
                onClick={() => handleDecision(true)}
                className="cursor-pointer rounded-xl border border-primary hover:shadow-xl hover:scale-105 transition-transform duration-300 p-4 text-center"
                >
                <Image
                    src="/illustrations/upload.png"
                    alt="Upload"
                    width={250}
                    height={250}
                    className="mx-auto"
                />
                <h4 className="font-semibold text-primary mt-2">Upload My Photo</h4>
                <p className="text-gray-500 text-sm">See outfits styled directly on you</p>
                </div>

                <div
                onClick={() => handleDecision(false)}
                className="cursor-pointer rounded-xl border border-primary hover:shadow-xl hover:scale-105 transition-transform duration-300 p-4 text-center"
                >
                <Image
                    src="/illustrations/nophoto.png"
                    alt="No Photo"
                    width={250}
                    height={250}
                    className="mx-auto"
                />
                <h4 className="font-semibold text-primary mt-2">Skip Upload</h4>
                <p className="text-gray-500 text-sm">
                    Get outfit ideas based on preferences only
                </p>
                </div>
            </div>
            </div>
        </div>
        )}
    </div>
  );
}
