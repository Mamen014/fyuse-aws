import React from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Dynamically import the client-side chart component
const ClientChart = dynamic(() => import("./ClientChart"), { ssr: false });

const AnalysisModal = ({ isOpen, onClose, analysisData, loading, tryOnImage, userEmail }) => {
  if (!isOpen) return null;

  const {
    gender = "unknown",
    skinTone = "unknown",
    bodyShape = "unknown",
    clothingFit = "unknown",
    clothingColor = "unknown",
    matchingPercentage = "0",
  } = analysisData || {};

  const matchingPercentageNum = parseInt(matchingPercentage, 10) || 0;

  const data = [
    { name: "Matched", value: matchingPercentageNum },
    { name: "Unmatched", value: 100 - matchingPercentageNum },
  ];

  const COLORS = ["#F38980", "#848CB1"];

  // Function to handle adding the try-on result to the user's collection
  const handleAddToCollection = async () => {
    if (!userEmail) {
      console.error("User email not found. Please log in.");
      toast.error("Please log in to add this item to your collection.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    try {
      // Make the POST request to the /tryontrack endpoint
      await axios.post(`${process.env.NEXT_PUBLIC_FYUSEAPI}/tryontrack`, {
        userEmail,
        imageUrl: tryOnImage, // Pass the try-on image URL
      });

      // Show success toast notification
      toast.success("Added to your collection!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error adding to collection:", error);
      toast.error("An error occurred while adding this item to your collection.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-[#1E1E2C] rounded-lg w-full max-w-2xl p-6 shadow-lg relative overflow-y-auto max-h-screen"
        style={{ maxWidth: "90vw" }} // Ensure the modal doesn't exceed the viewport width
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-red-500 text-xl font-bold focus:outline-none"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Main Content */}
        {loading || !tryOnImage ? (
          // Loading State
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF6B6B]"></div>
            <p className="text-gray-400 mt-4">Loading...</p>
          </div>
        ) : (
          // Loaded State
          <div className="flex flex-col md:flex-row gap-6">
            {/* Try-On Image */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                {tryOnImage ? (
                  <img
                    src={tryOnImage}
                    alt="Try-On Result"
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    No try-on image available
                  </div>
                )}
              </div>

              {/* User Appearance */}
              <div className="bg-[#1E1E2C] border border-[#FFFFFF1A] rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">User Appearance</h3>
                <ul className="list-disc pl-4 text-gray-400">
                  <li>Gender: {gender}</li>
                  <li>Body Shape: {bodyShape}</li>
                  <li>Skin Tone: {skinTone}</li>
                </ul>
              </div>
            </div>

            {/* Matching Percentage and Clothing Item */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              {/* Matching Percentage */}
              <div className="bg-white rounded-lg overflow-hidden shadow-md p-4 flex flex-col items-center justify-center">
                {ClientChart && (
                  <>
                    <ClientChart data={data} COLORS={COLORS} />
                    <span className="text-4xl font-bold mt-2" style={{ color: "#8A4A57" }}>
                      {matchingPercentageNum}%
                    </span>
                  </>
                )}
              </div>

              {/* Clothing Item */}
              <div className="bg-[#1E1E2C] border border-[#FFFFFF1A] rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Clothing Item</h3>
                <ul className="list-disc pl-4 text-gray-400">
                  <li>Fit: {clothingFit}</li>
                  <li>Color: {clothingColor}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        {(!loading && tryOnImage) && (
          <div className="mt-6 flex justify-end gap-4">
            {/* Add to My Collection Button */}
            <button
              className="bg-[#FF6B6B] text-white px-4 py-2 rounded-lg"
              onClick={handleAddToCollection}
              disabled={!userEmail}
            >
              Add to My Collection
            </button>
            {/* Close Button */}
            <button
              className="bg-[#FF6B6B] text-white px-4 py-2 rounded-lg"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}

        {/* Toast Notification Container */}
        <ToastContainer />
      </div>
    </div>
  );
};

export default AnalysisModal;