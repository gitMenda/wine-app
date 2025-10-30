import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken } from '@/lib/tokenStorage';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

// Control para evitar múltiples intentos simultáneos de refresh
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Cliente API simplificado con mejor manejo de errores
export const apiClient = {
  async get(endpoint: string, retryCount = 0) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = await getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      console.log(`Making GET request to: ${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      // Manejar error 401 (token expirado)
      if (response.status === 401 && retryCount === 0) {
        console.log('Token expired, attempting refresh');
        const refreshed = await this.refreshTokenDirectly();
        if (refreshed) {
          console.log('Token refreshed successfully, retrying request');
          return this.get(endpoint, retryCount + 1);
        } else {
          console.log('Token refresh failed');
          throw new Error('Session expired');
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error ${response.status}: ${errorText}`);
        throw new Error(`Error: ${response.status}`);
      }

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
      console.log(`Making POST request to: ${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      // Manejar error 401
      if (response.status === 401 && retryCount === 0) {
        console.log('Token expired, attempting refresh');
        const refreshed = await this.refreshTokenDirectly();
        if (refreshed) {
          console.log('Token refreshed successfully, retrying request');
          return this.post(endpoint, data, retryCount + 1);
        } else {
          console.log('Token refresh failed');
          throw new Error('Session expired');
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error ${response.status}: ${errorText}`);
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      console.log(`POST response from ${endpoint}:`, result);
      return result;
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
        const refreshed = await this.refreshTokenDirectly();
        if (refreshed) {
          return this.put(endpoint, data, retryCount + 1);
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
        const refreshed = await this.refreshTokenDirectly();
        if (refreshed) {
          return this.delete(endpoint, data, retryCount + 1);
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
    if (isRefreshing) {
      console.log('Token refresh already in progress, waiting...');
      return refreshPromise;
    }

    isRefreshing = true;
    console.log('Starting token refresh process');

    refreshPromise = (async () => {
      try {
        const rToken = await getRefreshToken();
        if (!rToken) {
          console.log('No refresh token available for refresh');
          return false;
        }

        // Llamar al endpoint de refresh directamente usando refreshToken en el cuerpo
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: rToken }),
        });

        if (!response.ok) {
          console.error(`Refresh token failed with status: ${response.status}`);
          return false;
        }

        const data = await response.json();
        const newAccess = data?.accessToken || data?.access_token;
        const newRefresh = data?.refreshToken || data?.refresh_token;
        if (newAccess) {
          console.log('Successfully obtained new access token');
          await setAccessToken(newAccess);
          if (newRefresh) {
            await setRefreshToken(newRefresh);
          }
          return true;
        }
        console.log('Refresh response did not include access token');
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