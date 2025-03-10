'use client';

import React, { useState } from "react";
import axios from "axios";

const VirtualTryOn = () => {
  const [personImageUrl, setPersonImageUrl] = useState("");
  const [garmentImageUrl, setGarmentImageUrl] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const handleTryOn = async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await axios.post(
        "https://ipgyftqcsg.execute-api.ap-southeast-2.amazonaws.com/dev", // 🔁 Replace this with your actual API Gateway endpoint
        {
          person_image_url: personImageUrl,
          garment_image_url: garmentImageUrl,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      if (data.status === "success" && data.generated_image_url) {
        setGeneratedImage(data.generated_image_url);
        setStatus("success");
      } else {
        setStatus("error");
        setError(data.error || "Try-on failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during try-on:", err);
      setStatus("error");
      setError(err.response?.data?.error || err.message || "Unexpected error occurred");
    }
  };

  const handleReset = () => {
    setPersonImageUrl("");
    setGarmentImageUrl("");
    setGeneratedImage(null);
    setStatus("idle");
    setError(null);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Virtual Try-On</h1>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Person Image URL:</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={personImageUrl}
          onChange={(e) => setPersonImageUrl(e.target.value)}
          placeholder="Enter person image URL"
        />
        {personImageUrl && (
          <img
            src={personImageUrl}
            alt="Person Preview"
            className="mt-2 w-full max-h-64 object-contain rounded shadow"
          />
        )}
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Garment Image URL:</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={garmentImageUrl}
          onChange={(e) => setGarmentImageUrl(e.target.value)}
          placeholder="Enter garment image URL"
        />
        {garmentImageUrl && (
          <img
            src={garmentImageUrl}
            alt="Garment Preview"
            className="mt-2 w-full max-h-64 object-contain rounded shadow"
          />
        )}
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        <button
          onClick={handleTryOn}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
          disabled={status === "loading" || !personImageUrl || !garmentImageUrl}
        >
          {status === "loading" ? "Processing..." : "Try On"}
        </button>

        <button
          onClick={handleReset}
          className="bg-gray-200 text-gray-800 px-5 py-2 rounded hover:bg-gray-300 transition"
        >
          Reset
        </button>
      </div>

      {status === "success" && generatedImage && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Generated Try-On Image:</h2>
          <img
            src={generatedImage}
            alt="Try-On Result"
            className="w-full rounded shadow-xl"
          />
        </div>
      )}

      {status === "error" && error && (
        <div className="mt-4 text-red-600 font-semibold">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default VirtualTryOn;
