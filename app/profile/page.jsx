'use client';
import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

export default function ProfilePage() {
  const auth = useAuth();
  const router = useRouter();
  const [tryOnHistory, setTryOnHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Debugging localStorage if needed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        console.log('🪵 Stored local user:', JSON.parse(storedUser));
      }
    }
  }, []);

  const fetchHistory = async () => {
    if (!auth?.user?.profile?.email) return;

    try {
      const lambdaUrl = process.env.NEXT_PUBLIC_HISTORY_HANDLER;

      const res = await fetch(`${lambdaUrl}?email=${encodeURIComponent(auth.user.profile.email)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);

      const data = await res.json();
      const allItems = Array.isArray(data.items) ? data.items : [];
      const wardrobeItems = allItems.filter((item) => item.isInWardrobe === true);

      setTryOnHistory(wardrobeItems);
    } catch (err) {
      console.error("❌ Error fetching wardrobe history:", err);
      toast.error("Failed to load your wardrobe items.");
      setTryOnHistory([]);
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

  const handleRemoveFromWardrobe = async (taskId) => {
    if (!taskId) return;
    setActionLoading(taskId);

    try {
      const removeEndpoint = process.env.NEXT_PUBLIC_REMOVE_ENDPOINT;

      const response = await fetch(removeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API error: ${response.status} - ${errorBody}`);
      }

      const result = await response.json();
      console.log('✅ Removed from wardrobe:', result);
      toast.success('Item removed from wardrobe!');
      await fetchHistory();
    } catch (err) {
      console.error('❌ Failed to remove wardrobe item:', err);
      if (err.message.includes('Failed to fetch')) {
        toast.error('Network error or CORS issue. Check console for details.');
      } else {
        toast.error(err.message || 'Unexpected error removing item.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (!auth?.isAuthenticated) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-white">
        <Toaster position="top-center" />
        <p className="text-center text-gray-400">
          🔐 Please sign in to view your profile and wardrobe.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-white">
      <Toaster position="top-center" />

      <h2 className="text-2xl font-bold mb-4">Digital Wardrobe</h2>

      {/* Back to Home Button */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all"
        >
          ← Back to Home
        </button>
      </div>

      <div className="bg-[#1a1a2f] p-4 rounded-xl mb-6">
        <p><strong>Name:</strong> {auth.user?.profile?.name || 'N/A'}</p>
        <p><strong>Email:</strong> {auth.user?.profile?.email}</p>
      </div>
      {loading ? (
        <p className="text-gray-400">Loading wardrobe...</p>
      ) : tryOnHistory.length === 0 ? (
        <p className="text-gray-400">
          Your wardrobe is empty. Try on outfits and build your collection!
        </p>
      ) : (
        <ul className="space-y-4">
          {tryOnHistory.map((item) => (
            <li key={item.taskId} className="border border-gray-600 p-4 rounded-xl bg-[#121222]">
              <p><strong>Matching:</strong> {item.matchingPercentage || '0'}%</p>

              {item.generatedImageUrl && (
                <img
                  src={item.generatedImageUrl}
                  alt="Try-on preview"
                  className="mt-3 rounded shadow max-w-xs"
                />
              )}

              <div className="mt-3">
                <button
                  onClick={() => handleRemoveFromWardrobe(item.taskId)}
                  disabled={actionLoading === item.taskId}
                  className="px-4 py-2 rounded text-sm bg-red-600 hover:bg-red-700 transition-all"
                >
                  {actionLoading === item.taskId ? 'Processing...' : 'Remove from Wardrobe'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}