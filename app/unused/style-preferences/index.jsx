// app/onboarding/style-preferences/step-3/page.jsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StylePreferencesStep3() {
  const router = useRouter();
  const [clothingType, setClothingType] = useState('Top');
  const [fit, setFit] = useState('Regular');

  const handleSubmit = () => {
    localStorage.setItem(
      'onboarding_style_preferences_3',
      JSON.stringify({ clothingType, fit })
    );

    router.push('/onboarding/recommended-product');
  };

  return (
    <div>
      <h2 className="text-lg font-bold">Style Preference</h2>
      <p className="mb-4">Step 3/3 - Select clothing type and fit</p>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Clothing Type</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setClothingType('Top')}
            className={`py-2 px-4 rounded-lg border ${
              clothingType === 'Top' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            Top
          </button>
          <button
            onClick={() => setClothingType('Bottom')}
            className={`py-2 px-4 rounded-lg border ${
              clothingType === 'Bottom' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            Bottom
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Clothing Fit</h3>
        <div className="flex space-x-4">
          {['Tight', 'Regular', 'Loose'].map((option) => (
            <button
              key={option}
              onClick={() => setFit(option)}
              className={`py-2 px-4 rounded-lg border ${
                fit === option ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-blue-500 text-white rounded-lg"
      >
        Continue
      </button>
    </div>
  );
}