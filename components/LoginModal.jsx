import React from "react";

export default function LoginModal({ isOpen, onClose, onSignIn, onSignUp }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-background text-foreground p-8 rounded shadow-lg max-w-md w-full relative border border-primary">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground hover:text-cta text-xl font-bold"
          aria-label="Close Modal"
        >
          &times;
        </button>

        {/* Modal Content */}
        <h2 className="text-2xl font-bold mb-6 text-cta">
          Please Log In
        </h2>
        <p className="text-foreground mb-6">
          To access this feature, please log in or create an account.
        </p>
        <div className="space-y-4">
          <button
            onClick={onSignIn}
            className="w-full bg-cta hover:bg-primary text-cta-foreground px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onSignUp} // Call the passed `onSignUp` function
            className="w-full bg-success hover:bg-success/80 text-success-foreground px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}