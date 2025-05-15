'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StylePreferencesStep3() {
  const router = useRouter();
  const [clothingType, setClothingType] = useState('Top');
  const [fitIndex, setFitIndex] = useState(1); // Default to second position (Regular)
  
  const handleSubmit = () => {
    const fitOptions = ['Tight', 'Regular', 'Loose', 'Oversized'];
    localStorage.setItem(
      'onboarding_style_preferences_3',
      JSON.stringify({ clothingType, fit: fitOptions[fitIndex] })
    );
    router.push('/onboarding/recommended-product');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 w-full max-w-xs">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-navy-800">Style Preference</h2>
          <span className="text-xs bg-navy-800 text-white px-2 py-1 rounded-md">Step 3/3</span>
        </div>
        
        <div className="mb-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setClothingType('Top')}
              className={`py-1 px-4 rounded-full text-sm border ${
                clothingType === 'Top' ? 'bg-navy-800 text-white' : 'bg-white text-navy-800'
              }`}
            >
              Top
            </button>
            <button
              onClick={() => setClothingType('Bottom')}
              className={`py-1 px-4 rounded-full text-sm border ${
                clothingType === 'Bottom' ? 'bg-navy-800 text-white' : 'bg-white text-navy-800'
              }`}
            >
              Bottom
            </button>
          </div>
          
          <h3 className="font-medium text-navy-800 mb-4">Cloth fitting</h3>
          
          <div className="bg-navy-800 py-1 px-3 rounded-full w-12 mb-6">
            <span className="text-white text-sm font-medium">Top</span>
          </div>
          
          {/* T-shirt icons */}
          <div className="flex justify-between items-end mb-2">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="flex flex-col items-center">
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  className="text-gray-400"
                  strokeWidth="1.5"
                >
                  <path d="M20 8l-8-4-8 4m16 0v12H4V8m4-4v4m8-4v4" />
                </svg>
              </div>
            ))}
          </div>
          
          {/* Fit slider */}
          <div className="relative w-full h-1 bg-gray-200 rounded-full mb-2">
            <div className="absolute left-0 top-0 h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
            <div className="relative flex justify-between">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => setFitIndex(index)}
                  className={`w-4 h-4 rounded-full -mt-1.5 transition-all ${
                    fitIndex === index ? 'bg-navy-800 border-2 border-white' : 'bg-blue-900'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Tighter</span>
            <span>Looser</span>
          </div>
        </div>
        
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-900 text-white font-medium rounded-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}