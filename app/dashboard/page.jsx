// app/dashboard/paeg.jsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useAuth } from "react-oidc-context";
import Navbar from "@/components/Navbar";
import LoadingModalSpinner from "@/components/ui/LoadingState";
import ReferralModal from "@/components/ReferralModal";
import { User, ChevronRight, Shirt, MapPin, Sparkles, BriefcaseBusiness, CreditCard } from "lucide-react";
import axios from "axios";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, signinRedirect } = useAuth();
  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;
  
  const [tryOnCount, setTryOnCount] = useState(0);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);  
  const [nickname, setNickname] = useState("");
  const [clothCategory, setClothCategory] = useState([]);
  const [fashType, setFashType] = useState([]);
  const [tryonItems, setTryonItems] = useState([]);
  const [profileRaw, setProfileRaw] = useState(null);
  const [profileItems, setProfileItems] = useState([]);
  const [Loading, setLoading] = useState(false);  
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Body shape image mapping
  const bodyShapeImageMap = {
    male: {
      'rectangle': '/images/body-shape/male/rectangle.png',
      'inverted triangle': '/images/body-shape/male/inverted-triangle.png',
      'round': '/images/body-shape/male/round.png',
      'trapezoid': '/images/body-shape/male/trapezoid.png',
      'triangle': '/images/body-shape/male/triangle.png',
    },
    female: {
      'hourglass': '/images/body-shape/female/hourglass.png',
      'pear': '/images/body-shape/female/pear.png',
      'apple': '/images/body-shape/female/apple.png',
      'rectangle': '/images/body-shape/female/rectangle.png',
      'inverted triangle': '/images/body-shape/female/inverted-triangle.png',
    }
  };

  // Skin tone image mapping
  const skinToneImageMap = {
    'fair': '/images/skin-tone/fair.png',
    'light': '/images/skin-tone/light.png',
    'medium': '/images/skin-tone/medium.png',
    'deep': '/images/skin-tone/deep.png',
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
  const track = async (action, metadata = {}) => {
    if (!userEmail) return;
    await axios.post(`${API_BASE_URL}/trackevent`, {
      userEmail,
      action,
      timestamp: new Date().toISOString(),
      page: 'dashboardPage',
      ...metadata,
    }).catch(console.error);
  };

  // Check if user has registered
  useEffect(() => {
    if (typeof window !== "undefined") {
      const value = localStorage.getItem("showRegister");
      const shouldShow = value === "false" || value === "true";
      setShowRegisterPrompt(shouldShow);
    }
  }, []);

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
    }
  }, [isLoading, user, signinRedirect]);

  // Fetch user subscription plan and counts
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const token = user?.id_token || user?.access_token;
        if (!token) return;

        const res = await axios.get("/api/subscription-status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { plan, successful_stylings } = res.data;
        setTryOnCount(successful_stylings);
        setSubscriptionPlan(plan);
      } catch (err) {
        console.error("Failed to fetch subscription plan:", err);
      }
    };

    if (user) {
      fetchUserPlan();
    }
  }, [user]);

  // Fetch user style preference
  useEffect(() => {
    const fetchStylePref = async () => {
      try {
        const token = user?.id_token || user?.access_token;
        if (!token) return;

        const res = await axios.get("/api/style-preference", {
          headers: {
            Authorization: `Bearer ${token}`,
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
  }, [user]);

  // Fetch user history
  useEffect(() => {
    if (!isLoading && user) {
      const fetchHistory = async () => {
        try {
          const token = user.id_token || user.access_token;
          if (!token) throw new Error("Missing token");

          const res = await fetch("/api/styling-history", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
          const data = await res.json();

          // Sort by timestamp descending and take latest 3
          const sortedTryonItems = data
          setTryonItems(sortedTryonItems.slice(0, 3));

          // OPTIONAL: Keep this if you still plan to support likedRecommendations from response
          // if (Array.isArray(data.likedRecommendations)) {
          //   setLikedRecommendations(data.likedRecommendations);
          // } else {
          //   setLikedRecommendations([]);
          // }

        } catch (err) {
          console.error("Error fetching history:", err);
          setTryonItems([]);
          setLikedRecommendations([]);
        }
      };

      fetchHistory();
    }
  }, [isLoading, user]);

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

        const { skin_tone, body_shape, occupation, city, gender, nickname, user_image_url } = res.data;
        setProfileRaw({ skin_tone, body_shape, occupation, city, gender, nickname, user_image_url });
        setNickname(nickname || "");
        const items = [
          {
            label: "Profile",
            items: [
              { icon: MapPin, label: "Location", value: city },
              { icon: Sparkles, label: "Skin Tone", value: skin_tone },
              { icon: User, label: "Gender", value: gender },
              { icon: Sparkles, label: "Body Shape", value: body_shape },
              { icon: BriefcaseBusiness, label: "Occupation", value: occupation },
            ],
          },
          {
            label: "Monthly Status",
            items: [
              { icon: Shirt, label: "Styling", value: `${tryOnCount}x` },
              { icon: CreditCard, label: "Plan", value: `${subscriptionPlan}` },
            ],
          },

        ].filter(section => section.items.some(item => item.value !== "Not Set" && item.value !== "" && item.value !== "Category"));

        setProfileItems(items);
      } catch (err) {
        console.error('Error loading profile data:', err);
        setProfileItems([]);
      }
    }
    
    if (user) {
      fetchUserProfile();
    }    
  }, [user, tryOnCount, subscriptionPlan]);

  // Filter recommendations by category
  const tops = tryonItems.filter(item => item.category === "top");
  const bottoms = tryonItems.filter(item => item.category === "bottom");

  // Show loading spinner if data is still being fetched
  if (isLoading || !user || Loading) {
    return <LoadingModalSpinner />;
  };

  return (
  <div className="bg-background w-full min-h-screen flex flex-col text-primary">
    <Navbar />

    {/* Main Content */}
    <div className="flex-1 overflow-y-auto pb-20 pt-16">
    
      {/* Greeting Section */}
      <div className="px-6 pt-8 pb-6">
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
                    setLoading(true);
                    router.push("/register");
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-xl text-sm shadow-sm"
                >
                  Setup
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile + Monthly Status Combined Section */}
        <div className="px-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

            {/* Profile Card */}
            {(() => {
              const section = profileItems.find((s) => s.label === "Profile");
              if (!section) return null;

              const itemMap = {};
              section.items.forEach((item) => {
                itemMap[item.label] = item;
              });

              return (
                <div className="bg-white rounded-2xl p-6 shadow-md col-span-1 lg:col-span-2 flex flex-col justify-between">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-primary mb-4">
                    {section.label}
                  </h3>
                  <div className="flex gap-2 mb-4">

                    {/* Skin Tone */}
                    <div className="flex-1 flex flex-col items-center bg-gray-50 rounded-xl p-3">
                      {skinToneImageMap[(itemMap["Skin Tone"]?.value || "").toLowerCase()] ? (
                        <Image
                          src={skinToneImageMap[(itemMap["Skin Tone"]?.value || "").toLowerCase()]}
                          alt="Skin Tone"
                          width={64}
                          height={64}
                          className="rounded-md object-contain"
                        />
                      ) : <span className="text-gray-400">-</span>}
                      <span className="text-sm font-medium text-gray-900 mt-5">
                        {capitalizeWords(itemMap["Skin Tone"]?.value)}
                      </span>
                    </div>

                    {/* Body Shape */}
                    <div className="flex-1 flex flex-col items-center bg-gray-50 rounded-xl p-3">
                      {itemMap["Gender"]?.value && itemMap["Body Shape"]?.value &&
                      bodyShapeImageMap[itemMap["Gender"].value.toLowerCase()]?.[itemMap["Body Shape"].value.toLowerCase()] ? (
                        <Image
                          src={bodyShapeImageMap[itemMap["Gender"].value.toLowerCase()][itemMap["Body Shape"].value.toLowerCase()]}
                          alt="Body Shape"
                          width={80}
                          height={80}
                          priority
                          className="rounded-md object-contain"
                        />
                      ) : <span className="text-gray-400">-</span>}
                      <span className="text-sm font-medium text-gray-900 mt-1">
                        {capitalizeWords(itemMap["Body Shape"]?.value)}
                      </span>
                    </div>
                  </div>

                  {/* Location and Occupation */}
                  <div className="flex gap-2">
                    {[itemMap["Location"], itemMap["Occupation"]].map((item, i) =>
                      item && (
                        <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-start gap-2 flex-1">
                          <item.icon className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">{item.value}</p>
                          </div>
                        </div>
                      )
                    )}
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
                <div className="bg-white rounded-2xl p-6 border border-primary/20 shadow-md backdrop-blur-sm flex flex-col justify-between">
                  <h3 className="text-lg sm:text-xl font-bold mb-4">Monthly Status</h3>
                  <div className="flex flex-row flex-wrap gap-3 sm:flex-col">
                    {/* Styling */}
                    <div className="flex-1 min-w-[140px] flex items-center gap-4 bg-background rounded-xl p-4 border border-white/10">
                      <IconComponent className="w-10 h-10 text-primary" />
                      <div>
                        <p className="text-sm text-primary/60 mb-1">Styling</p>
                        <p className="text-xl font-bold text-primary">{stylingItem.value}</p>
                      </div>
                    </div>

                    {/* Plan */}
                    <div className="flex-1 min-w-[140px] flex items-center gap-4 bg-background rounded-xl p-4 border border-white/10">
                      <PlanIcon className="w-10 h-10 text-primary" />
                      <div>
                        <p className="text-sm text-primary/60 mb-1">Current Plan</p>
                        <p className="text-xl font-bold text-primary">{planItem.value}</p>
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
            onClick={() => setShowConfirmationModal(true)}
            className="bg-primary text-white font-bold text-lg py-4 w-full rounded-3xl shadow-lg hover:bg-primary/90"
          >
            Start Style Discovery
          </button>
        </div>
      </div>

      {/* Styling History & Wardrobe Collection Side by Side on Desktop */}
      <div className="px-6 mb-8 flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-6">

        {/* Styling History Section */}
        <div className="flex flex-col mb-6">
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
                    className="min-w-36 h-48 rounded-3xl overflow-hidden flex-shrink-0 bg-white shadow-md border border-gray-100 relative group"
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
                    <div className="absolute bottom-3 left-3 right-3 space-y-1">
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5">
                        {item.timestamp && (
                          <p className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        )}
                      </div>
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

        {/* Wardrobe Collection Section */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary mb-4">My Wardrobe</h2>
            <Link href="/wardrobe" className="flex items-center text-sm text-primary font-medium">
              View All <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>

          {/* Wardrobe Grid */}
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Tops Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 max-h-80 lg:max-h-72 overflow-hidden flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary">Top</h3>
              </div>
              <div className="flex gap-3">
                {tops.length > 0
                  ? tops.slice(0, 3).map((recommendation) => (
                      <Link
                        key={recommendation.item_id}
                        href="/wardrobe"
                        className="flex-1 max-w-[120px] aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 relative group"
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
                  : [1, 2].map((item) => (
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
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 max-h-80 lg:max-h-72 overflow-hidden flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary">Bottom</h3>
              </div>
              <div className="flex gap-3">
                {bottoms.length > 0
                  ? bottoms.slice(0, 3).map((recommendation) => (
                      <Link
                        key={recommendation.item_id}
                        href="/wardrobe"
                        className="flex-1 max-w-[120px] aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 relative group"
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
                  : [1, 2].map((item) => (
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

    {/* Confirmation Modal */}
    {showConfirmationModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
        <div className="modal-content w-full max-w-5xl rounded-2xl p-8 bg-white shadow-xl flex flex-col gap-10 md:flex-row md:gap-12">
          {/* Left Column: Profile Summary */}
          <div className="w-full md:w-[60%] space-y-6">

            {/* Physical Attributes */}
            <div className="border rounded-xl p-5 bg-muted">
              <h3 className="font-bold text-xl text-primary mb-4">Physical Attributes</h3>
              <div className="flex justify-between items-center gap-4">

                {/* Skin Tone */}
                <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow w-full">
                  {profileRaw?.skin_tone && skinToneImageMap[profileRaw.skin_tone.toLowerCase()] ? (
                    <Image
                      src={skinToneImageMap[profileRaw.skin_tone.toLowerCase()]}
                      alt="Skin Tone"
                      width={64}
                      height={64}
                      className="rounded-md object-contain"
                    />
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}

                  <p className="text-sm font-medium text-gray-700 mt-2">
                    {capitalizeWords(profileRaw?.skin_tone || "Not Set")}
                  </p>
                </div>

                {/* Body Shape */}
                <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow w-full">
                  {profileRaw?.gender && profileRaw?.body_shape &&
                  bodyShapeImageMap[profileRaw.gender.toLowerCase()]?.[profileRaw.body_shape.toLowerCase()] ? (
                    <Image
                      src={
                        bodyShapeImageMap[profileRaw.gender.toLowerCase()][profileRaw.body_shape.toLowerCase()]
                      }
                      alt="Body Shape"
                      width={64}
                      height={64}
                      className="rounded-md object-contain"
                    />
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}

                  <p className="text-sm font-medium text-gray-700 mt-2">
                    {capitalizeWords(profileRaw?.body_shape || "Not Set")}
                  </p>
                </div>
              </div>
            </div>

            {/* Liked Item Summary */}
            <div className="border rounded-xl p-5 bg-muted">
              <h3 className="font-bold text-xl text-primary mb-4">Latest Preference</h3>
              {tryonItems.length > 0 ? (
                <div className="flex items-center gap-5">
                  <div className="rounded-xl overflow-hidden shadow-sm bg-white border border-gray-200 aspect-[3/4] w-[100px] h-[130px]">
                    <Image
                      src={tryonItems[0].product_image_url || "/placeholder.svg"}
                      alt="Liked item"
                      width={100}
                      height={130}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col text-sm text-primary">
                    <p>
                      <span className="font-semibold">Fashion Type:</span>{" "}
                      {capitalizeWords(fashType || "Not Set")}
                    </p>
                    <p>
                      <span className="font-semibold">Category:</span>{" "}
                      {capitalizeWords(clothCategory || "Not Set")}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No style pick found.</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 pt-2 py-2">
              <button
                onClick={() => {
                  setShowConfirmationModal(false);
                  setLoading(true);
                  router.push("/personalized-styling/result");
                }}
                className="bg-primary text-white px-5 py-2.5 rounded-lg w-full md:w-auto"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  setShowConfirmationModal(false);
                  setLoading(true);
                  router.push("/personalized-styling/physical-appearances");
                }}
                className="bg-gray-100 text-gray-800 px-5 py-2.5 rounded-lg w-full md:w-auto"
              >
                Re-upload Photo
              </button>
              <button
                onClick={() => {
                  setShowConfirmationModal(false);
                  setLoading(true);
                  router.push("/personalized-styling/style-preferences");
                }}
                className="bg-gray-100 text-gray-800 px-5 py-2.5 rounded-lg w-full md:w-auto"
              >
                Change Preferences
              </button>
            </div>
          </div>

          {/* Right Column: User Image */}
          <div className="w-full md:w-[40%] flex justify-center md:justify-end">
            <Image
              src={profileRaw?.user_image_url || "/placeholder.svg"}
              width={40}
              height={120}
              alt="User Upload"
              className="md:w-full md:max-w-xs object-cover rounded-xl border"
            />
          </div>
        </div>
      </div>
    )}

    {/* Referral Modal */}
    {showReferralModal && (
      <ReferralModal
        isOpen={showReferralModal}
        handleTrack={(selectedOption) => {
          track("referral_selection", { selection: selectedOption }); 
          localStorage.removeItem("seeReferral");
          setShowReferralModal(false);
        }}
        onClose={() => setShowReferralModal(false)}
      />
    )}
  </div>
  )
}