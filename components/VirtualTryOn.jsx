import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "react-oidc-context";
import PricingPlans from "@/components/PricingPlanCard";
import AnalysisModal from "@/components/AnalysisModal";
import PrivacyPolicyModal from "@/components/PrivacyPolicyModal";
import LoginModal from "@/components/LoginModal";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const VirtualTryOn = () => {
  const { user, signinRedirect } = useAuth();
  const userEmail = user?.profile?.email;

  const [userImage, setUserImage] = useState(null);
  const [apparelImage, setApparelImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState(null);
  const [apparelImagePreview, setApparelImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [polling, setPolling] = useState(false);
  const [pollIntervalId, setPollIntervalId] = useState(null);
  const [tryOnCount, setTryOnCount] = useState(0);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [showPricingPlans, setShowPricingPlans] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchingAnalysis, setMatchingAnalysis] = useState(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userImageError, setUserImageError] = useState(null);
  const [isValidUserImage, setIsValidUserImage] = useState(false);
  const [isValidApparelImage, setIsValidApparelImage] = useState(false);
  const [apparelImageError, setApparelImageError] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  const allowedTypes = ["image/jpeg", "image/jpg", "image/webp"];
  const maxSizeMB = 10;
  const minResolution = 300;

  const validateImage = async (file) => {
    const isAllowedType = allowedTypes.includes(file.type);
    const isAllowedSize = file.size <= maxSizeMB * 1024 * 1024;

    const imageBitmap = await createImageBitmap(file);
    const hasMinResolution = imageBitmap.width >= minResolution && imageBitmap.height >= minResolution;

    return isAllowedType && isAllowedSize && hasMinResolution;
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
    const storedAgreement = localStorage.getItem(`privacyAgreement:${userEmail}`);
    if (storedAgreement === "true") {
      setAgreeToPrivacy(true);
    }
  }, [userEmail]);

  useEffect(() => {
    return () => {
      if (pollIntervalId) clearInterval(pollIntervalId);
    };
  }, [pollIntervalId]);

  const handleUserImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
    }
    const isValid = await validateImage(file);
    if (!isValid) {
      setUserImageError("Invalid image. Only JPG, JPEG, WEBP under 10MB with min 300x300px are allowed.");
      return;
    }
    setIsValidUserImage(isValid);
    setUserImageError(null);
    setUserImage(file);
    setUserImagePreview(URL.createObjectURL(file));
  };

  const handleApparelImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setApparelImage(file);
      setApparelImagePreview(URL.createObjectURL(file));
    }
        const isValid = await validateImage(file);
    if (!isValid) {
      setApparelImageError("Invalid image. Only JPG, JPEG, WEBP under 10MB with min 300x300px are allowed.");
      return;
    }
    setIsValidApparelImage(isValid);
    setApparelImageError(null);
    setApparelImage(file);
    setApparelImagePreview(URL.createObjectURL(file));
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
    const response = await axios.post(endpoint, {
      fileName,
      userEmail,
      fileDataBase64: base64,
      contentType,
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data?.imageUrl;
  };

  const pollTryonStatus = (taskId) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/process-tryon-result?taskId=${taskId}`);
        const data = response.data;

      if (data.status === "succeed" && data.generatedImageUrl) {
        clearInterval(intervalId);
        setResultImageUrl(data.generatedImageUrl);
        window.generatedImageUrl = data.generatedImageUrl;
        setPolling(false);
        setLoading(false);
        toast.success("Added to your wardrobe!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else if (data.status === "failed") {
        clearInterval(intervalId);
        setPolling(false);
        setLoading(false);
        setError(data.errorMessage || "Try-on failed. Please try again.");
        setIsModalOpen(true);
      }
      } catch (err) {
        clearInterval(intervalId);
        setPolling(false);
        setLoading(false);
        console.error("Polling error:", err?.response?.data || err.message);
        const message = err?.response?.data?.error || "Network error while checking try-on status.";
        setError(message);
        toast.error(message);
        setIsModalOpen(true);
      }
    }, 5000);
    setPollIntervalId(intervalId);
    setPolling(true);
  };

  const handleSubmit = async () => {
    if (!userImage || !apparelImage) {
      toast.error("Please upload both user and apparel images.");
      return;
    }
    if (!agreeToPrivacy) {
      toast.error("You must agree to the Privacy Policy.");
        return ;
    }
    if (!user) return setIsLoginModalOpen(true);
    if (tryOnCount >= 3) return setShowPricingPlans(true);
    if (!userImage || !apparelImage || !isValidUserImage || !isValidApparelImage) {
      toast.error("Please upload the accepted image.");
      return;
    }
  
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
      setError(null);
      setResultImageUrl(null);
      setMatchingAnalysis(null);
  
      // Upload images
      const userImageUrl = await uploadImageToS3(userImage, `${API_BASE_URL}/upload-user-image`);
      const apparelImageUrl = await uploadImageToS3(apparelImage, `${API_BASE_URL}/upload-apparel-image`);
  
      // Submit try-on task
      const response = await axios.post(`${API_BASE_URL}/tryon-image`, {
        person_image_url: userImageUrl,
        garment_image_url: apparelImageUrl,
        userEmail,
      });
  
      if (response?.data?.taskId) {
        const taskId = response.data.taskId; // Capture the task ID
        setTaskId(taskId);
        pollTryonStatus(taskId);
  
        // Trigger matching analysis with the same task ID
        const analysisResponse = await axios.post(`${API_BASE_URL}/MatchingAnalyzer`, {
          userImage: userImageUrl,
          apparelImageUrl,
          userEmail,
          analysisType: "direct",
          taskId, // Pass the task ID to the matching analysis
        });
  
        setMatchingAnalysis(analysisResponse.data);
        setIsModalOpen(true);
  
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setShowPricingPlans(true);
      } else {
        setError(err.response?.data?.error || "An error occurred during virtual try-on.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1a1a2f] text-white px-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-100">Digital Fitting Room</h1>
        <p className="text-gray-300 mt-2">Experience the perfect fit.</p>
      </header>

      {showPricingPlans && (
        <PricingPlans
          isOpen={showPricingPlans}
          onClose={() => setShowPricingPlans(false)}
          onSelectPlan={(planName) => alert(`You selected: ${planName}`)}
        />
      )}

      {!showPricingPlans && (
        <div className="bg-[#1a1a2f] w-full max-w-4xl space-y-6">
          <h2 className="text-2xl font-medium text-gray-100 text-center mb-4">Upload Your Photos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#848CB1]-700 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-gray-100 mb-4">Your Photo</h3>
              <input type="file" accept=".jpg,.jpeg,.webp" onChange={handleUserImageChange} className="hidden" id="userPhoto" />
              <label htmlFor="userPhoto" className="cursor-pointer">
                {userImagePreview ? (
                  <img src={userImagePreview} alt="User Preview" className="mx-auto max-h-48 object-contain rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-300">Click to upload</div>
                )}
              </label>
              <p className="text-xs text-gray-400 mt-2">
              Accepted formats: JPG, JPEG, WEBP. Max size: 10MB. Min resolution: 300×300px.
              </p>
              {userImageError && (
                <p className="text-red-400 text-sm mt-2">{userImageError}</p>
              )}
            </div>
            <div className="border border-[#848CB1]-700 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-gray-100 mb-4">Clothing Item</h3>
              <input type="file" accept=".jpg,.jpeg,.webp" onChange={handleApparelImageChange} className="hidden" id="apparelPhoto" />
              <label htmlFor="apparelPhoto" className="cursor-pointer">
                {apparelImagePreview ? (
                  <img src={apparelImagePreview} alt="Apparel Preview" className="mx-auto max-h-48 object-contain rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-300">Click to upload</div>
                )}
              </label>
              <p className="text-xs text-gray-400 mt-2">
              Accepted formats: JPG, JPEG, WEBP. Max size: 10MB. Min resolution: 300×300px.
              </p>
              {apparelImageError && (
                <p className="text-red-400 text-sm mt-2">{apparelImageError}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center mt-2 space-x-2">
            <input
              type="checkbox"
              id="privacyConsent"
              checked={agreeToPrivacy}
              onChange={(e) => {
                const checked = e.target.checked;
                setAgreeToPrivacy(checked);
                if (userEmail) {
                  localStorage.setItem(`privacyAgreement:${userEmail}`, checked.toString());
                }
              }}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="privacyConsent" className="text-sm text-gray-300">
              I agree to the{" "}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsPrivacyModalOpen(true);
                }}
                className="underline text-blue-400 cursor-pointer"
              >
                Privacy Policy Agreement
              </button>
            </label>
          </div>
          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              onClick={() => {
                if (!user) return setIsLoginModalOpen(true);
                handleSubmit();
              }}
              disabled
              className={`px-6 py-3 rounded-lg font-medium text-white ${
                agreeToPrivacy ? "bg-gray-500 cursor-not-allowed" : "bg-gray-500 cursor-not-allowed"
              }`}
            >
              Try-On Temporary Unavailable
            </button>
          </div>
          {polling && !resultImageUrl && (
            <p className="text-yellow-500 text-center mt-4">Waiting for result... polling server.</p>
          )}
          {loading && <p className="text-gray-400 text-center animate-pulse">Processing...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
        </div>
      )}

      <AnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        analysisData={matchingAnalysis}
        loading={loading}
        tryOnImage={resultImageUrl}
        userEmail={user?.email}
        errorMessage={error}
      />

      {isPrivacyModalOpen && (
        <PrivacyPolicyModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
        />
      )}

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSignIn={signinRedirect}
          onSignUp={() => {
            const clientId = process.env.NEXT_PUBLIC_CLIENTID;
            const domain = process.env.NEXT_PUBLIC_DOMAIN;
            const redirectUri = typeof window !== 'undefined' ? window.location.origin + '/' : 'http://localhost:3000/';
            const signUpUrl = `https://${domain}/signup?client_id=${clientId}&response_type=code&scope=openid+profile+email&redirect_uri=${encodeURIComponent(redirectUri)}`;
            sessionStorage.setItem('cameFromSignup', 'true');
            window.location.href = signUpUrl;
          }}
        />
      )} 
      {/* ✅ ToastContainer must be inside the returned JSX */}
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
    </div>
  );
};

export default VirtualTryOn;