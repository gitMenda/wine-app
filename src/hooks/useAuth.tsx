import { useState, useEffect, createContext, useContext } from 'react';
import { apiClient } from '@/lib/api';
import { getAccessToken, setAccessToken, removeAccessToken, getRefreshToken, setRefreshToken, removeRefreshToken } from '@/lib/tokenStorage';

// Tipo para el usuario autenticado con GUID y estado de onboarding
type AuthUser = {
  id?: string; // GUID del usuario
  email?: string;
  onboardingCompleted?: boolean; // Agregamos esta propiedad
  [key: string]: any;
} | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshToken: async () => false,
});

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

  // Inicializar el estado de autenticación al montar el componente
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const decoded = decodeJwt(token);
          // Asegurarse de guardar el GUID del usuario (sub es el subject en JWT)
          setUser({
            id: decoded?.sub || decoded?.id,
            email: decoded?.email,
            ...decoded
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error inicializando autenticación:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Función para actualizar el token - se llama solo cuando es necesario
  const refreshToken = async (): Promise<boolean> => {
    try {
      const rToken = await getRefreshToken();
      if (!rToken) return false;

      // Llamar al endpoint de refresh con el refreshToken guardado
      const res = await apiClient.post('/auth/refresh', { refreshToken: rToken });

      // Aceptar ambos formatos (camelCase y snake_case)
      const newAccess = res?.accessToken || res?.access_token;
      const newRefresh = res?.refreshToken || res?.refresh_token;

      if (newAccess) {
        await setAccessToken(newAccess);
        if (newRefresh) {
          await setRefreshToken(newRefresh);
        }
        const decoded = decodeJwt(newAccess);
        setUser({
          id: decoded?.sub || decoded?.id,
          email: decoded?.email,
          ...decoded
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error al refrescar token:", e);
      return false;
    }
  };

  // Login
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Intentando login con:", email);
      const res = await apiClient.post('/auth/login', { email, password });
      console.log("Respuesta del login:", res);
      
      // CORRECCIÓN AQUÍ: Aceptar ambos formatos (camelCase y snake_case)
      const access_token = res?.accessToken || res?.access_token;
      const refresh_token = res?.refreshToken || res?.refresh_token;

      if (!access_token) {
        console.error("Respuesta del servidor sin token:", res);
        return { error: { message: 'Respuesta inválida del servidor: falta token de acceso' } };
      }

      await setAccessToken(access_token);
      if (refresh_token) {
        await setRefreshToken(refresh_token);
      }
      const decoded = decodeJwt(access_token);
      
      // Guardar el usuario con su GUID y estado de onboarding
      setUser({
        id: decoded?.sub || decoded?.id,
        email: decoded?.email,
        onboardingCompleted: res?.onboardingCompleted || false, // Guardar el estado de onboarding
        ...decoded
      });
      
      return { error: null };
    } catch (e: any) {
      console.error("Error completo del login:", e);
      return { error: { message: e?.message || 'Error al iniciar sesión' } };
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
    await removeAccessToken();
    await removeRefreshToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      refreshToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};