'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "react-oidc-context";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import LoadingModalSpinner from '@/components/LoadingModal';
import Image from 'next/image';

export default function VirtualTryOnResultPage() {
  const { user } = useAuth();
  const userEmail = user?.profile?.email;
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pollIntervalId, setPollIntervalId] = useState(null);
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [product, setProduct] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;
  const taskId = typeof window !== "undefined" ? localStorage.getItem("taskId") : null;
  
  // Track user events
  const handleTrack = async (action, metadata = {}) => {
    if (!userEmail) return;
    
    const payload = {
      userEmail,
      action,
      timestamp: new Date().toISOString(),
      page: "VirtualTryOnResultPage",
      ...metadata,
    };

    try {
      await axios.post(`${API_BASE_URL}/trackevent`, payload);
    } catch (err) {
      console.error("Failed to track event:", err);
    }
  };
  
  // Load product data from localStorage
  useEffect(() => {
    const savedProduct = localStorage.getItem('tryonProduct');
    if (savedProduct) {
      setProduct(JSON.parse(savedProduct));
    }
  }, []);

  const handleHomeClick = () => {
    localStorage.setItem(`onboarding_step:${userEmail}`, "appearance");
    setIsLoading(true);
    router.push('/');
  };

  useEffect(() => {
    return () => {
      if (pollIntervalId) clearInterval(pollIntervalId);
    };
  }, [pollIntervalId]);

  useEffect(() => {
    const pollTryonStatus = () => {
      const intervalId = setInterval(async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/process-tryon-result?taskId=${taskId}`
          );
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
          }
        } catch (err) {
          clearInterval(intervalId);
          setPolling(false);
          setLoading(false);
          console.error("Polling error:", err?.response?.data || err.message);
          const message =
            err?.response?.data?.error ||
            "Network error while checking try-on status.";
          setError(message);
          toast.error(message);
        }
      }, 5000);
      setPollIntervalId(intervalId);
      setPolling(true);
      setLoading(true);
    };
    if (taskId) {
      pollTryonStatus();
    }
  }, [taskId]);

  if (loading) {
    return <LoadingModalSpinner message="Styling..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-[#0B1F63]/5 rounded-b-full blur-xl opacity-50 z-0"></div>
      
      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <h1 className="text-[#0B1F63] text-3xl md:text-4xl font-bold mb-3 text-center">
          Your Perfect Look
        </h1>
        <p className="text-gray-600 text-center mb-10">The style has been added to your wardrobe</p>
        
        {/* Results Container */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-start mb-12">
          {/* Try-On Result */}
          <div className="w-full md:w-1/2">
            <h2 className="text-xl font-semibold text-[#0B1F63] mb-4 text-center">Your Virtual Try-On</h2>
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F63]/20 to-transparent z-10"></div>
              {resultImageUrl ? (
                <img
                  src={resultImageUrl}
                  alt="Virtual Try-On Result"
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
              <div className="absolute bottom-4 right-4 bg-white/90 text-[#0B1F63] px-3 py-1 rounded-full text-sm font-medium z-20">
                Perfect Match
              </div>
            </div>
          </div>

          {/* Original Product */}
          {product && (
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold text-[#0B1F63] mb-4 text-center">Original Product</h2>
              <div className="bg-white rounded-2xl p-6 shadow-2xl h-full">
                <div className="relative w-full h-64 mb-4 rounded-xl overflow-hidden">
                  <img
                    src={product.imageS3Url}
                    alt={product.productName || 'Product image'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">{product.productName}</h3>
                  {product.brand && (
                    <p className="text-gray-600 mb-4">{product.brand}</p>
                  )}
                  {product.productLink && (
                    <a
                      href={product.productLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-sm text-white bg-[#0B1F63] hover:bg-[#0a1a57] px-4 py-2 rounded-full transition-colors"
                      onClick={() => handleTrack("Click Product Link", { 
                        productId: product.productId || 'unknown',
                        productName: product.productName || 'unknown',
                        brand: product.brand || 'unknown',
                        fromPage: 'TryOnResult'
                      })}
                    >
                      View Product
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons Container */}
        <div className="space-y-4 px-4 md:px-12">
          {/* Download Button (matching style/spacing) */}
          {resultImageUrl && (
          <button
            onClick={async () => {
              setIsDownloading(true);
              try {
                const res = await fetch(resultImageUrl, { mode: 'cors' });
                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = 'virtual-tryon-result.jpg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
              } catch (err) {
                console.error('Download failed:', err);
                toast.error('Failed to download image. Try again later.');
              } finally {
                setIsDownloading(false);
              }
            }}
            disabled={isDownloading}
            className={`w-full py-4 px-4 font-medium text-white rounded-full transition-all duration-300 text-center shadow-lg transform ${
              isDownloading ? 'bg-green-500/60 cursor-wait' : 'bg-green-600 hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            {isDownloading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Downloading...
              </span>
            ) : (
              'Download Your Look'
            )}
          </button>
          )}         
          {/* Try Another Style */}
          <button
            onClick={() => router.push('/onboarding/recommended-product')}
            className="w-full py-4 px-4 bg-foreground border border-primary text-background font-medium rounded-full"
          >
            Try Another Product
          </button>
          {/* Continue to Wardrobe */}
          <button
            onClick={handleHomeClick}
            disabled={isLoading}
            className="w-full py-4 px-4 font-medium text[20px] text-primary bg-white border border-primary rounded-full"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              "Back to Home"
            )}
          </button>           
        </div>

        {/* Additional Info */}
        <p className="text-center text-gray-500 text-sm mt-8">
          You can access this style anytime in your personal wardrobe
        </p>
      </div>

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
    </div>
  );
}