'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function DiscoverLoading() {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [previousPath, setPreviousPath] = useState(pathname);

  useEffect(() => {
    // Set loading to true when pathname changes
    if (pathname !== previousPath) {
      setIsLoading(true);
      setPreviousPath(pathname);
    }
  }, [pathname, previousPath]);

  useEffect(() => {
    // Hide loading when route change is complete
    const handleComplete = () => {
      setIsLoading(false);
    };

    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      handleComplete();
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#0B1F63]/20 border-t-[#0B1F63] border-b-[#0B1F63]"></div>
        <p className="mt-6 text-[#0B1F63] font-medium text-lg">Discovering your style...</p>
        <p className="mt-2 text-gray-500 text-sm">Just a moment please</p>
      </div>
    </div>
  );
}
