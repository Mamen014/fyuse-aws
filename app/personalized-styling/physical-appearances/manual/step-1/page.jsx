'use client'

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { useAuth } from "react-oidc-context";
import LoadingModalSpinner from '@/components/ui/LoadingState';

export default function PhysicalAttributesStep1() {
  const router = useRouter();
  const [gender, setGender] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [loading, setloading] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const sliderRef = useRef(null);
  const sliderContainerRef = useRef(null);
  const { user, isLoading, signinRedirect } = useAuth();

  // Skin tone options
  const skinTones = ['fair', 'light', 'medium', 'deep'];

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      signinRedirect();
    }
  }, [isLoading, user, signinRedirect]);
    
  function capitalizeWords(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
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
    router.push(`step-2?gender=${gender?.toLowerCase()}`);
  };

    const physic1 = async () => {
    const payload = {
      gender,
      skin_tone: skinTone,
    };
    
    try {
      fetch("/api/register-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.id_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      handleSubmit();
    } catch (err) {
      console.error("Failed to input data:", err);
    }
  };

  if (loading) {
    return <LoadingModalSpinner />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 py-8 lg:px-0">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mx-auto mb-6">
        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: '44%' }}
          ></div>
        </div>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-200 shadow-md p-6 sm:p-8">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          
          {/* Gender Selection */}
          <div>
            <h1 className="text-4xl font-semibold text-primary mb-3">Gender</h1>
            <div className="flex gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`min-w-[120px] px-6 py-2 rounded-full text-xl font-medium ${
                  gender === 'male' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`min-w-[120px] px-6 py-2 rounded-full text-xl font-medium ${
                  gender === 'female' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          {/* Skin Tone Selection */}
          <div className="mt-6">
            <h1 className="text-4xl font-semibold text-primary mb-3">Skin Tone</h1>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
              {skinTones.map((tone, index) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => handleSkinToneClick(tone, index)}
                  className={`w-full py-2 rounded-full text-sm sm:text-base font-medium transition ${
                    skinTone === tone
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {capitalizeWords(tone)}
                </button>
              ))}
            </div>

            {/* Skin Tone Gradient Slider */}
            <div
              ref={sliderContainerRef}
              className="relative w-full h-4 rounded-full bg-gradient-to-r from-amber-50 via-amber-200 to-amber-800 mb-2 cursor-pointer"
              onClick={handleSlide}
              onMouseDown={() => {
                document.addEventListener('mousemove', handleSlide);
                document.addEventListener('mouseup', () =>
                  document.removeEventListener('mousemove', handleSlide),
                  { once: true }
                );
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                handleSlide({ clientX: touch.clientX });
                document.addEventListener('touchmove', (e) => {
                  const t = e.touches[0];
                  handleSlide({ clientX: t.clientX });
                });
                document.addEventListener('touchend', () =>
                  document.removeEventListener('touchmove', handleSlide),
                  { once: true }
                );
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
            onClick={async () => {
              setloading(true);
              await physic1();
            }}
            disabled={!gender || !skinTone}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-[#0a1b56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );

}
