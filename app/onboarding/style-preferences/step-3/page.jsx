'use client'
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function StylePreferencesStep3() {
  const router = useRouter();
  const [clothingType, setClothingType] = useState('Top');
  const [fitIndex, setFitIndex] = useState(1); // Default to second position (Regular)
  const [sliderPosition, setSliderPosition] = useState((1 / 3) * 100); // Default position based on fitIndex
  const { user } = useAuth();
  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;
  const sliderRef = useRef(null);
  const sliderContainerRef = useRef(null);
  
  const fitOptions = ['Tight', 'Regular', 'Loose', 'Oversized'];
  
  const handleSubmit = () => {
    localStorage.setItem(
      'onboarding_style_preferences_3',
      JSON.stringify({ clothingType, fit: fitOptions[fitIndex] })
    );
    router.push('/onboarding/recommended-product');
  };
  
  // Handle sliding functionality
  const handleSlide = (e) => {
    if (!sliderContainerRef.current) return;

    const containerRect = sliderContainerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;

    // Calculate position relative to container (0 to 1)
    let relativePos = (e.clientX - containerRect.left) / containerWidth;

    // Limit to 0-1 range
    relativePos = Math.max(0, Math.min(1, relativePos));

    // Set the slider position
    setSliderPosition(relativePos * 100);

    // Determine which fit option this corresponds to
    const newFitIndex = Math.min(
      Math.floor(relativePos * fitOptions.length),
      fitOptions.length - 1
    );
    setFitIndex(newFitIndex);
  };
  
  // Handle direct icon click
  const handleFitClick = (index) => {
    setFitIndex(index);
    // Set slider position based on index
    const newPosition = ((index + 0.5) / fitOptions.length) * 100;
    setSliderPosition(newPosition);
  };

    const data = {
      clothingType,
      fit: fitOptions[fitIndex],
    }
    const pref3 = async () => {
    console.log("Registering user with data:", data);
    const payload = {
      userEmail,
      section: "StylePref3",
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 w-full max-w-xs">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-[#0B1F63]">Style Preference</h2>
          <span className="text-xs bg-[#0B1F63] text-white px-2 py-1 rounded-full">Step 7/7</span>
        </div>
        
        <div className="mb-8">
          {/* Top/Bottom Selection */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setClothingType('Top')}
              className={`py-1 px-4 rounded-full text-sm border ${
                clothingType === 'Top' ? 'bg-[#0B1F63] text-white' : 'bg-white text-[#0B1F63] border-gray-300'
              }`}
            >
              Top
            </button>
            <button
              onClick={() => setClothingType('Bottom')}
              className={`py-1 px-4 rounded-full text-sm border ${
                clothingType === 'Bottom' ? 'bg-[#0B1F63] text-white' : 'bg-white text-[#0B1F63] border-gray-300'
              }`}
            >
              Bottom
            </button>
          </div>
          
          <h3 className="font-medium text-[#0B1F63] mb-4">Cloth fitting</h3>
          
          
          
          {/* T-shirt icons representing different fits */}
          <div className="flex justify-between items-end mb-6">
            {fitOptions.map((fit, index) => {
              const isSelected = fitIndex === index;
              const basePath = clothingType === 'Top' ? '/images/cloth-fitting/cloth' : '/images/cloth-fitting/short';
              const imgSrc = isSelected ? `${basePath}-active.png` : `${basePath}-unactive.png`;
              const size = 24 + index * 3;

              return (
                <div 
                  key={fit} 
                  className="flex flex-col items-center cursor-pointer" 
                  onClick={() => handleFitClick(index)}
                >
                  <img 
                    src={imgSrc}
                    alt={`${fit} fit`}
                    style={{
                      width: `${size}px`,
                      height: `${size + 8}px`, // keeping slight height increase for aesthetics
                    }}
                  />
                  <span className="text-xs mt-1">{fit}</span>
                </div>
              );
            })}
          </div>
          
          {/* Slider for fit selection */}
          <div className="relative w-full mb-4">
            <div
              ref={sliderContainerRef}
              className="relative w-full h-1 bg-gradient-to-r from-[#0B1F63] via-[#0B1F63] to-[#0B1F63] rounded-full cursor-pointer"
              onClick={handleSlide}
              onMouseDown={() => {
                document.addEventListener('mousemove', handleSlide);
                document.addEventListener('mouseup', () => {
                  document.removeEventListener('mousemove', handleSlide);
                }, { once: true });
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                handleSlide({ clientX: touch.clientX });
                document.addEventListener('touchmove', (e) => {
                  const touch = e.touches[0];
                  handleSlide({ clientX: touch.clientX });
                });
                document.addEventListener('touchend', () => {
                  document.removeEventListener('touchmove', handleSlide);
                }, { once: true });
              }}
            >
              <div
                ref={sliderRef}
                className="absolute top-1/2 w-4 h-4 bg-[#0B1F63] border-2 border-white rounded-full transform -translate-y-1/2 -translate-x-1/2 cursor-grab"
                style={{ left: `${sliderPosition}%` }}
              />
            </div>
          </div>
          
          {/* Size labels */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>Tighter</span>
            <span>Looser</span>
          </div>
        </div>
        
        {/* Continue button */}
        <button
          onClick={pref3}
          className="w-full py-3 bg-[#0B1F63] text-white font-medium rounded-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}