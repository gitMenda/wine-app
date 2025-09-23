import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { apiClient } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';

interface Wine {
    wineId: number;
    wineName: string;
    type?: string;
    country?: string;
    region?: string;
    winery?: string;
    imageUrl?: string;
    isFavorite?: boolean;
}

interface FavoriteWineApi {
    wineId?: number;
    wine_id?: number;
    wineName?: string;
    wine_name?: string;
    type?: string;
    country?: string;
    region?: string;
    winery?: string;
    imageUrl?: string;
    image_url?: string;
    isFavorite?: boolean;
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
    imageUrl?: string;
    image_url?: string;
    isFavorite?: boolean;
}

interface RatingItem {
    id: string | number;
    wineId: number;
    wineName: string;
    rating: number | null;
    country?: string | null;
    region?: string | null;
    winery?: string | null;
    createdAt?: string;
    imageUrl?: string | null;
    isFavorite?: boolean;
}

const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
};

const getBackgroundColor = (name: string): string => {
    const colors = [
        'bg-purple-500', 'bg-blue-500', 'bg-green-500',
        'bg-yellow-500', 'bg-red-500', 'bg-indigo-500',
        'bg-pink-500', 'bg-teal-500', 'bg-orange-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
};

export default function MisVinosPage() {
    const [favorites, setFavorites] = useState<Wine[]>([]);
    const [ratings, setRatings] = useState<RatingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [togglingFavorites, setTogglingFavorites] = useState<Set<number>>(new Set());

    const userId = '204e52fc-d31e-459e-841a-b5e5f5400247';

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const tupleResponse = await apiClient.get(`/users/${userId}/wines/status`);
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
                        imageUrl: w.imageUrl ?? w.image_url,
                        isFavorite: true,
                    }))
                    .filter((w) => typeof w.wineId === 'number' && !!w.wineName);

                const rats: RatingItem[] = (tastedArr as any[])
                    .map((r) => ({
                        id: r.id,
                        wineId: r.id ?? r.wineId ?? r.wine_id,
                        wineName: r.name ?? r.wineName ?? r.wine_name ?? 'Vino',
                        rating: r.rating ?? null,
                        country: r.country ?? null,
                        region: r.region ?? null,
                        winery: r.winery ?? null,
                        createdAt: r.createdAt ?? r.created_at,
                        imageUrl: r.imageUrl ?? r.image_url ?? null,
                        isFavorite: r.isFavorite ?? favs.some(fav => fav.wineId === (r.id ?? r.wineId ?? r.wine_id)),
                    }))
                    .filter((r) => typeof r.wineId === 'number');

                if (!mounted) return;
                setFavorites(favs);
                setRatings(rats);
            } catch (e: any) {
                console.error('Error fetching wines:', e);
                if (!mounted) return;
                setError('No se pudieron cargar tus vinos.');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchData();
        return () => { mounted = false; };
    }, []);

    const toggleFavorite = async (wineId: number, currentFavoriteStatus: boolean, wineName: string) => {
        if (togglingFavorites.has(wineId)) return;

        setTogglingFavorites(prev => new Set(prev).add(wineId));

        try {
            const endpoint = `/users/${userId}/favorites/${wineId}`;

            if (currentFavoriteStatus) {
                await apiClient.delete(endpoint, null);
            } else {
                await apiClient.post(endpoint, null);
            }

            if (currentFavoriteStatus) {
                setFavorites(prev => prev.filter(wine => wine.wineId !== wineId));
                setRatings(prev =>
                    prev.map(item =>
                        item.wineId === wineId
                            ? { ...item, isFavorite: false }
                            : item
                    )
                );
            } else {
                const wineToAdd = ratings.find(r => r.wineId === wineId);
                if (wineToAdd) {
                    setFavorites(prev => [...prev, { ...wineToAdd, isFavorite: true }]);
                } else {
                    setFavorites(prev => [...prev, {
                        wineId,
                        wineName,
                        isFavorite: true
                    }]);
                }
                setRatings(prev =>
                    prev.map(item =>
                        item.wineId === wineId
                            ? { ...item, isFavorite: true }
                            : item
                    )
                );
            }

        } catch (error: any) {
            console.error('Error toggling favorite:', error);
            Alert.alert('Error', 'No se pudo actualizar el favorito. Intenta nuevamente.');

            if (currentFavoriteStatus) {
                const wineToAdd = ratings.find(r => r.wineId === wineId);
                if (wineToAdd) {
                    setFavorites(prev => [...prev, { ...wineToAdd, isFavorite: true }]);
                }
                setRatings(prev =>
                    prev.map(item =>
                        item.wineId === wineId
                            ? { ...item, isFavorite: true }
                            : item
                    )
                );
            } else {
                setFavorites(prev => prev.filter(wine => wine.wineId !== wineId));
                setRatings(prev =>
                    prev.map(item =>
                        item.wineId === wineId
                            ? { ...item, isFavorite: false }
                            : item
                    )
                );
            }
        } finally {
            setTogglingFavorites(prev => {
                const newSet = new Set(prev);
                newSet.delete(wineId);
                return newSet;
            });
        }
    };

    const header = (
        <View className="mb-4">
            <Text className="text-3xl font-bold text-white">Mis vinos</Text>
        </View>
    );

    const renderFavorite = ({ item }: { item: Wine }) => (
        <View className="mr-3 w-64"> {/* Increased width for better spacing */}
            <TouchableOpacity
                className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex-row items-start"
                onPress={() => router.push(`/wine/${item.wineId}`)}
            >
                {/* Image or Initials */}
                {item.imageUrl ? (
                    <Image
                        source={{ uri: item.imageUrl }}
                        className="w-12 h-12 rounded-md mr-3"
                        resizeMode="cover"
                    />
                ) : (
                    <View className={`w-12 h-12 rounded-md mr-3 ${getBackgroundColor(item.wineName)} justify-center items-center`}>
                        <Text className="text-white font-bold text-lg">{getInitials(item.wineName)}</Text>
                    </View>
                )}

                <View className="flex-1 flex-row justify-between items-start">
                    <View className="flex-1 mr-2">
                        <Text className="text-white font-semibold mb-1" numberOfLines={2}>{item.wineName}</Text>
                        {!!item.winery && <Text className="text-gray-300 text-sm" numberOfLines={1}>{item.winery}</Text>}
                        <View className="flex-row mt-1">
                            {!!item.country && item.region && <Text className="text-gray-400 text-sm" numberOfLines={1}>{item.region + ', ' + item.country}</Text>}
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.wineId, true, item.wineName);
                        }}
                        disabled={togglingFavorites.has(item.wineId)}
                        className="p-1 ml-2"
                    >
                        <Ionicons
                            name={togglingFavorites.has(item.wineId) ? "heart" : "heart"}
                            size={24}
                            color={togglingFavorites.has(item.wineId) ? "#6b7280" : "#d60f0f"}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderRating = ({ item }: { item: RatingItem }) => (
        <TouchableOpacity
            className="bg-gray-800 p-4 mb-3 rounded-lg border border-gray-700 flex-row items-start"
            onPress={() => router.push(`/wine/${item.wineId}`)}
        >
            {/* Image or Initials */}
            {item.imageUrl ? (
                <Image
                    source={{ uri: item.imageUrl }}
                    className="w-12 h-12 rounded-md mr-3"
                    resizeMode="cover"
                />
            ) : (
                <View className={`w-12 h-12 rounded-md mr-3 ${getBackgroundColor(item.wineName)} justify-center items-center`}>
                    <Text className="text-white font-bold text-lg">{getInitials(item.wineName)}</Text>
                </View>
            )}

            <View className="flex-1 flex-row justify-between items-start">
                <View className="flex-1 mr-2">
                    <View className="flex-row justify-between items-start mb-1">
                        <Text className="text-white font-semibold flex-1 mr-2" numberOfLines={2}>{item.wineName}</Text>
                        <View className="flex-row items-center">
                            {item.rating == null ? (
                                <Text className="text-gray-400 text-sm">Sin calificación</Text>
                            ) : (
                                <Text className="text-yellow-400 font-semibold">{item.rating.toFixed(1)}★</Text>
                            )}
                        </View>
                    </View>
                    {!!item.winery && <Text className="text-gray-300 text-sm" numberOfLines={1}>{item.winery}</Text>}
                    {(item.country && item.region) ? (
                        <Text className="text-gray-300 text-sm" numberOfLines={2}>{item.region + ', ' + item.country}</Text>
                    ) : (
                        <Text className="text-gray-500 text-sm">Ubicación desconocida</Text>
                    )}
                </View>

                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.wineId, item.isFavorite || false, item.wineName);
                    }}
                    disabled={togglingFavorites.has(item.wineId)}
                    className="p-1 ml-2"
                >
                    <Ionicons
                        name={togglingFavorites.has(item.wineId) ? "heart" : (item.isFavorite ? "heart" : "heart-outline")}
                        size={24}
                        color={togglingFavorites.has(item.wineId) ? "#d60f0f" : (item.isFavorite ? "#d60f0f" : "#6b7280")}
                    />
                </TouchableOpacity>
            </View>
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
                    setTimeout(() => {
                        (async () => {
                            try {
                                const tupleResponse = await apiClient.get(`/users/${userId}/wines/status`);
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
                                    imageUrl: w.imageUrl ?? w.image_url,
                                    isFavorite: true,
                                })).filter((w) => typeof w.wineId === 'number' && !!w.wineName);
                                const rats: RatingItem[] = (tastedArr as any[]).map((r) => ({
                                    id: r.id,
                                    wineId: r.id ?? r.wineId ?? r.wine_id,
                                    wineName: r.name ?? r.wineName ?? r.wine_name ?? 'Vino',
                                    rating: r.rating ?? null,
                                    comment: r.comment ?? null,
                                    createdAt: r.createdAt ?? r.created_at,
                                    imageUrl: r.imageUrl ?? r.image_url ?? null,
                                    isFavorite: r.isFavorite ?? favs.some(fav => fav.wineId === (r.id ?? r.wineId ?? r.wine_id)),
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
                        scrollEnabled={false}
                    />
                )}
            </View>
            <View className="h-6" />
        </ScrollView>
    );
}