'use client'

import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import LoadingModalSpinner from '@/components/ui/LoadingState';

export default function PhysicalAttributesStep3() {
  const [gender, setGender] = useState('');
  const [bodyShape, setBodyShape] = useState('');
  const [loading, setloading] = useState(false);
  const { user } = useAuth();
  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedGender = localStorage.getItem('gender');
      if (storedGender === 'male' || storedGender === 'female') {
        setGender(storedGender);
      } else {
        console.warn("Gender not found or invalid in localStorage.");
      }
    }
  }, []);


  function capitalizeWords(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const handleBodyShapeChange = (shape) => {
    setBodyShape(shape);
  };

  const handleSubmit = () => {
    localStorage.setItem('body-shape', bodyShape);
    window.location.href = '/style-discovery/personalized-styling/style-preferences';
  };

  const maleBodyTypeImages = {
    'trapezoid': '/images/body-shape/male/trapezoid.png',
    'triangle': '/images/body-shape/male/triangle.png',
    'inverted triangle': '/images/body-shape/male/inverted-triangle.png',
    'rectangle': '/images/body-shape/male/rectangle.png',
    'round': '/images/body-shape/male/round.png',
  };

  const maleBodyTypeDescriptions = {
    'trapezoid': 'Balanced proportions with a well-defined waist.',
    'triangle': 'Wider lower body compared to the upper body.',
    'inverted triangle': 'Broader shoulders and bust compared to the hips and waist.',
    'rectangle': 'Straight silhouette with minimal waist definition.',
    'round': 'Rounded silhouette with a less defined waist.'
  };

  const femaleBodyTypeImages = {
    'rectangle': '/images/body-shape/female/rectangle.png',
    'hourglass': '/images/body-shape/female/hourglass.png',
    'apple': '/images/body-shape/female/apple.png',
    'pear': '/images/body-shape/female/pear.png',
    'inverted triangle': '/images/body-shape/female/inverted-triangle.png',
  };

  const femaleBodyTypeDescriptions = {
    'rectangle': 'A straight, linear silhouette with similar bust, waist, and hip.',
    'hourglass': 'Bust and hips are similarly equal in size with a narrow waist.',
    'apple': 'A wider midsection and fuller bust, with slimmer legs.',
    'pear': 'Wider hips and thighs compared to the bust and shoulders.',
    'inverted triangle': 'Broader shoulders and bust compared to the hips and waist.'
  };

  const bodyTypeImages = gender === 'female' ? femaleBodyTypeImages : maleBodyTypeImages;
  const bodyTypeDescriptions = gender === 'female' ? femaleBodyTypeDescriptions : maleBodyTypeDescriptions;

    const data = {
    bodyShape,
  }

    const physic2 = async () => {
    console.log("Registering user with data:", data);
    const payload = {
      userEmail,
      section: "physicalAppearance2",
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

  if (loading) {
    return <LoadingModalSpinner />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-primary">Body Shape</h1>
          </div>

          <div className="space-y-4">
            {Object.keys(bodyTypeImages).map((shape) => (
              <div
                key={shape}
                className={`flex items-center p-4 border rounded-3xl cursor-pointer ${
                  bodyShape === shape ? 'bg-blue-50' : 'border-gray-300'
                }`}
                style={{
                  borderColor: bodyShape === shape ? '#0B1F63' : undefined,
                  backgroundColor: bodyShape === shape ? '#e6eaf7' : undefined,
                }}
                onClick={() => handleBodyShapeChange(shape)}
              >
                <div className="flex items-center flex-1">
                  <div className="mr-4">
                    <img 
                      src={bodyTypeImages[shape]} 
                      alt={`${shape} body type`} 
                      className="h-20 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary">{capitalizeWords(shape)}</h3>
                    <p className="text-sm text-primary mt-2">{bodyTypeDescriptions[shape]}</p>
                  </div>
                </div>
                <div className="ml-2">
                  {bodyShape === shape ? (
                    <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0B1F63' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="h-6 w-6 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {gender && (  
            <button
              onClick={async () => {
                setloading(true);
                await physic2();
              }}
              disabled={!gender || !bodyShape}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-[#0a1b56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              Next
            </button>
          )}  
        </div>
      </div>
    </div>
  );
}