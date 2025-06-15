'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export default function DiscoverLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // This component will now be controlled by the parent's isNavigating state
  // and will be used as a fallback for route changes not handled by the parent
  
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#0B1F63]/20 border-t-[#0B1F63] border-b-[#0B1F63]"></div>
        <p className="mt-6 text-[#0B1F63] font-medium text-lg">Loading your experience...</p>
        <p className="mt-2 text-gray-500 text-sm">Just a moment please</p>
      </div>
    </div>
  );
}
