import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';

export interface AuthResult {
  success: boolean;
  error?: string;
  /** True when sign-up succeeded but Supabase still requires email confirmation. */
  needsEmailConfirmation?: boolean;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  initializeAuth: () => Promise<void>;
}

/**
 * User-facing messages. Raw Supabase errors are never shown to users so we can
 * avoid leaking technical details and keep the wording consistent.
 */
const MESSAGES = {
  invalidCredentials: 'Invalid email or password.',
  emailNotConfirmed: 'Please verify your email before signing in.',
  alreadyRegistered: 'This email is already registered.',
  weakPassword: 'Please choose a stronger password (at least 6 characters).',
  rateLimited: 'Too many attempts. Please wait a moment and try again.',
  network: 'Unable to connect. Please check your internet connection and try again.',
  config: 'Authentication is not configured correctly. Please contact support.',
  generic: 'Something went wrong. Please try again.',
} as const;

/**
 * Translate a Supabase AuthError (or network failure) into a safe, friendly
 * message. The original error is logged by the caller for developer debugging.
 */
const mapAuthError = (error: unknown): string => {
  if (!error) return MESSAGES.generic;

  const { code = '', message = '' } =
    (error as { code?: string; message?: string }) || {};
  const normalizedCode = code.toLowerCase();
  const normalizedMessage = message.toLowerCase();

  // Configuration / invalid credentials against the API gateway.
  if (
    normalizedMessage.includes('invalid api key') ||
    normalizedMessage.includes('no api key') ||
    normalizedCode === 'invalid_api_key'
  ) {
    return MESSAGES.config;
  }

  if (
    normalizedCode === 'invalid_credentials' ||
    normalizedMessage.includes('invalid login credentials')
  ) {
    return MESSAGES.invalidCredentials;
  }

  if (
    normalizedCode === 'email_not_confirmed' ||
    normalizedMessage.includes('email not confirmed')
  ) {
    return MESSAGES.emailNotConfirmed;
  }

  if (
    normalizedCode === 'user_already_exists' ||
    normalizedMessage.includes('already registered') ||
    normalizedMessage.includes('already been registered')
  ) {
    return MESSAGES.alreadyRegistered;
  }

  if (
    normalizedCode === 'weak_password' ||
    normalizedMessage.includes('weak password') ||
    normalizedMessage.includes('password should be')
  ) {
    return MESSAGES.weakPassword;
  }

  if (
    normalizedCode === 'over_email_send_rate_limit' ||
    normalizedCode === 'over_request_rate_limit' ||
    normalizedMessage.includes('rate limit') ||
    normalizedMessage.includes('for security purposes') ||
    normalizedMessage.includes('you can only request this after')
  ) {
    return MESSAGES.rateLimited;
  }

  if (
    normalizedMessage.includes('network') ||
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('network request failed') ||
    normalizedMessage.includes('timeout')
  ) {
    return MESSAGES.network;
  }

  return MESSAGES.generic;
};

const logAuthError = (context: string, error: unknown) => {
  // Never log passwords, tokens or keys - only the safe error metadata.
  const { code, message, status } =
    (error as { code?: string; message?: string; status?: number }) || {};
  console.warn(
    `[auth] ${context}`,
    [code && `code=${code}`, status && `status=${status}`, message]
      .filter(Boolean)
      .join(' '),
  );
};

// Module-level guard so auth is initialized exactly once for the app lifetime.
let isInitialized = false;

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,

  initializeAuth: async () => {
    if (isInitialized) return;
    isInitialized = true;

    // Subscribe first so we never miss an auth event emitted during startup.
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session: session ?? null,
        user: session?.user ?? null,
        loading: false,
      });
    });

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) logAuthError('getSession failed', error);

      set({
        session: session ?? null,
        user: session?.user ?? null,
        loading: false,
      });
    } catch (error) {
      logAuthError('getSession threw', error);
      set({ loading: false });
    }
  },

  signUp: async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        logAuthError('signUp failed', error);
        return { success: false, error: mapAuthError(error) };
      }

      // When email confirmations are enabled, Supabase deliberately does not
      // return an error for an existing address. Instead it returns a user with
      // no identities. Detect that here so we can tell the user the truth.
      if (
        data.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        return { success: false, error: MESSAGES.alreadyRegistered };
      }

      // A session means email confirmation is disabled and the user is signed in.
      if (data.session) {
        set({ session: data.session, user: data.session.user, loading: false });
        return { success: true };
      }

      return { success: true, needsEmailConfirmation: true };
    } catch (error) {
      logAuthError('signUp threw', error);
      return { success: false, error: mapAuthError(error) };
    }
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        logAuthError('signIn failed', error);
        return { success: false, error: mapAuthError(error) };
      }

      if (!data.session) {
        return { success: false, error: MESSAGES.generic };
      }

      // Update state immediately so navigation does not depend on the
      // asynchronous onAuthStateChange event firing first.
      set({ session: data.session, user: data.session.user, loading: false });
      return { success: true };
    } catch (error) {
      logAuthError('signIn threw', error);
      return { success: false, error: mapAuthError(error) };
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) logAuthError('signOut failed', error);
    } catch (error) {
      logAuthError('signOut threw', error);
    } finally {
      set({ session: null, user: null });
    }
  },

  forgotPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo:
          typeof window !== 'undefined' && window.location?.origin
            ? `${window.location.origin}/auth/login`
            : undefined,
      });

      if (error) {
        logAuthError('forgotPassword failed', error);
        return { success: false, error: mapAuthError(error) };
      }

      return { success: true };
    } catch (error) {
      logAuthError('forgotPassword threw', error);
      return { success: false, error: mapAuthError(error) };
    }
  },
}));
