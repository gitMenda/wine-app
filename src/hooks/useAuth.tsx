import { useState, useEffect, createContext, useContext } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Create user record if signing up
        if (event === 'SIGNED_UP' && session?.user) {
          await createUserRecord(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createUserRecord = async (user: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          onboarding_completed: false,
        });

      if (error) {
        console.error('Error creating user record:', error);
      }
    } catch (error) {
      console.error('Error creating user record:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const access_token = res?.access_token;

      if (!access_token) {
        return { error: { message: 'Invalid response from server: access_token missing' } };
      }

      // Store token in sessionStorage (web)
      if (Platform.OS === 'web') {
        try {
          window.sessionStorage.setItem('access_token', access_token);
        } catch (err) {
          // Fallback: do nothing if sessionStorage is not available
          console.warn('Failed to access sessionStorage:', err);
        }
      }

      return { error: null };
    } catch (e: any) {
      return { error: { message: e?.message || 'Login failed' } };
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    // Clear token from sessionStorage on web
    if (Platform.OS === 'web') {
      try {
        window.sessionStorage.removeItem('access_token');
      } catch {}
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      session,
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