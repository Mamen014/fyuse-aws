import React from "react";

const ReferralModal = ({ isOpen, handleTrack, onClose }) => {
  if (!isOpen) return null;

  const options = [
    "Instagram",
    "TikTok",
    "LinkedIn",
    "Friends",
    "Google Search",
    "Other",
  ];

  const handleSelect = (option) => {
    handleTrack("Referral Source Selected", { selection: option });
    onClose(); // close after selection
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
        <div className="bg-[#0A1B5E] text-white text-center py-4 rounded-t-2xl">
          <h2 className="text-xl font-bold">
            How Did You Hear<br />About FYUSE?
          </h2>
        </div>
        <div className="flex flex-col gap-4 mt-6">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className="bg-[#0A1B5E] text-white py-3 px-6 rounded-full font-medium hover:opacity-90 transition"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferralModal;
