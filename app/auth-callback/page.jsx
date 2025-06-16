'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingModalSpinner from '@/components/LoadingModal';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const redirectPath = localStorage.getItem('postLoginRedirect') || '/style-discovery';
    router.replace(redirectPath);
  }, [router]);

  return <LoadingModalSpinner />;
}
