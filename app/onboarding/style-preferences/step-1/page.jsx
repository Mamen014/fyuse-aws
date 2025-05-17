'use client'

import { useState } from 'react';
import { useAuth } from 'react-oidc-context';

export default function StylePreferencesStep1() {
  const [selectedType, setSelectedType] = useState('');
  const { user } = useAuth();
  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  const handleSelection = (type) => {
    setSelectedType(type);
  };

  const handleSubmit = () => {
    if (!selectedType) {
      alert('Please select a fashion type');
      return;
    }
    localStorage.setItem(
      'onboarding_style_preferences_1',
      JSON.stringify({ selectedType })
    );
    window.location.href = '/onboarding/style-preferences/step-2';
  };

  const data = {
    selectedType,
  };

  const pref1 = async () => {
    console.log("Registering user with data:", data);
    const payload = {
      userEmail,
      section: "StylePref1",
      data,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/userPref`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("Inputing data:", result);
      await handleSubmit();
    } catch (err) {
      console.error("Failed to input data:", err);
    }
  };

  const fashionTypeDescriptions = {
    'Casual': 'Comfortable and relaxed clothing worn virtually, perfect for everyday activities. Think jeans, t-shirts, sneakers, and casual attire.',
    'Formal': 'Elegant and sophisticated attire suitable for professional environments and formal occasions. Includes suits, dresses, and refined pieces.',
    'Sporty': 'Athletic wear styled smartly, often used to create comfortable, functional looks perfect for active lifestyles and casual outings.',
    'Bohemian': 'Free-spirited, eclectic fashion borrowing elements from various cultures and eras. Features flowy fabrics, prints, and natural materials.',
    'Streetwear': 'Urban-inspired casual clothing rooted in skate and hip-hop culture. Features graphic tees, hoodies, sneakers, and statement accessories.'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0B1F63]">Style preference</h2>
              <p className="text-[#0B1F63]">Fashion type</p>
            </div>
            <div className="bg-[#0B1F63] text-white text-sm font-semibold px-3 py-1 rounded-full">
              Step 5/7
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {Object.keys(fashionTypeDescriptions).map((type) => (
              <div
                key={type}
                className={`p-4 rounded-3xl border transition-all duration-150 ${
                  selectedType === type
                    ? 'border-[#0B1F63] bg-blue-50'
                    : 'border-gray-200'
                } cursor-pointer`}
                onClick={() => handleSelection(type)}
              >
                <div className="flex items-start">
                  <div
                    className={`h-5 w-5 mt-1 flex-shrink-0 rounded-full ${
                      selectedType === type
                        ? 'bg-[#0B1F63]'
                        : 'border border-gray-400'
                    } flex items-center justify-center mr-3`}
                  >
                    {selectedType === type && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0B1F63]">{type}</h3>
                    <p className="text-sm text-[#0B1F63]/80">
                      {fashionTypeDescriptions[type]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={pref1}
            className="mt-2 w-full py-3 bg-[#0B1F63] text-white font-semibold rounded-lg shadow-md hover:bg-[#0A1B55] focus:outline-none focus:ring-2 focus:ring-[#0B1F63] focus:ring-opacity-50"
            disabled={!selectedType}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}