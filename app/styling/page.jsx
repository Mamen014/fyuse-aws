"use client";
import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "react-oidc-context";
import { Dialog } from "@headlessui/react";
import PrivacyPolicyModal from "@/components/PrivacyPolicyModal";
import LoginModal from "@/components/LoginModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;
const BODY_SHAPES = {
  male: ["trapezoid", "triangle", "inverted triangle", "rectangle", "round"],
  female: ["rectangle", "inverted triangle", "hourglass", "pear", "apple"],
};
const SKIN_TONES = ["fair", "light", "medium", "tan", "deep"];
const OCCASIONS = ["Work", "Gym/Workout", "Wedding", "Outdoor Adventure", "Date Night"];
const STYLE_OPTIONS = ["Casual", "Formal", "Sporty", "Bohemian", "Chic"];

export default function StylingTips() {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const { user, signinRedirect } = useAuth();
  const userEmail = user?.profile?.email;

  const handleSignUp = () => {
    const clientId = process.env.NEXT_PUBLIC_CLIENTID;
    const domain = process.env.NEXT_PUBLIC_DOMAIN;
    const redirectUri = typeof window !== "undefined" ? window.location.origin + "/" : "http://localhost:3000/";
    const signUpUrl = `https://${domain}/signup?client_id=${clientId}&response_type=code&scope=openid+profile+email&redirect_uri=${encodeURIComponent(redirectUri)}`;
    sessionStorage.setItem("cameFromSignup", "true");
    window.location.href = signUpUrl;
  };

  const [useSavedPreferences, setUseSavedPreferences] = useState(true);
  const [gender, setGender] = useState("male");
  const [selectedOccasion, setSelectedOccasion] = useState("casual");
  const [stylingTips, setStylingTips] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStyleToggle = (style) => {
    setSelectedStyles((prev) => (prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]));
  };

  const collectUserData = () => ({
    bodyShape: document.querySelector('select[name="bodyShape"]')?.value,
    skinTone: document.querySelector('select[name="skinTone"]')?.value,
    gender,
    preferences: { style: selectedStyles },
  });

  const handleGetStylingTips = async () => {
    if (!user) {
      alert("Please sign in to view styling tips.");
      signinRedirect();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setStylingTips(null);
      const userData = collectUserData();
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
        setError("No styling tips available for your preferences.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "An unexpected error occurred.");
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

  const handleLikeStyle = async (style) => {
    if (!userEmail || !style) return;
    try {
      const payload = {
        userEmail,
        likedStyle: [style.toLowerCase()],
        ...(useSavedPreferences
          ? { userData: { preferences: { style: selectedStyles } } }
          : { userData: collectUserData() }),
      };
      await axios.post(`${API_BASE_URL}/styletips`, payload);
    } catch (err) {
      console.error("Error saving liked style:", err);
    }
  };

  return (
    <>
      <section className="bg-background text-primary-background px-6 py-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Personalized Styling Tips</h2>
        <div className="flex justify-center gap-6 mb-6">
          <label className="flex items-center gap-2">
            <input type="radio" name="preferences" value="saved" checked={useSavedPreferences} onChange={() => setUseSavedPreferences(true)} />
            Use saved preferences
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="preferences" value="new" checked={!useSavedPreferences} onChange={() => setUseSavedPreferences(false)} />
            Enter new preferences
          </label>
        </div>

        {!useSavedPreferences && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block mb-1">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2 border border-cta rounded-md bg-input text-foreground">
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Body Shape</label>
                <select name="bodyShape" className="w-full p-2 border border-cta rounded-md bg-input text-foreground">
                  {BODY_SHAPES[gender].map((shape) => (
                    <option key={shape} value={shape}>{shape}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Skin Tone</label>
                <select name="skinTone" className="w-full p-2 border border-cta rounded-md bg-input text-foreground">
                  {SKIN_TONES.map((tone) => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2">Style Preferences</label>
              <div className="flex flex-wrap gap-2">
                {STYLE_OPTIONS.map((style) => (
                  <button
                    key={style}
                    onClick={() => handleStyleToggle(style)}
                    className={`px-4 py-2 rounded-md text-sm font-medium border transition-all ${selectedStyles.includes(style) ? "bg-cta border-cta text-white" : "bg-background border-cta text-foreground"}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="mb-6">
          <label className="block mb-1">Occasion</label>
          <select value={selectedOccasion} onChange={(e) => setSelectedOccasion(e.target.value)} className="w-full p-2 border border-cta rounded-md bg-input text-foreground">
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-center mt-2 space-x-2">
          <input type="checkbox" id="privacyConsent" checked={agreeToPrivacy} onChange={handlePrivacyCheckbox} className="w-4 h-4 accent-blue-500" />
          <label htmlFor="privacyConsent" className="text-sm text-muted-foreground">
            I agree to the <button onClick={(e) => { e.preventDefault(); setIsPrivacyModalOpen(true); }} className="underline text-blue-400 cursor-pointer">Privacy Policy Agreement</button>
          </label>
        </div>

        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            onClick={() => {
              if (!user) return setIsLoginModalOpen(true);
              handleGetStylingTips();
            }}
            disabled={!agreeToPrivacy || loading}
            className={`px-6 py-3 bg-accent rounded-md font-medium text-background transition-transform shadow-md ${agreeToPrivacy ? "bg-cta hover:scale-105" : "bg-muted-foreground text-muted cursor-not-allowed"}`}
          >
            {loading ? "Generating..." : "Get Styling Tips"}
          </button>
        </div>

        {error && <p className="text-destructive mt-4 text-center">{error}</p>}
      </section>

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-background text-foreground max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-cta">
            <Dialog.Title className="text-xl font-bold mb-4">Your Styling Tips</Dialog.Title>
            <ul className="list-disc pl-6 space-y-6 text-foreground justify-between">
              {stylingTips?.map((tip, index) => (
                <li key={index} className="flex items-center justify-center space-x-10">
                  <div>
                    <strong>{tip.style}:</strong> {tip.description}
                  </div>
                  <button
                    onClick={async () => {
                      await handleLikeStyle(tip.style);
                      setStylingTips((prev) => prev.filter((_, i) => i !== index));
                    }}
                    className="px-3 py-1 rounded-md text-sm bg-success"
                  >
                    Like
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-right">
              <button onClick={() => setIsModalOpen(false)} className="bg-background border border-cta px-4 py-2 rounded-md">Close</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

        <div className="bottom-0 left-0 right-0 bg-background py-8 px-2 flex justify-between items-center">
          {/* Back to Home (Arrow Icon) */}
          <Link href="/" passHref>
            <button
              className="text-foreground text-xl hover:text-cta transition-colors"
              aria-label="Back to Home"
            >
              ← Back to Home
            </button>
          </Link>

          {/* Link to /tryon */}
          <Link href="/tryon" passHref>
            <button
              className="text-foreground text-xl hover:text-cta transition-colors"
              aria-label="View Tryon Page"
            >
              Digital Fitting Room →
            </button>
          </Link>
        </div>
      {isPrivacyModalOpen && <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />}
      {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onSignIn={signinRedirect} onSignUp={handleSignUp} />}
    </>
  );
}
