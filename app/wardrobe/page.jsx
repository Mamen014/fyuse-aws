// Enhanced wardrobe page with Tailwind styling for FYUSE target users
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingModalSpinner from "@/components/ui/LoadingState";
import Navbar from "@/components/Navbar";
import { ChevronRight, Shirt, ShirtIcon } from "lucide-react";

export default function ProfilePage() {
  const auth = useAuth();
  const [likedRecommendations, setLikedRecommendations] = useState([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [nickname, setNickname] = useState("");
  const [userImage, setuserImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;
  const userEmail = auth?.profile?.email || auth?.user?.profile?.email;

  // Set last updated date when component mounts and fetches user plan
  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());

    const fetchUserPlan = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/userPlan?userEmail=${encodeURIComponent(userEmail)}`);
        if (!res.ok) throw new Error("Failed to fetch plan");
        const data = await res.json();
        setSubscriptionPlan(data.plan || "Basic");
      } catch (err) {
        console.error("Failed to fetch subscription plan:", err);
        setSubscriptionPlan("Basic");
      }
    };

    if (auth?.isAuthenticated && userEmail) {
      fetchUserPlan();
    }
  }, [auth?.isAuthenticated, userEmail]);

  // Load nickname from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const data = JSON.parse(localStorage.getItem("profile") || "{}");
        if (data.nickname) {
          setNickname(data.nickname);
        }

        const image = localStorage.getItem("user_image");
        if (image) {
          setuserImage(image);
        }
      } catch (err) {
        console.warn("Failed to parse profile from localStorage:", err);
      }
    }
  }, []);

  // Fetch user's liked recommendations based on their subscription plan
  const fetchHistory = async () => {
    if (!userEmail) return;

    try {
      const endpoint = `${API_BASE_URL}/fetchTryonData`;
      const res = await fetch(
        `${endpoint}?email=${encodeURIComponent(userEmail)}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
      const data = await res.json();
      const limit = subscriptionPlan === "Glamour" ? data.likedRecommendations.length
              : subscriptionPlan === "Elegant" ? 50
              : 15;

      setLikedRecommendations(Array.isArray(data.likedRecommendations) ? data.likedRecommendations.slice(0, limit) : []);
    } catch (err) {
      console.error("❌ Error fetching liked recommendations:", err);
      toast.error("Failed to load your liked recommendations.");
      setLikedRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch liked recommendations when user is authenticated and subscription plan is set
  useEffect(() => {
    if (auth?.isAuthenticated && userEmail && subscriptionPlan !== null) {
      fetchHistory();
    }
  }, [auth?.isAuthenticated, userEmail, subscriptionPlan]);

  // If user is not authenticated, show a message prompting them to sign in
  if (!auth?.isAuthenticated && !auth?.isLoading) {
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
  if (auth.isLoading || loading) return <LoadingModalSpinner />;

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
                {auth?.user ? `Hi, ${nickname || 'there'}!` : 'Your Wardrobe'}
              </h1>
              <p className="text-sm text-muted-foreground">Items you’ve tried!</p>
            </div>
          </div>
          {userImage && (
            <div className="mt-2">
              <Image
                src={userImage}
                alt="User Avatar"
                width={300}
                height={400}
                className="rounded-xl object-cover border border-primary shadow-sm"
              />
            </div>
          )}
        </div>

        <WardrobeSection title="Top" items={tops} />
        <WardrobeSection title="Bottom" items={bottoms} />
      </div>
    </div>
  );
}

function WardrobeSection({ title, items }) {
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
            <div key={item.productId} className="bg-white rounded-2xl shadow-md p-4 flex items-start gap-4 hover:shadow-lg transition-shadow duration-200">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.clothingType} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-primary mb-2">{item.productName || "Unknown"}</h3>
                <p className="text-sm text-muted-foreground">{item.brand} ({item.fashionType})</p>
                <p className="text-sm text-muted-foreground">Color: <span className="font-medium">{item.color || "N/A"}</span></p>
                {item.productLink && (
                  <a href={item.productLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-cta hover:underline mt-1">
                    View Product <ChevronRight size={14} className="ml-1" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}