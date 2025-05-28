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
import { Home, Search, Heart, User, ChevronRight, Zap, X, Shirt, Sparkles, Star, TrendingUp } from "lucide-react";

// Define brand colors
const BRAND_BLUE = '#0B1F63';

export default function HomePage() {
  const { user, isLoading, signinRedirect } = useAuth();
  const [likedRecommendations, setLikedRecommendations] = useState([]);
  const [tryonItems, setTryonItems] = useState([]);
  const [apparelImage, setApparelImage] = useState(null);
  const [showForYouModal, setShowForYouModal] = useState(false);
  const [onboardingData, setOnboardingData] = useState({});
  const [profileData, setProfileData] = useState({
    gender: "Not Set",
    bodyShape: "Not Set",
    selectedType: "Not Set",
    skinTone: "Not Set",
    occupation: "Not Set",
    country: "Not Set",
    clothingType: "Top",
    brands: [],
    colors: []
  });
  const userEmail = user?.profile?.email;
  const [lastUpdated, setLastUpdated] = useState("");
  const [tryOnCount, setTryOnCount] = useState(0);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [tipsCount, setTipsCount] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState("Basic");
  const [profileItems, setProfileItems] = useState([]);
  
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

        const fetchTipsCount = async () => {
          try {
            const res = await axios.get(`${API_BASE_URL}/getTipsTrack?userEmail=${userEmail}`);
            const count = res.data.tipsCount || 0;
            setTipsCount(count);
            sessionStorage.setItem('tipsCount', count);
          } catch (err) {
            console.error('Error fetching tips count:', err);
          }
        };

        // Get selected plan from localStorage
        const loggedInUser = localStorage.getItem("loggedInUser");
        if (loggedInUser) {
          try {
            const userData = JSON.parse(loggedInUser);
            if (userData.selectedPlan) {
              setSelectedPlan(userData.selectedPlan);
            }
          } catch (err) {
            console.error('Error parsing user data:', err);
          }
        }

        refreshTryOnCount();
        fetchTipsCount();

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
          const hasShown = sessionStorage.getItem("hasShownPricingModal");
          if (!hasShown) {
            setShowPricingModal(true);
            sessionStorage.setItem("hasShownPricingModal", "true");
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
              setTryonItems(sortedTryonItems.slice(0, 3));
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
    if (typeof window !== 'undefined' && userEmail) {
      try {
        // Get registration data
        const registerData = JSON.parse(localStorage.getItem('onboarding_register') || '{}');
        
        // Get onboarding data
        const data = getAllOnboardingData();
        const flatData = Object.values(data).reduce((acc, section) => {
          if (section && typeof section === "object") {
            Object.entries(section).forEach(([key, value]) => {
              acc[key] = value;
            });
          }
          return acc;
        }, {});

        const gender = flatData.gender || "Not Set";
        const bodyShape = flatData.bodyShape || "Not Set";
        const selectedType = flatData.selectedType || "Not Set";
        const skinTone = flatData.skinTone || "Not Set";
        const clothingType = flatData.clothingType || "Top";
        const occupation = registerData.occupation || flatData.occupation || "Not Set";
        const country = registerData.country || flatData.country || "Not Set";

        // Create display items
        const items = [
          { label: "User Preferences", items: [
            { icon: Shirt, label: clothingType, value: selectedType },
            { icon: Sparkles, label: "Skin", value: skinTone },
            { icon: User, label: "Gender", value: gender },
            { icon: Star, label: "Body", value: bodyShape },
            { icon: TrendingUp, label: "Fashion Type", value: selectedType },
          ]},
          { label: "Monthly Status", items: [
            { icon: Sparkles, label: "Fitting", value: `${tryOnCount}x` },
            { icon: Star, label: "Styling", value: `${tipsCount}x` },
            { icon: ChevronRight, label: "Plan", value: selectedPlan }
          ]},
          // { label: "User Profile", items: [
          //   { icon: ChevronRight, label: "Location", value: country },
          //   { icon: TrendingUp, label: "Occupation", value: occupation }
          // ]}
        ].filter(section => section.items.some(item => item.value !== "Not Set" && item.value !== ""));

        setProfileItems(items);
      } catch (err) {
        console.error('Error loading profile data:', err);
        setProfileItems([]);
      }
    }
  }, [userEmail, tryOnCount, tipsCount, selectedPlan]);

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
 <Script
