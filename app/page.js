"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useAuth } from "react-oidc-context";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/Navbar";
import { Home, Search, Heart, User, ChevronRight, Zap, X, Shirt } from "lucide-react";

// Define brand colors
const BRAND_BLUE = '#0B1F63';

export default function HomePage() {
  const { user, isLoading, signinRedirect } = useAuth();
  const [likedProduct, setLikedProduct] = useState(null);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [apparelImage, setApparelImage] = useState(null);
  const [showForYouModal, setShowForYouModal] = useState(false);
  const [onboardingData, setOnboardingData] = useState({});
  const userEmail = user?.profile?.email;
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        localStorage.setItem("postLoginRedirect", "/");
        signinRedirect();
      } else {
        const redirect = localStorage.getItem("postLoginRedirect");
        if (redirect && window.location.pathname !== redirect) {
          localStorage.removeItem("postLoginRedirect");
          window.location.href = redirect;
          return;
        }
        // Use user email as key
        const step = localStorage.getItem(`onboarding_step:${userEmail}`);
        if (step !== "appearance") {
          window.location.href = "/onboarding/register";
        }
        // Load apparel_image from localStorage
        const apparelImg = localStorage.getItem("apparel_image");
        if (apparelImg) setApparelImage(apparelImg);
        // Load liked product from localStorage
        const stored = localStorage.getItem("likedProduct");
        if (stored) setLikedProduct(JSON.parse(stored));

        // Fetch wardrobe items (limit to 5 for preview)
        const fetchWardrobe = async () => {
          try {
            const lambdaUrl = process.env.NEXT_PUBLIC_HISTORY_HANDLER;
            const res = await fetch(
              `${lambdaUrl}?email=${encodeURIComponent(userEmail)}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
            const data = await res.json();
            const allItems = Array.isArray(data.items) ? data.items : [];
            const wardrobe = allItems.filter((item) => item.isInWardrobe === true);
            setWardrobeItems(wardrobe.slice(0, 5));
          } catch (err) {
            setWardrobeItems([]);
          }
        };
        fetchWardrobe();
      }
    }
  }, [isLoading, user]);

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

      <div className="bg-white max-w-md mx-auto h-screen flex flex-col relative">
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
            <div className="w-12 h-12 rounded-full border-2 overflow-hidden flex items-center justify-center bg-blue-50" style={{ borderColor: BRAND_BLUE }}>
              {user?.profile?.picture ? (
                <img 
                  src={user.profile.picture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={24} color={BRAND_BLUE} />
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Button: For You Style */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => {
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
                {/* Modal Content */}
                <div className="max-h-80 overflow-y-auto px-5 py-4 space-y-4">
                  {Object.entries(onboardingData).map(([sectionKey, sectionData]) => (
                    <div key={sectionKey} className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2 capitalize">
                        {sectionLabels[sectionKey] || toCamelCase(sectionKey)}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-700">
                        {sectionData && Object.keys(sectionData).length > 0 ? (
                          Object.entries(sectionData).map(([key, value]) => (
                            <div key={key} className="flex items-start">
                              <span className="font-medium">
                                {keyDisplays[key] || toCamelCase(key)}:
                              </span>
                              <span className="ml-1 break-words">
                                {Array.isArray(value) ? value.join(", ") : String(value)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="italic text-gray-400">No data available</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="py-4 px-6 bg-gray-50 border-t" style={{ borderColor: `${BRAND_BLUE}1A` }}>
                  <div className="flex gap-3">
                    <button
                      className="flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center"
                      style={{ backgroundColor: BRAND_BLUE }}
                      onClick={() => {
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
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {wardrobeItems.length > 0 ? (
                wardrobeItems.map((item) => (
                  <div key={item.taskId || item.id} className="min-w-[100px] h-[140px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                    {item.generatedImageUrl ? (
                      <img
                        src={item.generatedImageUrl}
                        alt="Wardrobe item"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No Image</span>
                    )}
                  </div>
                ))
              ) : (
                [1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="min-w-[100px] h-[140px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
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
              {likedProduct || apparelImage ? (
                <div className="flex items-center">
                  <div className="w-20 h-20 rounded-lg overflow-hidden mr-4">
                    {apparelImage ? (
                      <img
                        src={apparelImage}
                        alt="Apparel"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={likedProduct.imageS3Url}
                        alt={likedProduct.productName}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: BRAND_BLUE }}>
                      {likedProduct?.productName || "Recently Uploaded Apparel"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{likedProduct?.brand || ""}</p>
                    {likedProduct?.productLink ? (
                      <a
                        href={likedProduct.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold"
                        style={{ color: BRAND_BLUE }}
                      >
                        View Product
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="pb-3 mb-3" style={{ borderBottom: `1px solid ${BRAND_BLUE}1A` }}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full text-white flex items-center justify-center mr-3 text-xs" style={{ backgroundColor: BRAND_BLUE }}>
                      💡
                    </div>
                    <div>
                      <p className="text-sm font-semibold">No liked products yet</p>
                      <p className="text-xs text-gray-500">Like a product to see it here</p>
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
                <div>
                  {Object.entries(grouped).map(([section, items]) => (
                    <div key={section} className="mb-4">
                      <h3 className="font-semibold mb-2 flex items-center" style={{ color: BRAND_BLUE }}>
                        <span className="w-6 h-6 rounded-full mr-2 flex items-center justify-center text-xs text-white" 
                              style={{ backgroundColor: BRAND_BLUE }}>
                          {section.toLowerCase().includes('physical') ? 'P' : 'S'}
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
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex gap-3 mb-20">
            <button 
              onClick={() => window.location.href = "/pricing"}
              className="flex-1 text-white py-3 rounded-xl font-medium" 
              style={{ backgroundColor: BRAND_BLUE }}
            >
              Upgrade Plan
            </button>
            <button 
              onClick={() => window.location.href = "/contact"}
              className="flex-1 py-3 rounded-xl font-medium" 
              style={{ backgroundColor: `${BRAND_BLUE}1A`, color: BRAND_BLUE }}
            >
              Help/Support
            </button>
          </div>
        </div>

        <ToastContainer />
        
        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around items-center px-2 pt-2 pb-1">
          <Link href="/" className="flex flex-col items-center" style={{ color: BRAND_BLUE }}>
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-gray-400 hover:text-blue-900">
            <Shirt className="w-5 h-5 mb-0.5" />
            <span className="text-xs mt-1">Wardrobe</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-gray-400">
            <User size={20} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>

        {/* Keep the original footer but hide it on mobile */}
        <footer className="hidden md:block bg-primary text-primary-foreground py-8 text-center">
          <p>&copy; 2025 FYUSE. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <Link href="/pricing">Pricing</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/features">Features</Link>
          </div>
        </footer>
      </div>
    </>
  );
}