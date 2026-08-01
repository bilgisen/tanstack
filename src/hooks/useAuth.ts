import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from '../lib/auth-client';

export interface UserProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  tier: string;
  credits: UserCredits | null;
  user_metadata: {
    avatar_url?: string | null;
    full_name?: string;
  };
}

interface UserCredits {
  tier: string;
  tierDisplayName: string;
  monthlyJT: number;
  usedJT: number;
  extraJT: number;
  availableJT: number;
  usagePercent: number;
}

export function useAuth() {
  const { data, isPending } = useSession();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(false);

  // Fetch user credits/tier when session is available
  useEffect(() => {
    if (data?.user) {
      setCreditsLoading(true);
      fetch('/api/user/credits')
        .then(res => res.json() as Promise<Record<string, unknown>>)
        .then(payload => {
          if (payload && typeof payload === 'object' && 'tier' in payload) {
            setCredits(payload as unknown as UserCredits);
          }
        })
        .catch(err => {
          console.error('Failed to fetch user credits:', err);
        })
        .finally(() => {
          setCreditsLoading(false);
        });
    } else {
      setCredits(null);
    }
  }, [data?.user]);

  const handleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/profil`,
      });
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.reload();
          }
        }
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return {
    user: data?.user ? {
      ...data.user,
      tier: credits?.tier || 'free',
      credits: credits,
      user_metadata: {
        avatar_url: data.user.image,
        full_name: data.user.name,
      }
    } : null,
    session: data?.session,
    loading: isPending || creditsLoading,
    login: handleLogin,
    logout: handleLogout,
  };
}
