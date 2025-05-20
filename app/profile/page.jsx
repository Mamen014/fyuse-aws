"use client";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import Image from "next/image";

export default function ProfilePage() {
  const auth = useAuth();
  const router = useRouter();
  const [likedRecommendations, setLikedRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("loggedInUser");
      if (storedUser) {
        console.log("🪵 Stored local user:", JSON.parse(storedUser));
      }
    }
  }, []);

  const fetchHistory = async () => {
    if (!auth?.user?.profile?.email) return;

    try {
      const endpoint = `${API_BASE_URL}/historyHandler`;

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

      // Start polling every 5 seconds (you might want to adjust or remove this for liked recommendations)
      const interval = setInterval(() => {
        fetchHistory();
      }, 5000);

      // Cleanup on unmount or auth state change
      return () => clearInterval(interval);
    }
  }, [auth?.isAuthenticated]);

  if (!auth?.isAuthenticated) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-foreground">
        <Toaster position="top-center" />
        <p className="text-center text-gray-400">
          🔐 Please sign in to view your profile and liked recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background p-6 max-w-3xl mx-auto text-foreground">
      <Toaster position="top-center" />

      {/* Heading */}
      <h2 className="text-2xl font-bold mb-4 text-primary">For You Style!</h2>

      {/* Back to Home Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-cta hover:bg-primary text-cta-foreground rounded-md transition-all"
        >
          ← Home
        </button>
      </div>

      {/* Liked Recommendations Section */}
      <div className="bg-background p-4 rounded-xl mb-6 border border-cta shadow-lg">
        {loading ? (
          <p className="text-gray-400">Loading liked recommendations...</p>
        ) : likedRecommendations.length === 0 ? (
          <p className="text-gray-400">No liked recommendations yet.</p>
        ) : (
          <div className="flex flex-col space-y-4">
            {likedRecommendations.map((recommendation) => (
              <div
                key={recommendation.productId}
                className="border border-cta p-4 rounded-xl bg-background"
              >
                {recommendation.imageUrl && (
                  <div className="relative w-32 h-48 rounded shadow-md overflow-hidden">
                    <Image
                      src={recommendation.imageUrl}
                      alt="Liked Recommendation"
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 32px"
                      priority
                    />
                  </div>
                )}
                <p className="mt-2">
                  <strong>Brand:</strong> {recommendation.brand || "N/A"}
                </p>
                <p>
                  <strong>Type:</strong> {recommendation.clothingType || "N/A"} ({recommendation.fashionType || "N/A"})
                </p>
                <p>
                  <strong>Color:</strong> {recommendation.color || "N/A"}
                </p>
                {recommendation.productLink && (
                  <a
                    href={recommendation.productLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mt-2 block"
                  >
                    View Product
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}