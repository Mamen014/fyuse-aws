// app/dashboard/page.jsx

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "react-oidc-context";
import Navbar from "@/components/Navbar";
import LoadingModalSpinner from "@/components/ui/LoadingState";
import { useUserProfile } from "../context/UserProfileContext";
import ReferralModal from "@/components/ReferralModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import SurveyPromptModal from "@/components/SurveyPromptModal";
import { getOrCreateSessionId } from "@/lib/session";
import { ChevronRight, Shirt, MapPin, BriefcaseBusiness, CreditCard } from "lucide-react";
import axios from "axios";
import { sendGAEvent } from "@next/third-parties/google";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, signinRedirect } = useAuth();
  const token = useMemo(() => {
    if (!user) return null;
    return user.access_token || user.id_token;
  }, [user]);
  
  const { profile, loading: profileLoading, refetchProfile } = useUserProfile();
  const nickname = profile?.nickname || "";
  const sessionId = getOrCreateSessionId();
  const pathname = usePathname();
  const [tryOnCount, setTryOnCount] = useState(0);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);  
  const [clothCategory, setClothCategory] = useState([]);
  const [fashType, setFashType] = useState([]);
  const [tryonItems, setTryonItems] = useState([]);
  const [profileItems, setProfileItems] = useState([]);
  const [loading, setLoading] = useState(false);  
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showSurveyPrompt, setShowSurveyPrompt] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

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

  // Utility for display
  function capitalizeWords(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Track user actions
  const logActivity = async (
    action,
    { selection, page } = {}
  ) => {
    try {
      const res = await fetch("/api/log-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          action,
          selection,
          page: page || window.location.pathname,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        console.warn("⚠️ Failed to log activity:", await res.json());
      }
    } catch (error) {
      console.error("❌ Activity log error:", error);
    }
  };

  // Fetch survey prompt if user is authenticated
  useEffect(() => {
    try {
      if (isLoading || !user || !token) return;

      // Fetch survey prompt
      const fetchSurveyPrompt = async () => {
        const res = await fetch('/api/survey-prompt', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            "x-session-id": sessionId,
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch survey prompt: ${res.status}`);
        const data = await res.json();
        if (data.dismissed === false && [3, 5, 9, 15].includes(data.stage) ) {
          setShowSurveyPrompt(true);
        }
      };
      if (user) {
        fetchSurveyPrompt();
      } 
    }
    catch (error) {
      console.error("Error in fetching data:", error);
    }
  }, [user, token, isLoading, sessionId]);

  useEffect(() => {
    if (!profile) return;

    const isIncomplete =
      !profile.city || !profile.occupation;

    setShowRegisterPrompt(isIncomplete);
  }, [profile]);

  // Show referral modal if applicable
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seeReferral = localStorage.getItem("seeReferral");
      if (seeReferral === "true") {
        setShowReferralModal(true);
      }
    }
  }, []);

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      signinRedirect();
      return;
    }
  }, [isLoading, user, signinRedirect]);

  // Fetch user subscription plan
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return;

        // Fetch user subs data
        const resPlan = await axios.get("/api/subscription-status", { 
          headers: { 
            "x-session-id": sessionId,
            Authorization: `Bearer ${token}`, 
          },           
        });

        // Plan data
        const { plan, successful_stylings } = resPlan.data;
        setTryOnCount(successful_stylings);
        setSubscriptionPlan(plan);
      } catch (err) {
        console.error("❌ Error fetching plan:", err);
        setTryOnCount("");
        setSubscriptionPlan("");
      }
    };

    fetchData();
  }, [user, token, sessionId]);

  // Set profile data
  useEffect(() => {
    if (!profile || !subscriptionPlan) return;

    const items = [
      {
        label: "Profile",
        items: [
          { icon: MapPin, label: "City", value: profile.city || "Not Set" },
          { icon: BriefcaseBusiness, label: "Occupation", value: profile.occupation || "Not Set" },
        ],
      },
      {
        label: "Monthly Status",
        items: [
          { icon: Shirt, label: "Styling", value: `${tryOnCount}x` },
          { icon: CreditCard, label: "Plan", value: `${subscriptionPlan}` },
        ],
      },
    ].filter((section) =>
      section.items.some(
        (item) =>
          item.value !== "Not Set" &&
          item.value !== "" &&
          item.value !== "Category"
      )
    );

    setProfileItems(items);
  }, [profile, tryOnCount, subscriptionPlan]);

  // Fetch user style preference
  useEffect(() => {
    const fetchStylePref = async () => {
      try {
        if (!token) return;

        const res = await axios.get("/api/style-preference", {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-session-id": sessionId,
          },
        });
        const { clothing_category, fashion_type } = res.data;
        setClothCategory(clothing_category);
        setFashType(fashion_type);
      } catch (err) {
        console.error("Failed to fetch style preferences:", err);
      }
    };

    if (user) {
      fetchStylePref();
    }
  }, [user, token, sessionId]);

  // Fetch user history
  useEffect(() => {
    if (!isLoading && user) {
      const fetchHistory = async () => {
        try {
          if (!token) throw new Error("Missing token");

          const res = await fetch("/api/styling-history", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "x-session-id": sessionId,
            },
          });

          if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
          const data = await res.json();

          // Sort by timestamp descending and take latest 3
          const sortedTryonItems = data
          setTryonItems(sortedTryonItems.slice(0, 3));

        } catch (err) {
          console.error("Error fetching history:", err);
          setTryonItems([]);
        }
      };

      fetchHistory();
    }
  }, [isLoading, user, token, sessionId]);

  // Filter recommendations by category
  const tops = tryonItems.filter(item => item.category === "top");
  const bottoms = tryonItems.filter(item => item.category === "bottom");

  // Show loading spinner if data is still being fetched
  if (isLoading || profileLoading  || !user || loading) {
    return <LoadingModalSpinner />;
  };

  return (
  <div className="bg-background w-full min-h-screen flex flex-col text-primary">
    <Navbar />

    {/* Main Content */}
    <div className="flex flex-col pb-20 pt-16">
    
      {/* Greeting Section */}
      <div className="flex flex-col px-6 pt-8 pb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">
            {nickname ? `Hi ${nickname}!` : "Hi there!"}
          </h1>
          <p className="text-sm text-primary/70">Let&apos;s find your next favorite look.</p>

          {showRegisterPrompt && (
            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-primary/20">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-primary mb-1">Want More Personalized Styles?</p>
                  <p className="text-sm text-primary/60">Tell us a little about yourself so we can style you better.</p>
                </div>
                <button
                  onClick={() => {
                    localStorage.setItem("registerFrom", "dashboard");
                    trackGAEvent('click_setup_profile', {
                      page_context: pathname,
                      user_status: user ? 'authenticated' : 'unauthenticated',
                    });                    
                    setLoading(true);
                    router.push("/register");
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-xl text-sm shadow-md"
                >
                  Setup
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile + Monthly Status Combined Section */}
        <div className="gap-6 px-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">

            {/* Profile Card */}
            {(() => {
              const section = profileItems.find((s) => s.label === "Profile");
              if (!section) return null;

              const itemMap = {};
              section.items.forEach((item) => {
                itemMap[item.label] = item;
              });

              return (
                <div className="bg-white basis-1/2 rounded-2xl p-6 shadow-md flex flex-col justify-between">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-primary mb-4">
                    {section.label}
                  </h3>
                  <div className="flex gap-2 mb-4">

                    {/* Skin Tone */}
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-xl p-3">
                      {profile?.skin_tone ? (
                        <Image
                          src={`/images/skin-tone/${profile.skin_tone}.png`}
                          alt="Skin Tone"
                          width={64}
                          height={64}
                          className="rounded-md object-contain mt-4"
                        />
                      ) : <span className="text-gray-400">-</span>}
                      <span className="text-sm font-medium text-gray-900 mt-5">
                        {capitalizeWords(profile?.skin_tone)}
                      </span>
                    </div>

                    {/* Body Shape */}
                    <div className="flex-1 flex flex-col items-center bg-gray-50 rounded-xl p-3">
                      {profile?.gender && profile.body_shape ? (
                        <Image
                          src={`/images/body-shape/${profile.gender}/${profile.body_shape}.png`}
                          alt="Body Shape"
                          width={96}
                          height={96}
                          priority
                          className="rounded-md object-contain"
                        />
                      ) : <span className="text-gray-400">-</span>}
                      <span className="text-sm font-medium text-gray-900 mt-1">
                        {capitalizeWords(profile?.body_shape)}
                      </span>
                    </div>
                  </div>

                  {/* Location and Occupation */}
                  <div className="flex gap-2">
                        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-center gap-2 flex-1">
                          <MapPin className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">{capitalizeWords(profile?.city)}</p>
                          </div>
                        </div> 
                        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-center gap-2 flex-1">
                          <BriefcaseBusiness className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">{capitalizeWords(profile?.occupation)}</p>
                          </div>
                        </div>                                            
                  </div>
                </div>
              );
            })()}

            {/* Monthly Status Card */}
            {(() => {
              const section = profileItems.find((s) => s.label === "Monthly Status");
              if (!section) return null;

              const itemMap = Object.fromEntries(section.items.map(item => [item.label, item]));
              const stylingItem = itemMap["Styling"];
              const planItem = itemMap["Plan"];
              const IconComponent = stylingItem.icon;
              const PlanIcon = planItem.icon;

              return (
                <div className="bg-white basis-1/2 rounded-2xl p-6 shadow-md flex flex-col justify-between">
                  <h3 className="text-lg sm:text-xl font-bold mb-4">Monthly Status</h3>
                  <div className="flex flex-row flex-wrap gap-3 sm:flex-col">
                    {/* Styling */}
                    <div className="flex-1 min-w-[140px] flex items-center gap-4 bg-background rounded-xl p-4 border border-white/10">
                      <IconComponent className="w-10 h-10 text-primary" />
                      <div>
                        <p className="text-sm text-primary/60 mb-1">Styling</p>
                        <p className="text-xl font-bold text-primary">{stylingItem?.value || "Loading..."}</p>
                      </div>
                    </div>

                    {/* Plan */}
                    <div className="flex-1 min-w-[140px] flex items-center gap-4 bg-background rounded-xl p-4 border border-white/10">
                      <PlanIcon className="w-10 h-10 text-primary" />
                      <div>
                        <p className="text-sm text-primary/60 mb-1">Current Plan</p>
                        <p className="text-xl font-bold text-primary">{capitalizeWords(planItem?.value || "Loading...")}</p>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              trackGAEvent('click_start_style_discovery', {
                page_context: pathname,
                user_status: user ? 'authenticated' : 'unauthenticated',
              });          
              setShowConfirmationModal(true)}}
            className="bg-primary text-white font-bold text-lg py-4 w-full rounded-3xl shadow-md hover:bg-primary/90"
          >
            Start Style Discovery
          </button>
        </div>
      </div>

      {/* Styling History & Wardrobe Collection Side by Side on Desktop */}
      <div className="px-6 mb-8 flex flex-col gap-6 md:flex-row md:items-stretch">

        {/* Styling History Section */}
        <div className="basis-1/2 flex flex-col bg-white shadow-md rounded-3xl border border-gray-100 p-3 h-full min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary mb-4">Styling History</h2>
            <Link href="/history" className="flex items-center text-sm text-primary font-medium">
              View All <ChevronRight size={16} className="ml-1"/>
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {tryonItems.length > 0
              ? tryonItems.slice(0, 3).map((item, index) => (
                  <Link
                    key={index}
                    href="/history"
                    className="min-w-48 h-56 rounded-3xl overflow-hidden flex-shrink-0 bg-white shadow-md border border-gray-100 relative group"
                  >
                    {item?.styling_image_url ? (
                      <Image
                        src={item.styling_image_url}
                        alt={`Try-on #${tryonItems.length - index}`}
                        sizes="144px"
                        fill
                        priority
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <Shirt className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
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

        {/* Wardrobe Collection Section */}
        <div className="basis-1/2 flex flex-col bg-white shadow-md rounded-3xl border border-gray-100 p-3 h-full min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary mb-2">My Wardrobe</h2>
            <Link href="/wardrobe" className="flex items-center text-sm text-primary font-medium">
              View All <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>

          {/* Wardrobe Grid */}
          <div className="flex flex-col lg:flex-row gap-5 justify-between">

            {/* Tops Section */}
            <div className="bg-white rounded-3xl p-4 border border-primary/10 max-h-80 lg:max-h-72 overflow-hidden flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary">Top</h3>
              </div>
              <div className="flex gap-3">
                {tops.length > 0
                  ? tops.slice(0, 3).map((recommendation) => (
                      <Link
                        key={recommendation.item_id}
                        href="/wardrobe"
                        className="flex-1 max-w-[120px] aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100 relative group"
                      >
                        {recommendation.product_image_url ? (
                          <Image
                            src={recommendation.product_image_url || "placeholder.svg"}
                            alt="Top Item"
                            fill
                            sizes="144px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <Shirt className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </Link>
                    ))
                  : [0, 1, 2].map((item) => (
                      <div
                        key={item}
                        className="flex-1 max-w-[120px] aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                      >
                        <Shirt className="w-8 h-8 text-gray-400" />
                      </div>
                    ))}
              </div>
            </div>

            {/* Bottoms Section */}
            <div className="bg-white rounded-3xl p-4 border border-primary/10 max-h-80 lg:max-h-72 overflow-hidden flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary">Bottom</h3>
              </div>
              <div className="flex gap-3">
                {bottoms.length > 0
                  ? bottoms.slice(0, 3).map((recommendation) => (
                      <Link
                        key={recommendation.item_id}
                        href="/wardrobe"
                        className="flex-1 max-w-[120px] aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100 relative group"
                      >
                        {recommendation.product_image_url ? (
                          <Image
                            src={recommendation.product_image_url || "/placeholder.svg"}
                            alt="Bottom Item"
                            fill
                            sizes="144px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <Shirt className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </Link>
                    ))
                  : [0, 1, 2].map((item) => (
                      <div
                        key={item}
                        className="flex-1 max-w-[120px] aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                      >
                        <Shirt className="w-8 h-8 text-gray-400" />
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmationModal
      isOpen={showConfirmationModal}
      onClose={() => setShowConfirmationModal(false)}
      trackingPage="/dashboard"
    />

    {/* Referral Modal */}
    {showReferralModal && (
      <ReferralModal
        isOpen={showReferralModal}
        handleTrack={(selectedOption) => {
          logActivity("referral_selection", { selection: selectedOption }); 
          localStorage.removeItem("seeReferral");
          setShowReferralModal(false);
        }}
        onClose={() => setShowReferralModal(false)}
      />
    )}

    {/* Survey Prompt Modal */}
    {showSurveyPrompt && (
      <SurveyPromptModal
        isOpen={showSurveyPrompt}
        token={token}
        onClose={() => {
          logActivity("survey_prompt", { selection: "declined" });
          setShowSurveyPrompt(false);
        }}
        onSubmit={() => {
          logActivity("survey_prompt", { selection: "accepted" });
          setShowSurveyPrompt(false);
          router.push("/survey");
        }}
      />
    )}

  </div>
  )
}