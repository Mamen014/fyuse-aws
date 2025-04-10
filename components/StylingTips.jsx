'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from 'react-oidc-context';
import { Dialog } from '@headlessui/react';
import PrivacyPolicyModal from "@/components/PrivacyPolicyModal";
import LoginModal from "@/components/LoginModal"

const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

const BODY_SHAPES = {
  male: ['trapezoid', 'triangle', 'inverted triangle', 'rectangle', 'round'],
  female: ['rectangle', 'inverted triangle', 'hourglass', 'pear', 'apple'],
};

const SKIN_TONES = ['fair', 'light', 'medium', 'tan', 'deep'];
const OCCASIONS = ['casual', 'business casual', 'formal', 'evening/party', 'sport/active'];

export default function StylingTips() {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(true); // or false if default

  const { user, signinRedirect } = useAuth();
  const userEmail = user?.profile?.email;
  const handleSignUp = () => {
    const clientId = process.env.NEXT_PUBLIC_CLIENTID
    const domain = process.env.NEXT_PUBLIC_DOMAIN;
    const redirectUri = typeof window !== 'undefined' ? window.location.origin + '/' : 'http://localhost:3000/';
    const signUpUrl = `https://${domain}/signup?client_id=${clientId}&response_type=code&scope=openid+profile+email&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
    sessionStorage.setItem('cameFromSignup', 'true'); // 🔑 Set flag
    window.location.href = signUpUrl;
  };

  const [useSavedPreferences, setUseSavedPreferences] = useState(true);
  const [gender, setGender] = useState('male');
  const [selectedOccasion, setSelectedOccasion] = useState('casual');
  const [stylingTips, setStylingTips] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGetStylingTips = async () => {
    if (!user) {
      alert('Please sign in to view styling tips.');
      signinRedirect();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStylingTips(null);

      const userData = {
        bodyShape: document.querySelector('select[name="bodyShape"]')?.value,
        skinTone: document.querySelector('select[name="skinTone"]')?.value,
        gender,
        preferences: {
          style: ['business casual', 'minimalist'],
        },
      };

      const payload = {
        userEmail,
        useSavedPreferences,
        occasion: selectedOccasion,
        ...(useSavedPreferences ? {} : { userData }),
      };

      const response = await axios.post(`${API_BASE_URL}/styletips`, payload);
      if (Array.isArray(response.data?.stylingTips)) {
        setStylingTips(response.data.stylingTips);
        setIsModalOpen(true);
      } else {
        setError('No styling tips available for your preferences.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyCheckbox = (e) => {
    const checked = e.target.checked;
    setAgreeToPrivacy(checked);
    if (userEmail) {
      localStorage.setItem(`privacyAgreement:${userEmail}`, checked.toString());
    }
  };

  return (
    <>
      <section className="bg-[#1a1a2f] text-white px-6 py-12 rounded-xl max-w-3xl mx-auto my-12 shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-center">Personalized Styling Tips</h2>

        <div className="flex justify-center gap-6 mb-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="preferences"
              value="saved"
              checked={useSavedPreferences}
              onChange={() => setUseSavedPreferences(true)}
            />
            Use saved preferences
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="preferences"
              value="new"
              checked={!useSavedPreferences}
              onChange={() => setUseSavedPreferences(false)}
            />
            Enter new preferences
          </label>
        </div>

        {!useSavedPreferences && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2 rounded bg-[#1f1f2e] text-white"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>

            <div>
              <label className="block mb-1">Body Shape</label>
              <select
                name="bodyShape"
                className="w-full p-2 rounded bg-[#1f1f2e] text-white"
              >
                {BODY_SHAPES[gender].map((shape) => (
                  <option key={shape} value={shape}>
                    {shape}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Skin Tone</label>
              <select
                name="skinTone"
                className="w-full p-2 rounded bg-[#1f1f2e] text-white"
              >
                {SKIN_TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block mb-1">Occasion</label>
          <select
            value={selectedOccasion}
            onChange={(e) => setSelectedOccasion(e.target.value)}
            className="w-full p-2 rounded bg-[#1f1f2e] text-white"
          >
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-center mt-2 space-x-2">
            <input
              type="checkbox"
              id="privacyConsent"
              checked={agreeToPrivacy}
              onChange={handlePrivacyCheckbox}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="privacyConsent" className="text-sm text-gray-300">
              I agree to the{" "}
              <button
                onClick={(e) => {
                  e.preventDefault(); // Prevent default link behavior
                  setIsPrivacyModalOpen(true); // Open the Privacy Policy Modal
                }}
                className="underline text-blue-400 cursor-pointer"
              >
                Privacy Policy Agreement
              </button>
            </label>
        </div>

        <div className="flex justify-center items-center mt-4 space-x-2">
          {/* Get Styling Tips Button */}
            <button
              onClick={() => {
                if (!user) return setIsLoginModalOpen(true); // Show Login Modal instead of signIn()
                handleGetStylingTips(); // only call this if user is logged in
              }}
              disabled={!agreeToPrivacy}
              className={`px-6 py-3 rounded-full font-medium text-white transition-transform shadow-md ${
                agreeToPrivacy
                  ? "bg-gradient-to-r from-purple-600 to-indigo-500 hover:scale-105"
                  : "bg-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? "Loading..." : "Get Styling Tips"}
            </button>

            {isPrivacyModalOpen && (
              <PrivacyPolicyModal
                isOpen={isPrivacyModalOpen}
                onClose={() => setIsPrivacyModalOpen(false)}
              />
            )}
  
            {/* Login Modal */}
            {isLoginModalOpen && (
              <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSignIn={signinRedirect}
                onSignUp={handleSignUp}
              />
            )}
        </div>

        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      </section>

      {/* Styling Tips Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed z-50 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-[#1f1f2e] text-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-purple-600">
            <Dialog.Title className="text-xl font-bold mb-4">Your Styling Tips</Dialog.Title>
            <ul className="list-disc pl-6 space-y-2 text-purple-200">
              {stylingTips?.map((tip, index) => (
                <li key={index}>
                  <strong>{tip.style}:</strong> {tip.description}
                </li>
              ))}
            </ul>
            <div className="mt-6 text-right">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gradient-to-r from-purple-600 to-indigo-500 px-4 py-2 rounded-full"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
