'use client';

import { useState } from 'react';
import { useAuth } from 'react-oidc-context';

export default function StylePreferencesStep2() {
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const { user } = useAuth();
  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  const brandOptions = [
    { name: 'MANGO', image: '/images/brand-logo/mango-logo.png' },
    { name: 'Massimo Dutti', image: '/images/brand-logo/massimodutti-logo.png' },
    { name: 'PULL&BEAR', image: '/images/brand-logo/pull&bear-logo.png' },
    { name: 'ZARA', image: '/images/brand-logo/zara-logo.png' },
    { name: 'Ralph Lauren', image: '/images/brand-logo/ralphlauren-logo.png' },
    { name: 'Dior', image: '/images/brand-logo/dior-logo.png' },
    { name: 'Nike', image: '/images/brand-logo/nike-logo.png' },
    { name: 'Tommy Hilfiger', image: '/images/brand-logo/tommyhilfiger-logo.png' },
    { name: 'M&S', image: '/images/brand-logo/m&s-logo.png' },
    { name: 'Louis Vuitton', image: '/images/brand-logo/lv-logo.png' },
    { name: 'adidas', image: '/images/brand-logo/adidas-logo.png' },
    { name: 'H&M', image: '/images/brand-logo/hnm-logo.png' },
  ];

  const colorOptions = [
    { name: 'White', hex: '#FFFFFF', border: true },
    { name: 'Black', hex: '#000000' },
    { name: 'Brown', hex: '#8B4513' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Green', hex: '#00FF00' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Blue', hex: '#0000FF' },
  ];

  const toggleBrand = (brand) => {
    if (brands.includes(brand)) {
      setBrands(brands.filter((b) => b !== brand));
    } else {
      setBrands([...brands, brand]);
    }
  };

  const toggleColor = (color) => {
    if (colors.includes(color)) {
      setColors(colors.filter((c) => c !== color));
    } else {
      setColors([...colors, color]);
    }
  };

  const handleSubmit = () => {
    if (brands.length === 0 || colors.length === 0) {
      alert('Please select at least one brand and one color.');
      return;
    }

    const preferences = {
      brands,
      colors,
    };

    localStorage.setItem('onboarding_style_preferences_2', JSON.stringify(preferences));
    window.location.href = '/onboarding/style-preferences/step-3';
  };

  const data = {
    brands,
    colors,
  };
  
    const pref2 = async () => {
    console.log("Registering user with data:", data);
    const payload = {
      userEmail,
      section: "StylePref2",
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-lg p-6 space-y-6">
        <div className="flex justify-between items-start">
          <h2 className="text-3xl font-bold text-[#0B1F63] leading-snug">
            Style<br />Preference
          </h2>
          <div className="bg-[#0B1F63] text-white text-sm font-semibold px-4 py-1 rounded-full">
            Step 6/7
          </div>
        </div>

        {/* Brand and Color Selectors Side-by-Side */}
        <div className="flex flex-col md:flex-row gap-6 overflow-x-auto">
          {/* Brand Selector */}
          <div className="min-w-[140px] flex-1">
            <h3 className="text-lg font-semibold text-[#0B1F63] mb-3">Preferred brand</h3>
            <div className="flex flex-wrap gap-2">
              {brandOptions.map((brand) => (
                <button
                  key={brand.name}
                  onClick={() => toggleBrand(brand.name)}
                  className={`h-16 w-16 rounded-full flex items-center justify-center bg-white shrink-0 ${
                    brands.includes(brand.name)
                      ? 'ring-2 ring-[#0B1F63] ring-offset-1'
                      : 'border border-gray-300'
                  }`}
                >
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className={`object-contain ${
                      ['MANGO', 'Massimo Dutti', 'PULL&BEAR', 'ZARA', 'Ralph Lauren', 'Louis Vuitton'].includes(brand.name)
                        ? 'h-100 w-100'
                        : 'h-100 w-100'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div className="min-w-[140px] flex-1">
            <h3 className="text-lg font-semibold text-[#0B1F63] mb-3">Preferred color</h3>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  onClick={() => toggleColor(color.name)}
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    colors.includes(color.name)
                      ? 'ring-2 ring-[#0B1F63] ring-offset-1'
                      : ''
                  }`}
                  style={{
                    backgroundColor: color.hex,
                    border: color.border ? '1px solid #ccc' : undefined,
                  }}
                >
                  {colors.includes(color.name) && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke={color.name === 'White' ? '#000' : '#fff'}
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={pref2}
          className="w-full py-3 bg-[#0B1F63] text-white text-lg font-semibold rounded-full shadow-md"
        >
          Next
        </button>
      </div>
    </div>
  );
}