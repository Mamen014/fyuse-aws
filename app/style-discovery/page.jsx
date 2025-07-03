"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useAuth } from "react-oidc-context";
import Image from 'next/image';
import dynamic from 'next/dynamic';
import LoadingModalSpinner from '@/components/ui/LoadingState';
// Dynamically import the ReferralModal to avoid SSR issues
const ReferralModal = dynamic(
  () => import('@/components/ReferralModal'),
  { ssr: false }
);

export default function StyleChoice() {
  const router = useRouter();
  const [hasRegistered, setHasRegistered] = useState(false);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');
  const { user, signinRedirect } = useAuth();
  const [loading, setloading] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralHandled, setReferralHandled] = useState(false);

  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;  
  
  // Check if user has seen the referral modal before
  const hasSeenReferral = () => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('hasSeenReferral') === 'true';
  };

  const handleTrack = async (action, metadata = {}) => {
    const payload = {
      userEmail,
      action,
      timestamp: new Date().toISOString(),
      page: "style-discovery",
      ...metadata,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/trackevent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
    } catch (err) {
      console.error("Failed to track user event:", err);
    }
  };

  const handleReferralSelect = (source) => {
    handleTrack("Referral Source Selected", { selection: source });
    setShowReferralModal(false);
    setReferralHandled(true);
    localStorage.removeItem('hasSeenReferral');
  };

  // Check if user has registered
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const registered = localStorage.getItem('showRegister') === 'true';
      setHasRegistered(registered);
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {

    // If user is logged in and hasn't seen the referral modal, show it
    if (user && hasSeenReferral() && !referralHandled) {
      setShowReferralModal(true);
    }
  }, [user, signinRedirect, referralHandled]);

  const options = [
    {
      icon: "/images/step-3.png",
      title: "Personalized Styling",
      subtitle: "Looks tailored for you",
      description: "Discover outfit recommendations tailored to your body and styling preferences",
      path: "style-discovery/personalized-styling/physical-appearances",
      gradient: "from-blue-50 to-indigo-50"
    },
    {
      icon: "/images/step-4.png",
      title: "Direct Fitting",
      subtitle: "Upload and Preview",
      description: "This path lets you try on your own clothing item virtually to see how it fits your actual body",
      path: "style-discovery/digital-fitting-room",
      gradient: "from-blue-50 to-indigo-50"
    }
  ];

  if (loading) {
    return (
    <LoadingModalSpinner />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-primary overflow-x-hidden">
      {/* Referral Modal */}
      {showReferralModal && (
        <ReferralModal
          isOpen={showReferralModal}
          handleTrack={handleReferralSelect}
          onClose={() => {
            setShowReferralModal(false);
            setReferralHandled(true);
          }}
        />
      )}
      {showRegisterPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl text-center">
            <h2 className="text-xl font-bold mb-4 text-primary">Want More Personalized Styles?</h2>
            <p className="text-sm text-gray-700 mb-6">
              Tell us a little about yourself — so we can tailor outfit ideas that fit your lifestyle better.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  localStorage.setItem("registerFrom", "style-discovery");
                  localStorage.setItem('showRegister', 'false');
                  setShowRegisterPrompt(false);
                  setloading(true);
                  router.push('/style-discovery/register');
                }}
                className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-[#0a1b56] transition"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('showRegister', 'false');
                  setShowRegisterPrompt(false);
                  setloading(true);
                  router.push(selectedPath || 'style-discovery/personalized-styling/physical-appearances');
                }}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-16 sm:pt-20 lg:pt-28 pb-8 sm:pb-12 lg:pb-20 bg-white">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-12 lg:mb-16">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary mb-3 sm:mb-4 lg:mb-6 leading-tight tracking-tight px-2">
                Style Discovery Path
              </h1>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-primary/70 max-w-3xl mx-auto leading-relaxed px-2">
                Choose the perfect way to discover your ideal style and fit
              </p>
            </div>

            {/* Options Grid - Side by side on all screens */}
            <div className="flex flex-row gap-2 sm:gap-4 lg:gap-6 xl:gap-8 max-w-5xl mx-auto">
              {options.map((option, index) => (
                <div
                  key={index}
                  className={`
                    relative group cursor-pointer
                    bg-gradient-to-br ${option.gradient}
                    rounded-xl sm:rounded-2xl border-2 border-primary/10
                    overflow-hidden
                    flex-1 min-h-[400px] sm:min-h-[450px] lg:min-h-[500px]
                    active:scale-[0.98] active:shadow-lg
                  `}
                  onClick={() => {
                    handleTrack("Selected Path", { selection: option.title });
                    if (option.title === "Personalized Styling") {
                      if (hasRegistered) {
                        setSelectedPath(option.path);
                        setShowRegisterPrompt(true);
                      } else {
                        setloading(true);
                        router.push(option.path);
                      }
                    } else {
                      setloading(true);
                      router.push(option.path);
                    }
                  }}
                >
                  <div className="p-4 sm:p-6 lg:p-8 xl:p-10 h-full flex flex-col">
                    {/* Icon and Title */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="p-2 sm:p-3 lg:p-4 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                        <Image 
                          src={option.icon} 
                          alt={option.title}
                          width={48}
                          height={48}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h2 className="text-base sm:text-xl lg:text-2xl xl:text-3xl font-bold text-primary mb-2 leading-tight">
                          {option.title}
                        </h2>
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-primary/80 mb-2 sm:mb-3">
                          {option.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Description - Flexible grow area */}
                    <div className="flex-grow mb-4 sm:mb-6">
                      <p className="text-sm sm:text-base lg:text-lg text-primary/70 leading-relaxed text-center sm:text-left">
                        {option.description}
                      </p>
                    </div>

                    {/* CTA Button - Always at bottom */}
                    <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-0 mt-auto">
                      <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all duration-300">
                        <span className="text-sm sm:text-base lg:text-lg">Get Started</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  {/* Mobile tap feedback */}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-active:opacity-100 transition-opacity duration-150 pointer-events-none lg:hidden"></div>
                </div>
              ))}
            </div>

            {/* Mobile-specific helper text */}
            <div className="text-center mt-4 sm:mt-6 lg:mt-8 lg:hidden">
              <p className="text-xs text-primary/50 px-4">
                Tap on any option to get started
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <button
              onClick={() => {
                handleTrack("Selected Path", {
                  selection: "Dashboard"
                });
                setloading(true);
                router.push('/dashboard');
              }}
              className="inline-block px-6 py-3 rounded-full bg-background text-primary border border-primary hover:bg-background/90 transition-colors duration-300 shadow-md text-sm sm:text-base"
            >
              <span>Go to Dashboard</span>
            </button>
          </div>          
        </section>
      </main>
    </div>
  );
}