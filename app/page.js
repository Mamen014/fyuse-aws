'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingModalSpinner from '@/components/LoadingModal';

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true); // Prevent flicker

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasRegistered = localStorage.getItem('hasRegistered') === 'true';

    if (hasRegistered) {
      router.replace('/dashboard');
    } else {
      router.replace('/landing-page');
    }

    // Optional: if you want to delay unmount
    setTimeout(() => setChecking(false), 500);
  }, [router]);

  if (checking) {
    return <LoadingModalSpinner message="Redirecting..." />;
  }

  return null; // Show nothing after redirect
}
