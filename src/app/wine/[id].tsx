import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Button from '@/components/Button';
import { apiClient } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { toggleFavoriteApi, favoriteIconColor, favoriteIconName } from '@/lib/favorites';
import WineImage from "@/components/WineImage";

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
}

export default function WineDetailPage() {
  const { id } = useLocalSearchParams();
  const [wine, setWine] = useState<Wine | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const userId = '5ebaba97-9e1d-41ad-ba40-c0fd5a07c339';

  useEffect(() => {
    const fetchWine = async () => {
      try {
        const data = await apiClient.get(`/wines/${id}`);
        setWine(data);
        setIsFavorite(!!(data?.isFavorite));
      } catch (error) {
        console.error('Error fetching wine:', error);
        setWine(null);
      }
      setLoading(false);
    };
    if (id) fetchWine();
  }, [id]);

  // Fetch existing rating for this wine by the current user
  useEffect(() => {
    const fetchRating = async () => {
      if (!id) return;
      try {
        const statusResp = await apiClient.get(`/users/${userId}/wines/status/${id}`);
        const r = (statusResp as any)?.rating ?? null;
        setSelectedRating(typeof r === 'number' && r >= 1 && r <= 5 ? r : null);
      } catch (e) {
        console.error('Error fetching rating status:', e);
      }
    };
    fetchRating();
  }, [id]);

  const onToggleFavorite = async () => {
    if (!wine || isToggling) return;
    const prev = isFavorite;
    setIsToggling(true);
    setIsFavorite(!prev);
    try {
      await toggleFavoriteApi(userId, wine.wineId, prev);
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar el favorito. Intenta nuevamente.');
      setIsFavorite(prev);
    } finally {
      setIsToggling(false);
    }
  };

  const onToggleStar = (value: number) => {
    setSelectedRating(prev => (prev === value ? null : value));
  };

  const onSaveRating = async () => {
    if (!id) {
      Alert.alert('Error', 'Vino inválido.');
      return;
    }
    try {
      setSaving(true);
      await apiClient.post(`/users/${userId}/wines/status`, {
        wine: Number(id),
        rating: selectedRating ?? null,
      });
      Alert.alert('Listo', 'Tu registro fue guardado.');
    } catch (e) {
      console.error('Error guardando rating', e);
      Alert.alert('Error', 'No se pudo guardar. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const formatArrayField = (field: string) => {
    try {
      const jsonString = field.replace(/'/g, '"');
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed.join(', ') : field;
    } catch {
      return field;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-lg text-white">Cargando...</Text>
      </View>
    );
  }

  if (!wine) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-lg text-white">Vino no encontrado</Text>
        <Button title="Volver" onPress={() => router.back()} variant="secondary" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4 pt-8 dark:bg-gray-900">
      <View className="flex-row justify-between items-center mb-2">
        <WineImage name={wine.wineName} size={48} rounded className="mr-3" />
        <Text className="text-3xl font-bold text-white flex-1 mr-2" numberOfLines={2}>{wine.wineName}</Text>
        <TouchableOpacity className="p-1" onPress={onToggleFavorite}>
          <Ionicons
            name={favoriteIconName(isFavorite, isToggling)}
            size={26}
            color={favoriteIconColor(isFavorite, isToggling)}
          />
        </TouchableOpacity>
      </View>
      <Text className="text-lg mb-2 text-white"><Text className="font-semibold">Tipo:</Text> {wine.type}</Text>
      <Text className="text-lg mb-2 text-white"><Text className="font-semibold">Elaboración:</Text> {wine.elaborate}</Text>
      <Text className="text-lg mb-2 text-white"><Text className="font-semibold">Uvas:</Text> {formatArrayField(wine.grapes)}</Text>
      <Text className="text-lg mb-2 text-white"><Text className="font-semibold">Armonización:</Text> {formatArrayField(wine.harmonize)}</Text>
      <Text className="text-lg mb-2 text-white"><Text className="font-semibold">ABV:</Text> {wine.abv}%</Text>
      <Text className="text-lg mb-2 text-white"><Text className="font-semibold">Cuerpo:</Text> {wine.body}</Text>
      <Text className="text-lg mb-2 text-white"><Text className="font-semibold">Acidez:</Text> {wine.acidity}</Text>
      <Text className="text-lg mb-2 text-white"><Text className="font-semibold">País:</Text> {wine.country}</Text>
      <Text className="text-lg mb-2 text-white"><Text className="font-semibold">Región:</Text> {wine.region}</Text>
      <Text className="text-lg mb-2 text-white"><Text className="font-semibold">Bodega:</Text> {wine.winery}</Text>
      <Text className="text-lg mb-4 text-white"><Text className="font-semibold">Añadas:</Text> {formatArrayField(wine.vintages)}</Text>

      <View className="mt-2 mb-4">
        <Text className="text-2xl font-bold mb-2 text-white">¿Probaste este vino?</Text>
        <Text className="text-gray-300 mb-3">Podés dejar la calificación en blanco.</Text>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-gray-400 mr-2">No me gustó</Text>
          <View className="flex-row items-center">
            {[1, 2, 3, 4, 5].map((i) => {
              const filled = selectedRating !== null && i <= selectedRating;
              return (
                <TouchableOpacity key={i} onPress={() => onToggleStar(i)} className="px-1">
                  <Ionicons name={filled ? 'star' : 'star-outline'} size={28} color={filled ? '#FACC15' : '#9CA3AF'} />
                </TouchableOpacity>
              );
            })}
          </View>
          <Text className="text-gray-400 ml-2">Me encantó</Text>
        </View>
        <Button title={saving ? 'Guardando...' : 'Guardar'} onPress={onSaveRating} variant="primary" disabled={saving} />
      </View>

      <Button title="Volver" onPress={() => router.back()} variant="secondary" />
    </ScrollView>
  );
}