'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import toast, { Toaster } from 'react-hot-toast';
import LoadingModalSpinner from '@/components/ui/LoadingState';


export default function SurveyPage() {
  const { user, isLoading, signinRedirect } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const token = user?.access_token || user?.id_token;
  const [formData, setFormData] = useState({
    stylingSatisfaction: '',
    styleMatch: '',
    bodyShape: '',
    skinTone: '',
    tryonRealism: '',
    tryonEase: '',
    appExperience: '',
    device: '',
    issues: [],
    shareIntent: '',
    purchaseIntent: '',
    likeMost: '',
    improveSuggestions: '',
    email: '',
  });

  const requiredFields = [
    'stylingSatisfaction',
    'styleMatch',
    'bodyShape',
    'skinTone',
    'tryonRealism',
    'tryonEase',
    'appExperience',
    'device',
    'shareIntent',
    'purchaseIntent',
  ];

  const isFormValid = requiredFields.every((field) => formData[field]);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      signinRedirect();
    }
  }, [isLoading, user, signinRedirect]);
    
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckbox = (value) => {
    setFormData((prev) => {
      const exists = prev.issues.includes(value);
      return {
        ...prev,
        issues: exists
          ? prev.issues.filter((i) => i !== value)
          : [...prev.issues, value],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // prevent double click
    if (!isFormValid) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setLoading(true); // show loading spinner

    try {
      const res = await fetch('/api/submit-survey', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Survey submission failed");

      toast.success('Thanks for your feedback!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
      setLoading(false); // allow retry
    }
  };

  const renderRadioGroup = (label, field, options) => (
    <div className="space-y-2">
      <p className="font-semibold text-gray-800">{label}</p>
      <div className="flex flex-wrap gap-3 mt-2">
        {options.map((opt, idx) => (
          <label key={idx} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={field}
              value={opt}
              checked={formData[field] === opt}
              onChange={() => handleChange(field, opt)}
              className="accent-primary"
            />
            <span className="text-sm text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const options = {
    scale1to5: ['1', '2', '3', '4', '5'],
    accuracy: ['Very inaccurate', 'Somewhat accurate', 'Very accurate'],
    realism: ['Not realistic', 'Okay', 'Good', 'Very realistic', 'Jaw-dropping'],
    ease: ['Confusing', 'A bit tricky', 'Straightforward', 'Super intuitive'],
    match: ['Not at all', 'Somewhat', 'Mostly', 'Perfectly'],
    devices: ['Mobile', 'Tablet', 'Desktop/Laptop'],
    issues: [
      'Slow load times',
      'Try-on image failed or took too long',
      'Wrong try-on result shown',
      'Upload problems',
      'Subscription limits confusing',
      'None of the above',
    ],
    shareIntent: ['Yes, definitely', 'Maybe', 'No'],
    purchaseIntent: [
      'Very likely',
      'Somewhat likely',
      'Not likely',
      'I prefer browsing only',
    ],
  };

  if (loading) return <LoadingModalSpinner message="Submitting your feedback..." />;
  return (
    <>
    <Toaster position="top-center" />
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto px-4 py-10 space-y-10 text-gray-800"
    >
      <h1 className="text-3xl font-bold text-center text-primary mb-2">
        🧥 FYUSE Feedback Survey
      </h1>
      <p className="text-center text-gray-600">
        Your thoughts help us make FYUSE better for you. This will only take 2–3 minutes.
      </p>

      {/* Styling Section */}
      <div className="bg-white shadow-md rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold text-primary">👗 Personalized Styling Experience</h2>
        {renderRadioGroup(
          'How satisfied are you with the personalized fashion recommendations you’ve received?',
          'stylingSatisfaction',
          options.scale1to5
        )}
        {renderRadioGroup(
          'How well do the recommended styles match your preferences and lifestyle?',
          'styleMatch',
          options.match
        )}
        {renderRadioGroup('How accurately does FYUSE detect your body shape?', 'bodyShape', options.accuracy)}
        {renderRadioGroup('How accurately does FYUSE detect your skin tone?', 'skinTone', options.accuracy)}
        {renderRadioGroup('How realistic do the virtual try-on images look to you?', 'tryonRealism', options.realism)}
        {renderRadioGroup('How easy was it to use the try-on feature?', 'tryonEase', options.ease)}
      </div>

      {/* App Section */}
      <div className="bg-white shadow-md rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold text-primary">📱 App Experience</h2>
        {renderRadioGroup('How would you rate the overall user experience on FYUSE?', 'appExperience', options.scale1to5)}
        {renderRadioGroup('Which device do you mostly use FYUSE on?', 'device', options.devices)}

        <div className="space-y-2">
          <p className="font-semibold text-gray-800">
            Have you experienced any of the following issues? (Check all that apply)
          </p>
          <div className="flex flex-col gap-2">
            {options.issues.map((issue, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={issue}
                  checked={formData.issues.includes(issue)}
                  onChange={() => handleCheckbox(issue)}
                  className="accent-primary"
                />
                <span className="text-sm text-gray-700">{issue}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Future Features Section */}
      <div className="bg-white shadow-md rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold text-primary">💡 Future Features</h2>
        {renderRadioGroup(
          'Would you like to share your try-on results on social media (e.g., Instagram, WhatsApp)?',
          'shareIntent',
          options.shareIntent
        )}
        {renderRadioGroup(
          'How likely would you be to purchase clothing through FYUSE if it redirected you to the brand’s store (with cashback or perks)?',
          'purchaseIntent',
          options.purchaseIntent
        )}
      </div>

      {/* Final Thoughts Section */}
      <div className="bg-white shadow-md rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold text-primary">✍️ Final Thoughts</h2>

        <div className="space-y-2">
          <label className="font-semibold">What do you like most about FYUSE?</label>
          <textarea
            rows={3}
            value={formData.likeMost}
            onChange={(e) => handleChange('likeMost', e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3"
            placeholder="Your favorite part of the experience..."
          />
        </div>

        <div className="space-y-2">
          <label className="font-semibold">What could we improve or add to make FYUSE better for you?</label>
          <textarea
            rows={3}
            value={formData.improveSuggestions}
            onChange={(e) => handleChange('improveSuggestions', e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3"
            placeholder="Your honest suggestions..."
          />
        </div>

        <div className="space-y-2">
          <label className="font-semibold">Email (optional, for follow-up):</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`text-lg font-semibold py-3 px-8 rounded-full transition flex items-center justify-center gap-2 ${
            !isFormValid || loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Feedback"
          )}
        </button>
      </div>
    </form>    
    </>

  );
}
