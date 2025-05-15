import { useEffect } from 'react';
import { useRouter } from 'next/router';

export function useAuth() {
  const isAuthenticated = true; // Replace with actual authentication logic
  const user = { profile: { email: 'user@example.com' } }; // Replace with actual user data

  return { isAuthenticated, user };
}

export function useOnboarding() {
  const router = useRouter();

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');

    if (!hasCompletedOnboarding) {
      router.push('/onboarding/register');
    }
  }, [router]);
}