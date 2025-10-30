import React, { useEffect, useState } from 'react';
import {View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Button from '@/components/Button';
import { apiClient } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { toggleFavoriteApi, favoriteIconColor, favoriteIconName } from '@/lib/favorites';
import { useAuth } from '@/hooks/useAuth';
import HorizontalScroll from '@/components/HorizontalScroll';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Droplets,
  Scale,
  Droplet,
  Grape,
  Calendar,
  Utensils,
  MessageSquareHeart,
  Sparkles,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";

// Enable className support for LinearGradient
cssInterop(LinearGradient, {
  className: "style",
});

interface Wine {
  wineId: number;
  wineName: string;
  type: string;
  elaborate: string;
  grapes: string;
  harmonize: string;
  harmonizeEs: string;
  abv: number;
  body: string;
  acidity: string;
  country: string;
  region: string;
  winery: string;
  vintages: string;
  summary?: string | null;
  id?: string;
}

export default function WineDetailPage() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [wine, setWine] = useState<Wine | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [review, setReview] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedVintage, setSelectedVintage] = useState<string | null>(null);
  const [wineIconActive, setWineIconActive] = useState<boolean>(false);
  
  // Use current user ID instead of hardcoded ID
  const userId = user?.id || user?.sub;

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
      if (!id || !userId) return;
      try {
        const statusResp = await apiClient.get(`/users/${userId}/wines/status/${id}`);
        const r = (statusResp as any)?.rating ?? null;
        const validRating = typeof r === 'number' && r >= 1 && r <= 5 ? r : null;
        setSelectedRating(validRating);
        // Toggle wine icon based on whether there is a valid rating stored for this user and wine
        setWineIconActive(validRating != null);
        const existingReview = (statusResp as any)?.review ?? '';
        setReview(typeof existingReview === 'string' ? existingReview : '');
      } catch (e) {
        console.error('Error fetching rating status:', e);
        // Silently fail - user might not have rated this wine yet
        setWineIconActive(false);
      }
    };
    fetchRating();
  }, [id, userId]);

  const onToggleFavorite = async () => {
    if (!wine || isToggling || !userId) return;
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
    if (!id || !userId) {
      Alert.alert('Error', 'Necesitas iniciar sesión para guardar calificaciones.');
      return;
    }
    try {
      setSaving(true);
      await apiClient.post(`/users/${userId}/wines/status`, {
        wine: Number(id),
        rating: selectedRating ?? null,
        review: (review?.trim()?.length ?? 0) > 0 ? review.trim() : null,
      });
      Alert.alert('Listo', 'Registramos tu experiencia correctamente.');
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
      <View className="flex-1 justify-center items-center bg-[#2c0d0d]">
        <ActivityIndicator size="large" color="#fca5a5" />
        <Text className="text-white mt-4">Cargando...</Text>
      </View>
    );
  }

  if (!wine) {
    return (
      <View className="flex-1 justify-center items-center bg-[#2c0d0d]">
        <Text className="text-lg text-white">Vino no encontrado</Text>
        <Button title="Volver" onPress={() => router.back()} style={{ marginTop: 20, marginBottom: 20 }} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f6ecd9]">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header with back button */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity className="p-2" onPress={() => router.back()}>
            <ArrowLeft color="#fca5a5" size={24} />
          </TouchableOpacity>
          <Text className="text-burgundy-300 text-xl font-bold flex-1 text-center">
            {wine.wineName}
          </Text>
          <TouchableOpacity
            className="p-2"
            onPress={() => {
              setWineIconActive(prev => !prev);
              onSaveRating();
            }}
          >
            <Ionicons
              name={wineIconActive ? 'wine' : 'wine-outline'}
              size={28}
              color={wineIconActive ? '#4d1835' : '#6b7280'}
            />
          </TouchableOpacity>
          <TouchableOpacity className="p-2" onPress={onToggleFavorite}>
            <Ionicons
              name={favoriteIconName(isFavorite, isToggling)}
              size={28}
              color={favoriteIconColor(isFavorite, isToggling)}
            />
          </TouchableOpacity>
        </View>

        {/* Botella de vino - cuello más ancho y mejor centrado */}
        <View className="items-center mb-8 mt-24">
          <View className="w-full h-[300px] relative">
            {/* Cuerpo de la botella */}
            <View className="absolute w-[80%] h-[220px] left-[10%] bottom-0">
              <LinearGradient
                colors={["#641800", "#4c1d00", "#300000"]}
                className="w-full h-full rounded-b-2xl"
              />
              {/* Etiqueta */}
              <View className="absolute w-full h-[150px] top-[50px] bg-[#e6d5a7]">
                <View className="w-full h-full justify-center items-center p-4">
                  <Text 
                    className="text-burgundy-900 font-bold text-center text-xl"
                    numberOfLines={2}
                  >
                    {wine.wineName}
                  </Text>
                  <View className="w-32 h-[1px] bg-burgundy-700 my-2" />
                  <Text className="text-burgundy-800 italic text-center text-sm">
                    {wine.winery}
                  </Text>
                </View>
              </View>
            </View>
            {/* Hombros de la botella */}
            <View className="absolute w-[80%] h-[50px] left-[10%] bottom-[220px]">
              <View className="w-full h-full bg-[#4c1d00] rounded-t-[100px]" />
            </View>
            {/* Cuello de la botella - ahora 30% de ancho y mejor centrado */}
            <View className="absolute w-[20%] h-[80px] left-[40%] bottom-[270px]">
              <View className="w-full h-full bg-[#4c1d00] rounded-t-xl">
                <View className="absolute right-2 w-2 h-full bg-white/10" />
              </View>
            </View>
            {/* Anillo del cuello */}
            <View className="absolute w-[24%] h-6 left-[38%] bottom-[270px] bg-[#3a1500] rounded-t-md" />
            {/* Corcho/Tapa */}
            <View className="absolute w-[20%] h-12 left-[40%] bottom-[340px] bg-[#8B4513] rounded-t-md" />
          </View>
        </View>

        {/* Wine Description */}
        <View className="mb-8 bg-burgundy-800 p-4 rounded-xl">
          <Text className="text-burgundy-200 text-base text-center italic">
            "{wine.elaborate}"
          </Text>
        </View>

        {/* Wine Characteristics Grid */}
        <View className="flex-row flex-wrap gap-4 mb-8">
          {/* Origin */}
          <View className="flex-1 min-w-[45%] bg-burgundy-700 rounded-2xl p-4 border border-burgundy-700/50">
            <View className="flex-row items-center mb-2">
              <MapPin color="#fca5a5" size={18} />
              <Text className="text-white font-semibold ml-2">Origen</Text>
            </View>
            <Text className="text-burgundy-200 text-sm">{wine.country}, {wine.region}</Text>
          </View>

          {/* Vineyard */}
          <View className="flex-1 min-w-[45%] bg-burgundy-700 rounded-2xl p-4 border border-burgundy-700/50">
            <View className="flex-row items-center mb-2">
              <Building2 color="#fca5a5" size={18} />
              <Text className="text-white font-semibold ml-2">Bodega</Text>
            </View>
            <Text className="text-burgundy-200 text-sm">{wine.winery}</Text>
          </View>

          {/* ABV */}
          <View className="flex-1 min-w-[45%] bg-burgundy-700 rounded-2xl p-4 border border-burgundy-700/50">
            <View className="flex-row items-center mb-2">
              <Droplets color="#fca5a5" size={18} />
              <Text className="text-white font-semibold ml-2">ABV</Text>
            </View>
            <Text className="text-burgundy-200 text-sm">{wine.abv}%</Text>
          </View>

          {/* Body */}
          <View className="flex-1 min-w-[45%] bg-burgundy-700 rounded-2xl p-4 border border-burgundy-700/50">
            <View className="flex-row items-center mb-2">
              <Scale color="#fca5a5" size={18} />
              <Text className="text-white font-semibold ml-2">Cuerpo</Text>
            </View>
            <Text className="text-burgundy-200 text-sm">{wine.body}</Text>
          </View>

          {/* Acidity */}
          <View className="flex-1 min-w-[45%] bg-burgundy-700 rounded-2xl p-4 border border-burgundy-700/50">
            <View className="flex-row items-center mb-2">
              <Droplet color="#fca5a5" size={18} />
              <Text className="text-white font-semibold ml-2">Acidez</Text>
            </View>
            <Text className="text-burgundy-200 text-sm">{wine.acidity}</Text>
          </View>

          {/* Type */}
          <View className="flex-1 min-w-[45%] bg-burgundy-700 rounded-2xl p-4 border border-burgundy-700/50">
            <View className="flex-row items-center mb-2">
              <Grape color="#fca5a5" size={18} />
              <Text className="text-white font-semibold ml-2">Tipo</Text>
            </View>
            <Text className="text-burgundy-200 text-sm">{wine.type}</Text>
          </View>
        </View>

        {/* Grape Type */}
        <View className="mb-6 bg-burgundy-700 rounded-2xl p-4 border border-burgundy-700/50">
          <Text className="text-white text-xl font-bold mb-3">Uvas</Text>
          <Text className="text-burgundy-200">{formatArrayField(wine.grapes)}</Text>
        </View>

        {/* Harmonization */}
        <View className="mb-6 bg-burgundy-700 rounded-2xl p-4 border border-burgundy-700/50">
          <View className="flex-row items-center mb-3">
            <Utensils color="#fca5a5" size={20} />
            <Text className="text-white text-xl font-bold ml-2">
              Acompañalo con...
            </Text>
          </View>
          <Text className="text-burgundy-200">{formatArrayField(wine.harmonizeEs)}</Text>
        </View>

        {/* Vintage Years */}
        <View className="mb-6 bg-burgundy-700 rounded-2xl p-4 border border-burgundy-700/50">
          <View className="flex-row items-center mb-2 px-1">
            <Calendar color="#fca5a5" size={20} />
            <Text className="text-white text-xl font-bold ml-2">
              Años de cosecha
            </Text>
          </View>
          <HorizontalScroll
            vintagesString={formatArrayField(wine.vintages)}
            onVintageSelect={(v) => setSelectedVintage(v)}
            selectedVintage={selectedVintage}
          />
        </View>

          {(wine.summary ?? '').trim().length > 0 && (
              <View className="mb-2 bg-burgundy-700 rounded-2xl p-4 border border-burgundy-700/50">
                  <View className="flex-row items-center">
                    <Sparkles color="#fca5a5" size={20}/>
                    <Text className="text-white text-xl font-bold ml-2">Resumen de opiniones hecho con IA</Text>
                  </View>
                  <Text className="text-burgundy-200 mb-2">{wine.summary}</Text>
              </View>
          )}

        {/* Rating Section - FIXED LAYOUT */}
        <View className="mb-2 bg-burgundy-700 rounded-2xl p-4 border border-burgundy-700/50">
          <View className="flex-row items-center">
              <MessageSquareHeart color="#fca5a5" size={20} />
              <Text className="text-white text-xl font-bold ml-2">¿Probaste este vino?</Text>
          </View>
            <View className="mb-2 bg-burgundy-700 rounded-2xl p-4 border border-burgundy-700/50">
                <Text className="text-burgundy-300 mb-3">Registrá tu experiencia para ajustar nuestras recomendaciones. No es necesario que escribas una opinión ni que lo califiques.</Text>
                <TextInput
                    className="mb-3 p-3 min-h-[100px] rounded-lg bg-burgundy-800 text-white border border-burgundy-700"
                    placeholder="¿Qué te pareció este vino? Contanos tu opinión."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    value={review}
                    onChangeText={setReview}
                    textAlignVertical="top"
                />
            
            {/* Stars in center */}
            <View className="flex-row justify-center my-2">
              {[1, 2, 3, 4, 5].map((i) => {
                const filled = selectedRating !== null && i <= selectedRating;
                return (
                  <TouchableOpacity key={i} onPress={() => onToggleStar(i)} className="px-2">
                    <Ionicons 
                      name={filled ? 'star' : 'star-outline'} 
                      size={32} 
                      color={filled ? '#FACC15' : '#9CA3AF'} 
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            <View className="flex-row justify-between mb-4">
                <Text className="text-burgundy-300">No me gustó</Text>
                <Text className="text-burgundy-300">Me encantó</Text>
            </View>
            
            <TouchableOpacity 
              className="bg-burgundy-500 py-3 rounded-xl items-center mt-4"
              onPress={onSaveRating}
              disabled={saving || !userId}
            >
              <Text className="text-white font-bold text-base">
                {saving ? 'Guardando...' : 'Registrar experiencia'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          className="bg-burgundy-700 py-4 rounded-2xl items-center mb-8"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold text-lg">
            Volver
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}