'use client';
import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';

export default function ProfilePage() {
  const auth = useAuth();
  const [tryOnHistory, setTryOnHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🐞 Debug localStorage for inspection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        console.log('🪵 Stored local user:', JSON.parse(storedUser));
      } else {
        console.warn("⚠️ No 'loggedInUser' found in localStorage.");
      }
    }
  }, []);

  // 🔄 Fetch try-on history from the API
  useEffect(() => {
    const fetchHistory = async () => {
      if (!auth?.user?.profile?.email) return;

      try {
        const res = await fetch(`/api/tryon-history?email=${encodeURIComponent(auth.user.profile.email)}`);
        const data = await res.json();

        // ✅ Safe array fallback and structure match
        if (Array.isArray(data.items)) {
          setTryOnHistory(data.items);
        } else {
          console.warn("⚠️ Unexpected API format. Setting empty history.");
          setTryOnHistory([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch try-on history:", err);
        setTryOnHistory([]);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.isAuthenticated) {
      fetchHistory();
    }
  }, [auth?.isAuthenticated]);

  if (!auth?.isAuthenticated) {
    return <p className="text-center text-gray-400">🔐 Please sign in to view your profile and try-on history.</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4">👤 User Profile</h2>
      <div className="bg-[#1a1a2f] p-4 rounded-xl mb-6">
        <p><strong>Name:</strong> {auth.user?.profile?.name || 'N/A'}</p>
        <p><strong>Email:</strong> {auth.user?.profile?.email}</p>
      </div>

      <h3 className="text-xl font-semibold mb-3">🕘 Try-On History</h3>
      {loading ? (
        <p className="text-gray-400">Loading try-on history...</p>
      ) : tryOnHistory.length === 0 ? (
        <p className="text-gray-400">No try-on history found.</p>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