strategy="afterInteractive"
src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID}`}
/>
 <Script id="google-analytics" strategy="afterInteractive">
{`
 window.dataLayer = window.dataLayer || [];
 function gtag(){dataLayer.push(arguments);}
 gtag('js', new Date());
 gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID}');
 `}
 </Script>
 
 <div className="bg-gradient-to-b from-gray-50 to-white w-full min-h-screen flex flex-col">
 <Navbar />

{/* Main Content */}
 <div className="flex-1 overflow-y-auto pb-20 pt-16">
 
{/* Hero Section with Greeting and Profile Summary */}
 <div className="px-6 pt-8 pb-6">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h1 className="text-3xl font-bold mb-1" style={{ color: BRAND_BLUE }}>
 Hi there!
 </h1>
 <p className="text-gray-600">Ready to style your day?</p>
 </div>
 </div>

{/* Profile Summary Cards */}
 <div className="mb-6">
{(() => {
if (profileItems.length === 0) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-semibold text-gray-900 mb-1">Complete Your Style Profile</p>
          <p className="text-sm text-gray-600">Tell us about your preferences</p>
        </div>
        <Link href="/onboarding/physical-attributes/step-1">
          <button className="bg-white text-blue-600 px-4 py-2 rounded-xl font-medium text-sm shadow-sm border border-blue-200">
            Setup
          </button>
        </Link>
      </div>
    </div>
  )
}

// Show profile summary in sections
return (
  <div className="flex flex-auto gap-2">
    {profileItems.map((section, sectionIndex) => (
      <div key={sectionIndex} className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-3 text-gray-800">{section.label}</h3>
        <div className="flex flex-wrap flex-cols-2 gap-2">
          {section.items.map((item, itemIndex) => {
            const IconComponent = item.icon;
            return (
              <div key={itemIndex} className="bg-gray-50/50 w-auto rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <IconComponent className="w-4 h-4 mt-0.5 text-gray-600" />
                  <div>
                    <span className="text-xs text-gray-500 block">{item.label}</span>
                    <p className="text-sm font-medium text-gray-900">{item.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ))}
  </div>
)
 })()}
 </div>

{/* AI Style Button - More prominent */}
 <button
onClick={() => {
if (!user) {
 localStorage.setItem("postLoginRedirect", "/onboarding/register")
 toast.error("Please sign in to use this feature.")
setTimeout(() => signinRedirect(), 1500)
 } else {
const data = getAllOnboardingData()
setOnboardingData(data)
setShowForYouModal(true)
 }
 }}
className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 rounded-3xl font-bold text-lg flex items-center justify-center shadow-lg shadow-blue-200/50 mb-2"
style={{ backgroundImage: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #1e40af 100%)` }}
>
 <Sparkles className="w-6 h-6 mr-3" />
 Get AI Style Recommendations
 </button>
 <p className="text-center text-xs text-gray-500 mb-8">Powered by personalized AI matching</p>
 </div>

{/* Try-On History Section */}
<div className="px-6 mb-8">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-bold text-gray-900">Try-On History</h2>
 <Link href="/tryOnHistory" className="text-sm font-medium" style={{ color: BRAND_BLUE }}>
 View All
 </Link>
 </div>
 
 <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
{tryonItems.length > 0
? tryonItems.slice(0, 3).map((item, index) => (
<Link
key={index}
href="/try-on-history"
className="min-w-36 h-48 rounded-3xl overflow-hidden flex-shrink-0 bg-white shadow-md border border-gray-100 relative group"
>
{item?.generatedImageUrl ? (
<Image
src={item.generatedImageUrl}
alt={`Try-on #${tryonItems.length - index}`}
width={144}
height={192}
className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
/>
) : (
<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
 <Shirt className="w-10 h-10 text-gray-400" />
</div>
)}
<div className="absolute bottom-3 left-3 right-3 space-y-1">
 <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5">
 <p className="text-xs font-medium text-gray-800">Try-On #{tryonItems.length - index}</p>
 {item.timestamp && (
 <p className="text-xs text-gray-500">
 {new Date(item.timestamp).toLocaleDateString()}
 </p>
 )}
 </div>
 {item.rating > 0 && (
 <div className="bg-white/90 backdrop-blur-sm rounded-xl px-2 py-1 flex justify-center">
 {[1, 2, 3, 4, 5].map((star) => (
 <Star
 key={star}
 className={`w-3 h-3 ${
 star <= item.rating
 ? 'text-yellow-400 fill-current'
 : 'text-gray-300'
 }`}
 />
 ))}
 </div>
 )}
</div>
</Link>
))
: [1, 2, 3].map((item) => (
<div
key={item}
className="min-w-36 h-48 rounded-3xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative"
>
 <Shirt className="w-10 h-10 text-gray-400" />
 <div className="absolute bottom-3 left-3 right-3">
 <div className="bg-white/80 backdrop-blur-sm rounded-xl px-3 py-1.5">
 <p className="text-xs font-medium text-gray-600">Try something new</p>
 </div>
 </div>
</div>
))}
 </div>
</div>

{/* Wardrobe Collection */}
 <div className="px-6 pb-8">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-xl font-bold text-gray-900">My Wardrobe</h2>
 <Link href="/profile" className="flex items-center text-sm font-medium" style={{ color: BRAND_BLUE }}>
 Organize <ChevronRight size={16} className="ml-1" />
 </Link>
 </div>

