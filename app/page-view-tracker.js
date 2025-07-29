// app/page-view-tracker.js

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import { sendGAEvent } from '@next/third-parties/google';

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
    } else {
      window.gtag('set', { user_id: null });
    }

    sendGAEvent({
      event: 'page_view',
      page_path: pathname,
    });

  }, [pathname, isAuthenticated, user]);

  return null;
}
