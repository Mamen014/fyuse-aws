"use client";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import LoadingModalSpinner from "@/components/ui/LoadingState";
import "react-toastify/dist/ReactToastify.css";
import { Home, Shirt, User, LayoutGrid, ChevronRight } from "lucide-react";

// Define brand colors to match home page
const BRAND_BLUE = '#0B1F63';

export default function ProfilePage() {
  const auth = useAuth();
  const router = useRouter();
  const [likedRecommendations, setLikedRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("loggedInUser");
      if (storedUser) {
      }
    }
  }, []);

  const fetchHistory = async () => {
    if (!auth?.user?.profile?.email) return;

    try {
      const endpoint = `${API_BASE_URL}/userHistory`;

      const res = await fetch(
        `${endpoint}?email=${encodeURIComponent(auth.user.profile.email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);

      const data = await res.json();
      setLikedRecommendations(Array.isArray(data.likedRecommendations) ? data.likedRecommendations : []);

    } catch (err) {
      console.error("❌ Error fetching liked recommendations:", err);
      toast.error("Failed to load your liked recommendations.");
      setLikedRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.isAuthenticated) {
      fetchHistory();

      // Start polling every 5 seconds
      const interval = setInterval(() => {
        fetchHistory();
      }, 5000);

      // Cleanup on unmount or auth state change
      return () => clearInterval(interval);
    }
  }, [auth?.isAuthenticated]);

  if (!auth?.isAuthenticated) {
    return (
      <div className="bg-white max-w-md mx-auto h-screen flex flex-col relative">
        {/* Fixed Navbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center fixed top-0 left-0 right-0 z-10 max-w-md mx-auto">
          <h1 className="text-lg font-semibold" style={{ color: BRAND_BLUE }}>Your Wardrobe</h1>
        </div>
        
        <div className="p-6 max-w-3xl mx-auto text-foreground mt-20 flex-1">
          <ToastContainer />
          <p className="text-center text-gray-400">
            🔐 Please sign in to view your profile and liked recommendations.
          </p>
        </div>
        
        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around items-center px-2 pt-2 pb-1 z-10">
          <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-blue-900">
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center" style={{ color: BRAND_BLUE }}>
            <Shirt className="w-5 h-5 mb-0.5" />
            <span className="text-xs mt-1">Wardrobe</span>
          </Link>
          <Link href="/insights" className="flex flex-col items-center text-gray-400 hover:text-blue-900">
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    );
  }

  // Classify recommendations
  const tops = likedRecommendations.filter(
    (item) =>
      item.category &&
      item.category.toLowerCase().includes("top")
  );
  const bottoms = likedRecommendations.filter(
    (item) =>
      item.category &&
      item.category.toLowerCase().includes("bottom")
  );

  if (loading) {
    return <LoadingModalSpinner />;
  };

  return (
    <div className="bg-white max-w-md mx-auto h-screen flex flex-col relative">
      <ToastContainer />
      
      {/* Fixed Navbar */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center fixed top-0 left-0 right-0 z-10 max-w-md mx-auto">
        <h1 className="text-lg font-semibold" style={{ color: BRAND_BLUE }}>Your Wardrobe</h1>
      </div>

      {/* Main container with scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 mt-20 mb-16">
        {/* Header section with greeting and profile */}
        <div className="mb-6 rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: `${BRAND_BLUE}0D` }}>
          <div className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3" 
                  style={{ backgroundColor: BRAND_BLUE }}>
                👕
              </div>
              <div>
                <h1 className="text-xl font-semibold" style={{ color: BRAND_BLUE }}>
                  {auth?.user ? `Hi, ${auth.user.profile?.given_name || 'there'}!` : 'Your Wardrobe'}
                </h1>
                <p className="text-sm text-gray-600">
                  {auth?.user?.profile ? `Items you've liked` : 'Your saved items'}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <span className="text-xs text-gray-400 px-2 py-1 bg-white rounded-md">
                Last updated: {lastUpdated}
              </span>
            </div>
          </div>
        </div>

        {/* Top Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2" style={{ color: BRAND_BLUE }}>
            Top ({tops.length})
          </h2>
          {tops.length === 0 ? (
            <p className="text-sm text-gray-500">No tops found.</p>
          ) : (
            <div className="flex flex-col space-y-3">
              {tops.map((recommendation) => (
                <div
                  key={recommendation.productId}
                  className="bg-white rounded-lg p-3 shadow-sm overflow-hidden flex"
                >
                  <div className="relative w-24 h-24 overflow-hidden rounded-lg flex-shrink-0">
                    {recommendation.imageUrl ? (
                      <Image
                        src={recommendation.imageUrl}
                        alt="Top Item"
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100px, 100px"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium" style={{ color: BRAND_BLUE }}>
                      {recommendation.brand || "Unknown Brand"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {recommendation.clothingType || "Clothing"} ({recommendation.fashionType || "Style"})
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Color:</span> {recommendation.color || "N/A"}
                    </p>
                    {recommendation.productLink && (
                      <a
                        href={recommendation.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-xs flex items-center"
                        style={{ color: BRAND_BLUE }}
                      >
                        View Product <ChevronRight size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottoms Sectio */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2" style={{ color: BRAND_BLUE }}>
            Bottom ({bottoms.length})
          </h2>
          {bottoms.length === 0 ? (
            <p className="text-sm text-gray-500">No bottoms found.</p>
          ) : (
            <div className="flex flex-col space-y-3">
              {bottoms.map((recommendation) => (
                <div
                  key={recommendation.productId}
                  className="bg-white rounded-lg p-3 shadow-sm overflow-hidden flex"
                >
                  <div className="relative w-24 h-24 overflow-hidden rounded-lg flex-shrink-0">
                    {recommendation.imageUrl ? (
                      <Image
                        src={recommendation.imageUrl}
                        alt="Bottom Item"
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100px, 100px"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium" style={{ color: BRAND_BLUE }}>
                      {recommendation.brand || "Unknown Brand"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {recommendation.clothingType || "Clothing"} ({recommendation.fashionType || "Style"})
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Color:</span> {recommendation.color || "N/A"}
                    </p>
                    {recommendation.productLink && (
                      <a
                        href={recommendation.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-xs flex items-center"
                        style={{ color: BRAND_BLUE }}
                      >
                        View Product <ChevronRight size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around items-center px-2 pt-2 pb-1 z-10">
        <Link href="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-blue-900">
          <LayoutGrid size={20} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center" style={{ color: BRAND_BLUE }}>
          <Shirt className="w-5 h-5 mb-0.5" />
          <span className="text-xs mt-1">Wardrobe</span>
        </Link>
        <Link href="/insights" className="flex flex-col items-center text-gray-400 hover:text-blue-900">
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
}