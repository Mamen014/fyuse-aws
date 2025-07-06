'use client';

import React from 'react';
import Image from 'next/image';

export default function LoadingModalSpinner({
  message = "Loading...",
  subMessage = "Please wait"
}) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem',
    }}>
      
      {/* FYUSE logo */}
      <Image
        src="/logo-tb.png"
        alt="FYUSE Logo"
        width={120}
        height={0} 
        priority
        style={{ height: 'auto', width: '120px' }}
        className="mb-6 mx-auto"
      />

      {/* Spinner */}
      <div style={{
        width: '60px',
        height: '60px',
        border: '6px solid #ccc',
        borderTop: '6px solid #0B1F63',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />

      {/* Text Messages */}
      <p style={{
        marginTop: '16px',
        color: '#0B1F63',
        fontSize: '16px',
        fontWeight: '500',
        textAlign: 'center'
      }}>
        {message}
      </p>

      {subMessage && (
        <p style={{
          marginTop: '8px',
          color: '#6B7280',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {subMessage}
        </p>
      )}

      {/* Spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