{/* Wardrobe Grid */}
 <div className="space-y-6">
{/* Tops Section */}
 <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-bold text-gray-900">Tops</h3>
 <span className="text-sm text-gray-500">{likedRecommendations.length > 0 ? Math.min(2, likedRecommendations.length) : 0} items</span>
 </div>
 <div className="flex gap-3">
{likedRecommendations.length > 0
? likedRecommendations.slice(0, 2).map((recommendation, index) => (
<Link
key={recommendation.productId}
href="/profile"
className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 relative group"
>
{recommendation.imageUrl ? (
<Image
src={recommendation.imageUrl || "/placeholder.svg"}
alt="Top Item"
fill
className="object-cover group-hover:scale-105 transition-transform duration-300"
/>
 ) : (
<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
 <Shirt className="w-8 h-8 text-gray-400" />
 </div>
 )}
 </Link>
 ))
: [1, 2].map((item) => (
<div
key={item}
className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
>
 <Shirt className="w-8 h-8 text-gray-400" />
 </div>
 ))}
 </div>
 </div>

{/* Bottoms Section */}
 <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-bold text-gray-900">Bottoms</h3>
 <span className="text-sm text-gray-500">{likedRecommendations.length > 2 ? Math.min(2, likedRecommendations.length - 2) : 0} items</span>
 </div>
 <div className="flex gap-3">
{likedRecommendations.length > 2
? likedRecommendations.slice(2, 4).map((recommendation, index) => (
<Link
key={recommendation.productId}
href="/profile"
className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 relative group"
>
{recommendation.imageUrl ? (
<Image
src={recommendation.imageUrl || "/placeholder.svg"}
alt="Bottom Item"
fill
className="object-cover group-hover:scale-105 transition-transform duration-300"
/>
 ) : (
<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
 <Shirt className="w-8 h-8 text-gray-400" />
 </div>
 )}
 </Link>
 ))
: [1, 2].map((item) => (
<div
key={item}
className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
>
 <Shirt className="w-8 h-8 text-gray-400" />
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>

{/* Style Modal - Enhanced */}
{showForYouModal && (
<div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 backdrop-blur-sm">
 <div className="bg-white rounded-t-3xl w-full max-w-md mx-auto shadow-2xl overflow-hidden animate-slide-up">
 <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
 <div>
 <h2 className="text-xl font-bold" style={{ color: BRAND_BLUE }}>
 Your Style DNA
 </h2>
 <p className="text-gray-500 text-sm">Personalized just for you</p>
 </div>
 <button
onClick={() => setShowForYouModal(false)}
className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
>
 <X className="w-5 h-5 text-gray-600" />
 </button>
 </div>
 
 <div className="max-h-80 overflow-y-auto px-6 py-4">
{(() => {
const flatData = Object.values(onboardingData).reduce((acc, section) => {
if (section && typeof section === "object") {
 Object.entries(section).forEach(([key, value]) => {
 acc[key] = value
 })
 }
return acc
 }, {})
const displayKeys = Object.keys(keyDisplays)
const filtered = displayKeys
 .filter((key) => flatData[key] !== undefined && flatData[key] !== null && flatData[key] !== "")
 .map((key) => ({
 label: keyDisplays[key],
 value: Array.isArray(flatData[key]) ? flatData[key].join(", ") : String(flatData[key]),
 }))

if (filtered.length === 0) {
return (
<div className="text-center py-8">
 <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
 <User className="w-10 h-10" style={{ color: BRAND_BLUE }} />
 </div>
 <p className="text-gray-600 font-medium mb-2">Complete Your Style Profile</p>
 <p className="text-gray-500 text-sm mb-6">Help us understand your unique style</p>
 <Link href="/onboarding/physical-attributes/step-1">
 <button
className="text-white py-4 px-8 rounded-2xl font-medium shadow-lg"
style={{ backgroundColor: BRAND_BLUE }}
>
 Start Setup
 </button>
 </Link>
 </div>
 )
 }

return (
<div className="space-y-4">
{filtered.map(({ label, value }) => (
<div key={label} className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-100">
 <p className="text-sm font-semibold mb-1" style={{ color: BRAND_BLUE }}>
{label}
 </p>
 <p className="text-gray-900">{value}</p>
 </div>
 ))}
 </div>
 )
 })()}
 </div>
 
 <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
 <div className="flex gap-3">
 <button
className="flex-1 text-white py-4 rounded-2xl font-semibold shadow-lg"
style={{ backgroundColor: BRAND_BLUE }}
onClick={() => {
setShowForYouModal(false)
 window.location.href = "/onboarding/recommended-product"
 }}
>
 Get Recommendations
 </button>
 <button
className="flex-1 py-4 rounded-2xl font-semibold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
onClick={() => {
setShowForYouModal(false)
 window.location.href = "/onboarding/physical-attributes/step-1"
 }}
>
 Edit Profile
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 <ToastContainer />

{/* Bottom Navigation Bar - Unchanged */}
 <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around items-center px-2 pt-2 pb-1 z-10">
 <Link href="/" className="flex flex-col items-center text-gray-400 " style={{ color: BRAND_BLUE }}>
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
</>
 )
}