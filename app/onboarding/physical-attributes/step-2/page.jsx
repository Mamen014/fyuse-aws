'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PhysicalAttributesStep2() {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => setPhotoUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    localStorage.setItem(
      'onboarding_physical_attributes_2',
      JSON.stringify({ photoUrl })
    );
    router.push('/onboarding/physical-attributes/step-3');
  };

  return (
    <div className="flex flex-col justify-between min-h-screen bg-white px-5 py-8" style={{ maxWidth: "375px", margin: "0 auto" }}>
      {/* Header */}
      <div className="relative">
        <h1 className="text-[22px] font-bold leading-tight text-[#0B1F63]">
          Physical<br />attribute
        </h1>
        <div className="absolute top-0 right-0">
          <span className="inline-block px-3 py-0.5 text-xs text-white bg-[#0B1F63] rounded-full">
            Step 3/7
          </span>
        </div>
      </div>

      {/* Upload box */}
      <div className="flex flex-col items-center justify-center flex-1 mt-8 mb-10">
        <div className="w-full border border-[#0B1F63] rounded-2xl" style={{ minHeight: "340px" }}>
          <input
            type="file"
            onChange={handleFileUpload}
            id="photo-upload"
            className="hidden"
          />
          {!photoUrl ? (
            <label
              htmlFor="photo-upload"
              className="flex flex-col items-center justify-center h-[340px] cursor-pointer text-center px-4"
            >
              <p className="text-[#0B1F63] text-base font-medium mb-1">Input your photo here</p>
              <p className="text-[13px] text-[#0B1F63]">Click to upload</p>
            </label>
          ) : (
            <div className="w-full h-full flex items-center justify-center py-4">
              <img src={photoUrl} alt="Uploaded" className="max-w-full max-h-full object-contain" />
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center px-4">
          Accepted formats: JPG or JPEG. Max size: 10MB. Min resolution: 300×500px
        </p>
      </div>

      {/* Next Button */}
      <button
        onClick={handleSubmit}
        disabled={!photoUrl}
        className={`w-full py-3.5 font-medium rounded-lg transition-opacity duration-200 ${
          photoUrl ? 'bg-[#0B1F63] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        style={{ borderRadius: "8px" }}
      >
        Next
      </button>
    </div>
  );
}