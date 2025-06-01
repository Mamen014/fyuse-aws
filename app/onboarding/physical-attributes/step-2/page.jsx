'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PhysicalAttributesStep2() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has already uploaded a photo in AI flow
    const hasUploadedPhoto = localStorage.getItem('photo_uploaded') === 'true';
    if (hasUploadedPhoto) {
      // Skip to next step if photo was already uploaded
      router.push('/onboarding/physical-attributes/step-3');
    }
  }, [router]);

  const [photoPreview, setPhotoPreview] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isValidUserImage, setIsValidUserImage] = useState(false);
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

  const handleSubmit = async () => {
    if (!fileToUpload || !userEmail) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result.split(',')[1];
      const payload = {
        fileName: fileToUpload.name,
        fileDataBase64: base64Data,
        contentType: fileToUpload.type,
        userEmail: userEmail,
      };

      try {
        setUploading(true);
        const res = await fetch(`${API_BASE_URL}/upload-user-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        const raw_user_image = JSON.stringify(data.imageUrl)
        const user_image = raw_user_image.substring(1, raw_user_image.length - 1)
        if (user_image) {
          localStorage.setItem('user_image', user_image);
          router.push('/onboarding/physical-attributes/step-3');
        } else {
          toast.error('Upload failed. Please try again.');
        }
      } catch (err) {
        console.error('Upload error:', err);
        toast.error('An error occurred during upload.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(fileToUpload);
  };

  return (
    <div className="flex flex-col justify-between min-h-screen bg-white px-5 py-8" style={{ maxWidth: "375px", margin: "0 auto" }}>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

      {/* Header */}
      <div className="relative">
        <h1 className="text-[22px] font-bold leading-tight text-[#0B1F63]">
          Physical<br />attribute
        </h1>
        <div className="absolute top-0 right-0">
          <span className="inline-block px-3 py-0.5 text-xs text-white bg-[#0B1F63] rounded-full">
            Step 3/7
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
        onClick={handleSubmit}
        disabled={!fileToUpload || uploading || !isValidUserImage}
        className={`w-full py-3.5 font-medium rounded-lg transition-opacity duration-200 ${
          fileToUpload && isValidUserImage && !uploading
            ? 'bg-[#0B1F63] text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        style={{ borderRadius: "8px" }}
      >
        {uploading ? 'Uploading...' : 'Next'}
      </button>
    </div>
  );
}
