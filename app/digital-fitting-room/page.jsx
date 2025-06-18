"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "react-oidc-context";
import PricingPlans from "@/components/PricingPlanCard";
import PrivacyPolicyModal from "@/components/PrivacyPolicyModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ToastContainer } from "react-toastify";

export default function VirtualTryOn() {
  const { user, signinRedirect } = useAuth();
  const router = useRouter();
  const userEmail = user?.profile?.email;
  const [userImage, setUserImage] = useState(null);
  const [apparelImage, setApparelImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState(null);
  const [apparelImagePreview, setApparelImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [tryOnCount, setTryOnCount] = useState(0);
  const [showPricingPlans, setShowPricingPlans] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [userImageError, setUserImageError] = useState(null);
  const [isValidUserImage, setIsValidUserImage] = useState(false);
  const [isValidApparelImage, setIsValidApparelImage] = useState(false);
  const [apparelImageError, setApparelImageError] = useState(null);
  const [isUserPhotoGuidanceOpen, setIsUserPhotoGuidanceOpen] = useState(false);
  const [isApparelPhotoGuidanceOpen, setIsApparelPhotoGuidanceOpen] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  const allowedTypes = ["image/jpeg", "image/jpg"];
  const maxSizeMB = 10;
  const minResolution = 300;

  const validateImage = async (file) => {
    const isAllowedType = allowedTypes.includes(file.type);
    const isAllowedSize = file.size <= maxSizeMB * 1024 * 1024;
    const imageBitmap = await createImageBitmap(file);
    const hasMinResolution =
      imageBitmap.width >= minResolution && imageBitmap.height >= minResolution;
    return isAllowedType && isAllowedSize && hasMinResolution;
  };

  // Track Event Function
  const handleTrack = async (action, metadata = {}) => {
    console.log(`Tracked event: ${action}`, metadata);
    const payload = {
      userEmail,
      action,
      timestamp: new Date().toISOString(),
      page: "VirtualTryOn",
      ...metadata,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/trackevent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("Tracking result:", result);
    } catch (err) {
      console.error("Failed to track user event:", err);
    }
  };

  useEffect(() => {
    if (!userEmail) return;
    const storedCount = sessionStorage.getItem("tryOnCount");
    if (storedCount) {
      setTryOnCount(parseInt(storedCount));
    } else {
      axios
        .get(`${API_BASE_URL}/getrack?userEmail=${userEmail}`)
        .then((res) => {
          const count = res.data.tryOnCount || 0;
          setTryOnCount(count);
          sessionStorage.setItem("tryOnCount", count);
        })
        .catch((err) => console.error("Error fetching try-on count:", err));
    }

    const storedAgreement = localStorage.getItem(
      `privacyAgreement:${userEmail}`
    );
    if (storedAgreement === "true") {
      setAgreeToPrivacy(true);
    }
  }, [userEmail]);

  // Upload Person Image Handler + Track
  const handleUserImageChange = async (e) => {
    if (!user) {
      toast.error("Please log in to upload photos.");
      return signinRedirect();
    }

    const file = e.target.files?.[0];
    if (!file) {
      setUserImage(null);
      setUserImagePreview(null);
      setUserImageError(null);
      setIsValidUserImage(false);
      document.getElementById("userPhoto").value = "";
      return;
    }

    try {
      const isValid = await validateImage(file);
      if (!isValid) {
        setUserImageError(
          "Invalid image. Only JPG or JPEG under 10MB with min 300x300px are allowed."
        );
        setIsValidUserImage(false);
        return;
      }

      setUserImage(file);
      setUserImagePreview(URL.createObjectURL(file));
      setUserImageError(null);
      setIsValidUserImage(true);

      handleTrack("upload_person_image", { fileName: file.name });
    } catch (err) {
      console.error("Error validating image:", err.message);
      setUserImageError("An error occurred while validating the image.");
      setIsValidUserImage(false);
    }
  };

  // Upload Garment Image Handler + Track
  const handleApparelImageChange = async (e) => {
    if (!user) {
      toast.error("Please log in to upload photos.");
      return signinRedirect();
    }

    const file = e.target.files?.[0];
    if (!file) {
      setApparelImage(null);
      setApparelImagePreview(null);
      setApparelImageError(null);
      setIsValidApparelImage(false);
      document.getElementById("apparelPhoto").value = "";
      return;
    }

    try {
      const isValid = await validateImage(file);
      if (!isValid) {
        setApparelImageError(
          "Invalid image. Only JPG or JPEG under 10MB with min 300x300px are allowed."
        );
        setIsValidApparelImage(false);
        return;
      }

      setApparelImage(file);
      setApparelImagePreview(URL.createObjectURL(file));
      setApparelImageError(null);
      setIsValidApparelImage(true);

      handleTrack("upload_garment_image", { fileName: file.name });
    } catch (err) {
      console.error("Error validating image:", err.message);
      setApparelImageError("An error occurred while validating the image.");
      setIsValidApparelImage(false);
    }
  };

  // Try-On Button Click + Track
  const handleSubmit = async () => {
    if (!userImage || !apparelImage) {
      toast.error("Please upload both user and apparel images.");
      return;
    }

    if (tryOnCount >= 10) return setShowPricingPlans(true);

    if (
      !userImage ||
      !apparelImage ||
      !isValidUserImage ||
      !isValidApparelImage
    ) {
      toast.error("Please upload the accepted image.");
      return;
    }

    handleTrack("click_try_on_button");

    try {
      setLoading(true);
      toast.info("Processing started. This may take up to 3 minutes.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      const userImageUrl = await uploadImageToS3(
        userImage,
        `${API_BASE_URL}/upload-user-image`
      );
      const apparelImageUrl = await uploadImageToS3(
        apparelImage,
        `${API_BASE_URL}/upload-apparel-image`
      );

      const response = await axios.post(`${API_BASE_URL}/tryon-image`, {
        person_image_url: userImageUrl,
        garment_image_url: apparelImageUrl,
        userEmail,
      });

      localStorage.setItem('manual_apparel', apparelImage)

      if (response?.data?.taskId) {
        const taskId = response.data.taskId;
        setTaskId(taskId);
        localStorage.setItem('taskId', taskId);
        setSubmitStatus('success');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setShowPricingPlans(true);
      } else {
        setError(
          err.response?.data?.error ||
            "An error occurred during virtual try-on."
        );
        setSubmitStatus('error');
        setIsSubmitting(false);
      }
    } finally {
      await refreshTryOnCount();
      setIsSubmitting(false);
      return 'success';
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const uploadImageToS3 = async (imageFile, endpoint) => {
    const base64 = await toBase64(imageFile);
    const contentType = imageFile.type;
    const fileName = imageFile.name;
    const response = await axios.post(
      endpoint,
      {
        fileName,
        userEmail,
        fileDataBase64: base64,
        contentType,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data?.imageUrl;
  };

  const refreshTryOnCount = () => {
    axios
      .get(`${API_BASE_URL}/getrack?userEmail=${userEmail}`)
      .then((res) => {
        const updatedCount = res.data.tryOnCount || 0;
        setTryOnCount(updatedCount);
        sessionStorage.setItem("tryOnCount", updatedCount);
      })
      .catch((err) => {
        console.error("Error updating try-on count:", err);
      });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="bg-background w-full max-w-4xl mx-auto px-6 pt-20 md:pt-24 pb-12 space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-100">
            Digital Fitting Room
          </h1>
          <p className="text-primary-300 mt-2">Experience the perfect fit.</p>
        </header>

        {showPricingPlans && (
          <PricingPlans
            isOpen={showPricingPlans}
            onClose={() => setShowPricingPlans(false)}
            onSelectPlan={(planName) => alert(`You selected: ${planName}`)}
          />
        )}

        {!showPricingPlans && (
          <div className="bg-background w-full max-w-4xl space-y-6">
            <h2 className="text-2xl font-medium text-primary-100 text-center mb-4">
              Upload Your Photos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              {/* User Photo Upload */}
              <div className="border border-cta rounded-lg p-6 text-center">
                <h3 className="text-lg font-medium text-primary-100 mb-4">
                  Your Photo
                </h3>
                <input
                  type="file"
                  accept=".jpg,.jpeg"
                  onChange={handleUserImageChange}
                  className="hidden"
                  id="userPhoto"
                />
                <label htmlFor="userPhoto" className="cursor-pointer">
                  {userImagePreview ? (
                    <img
                      src={userImagePreview}
                      alt="User Preview"
                      className="mx-auto max-h-48 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-primary-300">
                      Click to upload
                    </div>
                  )}
                </label>
                <p className="text-xs text-primary-400 mt-2">
                  Accepted formats: JPG or JPEG. Max size: 10MB. Min resolution:
                  300×300px.
                </p>
                {userImageError && (
                  <p className="text-red-400 text-sm mt-2">{userImageError}</p>
                )}
                <p>
                  <button
                    onClick={() => setIsUserPhotoGuidanceOpen(true)}
                    className="underline text-blue-400 cursor-pointer"
                  >
                    Upload User Photo Guidance
                  </button>
                </p>
              </div>

              {/* Apparel Photo Upload */}
              <div className="border border-cta rounded-lg p-6 text-center">
                <h3 className="text-lg font-medium text-primary-100 mb-4">
                  Clothing Item
                </h3>
                <input
                  type="file"
                  accept=".jpg,.jpeg"
                  onChange={handleApparelImageChange}
                  className="hidden"
                  id="apparelPhoto"
                />
                <label htmlFor="apparelPhoto" className="cursor-pointer">
                  {apparelImagePreview ? (
                    <img
                      src={apparelImagePreview}
                      alt="Apparel Preview"
                      className="mx-auto max-h-48 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-primary-300">
                      Click to upload
                    </div>
                  )}
                </label>
                <p className="text-xs text-primary-400 mt-2">
                  Accepted formats: JPG or JPEG. Max size: 10MB. Min resolution:
                  300×300px.
                </p>
                {apparelImageError && (
                  <p className="text-red-400 text-sm mt-2">{apparelImageError}</p>
                )}
                <p>
                  <button
                    onClick={() => setIsApparelPhotoGuidanceOpen(true)}
                    className="underline text-blue-400 cursor-pointer"
                  >
                    Upload Apparel Photo Guidance
                  </button>
                </p>
              </div>
            </div>

            {/* Privacy Policy Checkbox + Read Link */}
            <div className="flex items-center justify-center mt-2 space-x-2">
              <input
                type="checkbox"
                id="privacyConsent"
                checked={agreeToPrivacy}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setAgreeToPrivacy(checked);
                  if (userEmail) {
                    localStorage.setItem(
                      `privacyAgreement:${userEmail}`,
                      checked.toString()
                    );
                  }
                }}
                className="w-4 h-4 accent-blue-500"
              />
              <label htmlFor="privacyConsent" className="text-sm text-primary-300">
                I agree to the{" "}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsPrivacyModalOpen(true);
                    handleTrack("click_read_privacy_policy");
                  }}
                  className="underline text-blue-400 cursor-pointer"
                >
                  Privacy Policy Agreement
                </button>
              </label>
            </div>

            {/* Try-On Button */}
            <div className="flex justify-center items-center mt-4 space-x-2">
            <button
                onClick={async () => {
                const result = await handleSubmit();
                if (result === 'limit' || result === 'error') return;
                router.push('/Direct-Fitting');
                }}
                disabled={
                loading ||
                isSubmitting ||
                !agreeToPrivacy ||
                !isValidUserImage ||
                !isValidApparelImage
                }
                className={`py-2 px-4 rounded-lg text-white transition-colors duration-200 ${
                agreeToPrivacy && isValidUserImage && isValidApparelImage && !loading && !isSubmitting
                    ? 'bg-cta hover:bg-blue-600'
                    : 'bg-gray-500 cursor-not-allowed'
                }`}
            > Fitting
            </button>
            </div>

            {/* Navigation Buttons */}
            <div className="bottom-0 left-0 right-0 bg-background py-8 px-2 flex justify-between items-center">
              <Link href="/dashboard" passHref>
                <button
                  className="text-foreground text-xl hover:text-cta transition-colors"
                  aria-label="Back"
                >
                  ← Dashboard
                </button>
              </Link>
              <Link href="/tryOnHistory" passHref>
                <button
                  className="text-foreground text-xl hover:text-cta transition-colors"
                  aria-label="View Profile Page"
                >
                  Fitting Results →
                </button>
              </Link>
            </div>
          </div>
        )}

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

        {isApparelPhotoGuidanceOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-[90%] max-w-3xl shadow-xl relative overflow-y-auto">
                
                {/* Close Button */}
                <button
                onClick={() => setIsApparelPhotoGuidanceOpen(false)}
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
                    src="/examples/apparel/good.png"
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
                    src="/examples/apparel/bad.png"
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

        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </main>
      <Footer />
    </div>
  );
}