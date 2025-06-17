'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import LoadingModalSpinner from '@/components/LoadingModal';

export default function CombinedStylePreferences() {
  const router = useRouter();
  const [clothingType, setClothingType] = useState('');
  const [fashionType, setFashionType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setloading] = useState(false);
  const { user } = useAuth();
  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  const fashionTypes = {
    'Casual': 'Jeans, t-shirts, sneakers, and casual attire.',
    'Formal': 'Suits, dresses, and refined pieces.',
    'Sporty': 'Athletic wear.',
    'Bohemian': 'Flowy fabrics, prints, and natural materials.',
    'Streetwear': 'Graphic tees and hoodies.'
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setloading(true);
    
    try {
      // Store in localStorage immediately for instant feedback
      localStorage.setItem('onboarding_style_preferences_1', 
        JSON.stringify({ selectedType: fashionType }));
      localStorage.setItem('onboarding_style_preferences_2', 
        JSON.stringify({ brands: [], colors: [] }));
      localStorage.setItem('onboarding_style_preferences_3', 
        JSON.stringify({ clothingType }));
      
      // Start API calls in the background
      const savePreferences = async () => {
        try {
          await Promise.all([
            // StylePref1 (fashion type)
            fetch(`${API_BASE_URL}/userPref`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userEmail,
                section: 'StylePref1',
                data: { selectedType: fashionType }
              }),
            }),
            
            // StylePref2 (brands and colors)
            fetch(`${API_BASE_URL}/userPref`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userEmail,
                section: 'StylePref2',
                data: { brands: [], colors: [] }
              }),
            }),
            
            // StylePref3 (clothing type)
            fetch(`${API_BASE_URL}/userPref`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userEmail,
                section: 'StylePref3',
                data: { clothingType }
              }),
            })
          ]);
        } catch (error) {
          console.error('Error saving preferences:', error);
        }
      };
      
      // Start API calls in background
      savePreferences();
      
      // Navigate to next page - Next.js will handle the loading state
      router.push('/onboarding/recommended-product');
      
    } catch (error) {
      console.error('Error in form submission:', error);
      setIsSubmitting(false);
      setloading(false);
    }
  };
  if (loading) {
    return (
    <LoadingModalSpinner />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 relative">
      {/* Next.js loading state will handle the loading overlay */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-[24px] font-bold text-[#0B1F63]">Style Preferences</p>
            <p className="text-[18px] text-primary">Helps us pick outfits that feel right for you — in both fit and fashion</p>
          </div>
        </div>

        {/* Clothing Type Selection */}
        <div className="mb-8">
          <p className="text-[18px] font-semibold text-[#0B1F63]">
            Preferred Clothing Type
          </p>
          <p className="text-[14px] font-regular text-gray-500">
            Pick One
          </p>          
          <div className="flex gap-3 mt-6">
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
          <label className="block text-[18px] font-semibold text-[#0B1F63] mb-3">
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
          disabled={!clothingType || isSubmitting || !fashionType}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
            clothingType && fashionType
              ? 'bg-[#0B1F63] text-white hover:bg-[#0a1b56]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : 'Continue'}
        </button>
      </div>
    </div>
  );
} 