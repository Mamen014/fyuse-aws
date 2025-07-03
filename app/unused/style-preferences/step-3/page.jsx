'use client'
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function StylePreferencesStep3() {
  const router = useRouter();
  const { user } = useAuth();
  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  const sliderRef = useRef(null);
  const sliderContainerRef = useRef(null);

  const [clothingType, setClothingType] = useState('Top');
  const getFitOptions = (type) =>
    type === 'Bottom'
      ? ['Tight', 'Slim', 'Regular', 'Loose', 'Oversized']
      : ['Tight', 'Regular', 'Loose', 'Oversized'];

  const [fitOptions, setFitOptions] = useState(getFitOptions('Top'));
  const [fitIndex, setFitIndex] = useState(1); // Default: 'Regular'
  const [sliderPosition, setSliderPosition] = useState(((1) / (fitOptions.length - 1)) * 100);

  useEffect(() => {
    const newOptions = getFitOptions(clothingType);
    setFitOptions(newOptions);

    // Set index to 'Regular' or fallback
    const defaultIndex = newOptions.indexOf('Regular') !== -1 ? newOptions.indexOf('Regular') : 0;
    setFitIndex(defaultIndex);
    setSliderPosition((defaultIndex / (newOptions.length - 1)) * 100);
  }, [clothingType]);

  const handleSlide = (e) => {
    if (!sliderContainerRef.current) return;
    const containerRect = sliderContainerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    let relativePos = (e.clientX - containerRect.left) / containerWidth;
    relativePos = Math.max(0, Math.min(1, relativePos));
    const newIndex = Math.min(
      Math.round(relativePos * (fitOptions.length - 1)),
      fitOptions.length - 1
    );
    setFitIndex(newIndex);
    setSliderPosition((newIndex / (fitOptions.length - 1)) * 100);
  };

  const handleFitClick = (index) => {
    setFitIndex(index);
    const newPosition = (index / (fitOptions.length - 1)) * 100;
    setSliderPosition(newPosition);
  };

  const data = {
    clothingType,
    fit: fitOptions[fitIndex],
  };

  const pref3 = async () => {
    const payload = {
      userEmail,
      section: 'StylePref3',
      data,
    };
    try {
      const res = await fetch(`${API_BASE_URL}/userPref`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      console.log('Inputing data:', result);
      router.push('/onboarding/recommended-product');
    } catch (err) {
      console.error('Failed to input data:', err);
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
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setClothingType('Top')}
              className={`py-1 px-4 rounded-full text-sm border ${
                clothingType === 'Top'
                  ? 'bg-[#0B1F63] text-white'
                  : 'bg-white text-[#0B1F63] border-gray-300'
              }`}
            >
              Top
            </button>
            <button
              onClick={() => setClothingType('Bottom')}
              className={`py-1 px-4 rounded-full text-sm border ${
                clothingType === 'Bottom'
                  ? 'bg-[#0B1F63] text-white'
                  : 'bg-white text-[#0B1F63] border-gray-300'
              }`}
            >
              Bottom
            </button>
          </div>

          <h3 className="font-medium text-[#0B1F63] mb-4">Cloth fitting</h3>

          <div className="flex justify-between items-end mb-6">
            {fitOptions.map((fit, index) => {
              const isSelected = fitIndex === index;
              const basePath =
                clothingType === 'Top'
                  ? '/images/cloth-fitting/cloth'
                  : '/images/cloth-fitting/short';
              const imgSrc = isSelected
                ? `${basePath}-active.png`
                : `${basePath}-unactive.png`;
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
                    style={{ width: `${size}px`, height: `${size + 8}px` }}
                  />
                  <span className="text-xs mt-1">{fit}</span>
                </div>
              );
            })}
          </div>

          <div className="relative w-full mb-4">
            <div
              ref={sliderContainerRef}
              className="relative w-full h-1 bg-gradient-to-r from-[#0B1F63] via-[#0B1F63] to-[#0B1F63] rounded-full cursor-pointer"
              onClick={handleSlide}
              onMouseDown={() => {
                document.addEventListener('mousemove', handleSlide);
                document.addEventListener(
                  'mouseup',
                  () => {
                    document.removeEventListener('mousemove', handleSlide);
                  },
                  { once: true }
                );
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                handleSlide({ clientX: touch.clientX });
                document.addEventListener('touchmove', (e) => {
                  const touch = e.touches[0];
                  handleSlide({ clientX: touch.clientX });
                });
                document.addEventListener(
                  'touchend',
                  () => {
                    document.removeEventListener('touchmove', handleSlide);
                  },
                  { once: true }
                );
              }}
            >
              <div
                ref={sliderRef}
                className="absolute top-1/2 w-4 h-4 bg-[#0B1F63] border-2 border-white rounded-full transform -translate-y-1/2 -translate-x-1/2 cursor-grab"
                style={{ left: `${sliderPosition}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Tighter</span>
            <span>Looser</span>
          </div>
        </div>

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
