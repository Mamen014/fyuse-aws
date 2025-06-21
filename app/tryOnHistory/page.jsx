'use client';

import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Star, Shirt, Home, User} from 'lucide-react';
import Navbar from '@/components/Navbar';
import LoadingModalSpinner from '@/components/LoadingModal';

export default function TryOnHistoryPage() {
  const { user } = useAuth();
  const userEmail = user?.profile?.email;
  const [tryonHistory, setTryonHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const BRAND_BLUE = '#0B1F63';

  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userEmail) return;
      
      try {
        const endpoint = `${API_BASE_URL}/historyHandler`;
        const res = await fetch(
          `${endpoint}?email=${encodeURIComponent(userEmail)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
        const data = await res.json();
        
        if (Array.isArray(data.tryonItems)) {
          const sortedTryonItems = data.tryonItems
            .filter(item => item.timestamp)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setTryonHistory(sortedTryonItems);
        } else {
          setTryonHistory([]);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
        setTryonHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userEmail]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-16">
        {/* Header */}
        <div className="flex items-center mb-6 pt-4">
          <Link href="/" className="mr-4">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Try-On History</h1>
        </div>

        {loading ? (
          <LoadingModalSpinner/>
        ) : tryonHistory.length === 0 ? (
          <div className="text-center py-16">
            <Shirt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No try-ons yet</p>
            <p className="text-gray-500 mt-2">Start exploring and try on some outfits!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tryonHistory.slice(0, 15).map((item, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="aspect-[3/4] relative">
                  {item.generatedImageUrl ? (
                    <Image
                      src={item.generatedImageUrl}
                      alt={`Try-on #${index + 1}`}
                      fill
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
                  
                  {item.timestamp && (
                    <p className="text-sm text-gray-500">
                      {new Date(item.timestamp).toLocaleDateString()}
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

        {/* Bottom Navigation Bar - Unchanged */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around items-center px-2 pt-2 pb-1 z-10">
        <Link href="/" className="flex flex-col items-center text-gray-400 " style={{ color: BRAND_BLUE }}>
        <Home size={20} />
        <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-gray-400 hover:text-blue-900">
        <Shirt className="w-5 h-5 mb-0.5" />
        <span className="text-xs mt-1">Wardrobe</span>
        </Link>
        <Link href="/insights" className="flex flex-col items-center text-gray-400 hover:text-blue-900">
        <User className="w-5 h-5 mb-0.5" />
        <span className="text-xs mt-1">Profile</span>
        </Link>
        </div>
      </main>
    </div>
  );
} 