"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useAuth } from "react-oidc-context";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/Navbar";
import axios from "axios";
import PricingPlans from "@/components/PricingPlanCard";
import ReferralModal from "@/components/ReferralModal";
import { Home, Search, Heart, User, ChevronRight, Zap, X, Shirt } from "lucide-react";

const BRAND_BLUE = '#0B1F63';

export default function HomePage() {
  const { user, isLoading, signinRedirect } = useAuth();
  const [likedRecommendations, setLikedRecommendations] = useState([]);
  const [referralHandled, setReferralHandled] = useState(false);
  const [tryonItems, setTryonItems] = useState([]);
  const [apparelImage, setApparelImage] = useState(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showForYouModal, setShowForYouModal] = useState(false);
  const [onboardingData, setOnboardingData] = useState({});
  const [lastUpdated, setLastUpdated] = useState("");
  const [tryOnCount, setTryOnCount] = useState(0);
  const [showPricingModal, setShowPricingModal] = useState(false);
  
  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        localStorage.setItem("postLoginRedirect", "/");
        signinRedirect();
      } else {
        const userEmail = user.profile.email;

        const refreshTryOnCount = async () => {
          try {
            const res = await axios.get(`${API_BASE_URL}/getrack?userEmail=${userEmail}`);
            const updatedCount = res.data.tryOnCount || 0;
            setTryOnCount(updatedCount);
            sessionStorage.setItem('tryOnCount', updatedCount);
            setLastUpdated(new Date().toLocaleDateString());
          } catch (err) {
            console.error('Error updating try-on count:', err);
          }
        };

        refreshTryOnCount();

        const redirect = localStorage.getItem("postLoginRedirect");
        if (redirect && window.location.pathname !== redirect) {
          localStorage.removeItem("postLoginRedirect");
          window.location.href = redirect;
          return;
        }

        const step = localStorage.getItem(`onboarding_step:${userEmail}`);
        if (step !== "appearance") {
          window.location.href = "/onboarding/register";
        }

        const apparelImg = localStorage.getItem("apparel_image");
        if (apparelImg) setApparelImage(apparelImg);

        if (!isLoading && user) {     
          const hasSeenReferral = localStorage.getItem("hasSeenReferralModal");
          if (!hasSeenReferral) {
            setShowReferralModal(true);
            localStorage.setItem("hasSeenReferralModal", "true");
          }
        }        

        const fetchHistory = async () => {
          try {
            const endpoint = `${API_BASE_URL}/historyHandler`;
            const res = await fetch(
              `${endpoint}?email=${encodeURIComponent(userEmail)}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
            const data = await res.json();
            console.log("Fetched History Data:", data);

            if (Array.isArray(data.tryonItems)) {
              const sortedTryonItems = data.tryonItems
                .filter(item => item.timestamp)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
              setTryonItems(sortedTryonItems.slice(0, 1));
            } else {
              setTryonItems([]);
            }

            if (Array.isArray(data.likedRecommendations)) {
              setLikedRecommendations(data.likedRecommendations.slice(0, 5));
            } else {
              setLikedRecommendations([]);
            }

          } catch (err) {
            console.error("Error fetching history:", err);
            setTryonItems([]);
            setLikedRecommendations([]);
          }
        };

        fetchHistory();
      }
    }
  }, [isLoading, user]);
  useEffect(() => {
    if (referralHandled) {
      const hasShown = sessionStorage.getItem("hasShownPricingModal");
      if (!hasShown) {
        setShowPricingModal(true);
        sessionStorage.setItem("hasShownPricingModal", "true");
      }
    }
  }, [referralHandled]);

  const getAllOnboardingData = () => {
    if (!userEmail) return {};
    const keys = [
      "onboarding_physical_attributes_1",
      "onboarding_physical_attributes_2",
      "onboarding_physical_attributes_3",
      "onboarding_style_preferences_1",
      "onboarding_style_preferences_2",
      "onboarding_style_preferences_3",
    ];
    const data = {};
    keys.forEach((key) => {
      try {
        const val = localStorage.getItem(key);
        if (val) {
          data[key.split(":")[0]] = JSON.parse(val);
        }
      } catch {
        data[key.split(":")[0]] = {};
      }
    });
    return data;
  };

  const handleTrack = async (action, metadata = {}) => {
    console.log(`Tracked event: ${action}`, metadata);
    const payload = {
      userEmail,
      action,
      timestamp: new Date().toISOString(),
      page: "HomePage",
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
      console.log("Tracking result:", result);
    } catch (err) {
      console.error("Failed to track user event:", err);
    }
  };
  const handleReferralSelect = (source) => {
    handleTrack("Referral Source Selected", { source });
    setShowReferralModal(false);
    setReferralHandled(true);
  };
  // Define key display mappings
    const keyDisplays = {
      gender: "Gender",
      skinTone: "Skin Tone",
      bodyShape: "Body shape",
      selectedType: "Fashion Type",
      brands: "Brand selections",
      colors: "Color preferences",
      clothingType: "Clothing Type",
      fit: "Fit",
    };

    // Section display names
    const sectionLabels = {
      onboarding_physical_attributes_1: "Physical Attributes",
      onboarding_physical_attributes_2: "Physical Attributes",
      onboarding_physical_attributes_3: "Physical Attributes",
      onboarding_style_preferences_1: "Style Preferences",
      onboarding_style_preferences_2: "Style Preferences",
      onboarding_style_preferences_3: "Style Preferences"
    };

const toCamelCase = (str) =>
  str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id= ${process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID}');
        `}
      </Script>

      <div className="bg-white w-full min-h-screen flex flex-col relative">
        {/* Keeping the original Navbar for now */}
        <Navbar />
        {/* Main container with scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 mt-20">
          {/* Header section with greeting and profile */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold" style={{ color: BRAND_BLUE }}>
                👋 {user ? `Hi, ${user.profile?.given_name || 'there'}!` : 'Hi, there!'}
              </h1>
              <p className="text-gray-600 text-sm">
                {user?.profile ? 'Welcome to your personal styling assistant' : 'Sign in to get started'}
              </p>
            </div>         
          </div>

          {/* Quick Action Button: For You Style */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => {
                handleTrack("Click For You Style Button");
                if (!user) {
                  localStorage.setItem("postLoginRedirect", "/onboarding/register");
                  toast.error("Please sign in to use this feature.", {
                    position: "top-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                  });
                  setTimeout(() => signinRedirect(), 1500);
                } else {
                  const data = getAllOnboardingData();
                  setOnboardingData(data);
                  setShowForYouModal(true);
                }
              }}
              className="flex-1 text-white py-4 rounded-xl font-medium"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              For You Style
            </button>
          </div>

          {/* For You Style Modal */}
          {showForYouModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-xl overflow-hidden border border-gray-100">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-lg font-semibold text-blue-900">For you style</h2>
                    <p className="text-sm text-gray-500">Review and confirm your style preferences</p>
                  </div>
                  <button
                    onClick={() => setShowForYouModal(false)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center shrink-0"
                  >
                    <X className="w-5 h-5 text-blue-900" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="max-h-80 overflow-y-auto px-5 py-4 space-y-4">
                  {(() => {
                    // Flatten all onboardingData into a single object
                    const flatData = Object.values(onboardingData).reduce((acc, section) => {
                      if (section && typeof section === "object") {
                        Object.entries(section).forEach(([key, value]) => {
                          acc[key] = value;
                        });
                      }
                      return acc;
                    }, {});
                    // Only display keys present in keyDisplays
                    const displayKeys = Object.keys(keyDisplays);
                    const filtered = displayKeys
                      .filter((key) => flatData[key] !== undefined && flatData[key] !== null && flatData[key] !== "")
                      .map((key) => ({
                        label: keyDisplays[key],
                        value: Array.isArray(flatData[key]) ? flatData[key].join(", ") : String(flatData[key]),
                      }));

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-3">
                          <p className="text-gray-500 text-sm">No style data available.</p>
                          <Link href="/onboarding/physical-attributes/step-1">
                            <button 
                              className="mt-2 py-2 px-4 rounded-lg text-sm font-medium"
                              style={{ backgroundColor: BRAND_BLUE, color: "white" }}
                            >
                              Complete Your Profile
                            </button>
                          </Link>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        {filtered.map(({ label, value }) => (
                          <div key={label} className="flex items-start">
                            <span className="font-medium">{label}:</span>
                            <span className="ml-1 break-words">{value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="py-4 px-6 bg-gray-50 border-t" style={{ borderColor: `${BRAND_BLUE}1A` }}>
                  <div className="flex gap-3">
                    <button
                      className="flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center"
                      style={{ backgroundColor: BRAND_BLUE }}
                      onClick={() => {
                        handleTrack("Click Continue Button in For You Style Modal");
                        setShowForYouModal(false);
                        window.location.href = "/onboarding/recommended-product";
                      }}
                    >
                      <span>Continue</span>
                      <ChevronRight size={18} className="ml-1" />
                    </button>
                    <button
                      className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center"
                      style={{ backgroundColor: `${BRAND_BLUE}1A`, color: BRAND_BLUE }}
                      onClick={() => {
                        handleTrack("Click Edit Profile Button in For You Style Modal");
                        setShowForYouModal(false);
                        window.location.href = "/onboarding/physical-attributes/step-1";
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wardrobe section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold" style={{ color: BRAND_BLUE }}>Your Wardrobe</h2>
              <Link href="/profile" className="flex items-center text-sm font-medium" style={{ color: BRAND_BLUE }}>
                See All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
              {likedRecommendations.length > 0 ? (
                likedRecommendations.map((recommendation) => (
                  <Link
                    key={recommendation.productId}
                    href="/profile"
                    className="min-w-[80px] md:min-w-[100px] h-[110px] md:h-[140px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center"
                  >
                    {recommendation.imageUrl ? (
                      <div className="relative w-[80px] md:w-[100px] h-[110px] md:h-[140px] overflow-hidden rounded-lg">
                        <Image
                          src={recommendation.imageUrl}
                          alt="Liked Recommendation"
                          width={100}
                          height={140}
                          className="object-cover w-full h-full"
                          priority
                        />
                      </div>

                    ) : (
                      <span className="text-xs text-gray-400">No Image</span>
                    )}
                  </Link>
                ))
              ) : (
                [1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="min-w-[80px] md:min-w-[100px] h-[110px] md:h-[140px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center"
                  >
                    <span className="text-xs text-gray-400">No Item</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity / Liked Product Widget */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold" style={{ color: BRAND_BLUE }}>Recent Activity</h2>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: `${BRAND_BLUE}0D` }}>
              {tryonItems.length > 0 ? (
                <div className="flex items-center">
                  <div className="w-28 h-28 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                    {tryonItems[0].generatedImageUrl ? (
                      <Image
                        src={tryonItems[0].generatedImageUrl}
                        alt="Recent Fitting"
                        width={120}
                        height={120}
                        className="w-full h-full object-contain rounded-xl transition-transform md:hover:scale-105 duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No Image</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-regular text-sm" style={{ color: BRAND_BLUE }}>
                      Last updated: {lastUpdated}
                    </h3>
                    <h3 className="font-regular text-sm" style={{ color: BRAND_BLUE }}>
                      Style Me: {tryOnCount} times
                    </h3>
                    {/* You might want to add a link to view all try-ons */}
                  </div>
                </div>
              ) : (
                <div className="pb-3 mb-3" style={{ borderBottom: `1px solid ${BRAND_BLUE}1A` }}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full text-white flex items-center justify-center mr-3 text-xs" style={{ backgroundColor: BRAND_BLUE }}>
                      💡
                    </div>
                    <div>
                      <p className="text-sm font-semibold">No recent activity</p>
                      <p className="text-xs text-gray-500">Your recent interactions will appear here</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        
          {/* User Style Profile Widget (displaying data directly on homepage) */}
          <div className="p-4">
            {/* Dynamic data from getAllOnboardingData() */}
            {(() => {
              const data = getAllOnboardingData();

              // Helper to convert snake_case to camelCase
              const toCamelCase = (str) =>
                str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

              // Map for display labels
              const keyDisplays = {
                gender: "Gender",
                skinTone: "Skin Tone",
                bodyShape: "Body shape",
                selectedType: "Fashion Type",
                brands: "Brand selections",
                colors: "Color preferences",
                clothingType: "Clothing Type",
              };

              // Section display names
              const sectionLabels = {
                onboarding_physical_attributes_1: "Physical Attributes",
                onboarding_physical_attributes_2: "Physical Attributes",
                onboarding_physical_attributes_3: "Physical Attributes",
                onboarding_style_preferences_1: "Style Preferences",
                onboarding_style_preferences_2: "Style Preferences",
                onboarding_style_preferences_3: "Style Preferences"
              };

              // Flatten and group data by section
              const grouped = {};
              Object.entries(data).forEach(([section, values]) => {
                if (values && Object.keys(values).length > 0) {
                  const label = sectionLabels[section] || section.replace(/_/g, " ");
                  if (!grouped[label]) grouped[label] = [];
                  Object.entries(values).forEach(([key, value]) => {
                    const camelKey = toCamelCase(key);
                    if (keyDisplays[camelKey]) {
                      grouped[label].push({
                        key: camelKey,
                        label: keyDisplays[camelKey],
                        value: value || "Not specified"
                      });
                    }
                  });
                }
              });

              if (Object.keys(grouped).length === 0) {
                return (
                  <div className="text-center py-3">
                    <p className="text-gray-500 text-sm">No style data available.</p>
                    <Link href="/onboarding/physical-attributes/step-1">
                      <button 
                        className="mt-2 py-2 px-4 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: BRAND_BLUE, color: "white" }}
                      >
                        Complete Your Profile
                      </button>
                    </Link>
                  </div>
                );
              }

              return (
                <div className="flex flex-row gap-4 overflow-x-auto">
                  {["Physical Attributes", "Style Preferences"].map((section) => {
                    const items = grouped[section];
                    if (!items) return null;

                    return (
                      <div key={section} className="w-full md:w-1/2 mb-4">
                        <h3 className="font-semibold mb-2 flex items-center" style={{ color: BRAND_BLUE }}>
                          <span className="w-6 h-6 rounded-full mr-2 flex items-center justify-center text-xs text-white" 
                                style={{ backgroundColor: BRAND_BLUE }}>
                            {section === "Physical Attributes" ? "P" : "S"}
                          </span>
                          <span>{section}</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-3 ml-8">
                          {items.map(({ key, label, value }) => (
                            <div key={key} className="bg-white rounded-lg p-3 shadow-sm">
                              <p className="text-xs text-gray-500">{label}</p>
                              <p className="font-medium mt-1" style={{ color: BRAND_BLUE }}>
                                {Array.isArray(value) ? value.join(', ') : value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        <ToastContainer />
        
        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 w-full bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around items-center px-4 pt-2 pb-3 z-50">
          <Link href="/" className="flex flex-col items-center text-blue-600">
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-gray-400 hover:text-blue-900">
            <Shirt className="w-5 h-5 mb-0.5" />
            <span className="text-xs mt-1">Wardrobe</span>
          </Link>
          <Link href="/insights" className="flex flex-col items-center text-gray-400 hover:text-blue-900">
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
      {showPricingModal && (
        <PricingPlans
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          sourcePage="HomePage"
        />
      )}
      {showReferralModal && (
        <ReferralModal
          isOpen={showReferralModal}
          handleTrack={handleTrack}
          onClose={() => {
            setShowReferralModal(false);
            setReferralHandled(true);
          }}
        />
      )}
    </>
  );
}