import { Platform } from 'react-native';

// Safely read the access_token from cookie on web
function getCookieToken(): string | null {
  if (Platform.OS !== 'web') return null;
  if (typeof document === 'undefined' || !document.cookie) return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('access_token='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

// Cliente simple para fetch (opcional, pero recomendado para reutilizar)
export const apiClient = {
  async get(endpoint: string) {
    const headers: Record<string, string> = {
      'ngrok-skip-browser-warning': 'true',
    };
    const token = getCookieToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers,
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
  },
  async post(endpoint: string, data: any) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    const token = getCookieToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
  },
  async delete(endpoint: string, data: any) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    const token = getCookieToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
  },
};

export default API_BASE_URL;