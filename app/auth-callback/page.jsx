'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingModalSpinner from '@/components/ui/LoadingState';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    router.replace('style-discovery');
  }, [router]);

  return <LoadingModalSpinner />;
}
