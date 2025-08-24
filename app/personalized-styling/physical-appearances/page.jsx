// app/personalized-stlying/physical-appearances/page.jsx

'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Venus, Mars, Wand2, Palette, User } from 'lucide-react';
import { useAuth } from 'react-oidc-context';
import { motion } from "framer-motion";
import { ToastContainer, toast } from 'react-toastify';
import Image from 'next/image';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import LoadingModalSpinner from '@/components/ui/LoadingState';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import { useUserProfile } from '@/app/context/UserProfileContext';

export default function AIPhotoUpload() {
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState('');
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isUserPhotoGuidanceOpen, setIsUserPhotoGuidanceOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidUserImage, setIsValidUserImage] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const { user, isLoading: authLoading, signinRedirect } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const nickname = profile?.nickname;
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);

  const isInitialLoading = authLoading || profileLoading || isPageLoading || !user;
  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;
  const token = user?.access_token || user?.id_token;
  const allowedTypes = ["image/jpeg", "image/jpg"];
  const maxSizeMB = 4.5;
  const minResolution = 300;

  // Onboarding steps data
  const onboardingSteps = [
    {
      icon: <User className="text-blue-600 w-6 h-6" />,
      title: "Upload Your Photo",
      desc: "A clear photo helps us understand your body proportions and skin tone to start personalizing your style.",
    },
    {
      icon: <Palette className="text-pink-500 w-6 h-6" />,
      title: "We Analyze You",
      desc: "FYUSE uses your features to suggest outfits that suit your shape and enhance your tone.",
    },
    {
      icon: <Wand2 className="text-purple-500 w-6 h-6" />,
      title: "Adjust If Needed",
      desc: "You’ll have a chance to review and customize the results before styling begins.",
    },
  ];

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      signinRedirect();
      return;
    }
  }, [authLoading, user, signinRedirect]);

  useEffect (() => {
    if (!isInitialLoading) {
      if (!nickname) {
        console.log("nickname:", nickname);
        setShowRegisterPrompt(true);
      } else {
        setShowRegisterPrompt(false);
      }
    }

  }, [profile]);

  useEffect(() => {
    if (!authLoading) {
      const storedAgreement = localStorage.getItem("privacyAgreement");
      if (storedAgreement === "true") {
        setAgreeToPrivacy(true);
      }
    }
  }, [authLoading, user]);

  //Gender mapping
  const genderIconMap = {
    male: <Mars className="w-20 h-20 text-primary inline-block ml-4" />,
    female: <Venus className="w-20 h-20 text-primary inline-block mr-2" />,
  };

  // Capitalizing user' attribute first word
  function capitalizeWords(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Handle file selection, validation, and upload
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoPreview('');
    setIsValidUserImage(false);
    setFileToUpload(null);

    const isAllowedType = allowedTypes.includes(file.type);
    const isAllowedSize = file.size <= maxSizeMB * 1024 * 1024;

    let hasMinResolution = false;
    try {
      const imageBitmap = await createImageBitmap(file);
      hasMinResolution = imageBitmap.width >= minResolution && imageBitmap.height >= minResolution;
    } catch (error) {
      toast.error("Unable to read image resolution.");
      return;
    }

    if (!isAllowedType) {
      toast.error("Only JPG or JPEG files are allowed.");
      return;
    }

    if (!isAllowedSize) {
      toast.error("File size must be 4.5MB or less.");
      return;
    }

    if (!hasMinResolution) {
      toast.error("Image resolution must be at least 300×300 pixels.");
      return;
    }

    setIsValidUserImage(true);
    setFileToUpload(file);

    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Handle upload and AI analysis
  const handleUpload = async () => {
    if (!fileToUpload || !userEmail) return;

    try {
      setIsAnalyzing(true);
      setShowAIModal(true);

      // Convert file to base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(fileToUpload);
      });

      // Shared payload
      const payload = {
        fileName: fileToUpload.name,
        fileDataBase64: base64Data,
        contentType: fileToUpload.type,
        userEmail,
      };

      // Fire off both requests, but wait for analyzerTest first
      const analyzerPromise = fetch(`${API_BASE_URL}/analyzerTest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const uploadPromise = fetch(`/api/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Wait for analyzerTest first
      const analyzerResponse = await analyzerPromise;
      const analyzerData = await analyzerResponse.json();

      if (!analyzerResponse.ok) {
        throw new Error(analyzerData.error || 'AI analysis failed.');
      }

      const aiAnalysisResults = {
        gender: analyzerData.gender,
        skin_tone: analyzerData.skinTone,
        body_shape: analyzerData.bodyShape,
      };

      setAiAnalysis(aiAnalysisResults);
      setIsAnalyzing(false);

      // Wait for upload (if not done already), then track event
      const uploadResponse = await uploadPromise;
      const uploadData = await uploadResponse.json();

      if (!uploadData.user_image_url) {
        throw new Error('Upload failed: No image URL returned');
      }

      track('upload_photo', { selection: uploadData.user_image_url });

      // Save to backend
      try {
        await fetch('/api/register-profile', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(aiAnalysisResults),
        });
      } catch (error) {
        console.error('Error saving to backend:', error);
      }

    } catch (error) {
      const message = error.message || '';
      if (message.includes('No face detected') ||
          message.includes('Multiple faces detected') ||
          message.includes('Face not clearly visible') ||
          message.includes('Face too small in image')) {
        toast.error(message, { autoClose: 5000 });
      } else {
        toast.error('An error occurred during upload.', { autoClose: 5000 });
      }

      setShowAIModal(false);
      setIsAnalyzing(false);
    }
  };

  // Accept AI analysis
  const handleAcceptAnalysis = async () => {
    if (isSubmitting) return;
    track('ai_analysis', { selection: "accept" });
    setIsSubmitting(true);
    setIsPageLoading(true);   
    
    try {
      // Navigate to the next page
      setIsPageLoading(true);
      router.push('fashion-type');
    } catch (error) {
      console.error('Error accepting analysis:', error);
      setIsSubmitting(false);
      setIsPageLoading(false);
    }
  };

  // Show loading spinner
  if (isInitialLoading) {
    return (
    <LoadingModalSpinner 
      message="Uploading..." 
      subMessage="Please wait" 
    />
    );
  }

  // Customize physical Appearance
  const handleCustomize = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      
      // Navigate to the first step of manual physical attributes
      track('ai_analysis', { selection: "decline" });
      setIsPageLoading(true);
      router.push('physical-appearances/manual/step-1');
    } catch (error) {
      console.error('Error during customization:', error);
      setIsSubmitting(false);
    }
  };

  // Tracker for user activity
  const track = async (action, metadata = {}) => {
    if (!userEmail) return;
    try {
      await axios.post(`${API_BASE_URL}/trackevent`, {
        userEmail,
        action,
        timestamp: new Date().toISOString(),
        page: 'physical_appearance',
        ...metadata,
      });
    } catch (err) {
      console.error('Tracking failed:', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 relative">

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-primary" style={{ width: '50%' }}></div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
      {/* Next.js loading state will handle the loading overlay */}
      
      <main className="max-w-6xl mx-auto py-4 px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Onboarding Steps */}
        <div className="space-y-6">

          <div>
            <h1 className="text-4xl font-bold text-primary mb-8">How This Works</h1>
            <div className="space-y-4">
              {onboardingSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.3 }}
                  className="flex items-start gap-4 bg-white rounded-xl shadow-sm p-4"
                >
                  <div>{step.icon}</div>
                  <div>
                    <h3 className="text-md font-semibold text-primary mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Upload Section */}
        <div className="w-full flex flex-col gap-6 max-w-md mx-auto">
          {/* Upload Box */}
          <div className="w-full border border-primary rounded-2xl overflow-hidden" style={{ minHeight: '340px' }}>
            <input
              type="file"
              accept=".jpg,.jpeg"
              onChange={handleFileSelect}
              id="photo-upload"
              className="hidden"
            />
            <label
              htmlFor="photo-upload"
              className="h-[340px] px-4 py-6 cursor-pointer text-center flex flex-col justify-between items-center"
            >
              {photoPreview ? (
                <div className="w-full h-full flex items-center justify-center px-6 py-4">
                  <Image
                    src={photoPreview}
                    alt="Uploaded"
                    width={200}
                    height={200}
                    className="max-h-full max-w-full object-contain rounded-xl"
                    style={{ aspectRatio: '3/4' }}
                  />
                </div>
              ) : (
                <>
                  {/* Middle: Upload Prompt */}
                  <div className="flex-1 flex flex-col justify-center items-center text-primary-300">
                    <p className="text-lg">Click to upload</p>
                    <p className="text-[10px] text-gray-400 mt-2 text-center px-4">
                      Accepted formats: JPG or JPEG. Max size: 4.5MB. Min resolution: 300×300px
                    </p>
                  </div>

                  {/* Bottom: Guidance Link */}
                  <div className="mt-auto">
                    <button
                      onClick={() => {
                        track("button_click", {selection: "upload_guidence"});
                        setIsUserPhotoGuidanceOpen(true)}}
                      className="underline text-[16px] text-blue-400 cursor-pointer"
                    >
                      Upload Photo Guidance
                    </button>
                  </div>
                </>
              )}
            </label>
          </div>

          {/* Privacy policy checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="privacyConsent"
              checked={agreeToPrivacy}
              onChange={(e) => {
                const checked = e.target.checked;
                setAgreeToPrivacy(checked);
                localStorage.setItem("privacyAgreement", checked.toString());
              }}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="privacyConsent" className="text-sm text-gray-500">
              I agree to the{" "}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsPrivacyModalOpen(true);
                }}
                className="text-blue-500 underline"
              >
                Privacy Policy Agreement
              </button>
            </label>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!fileToUpload || isAnalyzing || !isValidUserImage || !agreeToPrivacy}
            className={`w-full py-3.5 font-medium rounded-lg transition-opacity duration-200 ${
              fileToUpload && agreeToPrivacy && isValidUserImage && !isAnalyzing
                ? 'bg-primary text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            style={{ borderRadius: '8px' }}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Photo'}
          </button>
        </div>
      </main>

      {isUserPhotoGuidanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-3xl shadow-xl relative overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setIsUserPhotoGuidanceOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 font-bold rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              X
            </button>

            {/* Title */}
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6">
              Example Photos Guide
            </h2>

            {/* Side-by-Side Images, scrollable if too wide */}
            <div className="flex flex-row gap-6 overflow-x-auto">
              {/* Good Example */}
              <div className="flex flex-col items-center min-w-[45%]">
                <Image
                  src="/examples/user/good.png"
                  alt="Good example"
                  width={200}
                  height={300}
                  className="rounded-xl object-cover max-w-full h-auto"
                />
                <p className="text-green-600 font-medium mt-2">Good Example</p>
              </div>

              {/* Bad Example */}
              <div className="flex flex-col items-center min-w-[45%]">
                <Image
                  src="/examples/user/bad.png"
                  alt="Bad example"
                  width={200}
                  height={300}
                  className="rounded-xl object-cover max-w-full h-auto"
                />
                <p className="text-red-600 font-medium mt-2">Bad Example</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPrivacyModalOpen && (
        <PrivacyPolicyModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
        />
      )}

      {showRegisterPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl text-center">
            <h2 className="text-xl font-bold mb-4 text-primary">Want More Personalized Styles?</h2>
            <p className="text-sm text-gray-700 mb-6">
              Tell us a little about yourself — so we can tailor outfit ideas that fit your lifestyle better.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  localStorage.setItem("registerFrom", "physical-appearances");
                  track('register', {selection: 'true'});
                  setIsPageLoading(true);
                  router.push('/register');
                }}
                className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-[#0a1b56] transition"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  track('register', {selection: 'false'})
                  setShowRegisterPrompt(false);
                }}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )} 
      {/* AI Analysis Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            {isAnalyzing ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-lg font-medium text-primary">Analyzing your photo...</p>
                <p className="text-sm text-gray-500 mt-2 text-center">This may take a few moments</p>
              </div>
            ) : (
              <>
              <h1 className="text-4xl font-bold text-primary text-center mb-8">Analysis Results</h1>
              <div className="flex flex-row gap-6 items-start mb-4">
                {/* Left: Gender & Skin Tone (stacked) */}
                <div className="flex flex-col items-center gap-4">
                  {/* Gender */}
                  <div className="flex flex-col border border-primary/30 rounded-xl shadow-lg items-center px-7">
                    <p className="text-2xl font-medium text-gray-600">Gender</p>
                    <div className="flex flex-col items-center">
                      {genderIconMap[aiAnalysis?.gender?.toLowerCase()] || 'Not detected'}
                      <span className="text-lg text-primary mb-2">{capitalizeWords(aiAnalysis?.gender || '')}</span>
                    </div>
                  </div>
                  {/* Skin Tone */}
                  <div className="flex flex-col border border-primary/30 rounded-xl shadow-lg items-center mt-2 px-4">
                    <p className="text-2xl font-medium text-gray-600 whitespace-nowrap">Skin Tone</p>
                    <div className="flex flex-col items-center">
                      {aiAnalysis?.skin_tone && (
                        <Image
                          src={`/images/skin-tone/${aiAnalysis.skin_tone}.png`}
                          alt={aiAnalysis.skin_tone || 'Skin Tone'}
                          width={60}
                          height={60}
                          className="rounded-md object-contain mt-2"
                        />
                      )}
                      <span className="text-lg text-primary mt-2 mb-2">{capitalizeWords(aiAnalysis?.skin_tone || 'Not detected')}</span>
                    </div>
                  </div>
                </div>
                {/* Right: Body Shape */}
                <div className="flex flex-col border border-primary/30 rounded-xl shadow-lg items-center px-1">
                  <p className="text-2xl font-medium text-gray-600">Body Shape</p>
                  {aiAnalysis?.gender && aiAnalysis?.body_shape && (
                    <Image
                      src={`/images/body-shape/${aiAnalysis.gender}/${aiAnalysis.body_shape}.png`}
                      alt={aiAnalysis.body_shape || 'Body Shape'}
                      width={512}
                      height={512}
                      className="w-64 h-64 rounded-lg object-contain mt-2 transition-transform"
                    />
                  )}
                  <span className="text-lg text-primary mb-2">{capitalizeWords(aiAnalysis?.body_shape || 'Not detected')}</span>
                </div>
              </div>            
                <div className="space-y-3">
                  <button
                    onClick={handleAcceptAnalysis}
                    disabled={isSubmitting}
                    className={`w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-[#0a1b56] transition-colors flex items-center justify-center ${isSubmitting ? 'opacity-75' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : 'Accept Analysis'}
                  </button>
                  <button
                    onClick={handleCustomize}
                    disabled={isSubmitting}
                    className={`w-full py-3 border border-primary text-primary rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center ${isSubmitting ? 'opacity-50' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : 'Customize Manually'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 