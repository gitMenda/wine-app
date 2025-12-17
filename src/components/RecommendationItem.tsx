import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import WineImage from "@/components/WineImage";
import { favoriteIconColor, favoriteIconName } from '@/lib/favorites';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';

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
  abv: number;
  body: string;
  acidity: string;
  country: string;
  region: string;
  winery: string;
  vintages: string;
  id?: string;
  isFavorite?: boolean;
  score?: number;
}

interface RecommendationItemProps {
  item: Wine;
  onToggleFavorite: (wine: Wine) => void;
  togglingFavorites: Set<number>;
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({
  item,
  onToggleFavorite,
  togglingFavorites,
}) => {
  const { user } = useAuth();
  const userId = user?.id || user?.sub;
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [originalRating, setOriginalRating] = useState<number | null>(null);
  const [review, setReview] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [loadingRating, setLoadingRating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchRating = async () => {
      if (!item.wineId || !userId) return;
      try {
        setLoadingRating(true);
        const statusResp = await apiClient.get(`/users/${userId}/wines/status/${item.wineId}`);
        const r = (statusResp as any)?.rating ?? null;
        const validRating = typeof r === 'number' && r >= 1 && r <= 5 ? r : null;
        setSelectedRating(validRating);
        setOriginalRating(validRating);
        const existingReview = (statusResp as any)?.review ?? '';
        setReview(typeof existingReview === 'string' ? existingReview : '');
        setIsEditing(false);
      } catch (e) {
        console.error('Error fetching rating status:', e);
      } finally {
        setLoadingRating(false);
      }
    };
    fetchRating();
  }, [item.wineId, userId]);

  const onToggleStar = (value: number) => {
    if (!isEditing && originalRating !== null) {
      setIsEditing(true);
    }
    setSelectedRating(prev => (prev === value ? null : value));
  };

  const onStartEditing = () => {
    setIsEditing(true);
  };

  const onSaveRating = async () => {
    if (!item.wineId || !userId) {
      Alert.alert('Error', 'Necesitas iniciar sesión para guardar calificaciones.');
      return;
    }
    try {
      setSaving(true);
      const trimmedReview = review?.trim() || '';
      const reviewToSend = trimmedReview.length > 0 ? trimmedReview : null;
      const payload = {
        wine: item.wineId,
        rating: selectedRating ?? null,
        review: reviewToSend,
      };
      console.log('Saving rating with payload:', {
        wine: payload.wine,
        rating: payload.rating,
        review: payload.review,
        reviewLength: payload.review?.length || 0,
        reviewIsNull: payload.review === null,
      });
      await apiClient.post(`/users/${userId}/wines/status`, payload);
      setOriginalRating(selectedRating);
      setIsEditing(false);
      Alert.alert('Listo', originalRating !== null ? 'Actualizamos tu experiencia correctamente.' : 'Registramos tu experiencia correctamente.');
    } catch (e) {
      console.error('Error guardando rating', e);
      Alert.alert('Error', 'No se pudo guardar. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const getCompatibilityInfo = (score?: number) => {
    if (!score) return null;
    const percentage = Math.round(score);
    let label: string;
    let color: string;
    if (percentage >= 80) {
      label = 'Muy alta';
      color = '#22c55e';
    } else if (percentage >= 60) {
      label = 'Alta';
      color = '#3b82f6';
    } else if (percentage >= 40) {
      label = 'Media';
      color = '#f59e0b';
    } else {
      label = 'Baja';
      color = '#ef4444';
    }
    return { percentage, label, color };
  };

  const compatibilityInfo = getCompatibilityInfo(item.score);

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={['#0D0D0D', '#0E0E0E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View className="flex-row items-center mb-3">
          <WineImage name={item.wineName} size={36} rounded className="mr-3" />
          <Text style={styles.wineTitle} numberOfLines={2} className="flex-1">
            {item.wineName}
          </Text>
          <TouchableOpacity
            onPress={() => onToggleFavorite(item)}
            className="p-1 ml-2"
          >
            <Ionicons
              name={favoriteIconName(!!item.isFavorite, togglingFavorites.has(item.wineId))}
              size={24}
              color={favoriteIconColor(!!item.isFavorite, togglingFavorites.has(item.wineId))}
            />
          </TouchableOpacity>
        </View>

        {item.winery && (
          <Text style={styles.wineryText} numberOfLines={1} className="mb-1">
            {item.winery}
          </Text>
        )}
        {item.region && (
          <Text style={styles.regionText} numberOfLines={1} className="mb-2">
            {item.region}{item.country ? `, ${item.country}` : ''}
          </Text>
        )}

        {compatibilityInfo && (
          <View className="flex-row items-center mb-2">
            <Text style={[styles.compatibilityText, { color: compatibilityInfo.color }]}>
              Compatibilidad: {compatibilityInfo.label} ({compatibilityInfo.percentage}%)
            </Text>
          </View>
        )}

      {loadingRating ? (
        <View className="items-center py-3">
          <ActivityIndicator size="small" color="#CECCCD" />
        </View>
      ) : (
        <View>
          <View className="flex-row justify-between items-center my-2">
            <View className="flex-row">
              {[1, 2, 3, 4, 5].map((i) => {
                const ratingToShow = isEditing ? selectedRating : (selectedRating ?? originalRating);
                const filled = ratingToShow !== null && i <= ratingToShow;
                return (
                  <TouchableOpacity key={i} onPress={() => onToggleStar(i)} className="px-1">
                    <Ionicons 
                      name={filled ? 'star' : 'star-outline'} 
                      size={24} 
                      color={filled ? '#FACC15' : '#9CA3AF'} 
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            {originalRating !== null && !isEditing && selectedRating === originalRating && (
              <TouchableOpacity 
                style={styles.editButton}
                onPress={onStartEditing}
              >
                <Text style={styles.editButtonText}>
                  Editar
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {(isEditing || (selectedRating !== null && originalRating === null) || (selectedRating !== null && selectedRating !== originalRating)) && (
            <View className="mt-2">
              <TextInput
                style={styles.reviewInput}
                placeholder="¿Qué te pareció este vino? Contanos tu opinión."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={2}
                value={review}
                onChangeText={setReview}
                textAlignVertical="top"
              />
              <TouchableOpacity 
                style={styles.primaryAction}
                onPress={onSaveRating}
                disabled={saving || !userId}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#F5F0E6" />
                ) : (
                  <Text style={styles.primaryActionText}>
                    {originalRating !== null ? 'Actualizar calificación' : 'Registrar calificación'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  card: {
    padding: 16,
  },
  wineTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  wineryText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 2,
  },
  regionText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  compatibilityText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  primaryAction: {
    backgroundColor: '#6B1E3A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  primaryActionText: {
    color: '#F5F0E6',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryAction: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6B1E3A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  secondaryActionText: {
    color: '#6B1E3A',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: 'rgba(42, 42, 42, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#F5F0E6',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewInput: {
    marginBottom: 8,
    padding: 10,
    minHeight: 60,
    borderRadius: 8,
    backgroundColor: '#0F0105',
    color: '#F5F0E6',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    fontSize: 14,
  },
});

export default RecommendationItem;



