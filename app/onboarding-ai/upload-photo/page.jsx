'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AIPhotoUpload() {
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isValidUserImage, setIsValidUserImage] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
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
      setUploading(true);
      
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
      
      // Store physical attributes data in the same format as regular onboarding
      // First call - PhysicalAttributes1 (gender and skin tone)
      await fetch(`${API_BASE_URL}/userPref`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          section: 'PhysicalAttributes1',
          data: {
            gender: analyzerData.gender,
            skinTone: analyzerData.skinTone
          }
        })
      });

      // Second call - PhysicalAttributes3 (body shape)
      await fetch(`${API_BASE_URL}/userPref`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          section: 'PhysicalAttributes3',
          data: {
            bodyShape: analyzerData.bodyShape
          }
        })
      });

      // Set AI analysis state for the modal
      const aiAnalysisResults = {
        gender: analyzerData.gender,
        skinTone: analyzerData.skinTone,
        bodyShape: analyzerData.bodyShape
      };
      setAiAnalysis(aiAnalysisResults);
      setShowAIModal(true);
      
      localStorage.setItem('photo_uploaded', 'true');
      
      localStorage.setItem('onboarding_version', 'ai-to-manual');
      
      localStorage.setItem('skip_photo_upload', 'true');

    } catch (err) {
      console.error('Upload error:', err);
      toast.error('An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleAcceptAnalysis = () => {
    // Store AI analysis results in standard onboarding localStorage format
    localStorage.setItem('onboarding_physical_attributes_1', 
      JSON.stringify({ 
        gender: aiAnalysis.gender,
        skinTone: aiAnalysis.skinTone 
      })
    );
    localStorage.setItem('onboarding_physical_attributes_3', 
      JSON.stringify({ 
        bodyShape: aiAnalysis.bodyShape 
      })
    );
    // Redirect to AI style preferences
    router.push('/onboarding-ai/style-preferences');
  };

  const handleCustomize = () => {
    // Store AI analysis in standard onboarding localStorage format
    localStorage.setItem('onboarding_physical_attributes_1', 
      JSON.stringify({ 
        gender: aiAnalysis.gender,
        skinTone: aiAnalysis.skinTone 
      })
    );
    localStorage.setItem('onboarding_physical_attributes_3', 
      JSON.stringify({ 
        bodyShape: aiAnalysis.bodyShape 
      })
    );
    // Store that the user has already uploaded a photo
    localStorage.setItem('photo_uploaded', 'true');
    // Track that user switched to manual flow
    localStorage.setItem('onboarding_version', 'ai-to-manual');
    // Add flag to skip step 2
    localStorage.setItem('skip_photo_upload', 'true');
    // Redirect to manual physical attributes flow
    router.push('/onboarding/physical-attributes/step-1');
  };

  return (
    <div className="flex flex-col justify-between min-h-screen bg-white px-5 py-8" style={{ maxWidth: "375px", margin: "0 auto" }}>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

      {/* Header */}
      <div className="relative">
        <h1 className="text-[22px] font-bold leading-tight text-[#0B1F63]">
          Let's analyze<br />your style
        </h1>
        <div className="absolute top-0 right-0">
          <span className="inline-block px-3 py-0.5 text-xs text-white bg-[#0B1F63] rounded-full">
            Step 2/4
          </span>
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
      </div>

      {/* Next Button */}
      <button
        onClick={handleUpload}
        disabled={!fileToUpload || uploading || !isValidUserImage}
        className={`w-full py-3.5 font-medium rounded-lg transition-opacity duration-200 ${
          fileToUpload && isValidUserImage && !uploading
            ? 'bg-[#0B1F63] text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        style={{ borderRadius: "8px" }}
      >
        {uploading ? 'Analyzing...' : 'Analyze Photo'}
      </button>

      {/* AI Analysis Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-[#0B1F63] mb-4">AI Analysis Results</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Gender</p>
                <p className="text-lg text-[#0B1F63]">{aiAnalysis.gender}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Skin Tone</p>
                <p className="text-lg text-[#0B1F63]">{aiAnalysis.skinTone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Body Shape</p>
                <p className="text-lg text-[#0B1F63]">{aiAnalysis.bodyShape}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAcceptAnalysis}
                className="w-full py-3 bg-[#0B1F63] text-white rounded-lg font-medium"
              >
                Accept Analysis
              </button>
              <button
                onClick={handleCustomize}
                className="w-full py-3 border border-[#0B1F63] text-[#0B1F63] rounded-lg font-medium"
              >
                Customize Manually
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 