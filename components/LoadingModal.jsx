'use client';

import React from 'react';

export default function LoadingModalSpinner({ message = 'Loading, please wait...' }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '6px solid #ccc',
        borderTop: '6px solid #0B1F63',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{
        marginTop: '16px',
        color: '#0B1F63',
        fontSize: '16px',
        fontWeight: '500'
      }}>{message}</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
