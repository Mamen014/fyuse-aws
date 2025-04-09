'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const VirtualTryOnResultPage = () => {
  const searchParams = useSearchParams();
  const matchingAnalysis = searchParams.get('matchingAnalysis');
  const [formattedAnalysis, setFormattedAnalysis] = useState('');

  useEffect(() => {
    console.log("Raw Matching Analysis:", matchingAnalysis); // Debugging line
    if (matchingAnalysis) {
      try {
        const decodedText = decodeURIComponent(matchingAnalysis); // Decode the query parameter
        console.log("Decoded Matching Analysis:", decodedText); // Debugging line
        setFormattedAnalysis(formatMatchingAnalysis(decodedText));
      } catch (err) {
        console.error("Error decoding matching analysis:", err);
      }
    }
  }, [matchingAnalysis]);

  const formatMatchingAnalysis = (rawString) => {
    const lines = [];
    const pattern = /\*\*(.*?)\*\*[:：]?\s*([^*]*)/g;
    let match;

    while ((match = pattern.exec(rawString)) !== null) {
      const rawKey = match[1]?.trim() || '';
      const rawValue = match[2]?.trim() || '';

      const key = rawKey.replace(/[:：]+$/, '');
      const value = rawValue.replace(/^[:：]+/, '');

      if (key && value) {
        if (key === 'Matching Description') {
          lines.push(`\n${key}: ${value}`);
        } else {
          lines.push(`${key}: ${value}`);
        }
      }
    }

    return lines.join('\n');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans flex items-center justify-center px-4">
      <main className="w-full max-w-4xl bg-white/5 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10 whitespace-pre-line">
        <h1 className="text-3xl font-bold text-blue-300 mb-6 text-center">Fit Analysis</h1>
        <p className="text-lg text-gray-200">
          {formattedAnalysis || 'No analysis available. Please upload your photo and clothing item to generate a fit analysis.'}
        </p>
      </main>
    </div>
  );
};

export default VirtualTryOnResultPage;