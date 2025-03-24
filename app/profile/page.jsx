'use client';
import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { Toaster, toast } from 'react-hot-toast';

export default function ProfilePage() {
  const auth = useAuth();
  const [tryOnHistory, setTryOnHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

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
      const res = await fetch(`/api/tryon-history?email=${encodeURIComponent(auth.user.profile.email)}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setTryOnHistory(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error('❌ Error fetching history:', err);
      toast.error('Failed to load your wardrobe history.');
      setTryOnHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.isAuthenticated) {
      fetchHistory();
    }
  }, [auth?.isAuthenticated]);

  const handleWardrobeAction = async (taskId) => {
    if (!taskId) return;
    setActionLoading(taskId);
    try {
      const res = await fetch(
        `https://fzfl586ufb.execute-api.ap-southeast-2.amazonaws.com/dev/remove`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId }),
        }
      );

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`API error: ${res.status} - ${errorBody}`);
      }

      const result = await res.json();
      console.log('✅ Remove response:', result);
      toast.success('Item removed from wardrobe!');
      await fetchHistory(); // Refresh
    } catch (err) {
      console.error('❌ Failed to remove wardrobe item:', err);
      toast.error('Failed to remove item. Please try again.');
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

      <h2 className="text-2xl font-bold mb-4">👤 My Profile</h2>

      <div className="bg-[#1a1a2f] p-4 rounded-xl mb-6">
        <p><strong>Name:</strong> {auth.user?.profile?.name || 'N/A'}</p>
        <p><strong>Email:</strong> {auth.user?.profile?.email}</p>
      </div>

      <h3 className="text-xl font-semibold mb-3">👚 Digital Wardrobe</h3>

      {loading ? (
        <p className="text-gray-400">Loading wardrobe...</p>
      ) : tryOnHistory.length === 0 ? (
        <p className="text-gray-400">Your wardrobe is empty. Start trying on outfits to build your collection!</p>
      ) : (
        <ul className="space-y-4">
          {tryOnHistory.map((item) => (
            <li key={item.taskId} className="border border-gray-600 p-4 rounded-xl bg-[#121222]">
              <p><strong>Date:</strong> {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</p>
              <p><strong>Body Shape:</strong> {item.bodyShape || '-'}</p>
              <p><strong>Skin Tone:</strong> {item.skinTone || '-'}</p>
              <p><strong>Matching %:</strong> {item.matchingPercentage || '0'}%</p>

              {item.generatedImageUrl && (
                <img
                  src={item.generatedImageUrl}
                  alt="Try-on preview"
                  className="mt-3 rounded shadow max-w-xs"
                />
              )}

              <div className="mt-3">
                <button
                  onClick={() => handleWardrobeAction(item.taskId)}
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
