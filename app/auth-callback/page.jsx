'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingModalSpinner from '@/components/ui/LoadingState';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const from = localStorage.getItem('from');
    if (from === 'landing-page') {
      router.replace('personalized-styling/physical-appearances');
      localStorage.removeItem('from');
    } else {
      router.replace('dashboard');
    }
  }, [router]);

  return <LoadingModalSpinner />;
}
