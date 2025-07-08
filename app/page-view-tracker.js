'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;

    // Define paths to exclude from GA tracking
    const excludedPrefixes = [
      '/auth-callback',
    ];

    const shouldExclude = excludedPrefixes.some((excluded) =>
      pathname.startsWith(excluded)
    );

    if (shouldExclude) return;

    // Send GA page_view immediately
    window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID, {
      page_path: pathname,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[GA] page_view tracked:', pathname);
    }
  }, [pathname]);

  return null;
}
