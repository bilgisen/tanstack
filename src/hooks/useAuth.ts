import { useSession, signIn, signOut } from '../lib/auth-client';
import { useEffect, useState } from 'react';

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
        .then(res => res.json())
        .then((data: any) => {
          if (data.tier) {
            setCredits(data);
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
