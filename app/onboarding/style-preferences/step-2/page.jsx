'use client';

import { useState } from 'react';

export default function StylePreferencesStep2() {
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);

  const brandOptions = [
    { name: 'MANGO', logo: '/images/brand-logo/mango-logo.png' },
    { name: 'Massimo Dutti', logo: '/images/brand-logo/massimodutti-logo.png' },
    { name: 'PULL&BEAR', logo: '/images/brand-logo/pull&bear-logo.png' },
    { name: 'ZARA', logo: '/images/brand-logo/zara-logo.png' },
    { name: 'Ralph Lauren', logo: '/images/brand-logo/ralphlauren-logo.png' },
    { name: 'Dior', logo: '/images/brand-logo/dior-logo.png' },
    { name: 'Nike', logo: '/images/brand-logo/nike-logo.png' },
    { name: 'Tommy Hilfiger', logo: '/images/brand-logo/tommyhilfiger-logo.png' },
    { name: 'M&S', logo: '/images/brand-logo/m&s-logo.png' },
    { name: 'Louis Vuitton', logo: '/images/brand-logo/louisvuitton-logo.png' },
    { name: 'adidas', logo: '/path-to-adidas-logo.png' },
    { name: 'H&M', logo: '/path-to-hm-logo.png' }
  ];

  // Color options with their hex values
  const colorOptions = [
    { name: 'White', hex: '#FFFFFF', border: true },
    { name: 'Black', hex: '#000000' },
    { name: 'Brown', hex: '#8B4513' },
    { name: 'Red', hex: '#FF4500' },
    { name: 'Green', hex: '#4CAF50' },
    { name: 'Purple', hex: '#673AB7' },
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Blue', hex: '#1E88E5' }
  ];

  const toggleBrand = (brand) => {
    if (brands.includes(brand)) {
      setBrands(brands.filter(item => item !== brand));
    } else {
      setBrands([...brands, brand]);
    }
  };

  const toggleColor = (color) => {
    if (colors.includes(color)) {
      setColors(colors.filter(item => item !== color));
    } else {
      setColors([...colors, color]);
    }
  };

  const handleSubmit = () => {
    if (brands.length === 0 || colors.length === 0) {
      alert('Please select at least one brand and one color.');
      return;
    }

    localStorage.setItem(
      'onboarding_style_preferences_2',
      JSON.stringify({ brands, colors })
    );

    window.location.href = '/onboarding/style-preferences/step-3';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-4xl font-bold text-[#0B1F63] leading-tight">Style<br/>Preference</h2>
            </div>
            <div className="bg-[#0B1F63] text-white text-sm font-semibold px-4 py-1 rounded-full">
              Step 2/3
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-[#0B1F63] mb-4">Preferred brand</h3>
            <div className="grid grid-cols-4 gap-2">
              {brandOptions.map((brand) => (
                <button
                  key={brand.name}
                  onClick={() => toggleBrand(brand.name)}
                  className={`py-2 px-3 rounded-full flex items-center justify-center border ${
                    brands.includes(brand.name)
                      ? 'border-[#0B1F63] bg-white shadow-md'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <img src={brand.logo} alt={brand.name} className="h-6 w-auto" />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-20">
            <h3 className="text-2xl font-semibold text-[#0B1F63] mb-4">Preferred color</h3>
            <div className="grid grid-cols-5 gap-4">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  onClick={() => toggleColor(color.name)}
                  className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    colors.includes(color.name)
                      ? 'ring-2 ring-[#0B1F63] ring-offset-2'
                      : ''
                  }`}
                  style={{
                    backgroundColor: color.hex,
                    border: color.border ? '1px solid #DDD' : 'none'
                  }}
                >
                  {colors.includes(color.name) && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={color.name === 'White' ? '#000000' : '#FFFFFF'} strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-[#0B1F63] text-white font-semibold rounded-full shadow-md focus:outline-none"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
