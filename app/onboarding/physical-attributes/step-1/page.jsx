'use client'

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from "react-oidc-context";

export default function PhysicalAttributesStep1() {
  const router = useRouter();
  const [gender, setGender] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [sliderPosition, setSliderPosition] = useState(0);
  const sliderRef = useRef(null);
  const sliderContainerRef = useRef(null);
  const { user } = useAuth();
  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  // Skin tone options
  const skinTones = ['Fair', 'Light', 'Medium', 'Tan'];

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

    // Determine which skin tone this corresponds to
    const skinToneIndex = Math.min(
      Math.floor(relativePos * skinTones.length),
      skinTones.length - 1
    );
    setSkinTone(skinTones[skinToneIndex]);
  };

  // Handle option click
  const handleSkinToneClick = (tone, index) => {
    setSkinTone(tone);
    // Set slider position based on index
    const newPosition = ((index + 0.5) / skinTones.length) * 100;
    setSliderPosition(newPosition);
  };

  const handleSubmit = () => {

    router.push('/onboarding/physical-attributes/step-2');
  };

  const data = {
    gender,
    skinTone,
  }

    const physic1 = async () => {
    console.log("Registering user with data:", data);
    const payload = {
      userEmail,
      section: "physicalAppearance",
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
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#0B1F63]">Physical attribute</h2>
          <span className="inline-block px-3 py-1 text-xs bg-[#0B1F63] text-white rounded-full" style={{ height: '24px' }}>
            Step 2/7
          </span>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {/* Gender Selection */}
          <div>
            <label className="block text-sm font-medium text-[#0B1F63] mb-3">Gender</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGender('Male')}
                className={`min-w-16 px-5 py-2 rounded-full font-medium ${
                  gender === 'Male'
                    ? 'bg-[#0B1F63] text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('Female')}
                className={`min-w-16 px-5 py-2 rounded-full font-medium ${
                  gender === 'Female'
                    ? 'bg-[#0B1F63] text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          {/* Skin Tone Selection */}
          <div>
            <label className="block text-sm font-medium text-[#0B1F63] mb-3">Skin tone</label>
            <div className="flex justify-between mb-4">
              {skinTones.map((tone, index) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => handleSkinToneClick(tone, index)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    skinTone === tone
                      ? 'bg-[#0B1F63] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>

            {/* Skin Tone Gradient Bar with Slider */}
            <div
              ref={sliderContainerRef}
              className="relative w-full h-4 rounded-full bg-gradient-to-r from-amber-50 via-amber-200 to-amber-800 mb-2 cursor-pointer"
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
                className="absolute top-1/2 w-6 h-6 border-2 border-blue-900 rounded-full transform -translate-y-1/2 -translate-x-1/2 cursor-grab"
                style={{ left: `${sliderPosition}%`, background: 'transparent' }}
              />
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={physic1}
            disabled={!gender || !skinTone}
            className="w-full bg-[#0B1F63] text-white py-3 px-4 rounded-lg hover:bg-[#0a1b56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B1F63] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
}
