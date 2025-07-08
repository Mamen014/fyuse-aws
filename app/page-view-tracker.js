'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function PageViewTracker() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;

    const excludedPrefixes = ['/auth-callback'];
    const shouldExclude = excludedPrefixes.some((prefix) =>
      pathname.startsWith(prefix)
    );
    if (shouldExclude) return;

    // Extract user_id from Cognito ID token (usually in `sub` claim)
    const userId = isAuthenticated ? user?.profile?.sub : undefined;

    // Set global user_id (only once per session)
    if (userId) {
      window.gtag('set', { user_id: userId });
    }

    // Send GA page_view
    window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID, {
      page_path: pathname,
      ...(userId && { user_id: userId }), // optional: inline per-view
    });

  }, [pathname, isAuthenticated, user]);

  return null;
}
