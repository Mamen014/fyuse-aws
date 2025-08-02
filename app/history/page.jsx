'use client';

import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { Shirt } from 'lucide-react';
import Navbar from '@/components/Navbar';
import LoadingModalSpinner from '@/components/ui/LoadingState';
import Image from 'next/image';
import ConfirmationModal from '@/components/ConfirmationModal';
import { getOrCreateSessionId } from '@/lib/session';
import { useUserProfile } from "../context/UserProfileContext";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function TryOnHistoryPage() {
  const router = useRouter();
  const { user, isLoading, signinRedirect } = useAuth();
  const [tryonHistory, setTryonHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sessionId = getOrCreateSessionId();
  const { profile, loading: profileLoading } = useUserProfile();

  useEffect(() => {
    if (!isLoading && user) {
      const fetchHistory = async () => {
        try {
          const token = user.id_token || user.access_token;
          if (!token) throw new Error("Missing token");

          const res = await fetch("/api/styling-history", {
            method: "GET",
            headers: {
              "x-session-id": sessionId,
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
          const data = await res.json();

          // Sort by timestamp descending and take latest 3
          setTryonHistory(data);

        } catch (err) {
          console.error("Error fetching history:", err);
          setTryonHistory([]);
        }
      };

      fetchHistory();
    }
  }, [isLoading, user, sessionId]);

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
  }, [profile, profileLoading, isLoading, router, user]);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      signinRedirect();
      return;
    }
  }, [isLoading, user, signinRedirect]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <h1 className="text-2xl font-bold text-primary">Styling History</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition"
          >
            Style Me
          </button>
        </div>

        {isModalOpen && (
          <ConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            trackingPage="styling-history"
          />
        )}

        {isLoading ? (
          <LoadingModalSpinner/>
        ) : tryonHistory.length === 0 ? (
          <div className="text-center py-16">
            <Shirt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No Styling yet</p>
            <p className="text-gray-500 mt-2">Start exploring and try on some outfits!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tryonHistory.slice(0, 15).map((item, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="aspect-[3/4] relative">
                  {item.styling_image_url ? (
                    <Image
                      src={item.styling_image_url}
                      alt={`Try-on #${index + 1}`}
                      fill
                      priority
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Shirt className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                  </div>
                  
                  {item.updated_at && (
                    <p className="text-sm text-gray-500">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </p>
                  )}
                  
                  {item.review && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {item.review}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 