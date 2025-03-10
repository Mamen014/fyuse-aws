// ✅ Full version of VirtualTryOn.jsx with Lambda integration merged into original 273-line structure

'use client';

import React, { useState } from 'react';
import axios from 'axios';

export default function VirtualTryOn() {
  const [personImage, setPersonImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle person image input
  const handlePersonImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPersonImage(file);
    }
  };

  // Handle garment image input
  const handleGarmentImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGarmentImage(file);
    }
  };

  // Upload to S3 and trigger Lambda
  const handleTryOn = async () => {
    if (!personImage || !garmentImage) {
      setError('Please upload both person and garment images.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Convert files to base64
      const convertToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

      const base64Person = await convertToBase64(personImage);
      const base64Garment = await convertToBase64(garmentImage);

      // Lambda API URL
      const apiUrl = 'https://ipgyftqcsg.execute-api.ap-southeast-2.amazonaws.com/dev/tryon-image';

      // Send request to Lambda
      const response = await axios.post(apiUrl, {
        personImageBase64: base64Person,
        garmentImageBase64: base64Garment,
      });

      const { generatedImageUrl } = response.data;

      if (generatedImageUrl) {
        setResultImage(generatedImageUrl);
      } else {
        setError('Try-on failed: No image returned.');
      }
    } catch (err) {
      console.error(err);
      setError('Try-on failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Virtual Try-On</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Upload Person Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePersonImageChange}
            className="mb-4"
          />
          {personImage && (
            <img
              src={URL.createObjectURL(personImage)}
              alt="Person Preview"
              className="rounded-lg w-full h-auto shadow"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload Garment Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleGarmentImageChange}
            className="mb-4"
          />
          {garmentImage && (
            <img
              src={URL.createObjectURL(garmentImage)}
              alt="Garment Preview"
              className="rounded-lg w-full h-auto shadow"
            />
          )}
        </div>
      </div>

      <button
        onClick={handleTryOn}
        disabled={loading}
        className="mt-6 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
      >
        {loading ? 'Processing...' : 'Try On'}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {resultImage && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Result:</h3>
          <img
            src={resultImage}
            alt="Try-On Result"
            className="rounded-xl shadow-xl w-full"
          />
        </div>
      )}
    </div>
  );
}
