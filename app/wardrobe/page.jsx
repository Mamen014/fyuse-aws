// /app/wardrobe/route.jsx

"use client";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingModalSpinner from "@/components/ui/LoadingState";
import Navbar from "@/components/Navbar";
import { ChevronRight, ShirtIcon } from "lucide-react";
import axios from "axios";

export default function WardrobePage() {
  const { user } = useAuth();
  const [likedRecommendations, setLikedRecommendations] = useState([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [nickname, setNickname] = useState("");
  const [userImage, setuserImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  // Set last updated date when component mounts and fetches user plan
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const token = user.id_token || user.access_token;
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
  }, [user]);

  // Load nickname
  useEffect(() => {
    const fetchNickname = async () => {
      try {
        const token = user.id_token || user.access_token;
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
  }, [user]);

  // Fetch styled items when user is authenticated and subscription plan is set
  useEffect(() => {
    if (user && subscriptionPlan !== null) {
      fetchHistory();
    }
  }, [user, subscriptionPlan]);

  // Fetch user's liked recommendations based on their subscription plan
  const fetchHistory = async () => {
    if (!user) return;

    try {
      const token = user?.id_token || user?.access_token;
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
      setuserImage(data[0]?.user_image_url) || "/placeholder.svg";
    } catch (err) {
      console.error("❌ Error fetching liked recommendations:", err);
      toast.error("Failed to load your liked recommendations.");
      setLikedRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from wardrobe
  const handleRemoveFromWardrobe = async (itemId, taskId) => {
    try {
      const token = user.id_token || user.access_token;
      const res = await fetch("/api/remove-from-wardrobe", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_id: itemId, task_id: taskId }),
      });

      if (!res.ok) throw new Error("Failed to remove item");
      toast.success("Item removed from wardrobe.");
      fetchHistory(); // re-fetch updated wardrobe list
    } catch (err) {
      console.error("Failed to remove from wardrobe:", err);
      toast.error("Error removing item.");
    }
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
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-primary mr-3"><ShirtIcon></ShirtIcon></div>
            <div>
              <h1 className="text-2xl font-semibold text-primary">
                {user ? `Hi, ${nickname || 'there'}!` : 'Your Wardrobe'}
              </h1>
              <p className="text-sm text-muted-foreground">Items you’ve tried!</p>
            </div>
          </div>
          {userImage && (
            <div className="mt-2">
              <img
                src={userImage}
                alt="User Avatar"
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
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-cta hover:underline mt-1">
                    View Product <ChevronRight size={14} className="ml-1" />
                  </a>
                )}
                <button
                  onClick={() => onRemove(item.item_id, item.task_id)}
                  className="text-red-500 text-sm mt-2 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}