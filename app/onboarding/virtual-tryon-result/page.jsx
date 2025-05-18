'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "react-oidc-context";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import LoadingModalSpinner from '@/components/LoadingModal';

export default function VirtualTryOnResultPage() {
  const { user } = useAuth();
  const userEmail = user?.profile?.email;  
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pollIntervalId, setPollIntervalId] = useState(null);
  const [resultImageUrl, setResultImageUrl] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;
  const taskId = typeof window !== "undefined" ? localStorage.getItem("taskId") : null;

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
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid #0B1F63',
      borderRadius: '20px',
      padding: '20px',
      width: '100%',
      maxWidth: '300px',
      margin: 'auto'
    }}>
      <h2 style={{
        color: '#0B1F63',
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        Virtual try-on result
      </h2>
      <img
        src={resultImageUrl}
        alt="Virtual Try-On Result"
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '200px',
          objectFit: 'cover',
          marginBottom: '20px'
        }}
      />
      <button
        onClick={() => router.push('/onboarding/register')}
        style={{
          backgroundColor: 'transparent',
          color: '#0B1F63',
          padding: '10px',
          border: '1px solid #0B1F63',
          borderRadius: '5px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
          <path d="M14 2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        Re-style
      </button>
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
