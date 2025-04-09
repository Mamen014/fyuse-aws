import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from 'react-oidc-context';

const StylingTips = ({ userEmail }) => {
  const [stylingTips, setStylingTips] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useSavedPreferences, setUseSavedPreferences] = useState(true);
  const [gender, setGender] = useState('male');
  const [selectedOccasion, setSelectedOccasion] = useState('casual'); // Default to "casual"
  const [showModal, setShowModal] = useState(false);
  const { user, signIn } = useAuth();

  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  const BODY_SHAPES = {
    male: ["trapezoid", "triangle", "inverted triangle", "rectangle", "round"],
    female: ["rectangle", "inverted triangle", "hourglass", "pear", "apple"],
  };

  const SKIN_TONES = ["fair", "light", "medium", "tan", "deep"];

  const OCCASIONS = [
    "casual",
    "business casual",
    "formal",
    "evening/party",
    "sport/active",
  ];

  const handleGetStylingTips = async () => {
    if (!user) {
      alert("You need to log in to access styling tips.");
      signIn();
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
          style: ["business casual", "minimalist"],
        },
      };

      const payload = {
        userEmail,
        useSavedPreferences,
        occasion: selectedOccasion, // Use the selected occasion
        ...(useSavedPreferences ? {} : { userData }),
      };

      const response = await axios.post(`${API_BASE_URL}/styletips`, payload);

      if (response.data?.stylingTips && Array.isArray(response.data.stylingTips)) {
        setStylingTips(response.data.stylingTips);
      } else {
        setError("No styling tips available for your preferences.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <div className="text-center mt-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700"
        >
          Open Styling Tips
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl relative mx-4 my-12">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
              aria-label="Close modal"
            >
              &times;
            </button>

            <h2 className="text-2xl font-medium text-gray-800 text-center">Styling Tips</h2>

            <div className="flex items-center justify-center space-x-4 mt-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={useSavedPreferences}
                  onChange={() => setUseSavedPreferences(true)}
                  className="form-radio"
                />
                <span className="ml-2 text-gray-700">Use my saved preferences</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={!useSavedPreferences}
                  onChange={() => setUseSavedPreferences(false)}
                  className="form-radio"
                />
                <span className="ml-2 text-gray-700">Enter new preferences</span>
              </label>
            </div>

            {!useSavedPreferences && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Body Shape</label>
                  <select
                    name="bodyShape"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black bg-white"
                  >
                    {BODY_SHAPES[gender].map((shape) => (
                      <option key={shape} value={shape}>
                        {shape.charAt(0).toUpperCase() + shape.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Skin Tone</label>
                  <select
                    name="skinTone"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black bg-white"
                  >
                    {SKIN_TONES.map((tone) => (
                      <option key={tone} value={tone}>
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Occasion</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Occasion</label>
                  <select
                    value={selectedOccasion}
                    onChange={(e) => setSelectedOccasion(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black bg-white"
                  >
                    {OCCASIONS.map((occasion) => (
                      <option key={occasion} value={occasion}>
                        {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={handleGetStylingTips}
                disabled={loading}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-purple-400"
                aria-label="Generate styling tips"
              >
                {loading ? 'Generating Tips...' : 'Get Styling Tips'}
              </button>
            </div>

            {error && <p className="text-red-500 text-center mt-4">{error}</p>}

            {stylingTips && Array.isArray(stylingTips) && (
              <div className="mt-6 bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Personalized Styling Tips</h3>
                <ul className="space-y-2">
                  {stylingTips.map((tip, index) => (
                    <li key={index} className="text-gray-700">
                      <strong>{tip.style}:</strong> {tip.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default StylingTips;