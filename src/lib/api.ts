import { Platform } from 'react-native';

const API_BASE_URL = 'https://9071914aa8b3.ngrok-free.app/api';  // Agrega /api

// Cliente simple para fetch (opcional, pero recomendado para reutilizar)
export const apiClient = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
  },
  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
  },
};

export default API_BASE_URL;