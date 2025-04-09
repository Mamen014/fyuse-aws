import React from "react";

export default function LoginModal({ isOpen, onClose, onSignIn, onSignUp }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div
        className="bg-[#1C0C1D] text-white p-8 rounded shadow-lg max-w-md w-full relative"
        style={{ borderColor: "#848CB1" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-purple-400 text-xl font-bold"
          aria-label="Close Modal"
        >
          &times;
        </button>

        {/* Modal Content */}
        <h2 className="text-2xl font-bold mb-6 text-[#F38980]">Please Log In</h2>
        <p className="text-gray-300 mb-6">
          To access this feature, please log in or create an account.
        </p>
        <div className="space-y-4">
          <button
            onClick={onSignIn}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Sign In
          </button>
          <button
            onClick={onSignUp} // Call the passed `onSignUp` function
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Sign Up
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}