import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '@/components/Button';
import { apiClient } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { toggleFavoriteApi, favoriteIconColor, favoriteIconName } from '@/lib/favorites';

interface Wine {
  wineId: number;
  wineName: string;
  type: string;
  elaborate: string;
  grapes: string;
  harmonize: string;
  abv: number;
  body: string;
  acidity: string;
  country: string;
  region: string;
  winery: string;
  vintages: string;
  id?: string;
  isFavorite?: boolean;
}

export default function RecommendationsPage() {
  const params = useLocalSearchParams<{ user_id?: string; limit?: string }>();
  const [results, setResults] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingFavorites, setTogglingFavorites] = useState<Set<number>>(new Set());

  const effectiveUserId = useMemo(() => {
    // Fallback to the same hardcoded user as search page if not provided
    return (params.user_id as string) || '5ebaba97-9e1d-41ad-ba40-c0fd5a07c339';
  }, [params.user_id]);


  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(`/users/recommendations?user_id=${encodeURIComponent(effectiveUserId)}&limit=10`);
      // Expected shape: { user_id: string, recommendations: WineLike[] }
      const recs = (data?.recommendations ?? []) as any[];
      const normalized: Wine[] = recs.map((w: any) => ({
        wineId: w.wineId ?? w.id ?? w.wine_id,
        wineName: w.wineName ?? w.name ?? w.wine_name,
        type: w.type,
        elaborate: w.elaborate,
        grapes: w.grapes,
        harmonize: w.harmonize,
        abv: w.abv,
        body: w.body,
        acidity: w.acidity,
        country: w.country,
        region: w.region,
        winery: w.winery,
        vintages: w.vintages,
        isFavorite: w.isFavorite ?? false,
      }));
      setResults(normalized);
    } catch (e: any) {
      console.error('Error fetching recommendations:', e);
      setError('No se pudieron cargar las recomendaciones.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId]);

  const onToggleFavorite = async (wine: Wine) => {
    if (togglingFavorites.has(wine.wineId)) return;
    setTogglingFavorites(prev => new Set(prev).add(wine.wineId));
    const prevFav = !!wine.isFavorite;
    setResults(prev => prev.map(w => w.wineId === wine.wineId ? { ...w, isFavorite: !prevFav } : w));
    try {
      await toggleFavoriteApi(effectiveUserId, wine.wineId, prevFav);
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar el favorito. Intenta nuevamente.');
      setResults(prev => prev.map(w => w.wineId === wine.wineId ? { ...w, isFavorite: prevFav } : w));
    } finally {
      setTogglingFavorites(prev => {
        const ns = new Set(prev);
        ns.delete(wine.wineId);
        return ns;
      });
    }
  };

  const renderItem = ({ item }: { item: Wine }) => (
    <View className="bg-gray-800 p-4 m-2 rounded-lg shadow-md border border-gray-600">
      <TouchableOpacity onPress={() => router.push(`/wine/${item.wineId}`)}>
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-xl font-bold text-white flex-1 mr-2" numberOfLines={2}>{item.wineName}</Text>
          <TouchableOpacity className="p-1" onPress={() => onToggleFavorite(item)}>
            <Ionicons
              name={favoriteIconName(!!item.isFavorite, togglingFavorites.has(item.wineId))}
              size={22}
              color={favoriteIconColor(!!item.isFavorite, togglingFavorites.has(item.wineId))}
            />
          </TouchableOpacity>
        </View>
        <Text className="text-gray-300 mb-1">Tipo: {item.type}</Text>
        <Text className="text-gray-300 mb-1">País: {item.country}</Text>
        <Text className="text-gray-300 mb-1">Región: {item.region}</Text>
        <Text className="text-gray-300">Bodega: {item.winery}</Text>
      </TouchableOpacity>
      <View className="mt-3" />
      <Button
        title="¿Probaste este vino?"
        variant="secondary"
        onPress={() => router.push(`/wine/${item.wineId}`)}
      />
    </View>
  );

    return (
        <View className="flex-1 p-4 dark:bg-gray-900">
            <Text className="text-2xl font-bold mb-2 text-white">Nuestras recomendaciones para vos</Text>
            {loading && <Text className="mt-4 text-white">Cargando...</Text>}
            {error && (
                <View className="items-center">
                    <Text className="text-white mb-4">{error}</Text>
                    <View className="space-y-2 w-full items-center">
                        <Button title="Reintentar" onPress={fetchRecommendations} variant="primary" />
                        <Button title="Volver" variant="secondary" onPress={() => router.back()} />
                    </View>
                </View>
            )}
            <FlatList
                data={results}
                keyExtractor={(item) => item.wineId.toString()}
                renderItem={renderItem}
                className="mt-4"
            />
        </View>
    );
}
