// /app/wardrobe/page.jsx

"use client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import Image from "next/image";
import LoadingModalSpinner from "@/components/ui/LoadingState";
import Navbar from "@/components/Navbar";
import { ChevronRight, ShirtIcon } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useUserProfile } from "../context/UserProfileContext";
import { getOrCreateSessionId } from "@/lib/session";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function WardrobePage() {
  const { user, isLoading, signinRedirect } = useAuth();
  const [likedRecommendations, setLikedRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();
  const { profile, loading: profileLoading } = useUserProfile();
  const userName = profileLoading ? "" : (profile?.nickname || "Guest");
  const userImage = profileLoading ? null : profile?.user_image_url;
  const token = user?.id_token || user?.access_token;
  const sessionId = getOrCreateSessionId();

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      signinRedirect();
      return;
    }
  }, [isLoading, user, signinRedirect]);

  //check profile completeness
  useEffect(() => {
    if (!profileLoading && !isLoading && user && profile) {
      const isProfileIncomplete = !profile.skin_tone || !profile.body_shape;

      if (isProfileIncomplete) {
        toast.error("Please complete your profile first");
        setTimeout(() => {
          router.push('/personalized-styling/physical-appearances')}, 2000);        
      }
    }
  }, [profile, profileLoading, isLoading, user]);

  const fetchAllData = useCallback(async () => {
    try {
      // 1. Fetch Subscription Plan
      const planRes = await fetch("/api/subscription-status", {
        method: "GET",
        headers: { 
          "x-session-id": sessionId,
          Authorization: `Bearer ${token}`,
        },
      });

      if (planRes.status === 429) {
        toast.error("Too many requests. Please wait.");
        return;
      }
      if (!planRes.ok) throw new Error("Failed to fetch plan");

      const planData = await planRes.json();
      const plan = planData.plan || "Basic";

      // 2. Fetch Styling History
      const histRes = await fetch("/api/styling-history", {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-session-id": sessionId,
        },
      });

      if (histRes.status === 429) {
        toast.error("You're sending requests too quickly. Please wait.");
        return;
      }
      if (!histRes.ok) throw new Error(`Failed to fetch history: ${histRes.status}`);

      const historyData = await histRes.json();
      const limit =
        plan === "Glamour"
          ? historyData.length
          : plan === "Elegant"
          ? 50
          : 15;
      setLikedRecommendations(historyData.slice(0, limit));
    } catch (err) {
      console.error("❌ Error fetching user data:", err);
      toast.error("Failed to load user data.");
    } finally {
      setLoading(false);
    }
  },[token, sessionId]);

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

  // Remove item from wardrobe
  const handleRemoveFromWardrobe = async (itemId, logId) => {
    try {
      const res = await fetch("/api/remove-from-wardrobe", {
        method: "PATCH",
        headers: {
          "x-session-id": sessionId,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_id: itemId, log_id: logId }),
      });

      if (!res.ok) throw new Error("Failed to remove item");
      toast.success("Item removed from wardrobe.");
      logActivity("remove_item", { selection: itemId });
      fetchAllData();
    } catch (err) {
      console.error("Failed to remove from wardrobe:", err);
      toast.error("Error removing item.");
    }
  };

  // Fetch all user data
  useEffect(() => {
    if (!user || !token) return;
    setLoading(true);
    fetchAllData();
  }, [user, token, fetchAllData]);
  
  // If user is not authenticated, show a message prompting them to sign in
  if (!user && !loading && !isLoading) {
    return (
      <div className="bg-white max-w-md mx-auto h-screen flex flex-col relative">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center fixed top-0 left-0 right-0 z-10 max-w-md mx-auto">
          <h1 className="text-lg font-semibold text-primary">Your Wardrobe</h1>
        </div>

        <div className="p-6 max-w-3xl mx-auto text-foreground mt-20 flex-1">
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
  if (loading || isLoading || profileLoading) return <LoadingModalSpinner />;
  
  return (
    <div className="bg-background max-w-7xl mx-auto h-screen flex flex-col relative px-4 md:px-8">
      <Navbar />

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
                  {user ? `Hi, ${userName || 'there'}!` : 'Your Wardrobe'}
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

        <WardrobeSection title="Top" items={tops} onRemove={handleRemoveFromWardrobe} onTrack={logActivity} />
        <WardrobeSection title="Bottom" items={bottoms} onRemove={handleRemoveFromWardrobe} onTrack={logActivity} />

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

function WardrobeSection({ title, items, onRemove, onTrack }) {
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
                      onClick={() => onTrack("view_product", { selection: item.item_id })}
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