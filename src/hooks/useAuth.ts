import { useSession, signIn, signOut } from '../lib/auth-client';

export function useAuth() {
  const { data, isPending } = useSession();

  const handleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/panel`,
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
      user_metadata: {
        avatar_url: data.user.image,
        full_name: data.user.name,
      }
    } : null,
    session: data?.session,
    loading: isPending,
    login: handleLogin,
    logout: handleLogout,
  };
}
