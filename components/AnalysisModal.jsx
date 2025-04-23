import React from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Dynamically import the client-side chart component
const ClientChart = dynamic(() => import("./ClientChart"), { ssr: false });

const AnalysisModal = ({
  isOpen,
  onClose,
  analysisData,
  loading,
  tryOnImage,
  userEmail,
  errorMessage,
}) => {
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

  const COLORS = ["#A1E3B5", "#848CB1"];

  // Function to handle adding the try-on result to the user's collection
  const handleAddToCollection = async () => {
    if (!userEmail) {
      console.error("User email not found. Please log in.");
      toast.error("Please log in to add this item to your wardrobe.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    console.log("Submitting to wardrobe:", {
      userEmail,
      generatedImageUrl: tryOnImage,
    });
    try {
      // Make the POST request to the /tryontrack endpoint
      await axios.post(`${process.env.NEXT_PUBLIC_FYUSEAPI}/tryontrack`, {
        userEmail,
        generatedImageUrl: tryOnImage, // Pass the try-on image URL
      });

      // Show success toast notification
      toast.success("Added to your wardrobe!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error adding to wardrobe:", error);
      toast.error(
        "An error occurred while adding this item to your wardrobe.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog">
      <div className="bg-background text-foreground rounded-lg w-full max-w-2xl p-6 shadow-lg overflow-y-auto max-h-screen">
        <button
          onClick={onClose}
          className="text-xl font-bold text-destructive hover:text-red-600 focus:outline-none"
          aria-label="Close modal"
        >
          &times;
        </button>

        {errorMessage ? (
          <div className="text-center py-12 text-destructive">
            <h3 className="text-2xl font-semibold">Something went wrong</h3>
            <p className="mt-2">{errorMessage}</p>
          </div>
        ) : loading || !tryOnImage ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cta"></div>
            <p className="text-muted-foreground mt-4">Please wait...<br />This may take up to 3 minutes</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                {tryOnImage ? (
                  <img
                    src={tryOnImage}
                    alt="Try-On Result"
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="p-8 text-center text-muted-foreground">No try-on image available</div>
                )}
              </div>
              <div className="bg-background border border-border rounded-md p-4">
                <h3 className="text-lg font-medium text-foreground mb-2">User Appearance</h3>
                <ul className="list-disc pl-4 text-muted-foreground">
                  <li>Gender: {gender}</li>
                  <li>Body Shape: {bodyShape}</li>
                  <li>Skin Tone: {skinTone}</li>
                </ul>
              </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div className="bg-transparent rounded-lg shadow-md p-4 flex flex-col items-center">
                {ClientChart && (
                  <>
                    <ClientChart data={data} COLORS={COLORS} />
                    <span className="text-4xl font-bold text-accent mt-2">{matchingPercentageNum}%</span>
                  </>
                )}
              </div>
              <div className="bg-background border border-border rounded-md p-4">
                <h3 className="text-lg font-medium text-foreground mb-2">Clothing Item</h3>
                <ul className="list-disc pl-4 text-muted-foreground">
                  <li>Fit: {clothingFit}</li>
                  <li>Color: {clothingColor}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisModal;
