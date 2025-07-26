// /app/wardrobe/page.jsx

"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "react-oidc-context";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingModalSpinner from "@/components/ui/LoadingState";
import Navbar from "@/components/Navbar";
import { ChevronRight, ShirtIcon } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";
import axios from "axios";

export default function WardrobePage() {
  const { user, isLoading, signinRedirect } = useAuth();
  const [likedRecommendations, setLikedRecommendations] = useState([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [nickname, setNickname] = useState("");
  const [userImage, setuserImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;
  const userEmail = user?.profile?.email;
  const token = user?.id_token || user?.access_token;

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      signinRedirect();
    }
  }, [isLoading, user, signinRedirect]);

  // Set last updated date when component mounts and fetches user plan
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        if (!token) throw new Error("Missing token");

        const res = await fetch("/api/subscription-status", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch plan");
        const data = await res.json();
        setSubscriptionPlan(data.plan || "Basic");
      } catch (err) {
        console.error("Failed to fetch subscription plan:", err);
        setSubscriptionPlan("Basic");
      }
    };

    if (user) {
      fetchUserPlan();
    }
  }, [user, token]);

  // Load nickname
  useEffect(() => {
    const fetchNickname = async () => {
      try {
        if (!token) throw new Error("Missing token");

        const res = await fetch("/api/user-profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch nickname");
        const data = await res.json();
        setNickname(data.nickname || "");
      } catch (err) {
        console.error("Failed to fetch nickname:", err);
        setNickname("");
      }
    };

    if (user) {
      fetchNickname();
    }
  }, [user, token]);

  // Fetch styled items when user is authenticated and subscription plan is set
  useEffect(() => {
    if (user && subscriptionPlan !== null) {
      fetchHistory();
    }
  }, [user, subscriptionPlan, fetchHistory]);

  // Fetch user's liked recommendations based on their subscription plan
  const fetchHistory = useCallback(async () => {
    if (!user) return;

    try {
      if (!token) throw new Error("Missing token");

      const res = await fetch("/api/styling-history", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
      const data = await res.json();
      const limit = subscriptionPlan === "Glamour" ? data.length
              : subscriptionPlan === "Elegant" ? 50
              : 15;
      setLikedRecommendations(data.slice(0, limit));
      setuserImage(data[0]?.user_image_url || "/placeholder.svg");
    } catch (err) {
      console.error("❌ Error fetching liked recommendations:", err);
      toast.error("Failed to load your liked recommendations.");
      setLikedRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [user, subscriptionPlan, token]);

  // Remove item from wardrobe
  const handleRemoveFromWardrobe = async (itemId, logId) => {
    try {
      const res = await fetch("/api/remove-from-wardrobe", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_id: itemId, log_id: logId }),
      });

      if (!res.ok) throw new Error("Failed to remove item");
      toast.success("Item removed from wardrobe.");
      track("remove_item", { selection: itemId });
      fetchHistory();
    } catch (err) {
      console.error("Failed to remove from wardrobe:", err);
      toast.error("Error removing item.");
    }
  };

  // Track user actions
  const track = async (action, metadata = {}) => {
    if (!userEmail) return;
    await axios.post(`${API_BASE_URL}/trackevent`, {
      userEmail,
      action,
      timestamp: new Date().toISOString(),
      page: 'wardrobe',
      ...metadata,
    }).catch(console.error);
  };

  // If user is not authenticated, show a message prompting them to sign in
  if (!user) {
    return (
      <div className="bg-white max-w-md mx-auto h-screen flex flex-col relative">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center fixed top-0 left-0 right-0 z-10 max-w-md mx-auto">
          <h1 className="text-lg font-semibold text-primary">Your Wardrobe</h1>
        </div>

        <div className="p-6 max-w-3xl mx-auto text-foreground mt-20 flex-1">
          <ToastContainer />
          <p className="text-center text-gray-400">
            🔐 Please sign in to view your profile and liked recommendations.
          </p>
        </div>

      </div>
    );
  }

  const tops = likedRecommendations.filter(item => item.category?.toLowerCase().includes("top"));
  const bottoms = likedRecommendations.filter(item => item.category?.toLowerCase().includes("bottom"));

  // If still loading liked recommendations, show a loading spinner
  if (loading) return <LoadingModalSpinner />;
  
  return (
    <div className="bg-background max-w-7xl mx-auto h-screen flex flex-col relative px-4 md:px-8">
      <Navbar />
      <ToastContainer />

      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center fixed top-0 left-0 right-0 z-10 max-w-md mx-auto">
        <h1 className="text-lg font-semibold text-primary">Your Wardrobe</h1>
      </div>

      <div className="flex-1 overflow-y-auto mt-20 mb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col items-start">
          <div className="flex items-start justify-between w-full mb-4">
            {/* Left: Greeting + Subtitle */}
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-primary mr-3">
                <ShirtIcon />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-primary">
                  {user ? `Hi, ${nickname || 'there'}!` : 'Your Wardrobe'}
                </h1>
                <p className="text-sm text-muted-foreground">Items you’ve tried!</p>
              </div>
            </div>

            {/* Right: CTA Button */}
            <div className="mr-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition"
              >
                Style Me
              </button>
            </div>
          </div>

          {userImage && (
            <div className="mt-2">
              <Image
                src={userImage}
                alt="User Avatar"
                priority
                width={225}
                height={300}
                className="rounded-xl object-cover border border-primary shadow-sm"
              />
            </div>
          )}
        </div>

        <WardrobeSection title="Top" items={tops} onRemove={handleRemoveFromWardrobe} />
        <WardrobeSection title="Bottom" items={bottoms} onRemove={handleRemoveFromWardrobe} />
      </div>
      {isModalOpen && (
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          trackingPage="wardrobe"
        />
      )}      
    </div>
    
  );
}

function WardrobeSection({ title, items, onRemove }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-primary border-b border-muted mb-3 pb-1">{title} ({items.length})</h2>
      {items.length === 0 ? (
        <div className="text-center text-gray-400 py-6 italic">
          Nothing saved here yet. Start discovering your statement pieces!
        </div>
      ) : (
        <div className="flex flex-col space-y-4 md:space-y-0 md:gap-6">
          {items.map((item) => (
            <div key={item.item_id} className="bg-white rounded-2xl shadow-md p-4 flex items-start gap-4 hover:shadow-lg transition-shadow duration-200">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                {item.product_image_url ? (
                  <Image 
                  src={item.product_image_url} 
                  alt={item.cloth_type}
                  sizes="144px"
                  fill
                  className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-primary mb-2">{item.name || "Unknown"}</h3>
                <p className="text-sm text-muted-foreground">{item.brand} ({item.fashType})</p>
                <p className="text-sm text-muted-foreground">Color: <span className="font-medium">{item.color || "N/A"}</span></p>
                
                <div className="flex flex-row items-start justify-between">
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer"
                      onClick={() => track("view_product", { selection: item.item_id })}
                      className="inline-flex items-center text-sm text-cta hover:underline mt-1">
                      View Product <ChevronRight size={14} className="ml-1" />
                    </a>
                  )}
                  <button
                    onClick={() => onRemove(item.item_id, item.log_id)}
                    className="text-red-500 text-sm mt-2 hover:underline"
                  >
                    Remove
                  </button>
                </div>


              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}