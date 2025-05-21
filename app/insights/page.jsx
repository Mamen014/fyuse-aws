"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import Link from "next/link";
import { Home, User, Shirt, ChevronRight, X } from "lucide-react";

// Define brand colors - matching homepage
const BRAND_BLUE = '#0B1F63';

export default function UserFashionInsight() {
  const auth = useAuth();
  const userEmail = auth?.user?.profile?.email;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [insight, setInsight] = useState("");
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  useEffect(() => {
    async function fetchUserData() {
      if (!userEmail) return;
      try {
        const endpoint = `${API_BASE_URL}/insight?userEmail=${encodeURIComponent(userEmail)}`;
        const res = await fetch(endpoint, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();
        setData(json.userData);
        setInsight(json.fashionInsight || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [userEmail]);

  if (loading)
    return (
      <div className="bg-white max-w-md mx-auto h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold" style={{ color: BRAND_BLUE }}>Loading your fashion insights...</h2>
      </div>
    );

  if (error)
    return (
      <div className="bg-white max-w-md mx-auto h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold" style={{ color: BRAND_BLUE }}>Error: {error}</h2>
      </div>
    );

  const {
    physicalAppearance1,
    physicalAppearance2,
    StylePref1,
    StylePref2,
    StylePref3,
    userEmail: email,
    userProfile,
    tipsCount,
    recommendedHistory,
  } = data;

  return (
    <div className="bg-white max-w-md mx-auto h-screen flex flex-col relative">
      {/* Navbar placeholder - you would insert your actual Navbar component here */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center fixed top-0 left-0 right-0 z-10 max-w-md mx-auto">
        <h1 className="text-lg font-semibold" style={{ color: BRAND_BLUE }}>Fashion Insights</h1>
      </div>

      {/* Main container with scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 mt-20 mb-16">
        {/* Header section with greeting and profile */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: BRAND_BLUE }}>
              👋 {auth?.user ? `Hi, ${auth.user.profile?.given_name || 'there'}!` : 'Hi, there!'}
            </h1>
            <p className="text-gray-600 text-sm">
              Your personal fashion analysis
            </p>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="mb-6 rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: `${BRAND_BLUE}0D` }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: `${BRAND_BLUE}1A` }}>
            <h3 className="font-semibold" style={{ color: BRAND_BLUE }}>
              User Profile
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium mt-1 text-sm truncate" style={{ color: BRAND_BLUE }}>{email}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500">Location</p>
                <p className="font-medium mt-1 text-sm" style={{ color: BRAND_BLUE }}>
                  {userProfile.city}, {userProfile.country}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500">Occupation</p>
                <p className="font-medium mt-1 text-sm" style={{ color: BRAND_BLUE }}>{userProfile.occupation}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500">Birthdate</p>
                <p className="font-medium mt-1 text-sm" style={{ color: BRAND_BLUE }}>
                  {new Date(userProfile.birthdate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Physical Appearance Section */}
        <div className="flex flex-row gap-4 overflow-x-auto">
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 rounded-full mr-2 flex items-center justify-center text-xs text-white" 
                  style={{ backgroundColor: BRAND_BLUE }}>
                P
              </div>
              <h2 className="text-lg font-semibold" style={{ color: BRAND_BLUE }}>Physical Appearance</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 ml-8">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500">Gender</p>
                <p className="font-medium mt-1" style={{ color: BRAND_BLUE }}>{physicalAppearance1.gender}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500">Skin Tone</p>
                <p className="font-medium mt-1" style={{ color: BRAND_BLUE }}>{physicalAppearance1.skinTone}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500">Body Shape</p>
                <p className="font-medium mt-1" style={{ color: BRAND_BLUE }}>{physicalAppearance2.bodyShape}</p>
              </div>
            </div>
          </div>

          {/* Style Preferences Section */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 rounded-full mr-2 flex items-center justify-center text-xs text-white" 
                  style={{ backgroundColor: BRAND_BLUE }}>
                S
              </div>
              <h2 className="text-lg font-semibold" style={{ color: BRAND_BLUE }}>Style Preferences</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 ml-8">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-medium mt-1" style={{ color: BRAND_BLUE }}>{StylePref1.selectedType}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500">Colors</p>
                <p className="font-medium mt-1" style={{ color: BRAND_BLUE }}>{StylePref2.colors?.join(", ")}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500">Brands</p>
                <p className="font-medium mt-1" style={{ color: BRAND_BLUE }}>{StylePref2.brands?.join(", ")}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500">Fit</p>
                <p className="font-medium mt-1" style={{ color: BRAND_BLUE }}>{StylePref3.fit}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500">Clothing Type</p>
                <p className="font-medium mt-1" style={{ color: BRAND_BLUE }}>{StylePref3.clothingType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Fashion Insight */}
        <div className="mb-6 rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: `${BRAND_BLUE}0D` }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: `${BRAND_BLUE}1A` }}>
            <h3 className="font-semibold" style={{ color: BRAND_BLUE }}>
              AI Fashion Insight
            </h3>
          </div>
          <div className="p-4">
            {insight ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold mb-2" style={{ color: BRAND_BLUE }}>Fashion Style</h4>
                  <p className="text-sm">
                    As an inverted triangle body shape, your shoulders and upper body are broader than your hips. This means you should aim to balance your silhouette by drawing attention to your lower half. Think of styles that create a V-shape effect, such as high-waisted trousers, A-line skirts, and fitted tops that cinch at the waist.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold mb-2" style={{ color: BRAND_BLUE }}>Color Palettes</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="inline-block w-4 h-4 mt-1 mr-2 rounded-full bg-green-700"></span>
                      <span><strong>Earthy Tones:</strong> Deep greens, browns, and terracottas that complement your warm skin tone.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-4 h-4 mt-1 mr-2 rounded-full bg-blue-400"></span>
                      <span><strong>Vibrant Hues:</strong> Bright colors like turquoise, coral, and mustard yellow for energy.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-4 h-4 mt-1 mr-2 rounded-full bg-stone-300"></span>
                      <span><strong>Neutrals with a Twist:</strong> Classic beige, taupe, and olive green with colorful accessories.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold mb-2" style={{ color: BRAND_BLUE }}>Clothing Fit Recommendations</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 border rounded-lg text-center" style={{ borderColor: `${BRAND_BLUE}4D` }}>
                      <p className="font-medium mb-1" style={{ color: BRAND_BLUE }}>Tops</p>
                      <p>Fitted, cinched at waist</p>
                    </div>
                    <div className="p-2 border rounded-lg text-center" style={{ borderColor: `${BRAND_BLUE}4D` }}>
                      <p className="font-medium mb-1" style={{ color: BRAND_BLUE }}>Bottoms</p>
                      <p>High-waisted, A-line</p>
                    </div>
                    <div className="p-2 border rounded-lg text-center" style={{ borderColor: `${BRAND_BLUE}4D` }}>
                      <p className="font-medium mb-1" style={{ color: BRAND_BLUE }}>Outerwear</p>
                      <p>Defined shoulders, fitted waist</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold mb-2" style={{ color: BRAND_BLUE }}>Local Inspiration</h4>
                  <p className="text-sm">
                    Given your Indonesian roots, consider incorporating traditional elements like Batik patterns, sarongs, and handcrafted accessories to add a unique touch to your outfits.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full text-white flex items-center justify-center text-xl" style={{ backgroundColor: BRAND_BLUE }}>
                  ✨
                </div>
                <p className="font-medium" style={{ color: BRAND_BLUE }}>No fashion insight generated yet</p>
                <p className="text-xs text-gray-500 mt-2">Check back soon for your personalized style recommendations</p>
              </div>
            )}
          </div>
        </div>


        <footer className="text-center mt-8 mb-4">
          <p className="text-xs text-gray-400">Total Tips Generated: {tipsCount}</p>
          <p className="text-xs text-gray-400">Last Updated: {lastUpdated}</p>
        </footer>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around items-center px-2 pt-2 pb-1 z-10">
        <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-blue-900">
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-gray-400 hover:text-blue-900">
          <Shirt className="w-5 h-5 mb-0.5" />
          <span className="text-xs mt-1">Wardrobe</span>
        </Link>
        <Link href="/insights" className="flex flex-col items-center" style={{ color: BRAND_BLUE }}>
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
}