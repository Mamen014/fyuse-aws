'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import { motion } from 'framer-motion';
import TopActive from '/public/images/cloth-fitting/cloth-active.png';
import TopInactive from '/public/images/cloth-fitting/cloth-inactive.png';
import BottomActive from '/public/images/cloth-fitting/short-active.png';
import BottomInactive from '/public/images/cloth-fitting/short-inactive.png';
import Image from 'next/image';
import LoadingModalSpinner from '@/components/ui/LoadingState';

export default function StylePreferencesPage() {
  const router = useRouter();
  const [clothingType, setClothingType] = useState('');
  const [fashionType, setFashionType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setloading] = useState(false);
  const { user, isLoading, signinRedirect } = useAuth();

  // Define clothing options with active and inactive icons
  const clothingOptions = [
    {
      label: 'Top',
      activeIcon: TopActive,
      inactiveIcon: TopInactive,
    },
    {
      label: 'Bottom',
      activeIcon: BottomActive,
      inactiveIcon: BottomInactive,
    },
  ];

  // Define fashion types with descriptions and images
  const fashionTypes = {
    Casual: { desc: 'Relaxed everyday looks', image: '/styles/casual.png' },
    Formal: { desc: 'Elegant and professional', image: '/styles/formal.png' },
    Sporty: { desc: 'Athleisure and movement', image: '/styles/sporty.png' },
    Bohemian: { desc: 'Expressive, floral and earth tone', image: '/styles/boho.png' },
    Streetwear: { desc: 'Graphic tees and oversized fits', image: '/styles/streetwear.png' },
  };

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      signinRedirect();
    }
  }, [isLoading, user, signinRedirect]);
    
  // Handle form submission
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setloading(true);

    try {

      await fetch("/api/save-style-preference", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.id_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clothing_category: clothingType,
          fashion_type: fashionType,
        }),
      });

      router.push("result");
    } catch (error) {
      console.error("Error saving preferences:", error);
      setIsSubmitting(false);
      setloading(false);
    }
  };


  // Show loading spinner while submitting
  if (loading) return <LoadingModalSpinner />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 relative">

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-primary" style={{ width: '66%' }}></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[24px] font-bold text-primary">Style Preferences</p>
          <p className="text-[16px] text-gray-600 mt-2 max-w-md mx-auto">
            Your preferences help us show you better outfits — tailored to your lifestyle, fit, and vibe.
          </p>
        </div>

        {/* Clothing Type Selection */}
        <div className="mb-10">
          <p className="text-[18px] font-semibold text-primary mb-1">
            What are you shopping for?
          </p>
          <p className="text-[14px] text-gray-500 mb-4">Select one</p>
          <div className="grid grid-cols-2 gap-4">
            {clothingOptions.map(({ label, activeIcon, inactiveIcon }) => {
              const isSelected = clothingType === label;

              return (
                <button
                  key={label}
                  onClick={() => setClothingType(label)}
                  className={`flex items-center gap-3 px-5 py-4 w-full text-left border rounded-2xl transition-all
                    ${isSelected
                      ? 'bg-primary text-white border-primary shadow'
                      : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}
                  `}
                >
                  <Image
                    src={isSelected ? inactiveIcon : activeIcon}
                    alt={`${label} icon`}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                  <span className="font-medium text-sm sm:text-base">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fashion Type Selection */}
        <div className="mb-10">
          <p className="text-[18px] font-semibold text-primary mb-3">Which style feels most like you?</p>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(fashionTypes).map(([style, { desc, image }]) => (
              <div
                key={style}
                onClick={() => setFashionType(style)}
                className={`rounded-2xl border-2 overflow-hidden shadow-sm transition-all cursor-pointer group
                  ${fashionType === style
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-gray-200 hover:shadow-md'}
                `}
              >
                <Image
                  src={image}
                  alt={style}
                  width={300}
                  height={300}
                  className="w-full h-80 object-cover group-hover:scale-[1.01] transition-transform duration-300"
                />
                <div className="p-4">
                  <h4 className={`font-bold text-lg ${fashionType === style ? 'text-white' : 'text-primary'}`}>
                    {style}
                  </h4>
                  <p className={`text-sm ${fashionType === style ? 'text-white/90' : 'text-gray-600'}`}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!clothingType || !fashionType || isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
            clothingType && fashionType && !isSubmitting
              ? 'bg-primary text-white hover:bg-[#0a1b56]'
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
          ) : 'Discover My Style'}
        </button>
      </motion.div>
    </div>
  );
}
