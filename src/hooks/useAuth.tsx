import { useState, useEffect, createContext, useContext } from 'react';
import { Platform } from 'react-native';
import { apiClient } from '@/lib/api';

// Lightweight user type based on JWT payload (if available)
type AuthUser = any | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

function readTokenWeb(): string | null {
  if (Platform.OS !== 'web') return null;
  try {
    return window.sessionStorage.getItem('access_token');
  } catch {
    return null;
  }
}

function decodeJwt(token: string | null): any | null {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    if (!payload) return {};
    const json = typeof atob !== 'undefined' ? atob(payload.replace(/-/g, '+').replace(/_/g, '/')) : '';
    return json ? JSON.parse(decodeURIComponent(escape(json))) : {};
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from stored token (web)
    const token = readTokenWeb();
    const decoded = decodeJwt(token);
    if (token) {
      setUser(decoded || {});
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const access_token = res?.access_token;

      if (!access_token) {
        return { error: { message: 'Invalid response from server: access_token missing' } };
      }

      // Store token in sessionStorage (web) and update user state
      if (Platform.OS === 'web') {
        try {
          window.sessionStorage.setItem('access_token', access_token);
        } catch (err) {
          console.warn('Failed to access sessionStorage:', err);
        }
      }

      setUser(decodeJwt(access_token) || {});
      return { error: null };
    } catch (e: any) {
      return { error: { message: e?.message || 'Login failed' } };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Call backend register endpoint
      await apiClient.post('/auth/register', { email, password });
      // On success, automatically login to retrieve and store access token
      const { error } = await signIn(email, password);
      return { error };
    } catch (e: any) {
      return { error: { message: e?.message || 'Registration failed' } };
    }
  };

  const signOut = async () => {
    // Clear token from sessionStorage on web and reset user state
    if (Platform.OS === 'web') {
      try {
        window.sessionStorage.removeItem('access_token');
      } catch {}
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};