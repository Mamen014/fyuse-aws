'use client'

import { useState } from 'react';

export default function PhysicalAttributesStep3() {
  const [bodyShape, setBodyShape] = useState('');

  const handleBodyShapeChange = (shape) => {
    setBodyShape(shape);
  };

  const handleSubmit = () => {
    // Store the selected body shape in localStorage
    localStorage.setItem(
      'onboarding_physical_attributes_3',
      JSON.stringify({ bodyShape })
    );
    
    // Instead of using Next.js router, use standard navigation
    window.location.href = '/onboarding/style-preferences/step-1';
  };

  // Sample body type images (using placeholders)
  const bodyTypeImages = {
    'Trapezoid': '/images/body-type/trapezoid-man.png',
    'Triangle': '/images/body-type/triangle-man.png',
    'Inverted triangle': '/images/body-type/inverted-triangle-man.png',
    'Rectangle': '/images/body-type/rectangle-man.png',
    'Round': '/images/body-type/round-man.png',
  };

  const bodyTypeDescriptions = {
    'Trapezoid': 'Characterized by balanced proportions with a well-defined waist, similar to an hourglass but less pronounced.',
    'Triangle': 'Characterized by a wider lower body (hips, thighs, and buttocks) compared to the upper body (shoulders and bust).',
    'Inverted triangle': 'Characterized by broader shoulders and bust compared to the hips and waist.',
    'Rectangle': 'Characterized by a straight silhouette with minimal waist definition, similar measurements for bust, waist, and hips.',
    'Round': 'Characterized by a rounded silhouette with a less defined waist and a fuller midsection.'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Physical attribute</h2>
            <div className="bg-blue-900 text-white text-sm font-semibold px-3 py-1 rounded-full">
              Step 2/3
            </div>
          </div>
          <p className="text-gray-600 mb-6">Body shape</p>
          
          <div className="space-y-4">
            {Object.keys(bodyTypeImages).map((shape) => (
              <div
                key={shape}
                className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                  bodyShape === shape ? 'border-blue-900 bg-blue-50' : 'border-gray-300'
                }`}
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
                    <h3 className="font-semibold text-gray-800">{shape}</h3>
                    <p className="text-sm text-gray-600">{bodyTypeDescriptions[shape]}</p>
                  </div>
                </div>
                <div className="ml-2">
                  {bodyShape === shape ? (
                    <div className="h-6 w-6 bg-blue-900 rounded-full flex items-center justify-center">
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
            onClick={handleSubmit}
            className="mt-6 w-full py-3 bg-blue-900 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={!bodyShape}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}