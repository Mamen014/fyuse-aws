// app/onboarding/layout.jsx
'use client'
import React from 'react';
import { usePathname } from 'next/navigation';

export default function OnboardingLayout({ children }) {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Current Page Content */}
      {children}
      
      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-500">
        <p>© FYUSE | All rights reserved</p>
      </footer>
    </div>
  );
}