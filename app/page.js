

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useAuth } from "react-oidc-context";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/Navbar";
import { Home, Search, Heart, User, ChevronRight, Zap } from "lucide-react";

// Define brand colors
const BRAND_BLUE = '#0B1F63';

export default function HomePage() {
  const { user, isLoading, signinRedirect } = useAuth();
  const [likedProduct, setLikedProduct] = useState(null);
  const [wardrobeItems, setWardrobeItems] = useState([]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        localStorage.setItem("postLoginRedirect", "/");
        signinRedirect();
      } else {
        const redirect = localStorage.getItem("postLoginRedirect");
        if (redirect && window.location.pathname !== redirect) {
          localStorage.removeItem("postLoginRedirect");
          window.location.href = redirect;
          return;
        }
        // Use user email as key
        const userEmail = user?.profile?.email;
        const step = localStorage.getItem(`onboarding_step:${userEmail}`);
        if (step !== "appearance") {
          window.location.href = "/onboarding/register";
        }
        // Load liked product from localStorage
        const stored = localStorage.getItem("likedProduct");
        if (stored) setLikedProduct(JSON.parse(stored));

        // Fetch wardrobe items (limit to 5 for preview)
        const fetchWardrobe = async () => {
          try {
            const lambdaUrl = process.env.NEXT_PUBLIC_HISTORY_HANDLER;
            const res = await fetch(
              `${lambdaUrl}?email=${encodeURIComponent(userEmail)}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
            const data = await res.json();
            const allItems = Array.isArray(data.items) ? data.items : [];
            const wardrobe = allItems.filter((item) => item.isInWardrobe === true);
            setWardrobeItems(wardrobe.slice(0, 5));
          } catch (err) {
            setWardrobeItems([]);
          }
        };
        fetchWardrobe();
      }
    }
  }, [isLoading, user]);

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id= ${process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID}');
        `}
      </Script>

      <div className="bg-white max-w-md mx-auto h-screen flex flex-col relative">
        {/* Keeping the original Navbar for now */}
        <Navbar />

        {/* Main container with scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 mt-20">
          {/* Header section with greeting and profile */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold" style={{ color: BRAND_BLUE }}>
                👋 {user ? `Hi, ${user.profile?.given_name || 'there'}!` : 'Hi, there!'}
              </h1>
              <p className="text-gray-600 text-sm">
                {user?.profile ? 'Welcome to your personal styling assistant' : 'Sign in to get started'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full border-2 overflow-hidden flex items-center justify-center bg-blue-50" style={{ borderColor: BRAND_BLUE }}>
              {user?.profile?.picture ? (
                <img 
                  src={user.profile.picture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={24} color={BRAND_BLUE} />
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => {
                if (!user) {
                  localStorage.setItem("postLoginRedirect", "/onboarding/register");
                  toast.error("Please sign in to use the Try-on feature.", {
                    position: "top-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                  });
                  setTimeout(() => signinRedirect(), 1500);
                } else {
                  const step = localStorage.getItem("onboarding_step");
                  window.location.href = step === "appearance" ? "/tryon" : "/onboarding/register";
                }
              }}
              className="flex-1 text-white py-4 rounded-xl font-medium"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              Try-On Now
            </button>
            <button
              onClick={() => {
                if (!user) {
                  localStorage.setItem("postLoginRedirect", "/styling");
                  toast.error("Please sign in to use the Styling feature.", {
                    position: "top-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                  });
                  setTimeout(() => signinRedirect(), 1500);
                } else {
                  window.location.href = "/styling";
                }
              }}
              className="flex-1 text-white py-4 rounded-xl font-medium"
              style={{ backgroundColor: `${BRAND_BLUE}E6` }}
            >
              Style Me
            </button>
          </div>

          {/* Wardrobe section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold" style={{ color: BRAND_BLUE }}>Your Wardrobe</h2>
              <Link href="/profile" className="flex items-center text-sm font-medium" style={{ color: BRAND_BLUE }}>
                See All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {wardrobeItems.length > 0 ? (
                wardrobeItems.map((item) => (
                  <div key={item.taskId || item.id} className="min-w-[100px] h-[140px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                    {item.generatedImageUrl ? (
                      <img
                        src={item.generatedImageUrl}
                        alt="Wardrobe item"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No Image</span>
                    )}
                  </div>
                ))
              ) : (
                [1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="min-w-[100px] h-[140px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-400">No Item</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity / Liked Product Widget (styled similar to Recent Activity in dashboard) */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold" style={{ color: BRAND_BLUE }}>Recent Activity</h2>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: `${BRAND_BLUE}0D` }}>
              {likedProduct ? (
                <div className="flex items-center">
                  <div className="w-20 h-20 rounded-lg overflow-hidden mr-4">
                    <Image
                      src={likedProduct.imageS3Url}
                      alt={likedProduct.productName}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: BRAND_BLUE }}>
                      {likedProduct.productName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{likedProduct.brand}</p>
                    <a
                      href={likedProduct.productLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold"
                      style={{ color: BRAND_BLUE }}
                    >
                      View Product
                    </a>
                  </div>
                </div>
              ) : (
                <div className="pb-3 mb-3" style={{ borderBottom: `1px solid ${BRAND_BLUE}1A` }}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full text-white flex items-center justify-center mr-3 text-xs" style={{ backgroundColor: BRAND_BLUE }}>
                      💡
                    </div>
                    <div>
                      <p className="text-sm font-semibold">No liked products yet</p>
                      <p className="text-xs text-gray-500">Like a product to see it here</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations section (styled like coming soon) */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold" style={{ color: BRAND_BLUE }}>Coming Soon</h2>
            </div>
            <div className="rounded-xl p-4 flex gap-4" style={{ backgroundColor: `${BRAND_BLUE}0D` }}>
              <div className="w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: `${BRAND_BLUE}1A` }}>
                <Zap size={24} color={BRAND_BLUE} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: BRAND_BLUE }}>Wardrobe Management</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Save your favorite outfits and build a digital wardrobe. Coming Spring 2025!
                </p>
                <p className="text-sm font-semibold" style={{ color: BRAND_BLUE }}>
                  Get Notified
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex gap-3 mb-20">
            <button 
              onClick={() => window.location.href = "/pricing"}
              className="flex-1 text-white py-3 rounded-xl font-medium" 
              style={{ backgroundColor: BRAND_BLUE }}
            >
              Upgrade Plan
            </button>
            <button 
              onClick={() => window.location.href = "/contact"}
              className="flex-1 py-3 rounded-xl font-medium" 
              style={{ backgroundColor: `${BRAND_BLUE}1A`, color: BRAND_BLUE }}
            >
              Help/Support
            </button>
          </div>
        </div>

        <ToastContainer />
        
        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around items-center px-2 pt-2 pb-1">
          <Link href="/" className="flex flex-col items-center" style={{ color: BRAND_BLUE }}>
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/browse" className="flex flex-col items-center text-gray-400">
            <Search size={20} />
            <span className="text-xs mt-1">Browse</span>
          </Link>
          <div className="relative flex flex-col items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white -mt-5 shadow-lg" style={{ backgroundColor: BRAND_BLUE }}>
              <Zap size={24} />
            </div>
            <span className="text-xs mt-1 invisible">Try</span>
          </div>
          <Link href="/favorites" className="flex flex-col items-center text-gray-400">
            <Heart size={20} />
            <span className="text-xs mt-1">Saved</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-gray-400">
            <User size={20} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>

        {/* Keep the original footer but hide it on mobile */}
        <footer className="hidden md:block bg-primary text-primary-foreground py-8 text-center">
          <p>&copy; 2025 FYUSE. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <Link href="/pricing">Pricing</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/features">Features</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
