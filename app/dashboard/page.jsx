"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "react-oidc-context";
import Navbar from "@/components/Navbar";
import LoadingModalSpinner from "@/components/ui/LoadingState";
import { LayoutGrid, Venus, Mars, User, ChevronRight, Shirt, MapPin, Sparkles, BriefcaseBusiness } from "lucide-react";
import axios from "axios";

export default function dashboard() {
  const { user, isLoading, signinRedirect } = useAuth();
  const router = useRouter();
  const [Loading, setLoading] = useState(false);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [nickname, setNickname] = useState("");
  const [likedRecommendations, setLikedRecommendations] = useState([]);
  const [tryonItems, setTryonItems] = useState([]);
  const userEmail = user?.profile?.email;
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [tryOnCount, setTryOnCount] = useState(0);
  const [tipsCount, setTipsCount] = useState(0);
  const [profileItems, setProfileItems] = useState([]);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;
  const genderIconMap = {
    male: <Mars className="w-20 h-20 text-primary" />,
    female: <Venus className="w-20 h-20 text-primary" />,
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const data = JSON.parse(localStorage.getItem("profile") || "{}");
        console.log("Loaded profile from localStorage:", data);
        if (data.nickname) {
          setNickname(data.nickname);
        }
      } catch (err) {
        console.warn("Failed to parse profile from localStorage:", err);
      }
    }
  }, []);

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

  // Check if user has registered
  useEffect(() => {
    if (typeof window !== "undefined") {
      const value = localStorage.getItem("showRegister");
      const shouldShow = value === "false" || value === "true";
      setShowRegisterPrompt(shouldShow);
    }
  }, []);


  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      signinRedirect();
    }
  }, [isLoading, user, signinRedirect]);

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/userPlan?userEmail=${userEmail}`);
        const planupdate = res.data.plan;
        const updatedCount = res.data.tryOnCount || 0;
        const count = res.data.tipsCount || 0;
        setTipsCount(count);
        setTryOnCount(updatedCount);
        setSubscriptionPlan(planupdate);
      } catch (err) {
        console.error("Failed to fetch subscription plan:", err);
      }
    };

    if (userEmail) {
      fetchUserPlan();
    }
  }, [userEmail]);

  useEffect(() => {
    if (!isLoading && user) {
      const fetchHistory = async () => {
        try {
          const endpoint = `${API_BASE_URL}/userHistory`;
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
  }, [isLoading, user, API_BASE_URL, router]);

  // Load profile display data
  useEffect(() => {
    if (typeof window !== 'undefined' && userEmail) {
      try {
        const data = JSON.parse(localStorage.getItem("profile") || "{}");
        const birthdate = data.birthdate || "Not Set";
        const location = data.city || "Not Set";
        const occupation = data.occupation || "Not Set";
        const gender = localStorage.getItem('gender') || "Not Set";
        const bodyShape = localStorage.getItem('body-shape') || "Not Set";
        const skinTone = localStorage.getItem('skin-tone') || "Not Set";
        const generation = getGeneration(birthdate);

        const items = [
          {
            label: "User Profile",
            items: [
              { icon: MapPin, label: "Location", value: location },
              { icon: Sparkles, label: "Generation", value: generation },
              { icon: Sparkles, label: "Skin Tone", value: skinTone },
              { icon: User, label: "Gender", value: gender },
              { icon: Sparkles, label: "Body Shape", value: bodyShape },
              { icon: BriefcaseBusiness, label: "Occupation", value: occupation },
            ],
          },
          {
            label: "Monthly Status",
            items: [
              { icon: Sparkles, label: "Fitting", value: `${tryOnCount}x` },
              { icon: Sparkles, label: "Styling", value: `${tipsCount}x` },
              { icon: ChevronRight, label: "Plan", value: `${subscriptionPlan}` },
            ],
          },

        ].filter(section => section.items.some(item => item.value !== "Not Set" && item.value !== "" && item.value !== "Category"));

        setProfileItems(items);
      } catch (err) {
        console.error('Error loading profile data:', err);
        setProfileItems([]);
      }
    }
  }, [userEmail, tryOnCount, tipsCount, subscriptionPlan]);

  // Filter recommendations by category
  const tops = likedRecommendations.filter(item => item.category === "top");
  const bottoms = likedRecommendations.filter(item => item.category === "bottom");

  // Add this utility function at the top of your file
  function getGeneration(birthdate) {
    if (!birthdate) return "Unknown";
    const year = new Date(birthdate).getFullYear();
    if (year >= 2013 && year <= 2028) return "Gen Alpha";
    if (year >= 1997 && year <= 2012) return "Gen Z";
    if (year >= 1981 && year <= 1996) return "Millennials";
    if (year >= 1965 && year <= 1980) return "Gen X";
    return "Other";
  }  

  if (isLoading || !user || Loading) {
    return <LoadingModalSpinner />;
  };

  return (
  <div className="bg-gradient-to-b from-gray-50 to-white w-full min-h-screen flex flex-col">
  <Navbar />

  {/* Main Content */}
  <div className="flex-1 overflow-y-auto pb-20 pt-16">
  
  {/* Hero Section with Greeting and Profile Summary */}
  <div className="px-6 pt-8 pb-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-1">
          {nickname ? `Hi ${nickname}!` : "Hi there!"}
        </h1>
        <p className="text-gray-600">Ready to style your day?</p>

        {/* ✅ Inserted block here */}
        {showRegisterPrompt && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Want More Personalized Styles?</p>
                <p className="text-sm text-gray-600 mr-2">Tell us a little about yourself so we can style you better.</p>
              </div>
              <button
                onClick={() => {
                  localStorage.setItem("registerFrom", "dashboard");
                  setLoading(true);
                  router.push("/style-discovery/register");
                }}
                className="bg-white text-blue-600 px-4 py-2 rounded-xl font-medium text-sm shadow-sm border border-blue-200"
              >
                Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {(() => {
          const section = profileItems.find((s) => s.label === "Monthly Status");
          if (!section) return null;

          const itemMap = {};
          section.items.forEach((item) => {
            itemMap[item.label] = item;
          });

          return (
            <div className="bg-white rounded-2xl p-4 shadow-sm w-full">
              <h3 className="text-lg font-semibold mb-3 text-primary">{section.label}</h3>
              <div className="flex gap-2 w-full">
                {[itemMap["Fitting"], itemMap["Styling"]].map((item, i) => (
                  item && (
                    <div
                      key={i}
                      className="flex flex-col justify-between bg-gray-50 rounded-xl p-3 w-full"
                    >
                      <div className="flex items-start gap-2">
                        <item.icon className="w-4 h-4 mt-0.5 text-primary" />
                        <div className="flex flex-col">
                          <span className="text-lg text-gray-500">{item.label}</span>
                          <p className="text-lg font-bold text-gray-900">{item.value}</p>
                        </div>
                      </div>
                    </div>
                  )
                ))}

                {itemMap["Plan"] && (
                  <div className="col-span-2 bg-gray-50 rounded-xl p-3 flex items-start gap-2 w-full">
                    {(() => {
                      const IconComponent = itemMap["Plan"].icon;
                      return <IconComponent className="w-4 h-4 mt-0.5 text-gray-600" />;
                    })()}
                    <div>
                      <span className="text-lg text-gray-500 block">Plan</span>
                      <p className="text-lg font-bold text-gray-900">{itemMap["Plan"].value}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
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
              Setup Preferences
            </button>
          </Link>
        </div>
      </div>
    )
  }



  })()}
  </div>
  <button
    onClick={() => (window.location.href = "/style-discovery")}
    className="w-full bg-primary text-primary-foreground py-5 rounded-3xl font-bold text-lg flex items-center justify-center shadow-lg shadow-blue-200/50 mb-2 px-4">
    <span>Style discovery</span>
  </button>

  </div>

  {/* Try-On History Section */}
  <div className="px-6 mb-8">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-primary">Try-On History</h2>
      <Link href="/tryOnHistory" className="flex items-center text-sm text-primary font-medium">
      View All <ChevronRight size={16} className="ml-1"/>
      </Link>
    </div>
  
  <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
  {tryonItems.length > 0
  ? tryonItems.slice(0, 3).map((item, index) => (
  <Link
  key={index}
  href="/tryOnHistory"
  className="min-w-36 h-48 rounded-3xl overflow-hidden flex-shrink-0 bg-white shadow-md border border-gray-100 relative group"
  >
  {item?.generatedImageUrl ? (
  <Image
    src={item.generatedImageUrl}
    alt={`Try-on #${tryonItems.length - index}`}
    fill
    sizes="144px"
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
    {/* User Profile */}
    <div className="px-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {(() => {
          const section = profileItems.find((s) => s.label === "User Profile");
          if (!section) return null;

          const itemMap = {};
          section.items.forEach((item) => {
            itemMap[item.label] = item;
          });

          return (
            <div className="bg-white rounded-2xl p-4 shadow-sm w-full">
              <h3 className="text-xl font-semibold mb-3 text-primary">{section.label}</h3>
              <div className="flex gap-2 mb-2">
                <div className="flex-1 flex flex-col items-center bg-gray-50 rounded-xl p-3">
                  {genderIconMap[(itemMap["Gender"]?.value || "").toLowerCase()] || (
                    <span className="text-gray-400">-</span>
                  )}
                  <span className="text-sm font-medium text-gray-900 mt-3">
                    {capitalizeWords(itemMap["Gender"]?.value)}
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center bg-gray-50 rounded-xl p-3">
                  {skinToneImageMap[(itemMap["Skin Tone"]?.value || "").toLowerCase()] ? (
                    <Image
                      src={skinToneImageMap[(itemMap["Skin Tone"]?.value || "").toLowerCase()]}
                      alt={itemMap["Skin Tone"]?.value || "Skin Tone"}
                      width={64}
                      height={64}
                      className="rounded-md object-contain"
                    />
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                  <span className="text-sm font-medium text-gray-900 mt-5">
                    {capitalizeWords(itemMap["Skin Tone"]?.value)}
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center bg-gray-50 rounded-xl p-3">
                  {itemMap["Gender"]?.value && itemMap["Body Shape"]?.value &&
                  bodyShapeImageMap[itemMap["Gender"].value.toLowerCase()]?.[itemMap["Body Shape"].value.toLowerCase()] ? (
                    <Image
                      src={bodyShapeImageMap[itemMap["Gender"].value.toLowerCase()][itemMap["Body Shape"].value.toLowerCase()]}
                      alt={itemMap["Body Shape"]?.value || "Body Shape"}
                      width={80}
                      height={80}
                      className="rounded-md object-contain"
                    />
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                  <span className="text-sm font-medium text-gray-900 mt-1">
                    {capitalizeWords(itemMap["Body Shape"]?.value)}
                  </span>
                </div>                                                
              </div>
              <div className="flex gap-2 mb-2">  

              </div>  
              <div className="flex gap-2 mb-2">
                {[itemMap["Location"], itemMap["Occupation"]].map((item, i) =>
                  item && (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-start gap-2 flex-1">
                      <item.icon className="w-10 h-10 mt-0.5 text-gray-600" />
                      <div>
                        <p className="text-xl font-medium text-gray-900 mt-2">{item.value}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
    {/* Wardrobe Collection */}
    <div className="px-6 pb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-primary">My Wardrobe</h2>
        <Link href="/wardrobe" className="flex items-center text-sm text-primary font-medium">
        View All <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>

      {/* Wardrobe Grid */}
      <div className="space-y-6">
      {/* Tops Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-primary">Top</h3>
        </div>
        <div className="flex gap-3">
          {tops.length > 0
            ? tops.slice(0, 2).map((recommendation) => (
                <Link
                  key={recommendation.productId}
                  href="/wardrobe"
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
          <h3 className="text-lg font-bold text-primary">Bottom</h3>
        </div>
        <div className="flex gap-3">
          {bottoms.length > 0
            ? bottoms.slice(0, 2).map((recommendation) => (
                <Link
                  key={recommendation.productId}
                  href="/wardrobe"
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

  {/* Bottom Navigation Bar - Unchanged */}
  <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around items-center px-2 pt-2 pb-1 z-10">
  <Link href="/dashboard" className="flex flex-col items-center text-gray-400 ">
  <LayoutGrid size={20} />
  <span className="text-xs mt-1">Dashboard</span>
  </Link>
  <Link href="/wardrobe" className="flex flex-col items-center text-gray-400 hover:text-blue-900">
  <Shirt className="w-5 h-5 mb-0.5" />
  <span className="text-xs mt-1">Wardrobe</span>
  </Link>
  <Link href="/insights" className="flex flex-col items-center text-gray-400 hover:text-blue-900">
  <User className="w-5 h-5 mb-0.5" />
  <span className="text-xs mt-1">Profile</span>
  </Link>
  </div>
  </div>
  )
}