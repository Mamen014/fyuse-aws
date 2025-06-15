'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { ToastContainer, toast } from 'react-toastify';
import Image from 'next/image';
import 'react-toastify/dist/ReactToastify.css';

export default function AIPhotoUpload() {
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState('');
  const [isUserPhotoGuidanceOpen, setIsUserPhotoGuidanceOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isValidUserImage, setIsValidUserImage] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const userEmail = user?.profile?.email;
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  const allowedTypes = ["image/jpeg", "image/jpg"];
  const maxSizeMB = 10;
  const minResolution = 300;

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
      toast.error("File size must be 10MB or less.");
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

  const handleUpload = async () => {
    if (!fileToUpload || !userEmail) return;

    try {
      setLoading(true);
      setIsAnalyzing(true);
      setShowAIModal(true);
      
      // Convert file to base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(fileToUpload);
      });

      // Prepare payload
      const payload = {
        fileName: fileToUpload.name,
        fileDataBase64: base64Data,
        contentType: fileToUpload.type,
        userEmail: userEmail,
      };

      // Upload image
      const uploadResponse = await fetch(`${API_BASE_URL}/upload-user-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const uploadData = await uploadResponse.json();
      
      if (!uploadData.imageUrl) {
        throw new Error('Upload failed: No image URL returned');
      }

      // Store the image URL
      localStorage.setItem('user_image', uploadData.imageUrl);

      // Analyze the uploaded image
      const analyzerResponse = await fetch(`${API_BASE_URL}/userAnalyzer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userImage: uploadData.imageUrl,
          userEmail: userEmail
        }),
      });
      const analyzerData = await analyzerResponse.json();
      
      // Format the AI analysis results
      const aiAnalysisResults = {
        gender: analyzerData.gender,
        skinTone: analyzerData.skinTone,
        bodyShape: analyzerData.bodyShape
      };
      
      // Save to state for the modal
      setAiAnalysis(aiAnalysisResults);
      
      // Save to localStorage in the format expected by the onboarding flow
      localStorage.setItem('onboarding_physical_attributes_1', JSON.stringify({
        gender: analyzerData.gender,
        skinTone: analyzerData.skinTone
      }));
      
      localStorage.setItem('onboarding_physical_attributes_2', JSON.stringify({
        bodyShape: analyzerData.bodyShape
      }));
      
      // Save to backend API
      try {
        // First call - physicalAppearance1 (gender and skin tone)
        await fetch(`${API_BASE_URL}/userPref`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail,
            section: 'physicalAppearance1',
            data: {
              gender: analyzerData.gender,
              skinTone: analyzerData.skinTone
            }
          })
        });

        // Second call - physicalAppearance2 (body shape)
        await fetch(`${API_BASE_URL}/userPref`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail,
            section: 'physicalAppearance2',
            data: {
              bodyShape: analyzerData.bodyShape
            }
          })
        });
        
        // Mark photo as uploaded and set onboarding version
        localStorage.setItem('photo_uploaded', 'true');
        localStorage.setItem('onboarding_version', 'ai-flow');
        localStorage.setItem('skip_photo_upload', 'true');
        
      } catch (error) {
        console.error('Error saving to backend:', error);
        // Even if backend save fails, we can continue with the flow
        // since we've saved to localStorage
      }
      
      setIsAnalyzing(false);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err);
      setShowAIModal(false);
      setIsAnalyzing(false);
      toast.error('An error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAnalysis = () => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    // Save to local storage that user has accepted the analysis
    const userEmail = user?.profile?.email;
    if (userEmail) {
      localStorage.setItem(
        `onboarding_photo_analysis_accepted:${userEmail}`,
        'true'
      );
    }
    
    // Show loading state before navigation
    setTimeout(() => {
      router.push('/discover-your-style/style-preferences');
    }, 500);
  };

  const handleCustomize = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    try {
      // Update the onboarding version to indicate manual customization
      localStorage.setItem('onboarding_version', 'ai-to-manual');
      
      // Redirect to the first step of manual physical attributes
      router.push('/onboarding/physical-attributes/step-1');
      
    } catch (error) {
      console.error('Error in handleCustomize:', error);
      setIsNavigating(false);
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-screen bg-white px-5 py-8" style={{ maxWidth: "375px", margin: "0 auto" }}>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

      {/* Header */}
      <div className="relative">
        <h1 className="text-[22px] font-bold leading-tight text-[#0B1F63]">
          Please Upload<br />Your Photo
        </h1>
        <div className="absolute top-0 right-0">
        </div>
      </div>

      {/* Upload box */}
      <div className="flex flex-col items-center justify-center flex-1 mt-8 mb-10">
        <div className="w-full border border-[#0B1F63] rounded-2xl" style={{ minHeight: "340px" }}>
          <input
            type="file"
            accept=".jpg,.jpeg"
            onChange={handleFileSelect}
            id="photo-upload"
            className="hidden"
          />
          <label
            htmlFor="photo-upload"
            className="flex flex-col items-center justify-center h-[340px] cursor-pointer text-center px-4"
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Uploaded"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-primary-300">
                Click to upload
                <p className="text-[10px] text-gray-400 mt-2 text-center px-4">
                  Accepted formats: JPG or JPEG. Max size: 10MB. Min resolution: 300×300px
                </p>                
              </div>              
            )}
          </label>
        </div>
          <p>
            <button
              onClick={() => setIsUserPhotoGuidanceOpen(true)}
              className="underline text-[16px] text-blue-400 cursor-pointer"
            >
              Upload Photo Guidance
            </button>
          </p>
      </div>

      {/* Next Button */}
      <button
        onClick={handleUpload}
        disabled={!fileToUpload || loading || !isValidUserImage}
        className={`w-full py-3.5 font-medium rounded-lg transition-opacity duration-200 ${
          fileToUpload && isValidUserImage && !loading
            ? 'bg-[#0B1F63] text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        style={{ borderRadius: "8px" }}
      >
        {loading ? 'Analyzing...' : 'Analyze Photo'}
      </button>

      {isUserPhotoGuidanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-3xl shadow-xl relative overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setIsUserPhotoGuidanceOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <div className="w-6 h-6 text-gray-600" />
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


      {/* AI Analysis Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            {isAnalyzing ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B1F63] mb-4"></div>
                <p className="text-lg font-medium text-[#0B1F63]">Analyzing your photo...</p>
                <p className="text-sm text-gray-500 mt-2 text-center">This may take a few moments</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-[#0B1F63] mb-4">Analysis Results</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Gender</p>
                    <p className="text-lg text-[#0B1F63]">{aiAnalysis?.gender || 'Not detected'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Skin Tone</p>
                    <p className="text-lg text-[#0B1F63]">{aiAnalysis?.skinTone || 'Not detected'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Body Shape</p>
                    <p className="text-lg text-[#0B1F63]">{aiAnalysis?.bodyShape || 'Not detected'}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleAcceptAnalysis}
                    className="w-full py-3 bg-[#0B1F63] text-white rounded-lg font-medium hover:bg-[#0a1b56] transition-colors"
                  >
                    Accept Analysis
                  </button>
                  <button
                    onClick={handleCustomize}
                    className="w-full py-3 border border-[#0B1F63] text-[#0B1F63] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Customize Manually
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