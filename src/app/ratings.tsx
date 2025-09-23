import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { apiClient } from '@/lib/api';

interface Wine {
  wineId: number;
  wineName: string;
  type?: string;
  country?: string;
  region?: string;
  winery?: string;
}

interface FavoriteWineApi {
  // Be flexible with backend shapes; map to Wine in code
  wineId?: number; // camelCase
  wine_id?: number; // snake_case fallback
  wineName?: string;
  wine_name?: string;
  type?: string;
  country?: string;
  region?: string;
  winery?: string;
}

interface RatingApiItem {
  id: string | number;
  wineId?: number;
  wine_id?: number;
  wineName?: string;
  wine_name?: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
  created_at?: string;
}

interface RatingItem {
  id: string | number;
  wineId: number;
  wineName: string;
  rating: number | null;
  comment?: string | null;
  createdAt?: string;
}

export default function MisVinosPage() {
  const [favorites, setFavorites] = useState<Wine[]>([]);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch tuple-based response: [["favorite_wines",[...]],["tasted_wines",[...]]]
        const tupleResponse = await apiClient.get('/users/5ebaba97-9e1d-41ad-ba40-c0fd5a07c339/wines/status');
        const map = new Map<string, any[]>(tupleResponse as [string, any[]][]);

        const favArr = map.get('favorite_wines') ?? [];
        const tastedArr = map.get('tasted_wines') ?? [];

        const favs: Wine[] = (favArr as any[])
          .map((w) => ({
            wineId: w.id ?? w.wineId ?? w.wine_id,
            wineName: w.name ?? w.wineName ?? w.wine_name,
            type: w.type,
            country: w.country,
            region: w.region,
            winery: w.winery,
          }))
          .filter((w) => typeof w.wineId === 'number' && !!w.wineName);

        const rats: RatingItem[] = (tastedArr as any[])
          .map((r) => ({
            id: r.id,
            wineId: r.id ?? r.wineId ?? r.wine_id,
            wineName: r.name ?? r.wineName ?? r.wine_name ?? 'Vino',
            rating: r.rating ?? null,
            comment: r.comment ?? null,
            createdAt: r.createdAt ?? r.created_at,
          }))
          .filter((r) => typeof r.wineId === 'number');

        if (!mounted) return;
        setFavorites(favs);
        setRatings(rats);
      } catch (e: any) {
        console.error('Error fetching Mis Vinos:', e);
        if (!mounted) return;
        setError('No se pudieron cargar tus vinos.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  const header = (
    <View className="mb-4">
      <Text className="text-3xl font-bold text-white">Mis vinos</Text>
    </View>
  );

  const renderFavorite = ({ item }: { item: Wine }) => (
    <TouchableOpacity
      className="bg-gray-800 p-4 mr-3 rounded-lg w-56 border border-gray-700"
      onPress={() => router.push(`/wine/${item.wineId}`)}
    >
      <Text className="text-white font-semibold" numberOfLines={1}>{item.wineName}</Text>
      {!!item.winery && <Text className="text-gray-300" numberOfLines={1}>{item.winery}</Text>}
      <View className="flex-row mt-1">
        {!!item.type && <Text className="text-gray-400 mr-2">{item.type}</Text>}
        {!!item.region && <Text className="text-gray-400" numberOfLines={1}>{item.region}</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderRating = ({ item }: { item: RatingItem }) => (
    <TouchableOpacity
      className="bg-gray-800 p-4 mb-3 rounded-lg border border-gray-700"
      onPress={() => router.push(`/wine/${item.wineId}`)}
    >
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-white font-semibold" numberOfLines={1}>{item.wineName}</Text>
        {item.rating == null ? (
          <Text className="text-gray-400">Sin calificación</Text>
        ) : (
          <Text className="text-yellow-400">{item.rating.toFixed(1)}★</Text>
        )}
      </View>
      {item.comment ? (
        <Text className="text-gray-300" numberOfLines={2}>{item.comment}</Text>
      ) : (
        <Text className="text-gray-500">Sin comentario</Text>
      )}
      {item.createdAt && (
        <Text className="text-gray-500 mt-1">{new Date(item.createdAt).toLocaleDateString()}</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center dark:bg-gray-900">
        <ActivityIndicator color="#fff" />
        <Text className="text-white mt-3">Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4 dark:bg-gray-900">
        <Text className="text-white mb-4">{error}</Text>
        <Button title="Reintentar" onPress={() => {
          setLoading(true);
          setError(null);
          // trigger effect by resetting state via new tick
          setTimeout(() => {
            // simple re-run by resetting loading and using effect deps [] not ideal; call the API again here
            (async () => {
              try {
                const tupleResponse = await apiClient.get('/users/5ebaba97-9e1d-41ad-ba40-c0fd5a07c339/wines/status');
                const map = new Map<string, any[]>(tupleResponse as [string, any[]][]);
                const favArr = map.get('favorite_wines') ?? [];
                const tastedArr = map.get('tasted_wines') ?? [];
                const favs: Wine[] = (favArr as any[]).map((w) => ({
                  wineId: w.id ?? w.wineId ?? w.wine_id,
                  wineName: w.name ?? w.wineName ?? w.wine_name,
                  type: w.type,
                  country: w.country,
                  region: w.region,
                  winery: w.winery,
                })).filter((w) => typeof w.wineId === 'number' && !!w.wineName);
                const rats: RatingItem[] = (tastedArr as any[]).map((r) => ({
                  id: r.id,
                  wineId: r.id ?? r.wineId ?? r.wine_id,
                  wineName: r.name ?? r.wineName ?? r.wine_name ?? 'Vino',
                  rating: r.rating ?? null,
                  comment: r.comment ?? null,
                  createdAt: r.createdAt ?? r.created_at,
                })).filter((r) => typeof r.wineId === 'number');
                setFavorites(favs);
                setRatings(rats);
              } catch (e) {
                setError('No se pudieron cargar tus vinos.');
              } finally {
                setLoading(false);
              }
            })();
          }, 0);
        }} />
        <Button title="Volver" variant="secondary" className="mt-2" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4 pt-8 dark:bg-gray-900">
      {header}

      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-2xl font-semibold text-white">Favoritos</Text>
          {favorites.length > 0 && (
            <Text className="text-gray-400">{favorites.length}</Text>
          )}
        </View>
        {favorites.length === 0 ? (
          <View className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <Text className="text-gray-300">Aún no tienes vinos favoritos.</Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.wineId.toString()}
            renderItem={renderFavorite}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>

      <View className="mb-2">
        <Text className="text-2xl font-semibold text-white mb-2">Vinos probados</Text>
        {ratings.length === 0 ? (
          <View className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <Text className="text-gray-300">Aún no has probado vinos.</Text>
          </View>
        ) : (
          <FlatList
            data={ratings}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderRating}
          />
        )}
      </View>
      <View className="h-6" />
    </ScrollView>
  );
}
