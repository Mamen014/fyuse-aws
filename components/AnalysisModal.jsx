import React from "react";
import { PieChart, Pie, Cell } from "recharts"; // For circular progress bar

const AnalysisModal = ({ isOpen, onClose, analysisData, loading }) => {
  if (!isOpen) return null;

  const {
    gender = "unknown",
    skinTone = "unknown",
    bodyShape = "unknown",
    clothingFit = "unknown",
    clothingColor = "unknown",
    matchingPercentage = "0",
    DescriptionRaw = "No detailed analysis available.",
  } = analysisData || {};

  const matchingPercentageNum = parseInt(matchingPercentage, 10) || 0;

  const data = [
    { name: "Matched", value: matchingPercentageNum },
    { name: "Unmatched", value: 100 - matchingPercentageNum },
  ];

  const COLORS = ["#F38980", "#848CB1"];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Fit Analysis</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-lg font-bold focus:outline-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-32">
            <svg
              className="animate-spin h-8 w-8 text-blue-500 mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
              />
            </svg>
            <p className="text-gray-600">Analyzing your fit...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Matching Percentage and Details */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Matching Percentage (Circular Progress Bar) */}
              <div className="w-48 h-48 relative">
                <PieChart width={180} height={180}>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                    fill="#8884d8"
                    label={false}
                    innerRadius={60} // Create a hole in the center
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
                  style={{ zIndex: 1 }}
                >
                  <span
                    className="text-4xl font-bold"
                    style={{ color: "#8A4A57" }}
                  >
                    {matchingPercentageNum}%
                  </span>
                </div>
              </div>

              {/* User Appearance and Clothing Item */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                <div className="bg-gray-100 p-2 rounded">
                  <h3 className="text-gray-700 font-medium mb-1">User Appearance</h3>
                  <ul className="list-disc pl-4 text-gray-600">
                    <li>Gender: {gender}</li>
                    <li>Body Shape: {bodyShape}</li>
                    <li>Skin Tone: {skinTone}</li>
                  </ul>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <h3 className="text-gray-700 font-medium mb-1">Clothing Item</h3>
                  <ul className="list-disc pl-4 text-gray-600">
                    <li>Fit: {clothingFit}</li>
                    <li>Color: {clothingColor}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Matching Description */}
            <div className="bg-gray-100 p-4 rounded mt-4">
              <h3 className="text-gray-700 font-medium mb-1">Matching Description</h3>
              <p className="text-gray-600 whitespace-pre-line">{DescriptionRaw}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisModal;