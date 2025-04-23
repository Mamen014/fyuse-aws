import React from "react";

const LearnMoreModal = ({ isOpen, onClose, Component }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="learn-more-modal-title"
    >
      <div className="bg-[#FAFAFA] text-[#0B1F63] w-full max-w-3xl rounded-2xl p-8 relative shadow-2xl border border-[#005EB8] overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          className="absolute top-0 right-1 text-[#0B1F63] hover:text-[#005EB8] text-3xl font-bold focus:outline-none transition-colors"
          onClick={onClose}
          aria-label="Close Learn More Modal"
        >
          &times;
        </button>

        {/* Modal Content */}
        <div
          className="text-base md:text-lg leading-relaxed"
          id="learn-more-modal-title"
        >
          <Component />
        </div>
      </div>
    </div>
  );
};

export default LearnMoreModal;
