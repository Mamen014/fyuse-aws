'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingModalSpinner from '@/components/ui/LoadingState';

export default function LandingPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const hasRegistered = localStorage.getItem('hasRegistered') === 'true';
    const target = hasRegistered ? '/dashboard' : '/landing-page';

    router.replace(target);
  }, [hydrated, router]);

  return <LoadingModalSpinner />;
}
