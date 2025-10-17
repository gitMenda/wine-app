import { getAccessToken, setAccessToken } from '@/lib/tokenStorage';

// Reemplaza esto con tu URL de backend real
const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

// Control para evitar múltiples intentos simultáneos de refresh
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Cliente API simplificado
export const apiClient = {
  async get(endpoint: string, retryCount = 0) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = await getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      // Manejar error 401 (token expirado)
      if (response.status === 401 && retryCount === 0) {
        const refreshed = await apiClient.refreshTokenDirectly();
        if (refreshed) {
          return apiClient.get(endpoint, retryCount + 1);
        }
      }

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error(`GET request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  async post(endpoint: string, data: any, retryCount = 0) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = await getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      // Manejar error 401
      if (response.status === 401 && retryCount === 0) {
        const refreshed = await apiClient.refreshTokenDirectly();
        if (refreshed) {
          return apiClient.post(endpoint, data, retryCount + 1);
        }
      }

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error(`POST request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  async put(endpoint: string, data: any, retryCount = 0) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = await getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      // Manejar error 401
      if (response.status === 401 && retryCount === 0) {
        const refreshed = await apiClient.refreshTokenDirectly();
        if (refreshed) {
          return apiClient.put(endpoint, data, retryCount + 1);
        }
      }

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error(`PUT request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  async delete(endpoint: string, data: any, retryCount = 0) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = await getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify(data),
      });

      // Manejar error 401
      if (response.status === 401 && retryCount === 0) {
        const refreshed = await apiClient.refreshTokenDirectly();
        if (refreshed) {
          return apiClient.delete(endpoint, data, retryCount + 1);
        }
      }

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error(`DELETE request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  // Función para refrescar token sin usar hooks
  async refreshTokenDirectly() {
    if (isRefreshing) return refreshPromise;

    isRefreshing = true;

    refreshPromise = (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return false;

        // Llamar al endpoint de refresh directamente
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) return false;

        const data = await response.json();
        if (data?.access_token) {
          await setAccessToken(data.access_token);
          return true;
        }
        return false;
      } catch (e) {
        console.error('Error al refrescar token directamente:', e);
        return false;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },
};

export default API_BASE_URL;