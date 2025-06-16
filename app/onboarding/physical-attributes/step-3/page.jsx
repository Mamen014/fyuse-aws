'use client'

import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import LoadingModalSpinner from '@/components/LoadingModal';

export default function PhysicalAttributesStep3() {
  const [bodyShape, setBodyShape] = useState('');
  const [loading, setloading] = useState(false);
  const [gender, setGender] = useState('');
  const { user } = useAuth();
  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  useEffect(() => {
    const savedData = localStorage.getItem('onboarding_physical_attributes_1');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setGender(parsedData.gender);
    }
  }, []);

  const handleBodyShapeChange = (shape) => {
    setBodyShape(shape);
  };

  const handleSubmit = () => {
    localStorage.setItem(
      'onboarding_physical_attributes_3',
      JSON.stringify({ bodyShape })
    );
    window.location.href = '/discover-your-style/style-preferences';
  };

  const maleBodyTypeImages = {
    'Trapezoid': '/images/body-type/trapezoid-man.png',
    'Triangle': '/images/body-type/triangle-man.png',
    'Inverted triangle': '/images/body-type/inverted-triangle-man.png',
    'Rectangle': '/images/body-type/rectangle-man.png',
    'Round': '/images/body-type/round-man.png',
  };

  const maleBodyTypeDescriptions = {
    'Trapezoid': 'Balanced proportions with a well-defined waist.',
    'Triangle': 'Wider lower body compared to the upper body.',
    'Inverted triangle': 'Broader shoulders and bust compared to the hips and waist.',
    'Rectangle': 'Straight silhouette with minimal waist definition.',
    'Round': 'Rounded silhouette with a less defined waist and a fuller midsection.'
  };

  const femaleBodyTypeImages = {
    'Rectangle': '/images/body-type/rectangle-women.png',
    'Hourglass': '/images/body-type/hourglass-women.png',
    'Apple': '/images/body-type/apple-women.png',
    'Pear': '/images/body-type/pear-women.png',
    'Inverted triangle': '/images/body-type/inverted-triangle-women.png',
  };

  const femaleBodyTypeDescriptions = {
    'Rectangle': 'A straight, linear silhouette with similar bust, waist, and hip.',
    'Hourglass': 'Bust and hips are similarly equal in size with a narrow waist.',
    'Apple': 'A wider midsection and fuller bust, with proportionally slimmer legs.',
    'Pear': 'Wider hips and thighs compared to the bust and shoulders.',
    'Inverted triangle': 'Broader upper body with a slimmer lower body with narrow hips.'
  };

  const bodyTypeImages = gender === 'Female' ? femaleBodyTypeImages : maleBodyTypeImages;
  const bodyTypeDescriptions = gender === 'Female' ? femaleBodyTypeDescriptions : maleBodyTypeDescriptions;

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
            <h2 className="text-2xl font-bold" style={{ color: '#0B1F63' }}>Physical attribute</h2>
          </div>
          <p className="mb-6" style={{ color: '#0B1F63' }}>Body shape</p>

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
                    <h3 className="font-semibold" style={{ color: '#0B1F63' }}>{shape}</h3>
                    <p className="text-sm" style={{ color: '#0B1F63' }}>{bodyTypeDescriptions[shape]}</p>
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

          <button
            onClick={async () => {
              setloading(true);
              await physic2();
            }}
            disabled={!gender}
            className="w-full bg-[#0B1F63] text-white py-3 px-4 rounded-lg hover:bg-[#0a1b56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B1F63] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}