'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function CombinedStylePreferences() {
  const router = useRouter();
  const [clothingType, setClothingType] = useState('');
  const [fashionType, setFashionType] = useState('');
  const { user } = useAuth();
  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  const fashionTypes = {
    'Casual': 'Comfortable and relaxed clothing worn virtually, perfect for everyday activities. Think jeans, t-shirts, sneakers, and casual attire.',
    'Formal': 'Elegant and sophisticated attire suitable for professional environments and formal occasions. Includes suits, dresses, and refined pieces.',
    'Sporty': 'Athletic wear styled smartly, often used to create comfortable, functional looks perfect for active lifestyles and casual outings.',
    'Bohemian': 'Free-spirited, eclectic fashion borrowing elements from various cultures and eras. Features flowy fabrics, prints, and natural materials.',
    'Streetwear': 'Urban-inspired casual clothing rooted in skate and hip-hop culture. Features graphic tees, hoodies, sneakers, and statement accessories.'
  };

  const handleSubmit = async () => {
    try {
      // First call - StylePref1 (fashion type)
      await fetch(`${API_BASE_URL}/userPref`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          section: 'StylePref1',
          data: {
            selectedType: fashionType
          }
        }),
      });

      // Second call - StylePref2 (brands and colors)
      await fetch(`${API_BASE_URL}/userPref`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          section: 'StylePref2',
          data: {
            brands: [],  // Default empty since AI flow doesn't collect these
            colors: []   // Default empty since AI flow doesn't collect these
          }
        }),
      });

      // Third call - StylePref3 (clothing type)
      await fetch(`${API_BASE_URL}/userPref`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          section: 'StylePref3',
          data: {
            clothingType
          }
        }),
      });

      // Store in localStorage to match regular onboarding
      localStorage.setItem('onboarding_style_preferences_1', 
        JSON.stringify({ selectedType: fashionType }));
      localStorage.setItem('onboarding_style_preferences_2', 
        JSON.stringify({ brands: [], colors: [] }));
      localStorage.setItem('onboarding_style_preferences_3', 
        JSON.stringify({ clothingType }));
      
      // Redirect to recommended products
      router.push('/onboarding/recommended-product');
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0B1F63]">Style Preferences</h2>
            <p className="text-sm text-gray-500">Choose your style</p>
          </div>
          <span className="inline-block px-3 py-1 text-xs bg-[#0B1F63] text-white rounded-full">
            Step 3/4
          </span>
        </div>

        {/* Clothing Type Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#0B1F63] mb-3">
            Preferred Clothing Type
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setClothingType('Top')}
              className={`flex-1 px-5 py-2 rounded-full font-medium ${
                clothingType === 'Top'
                  ? 'bg-[#0B1F63] text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Top
            </button>
            <button
              type="button"
              onClick={() => setClothingType('Bottom')}
              className={`flex-1 px-5 py-2 rounded-full font-medium ${
                clothingType === 'Bottom'
                  ? 'bg-[#0B1F63] text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Bottom
            </button>
          </div>
        </div>

        {/* Fashion Type Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#0B1F63] mb-3">
            Fashion Style
          </label>
          <div className="space-y-3">
            {Object.entries(fashionTypes).map(([type, description]) => (
              <div
                key={type}
                onClick={() => setFashionType(type)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  fashionType === type
                    ? 'border-[#0B1F63] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <h3 className="font-medium text-[#0B1F63]">{type}</h3>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ml-4 ${
                    fashionType === type
                      ? 'border-[#0B1F63] bg-[#0B1F63]'
                      : 'border-gray-300'
                  }`}>
                    {fashionType === type && (
                      <svg className="w-full h-full text-white p-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!clothingType || !fashionType}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            clothingType && fashionType
              ? 'bg-[#0B1F63] text-white hover:bg-[#0a1b56]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
} 