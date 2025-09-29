import { apiClient } from './api';

/**
 * Toggle favorite for a wine.
 * It will POST when not favorite and DELETE when it's already favorite.
 */
export async function toggleFavoriteApi(userId: string, wineId: number, isFavorite: boolean) {
  const endpoint = `/users/${userId}/favorites/${wineId}`;
  if (isFavorite) {
    await apiClient.delete(endpoint, null);
  } else {
    await apiClient.post(endpoint, null);
  }
}

export function favoriteIconName(isFavorite: boolean, isLoading: boolean) {
  // Ionicons names used in the app
  if (isLoading) return 'heart';
  return isFavorite ? 'heart' : 'heart-outline';
}

export function favoriteIconColor(isFavorite: boolean, isLoading: boolean) {
  if (isLoading) return '#d60f0f';
  return isFavorite ? '#d60f0f' : '#6b7280';
}
