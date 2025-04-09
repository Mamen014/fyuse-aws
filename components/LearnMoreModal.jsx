import React from "react";

const LearnMoreModal = ({ isOpen, onClose, Component }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#1e1e2e] text-white w-full max-w-3xl rounded-2xl p-8 relative shadow-2xl border border-purple-700">
        <button
          className="absolute top-4 right-5 text-gray-300 hover:text-red-500 text-3xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close Learn More Modal"
        >
          &times;
        </button>
        <div className="text-base md:text-lg leading-relaxed">
          <Component />
        </div>
      </div>
    </div>
  );
};

export default LearnMoreModal;
