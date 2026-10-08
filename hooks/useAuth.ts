import { useAuthStore } from '../store/authStore';

/**
 * Read-only accessor for the shared auth store.
 *
 * Initialization is intentionally NOT performed here. It is done exactly once
 * by <AuthProvider> at the app root, otherwise every screen/modal using this
 * hook would re-run getSession() and register a duplicate auth listener.
 */
export const useAuth = () => {
  const { session, user, loading, signUp, signIn, signOut, forgotPassword } =
    useAuthStore();

  return {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    forgotPassword,
  };
};
