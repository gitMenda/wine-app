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
  isHeroCard: boolean;
  onToggleFavorite: (wine: Wine) => void;
  togglingFavorites: Set<number>;
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({
  item,
  isHeroCard,
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

  const getCompatibilityLevel = (score?: number) => {
    if (!score) return { level: 'Sin datos', color: '#9CA3AF', bgColor: '#F3F4F6' };
    if (score >= 0.8) return { level: 'Muy alta', color: '#059669', bgColor: '#ECFDF5' };
    if (score >= 0.6) return { level: 'Alta', color: '#0891B2', bgColor: '#F0F9FF' };
    if (score >= 0.4) return { level: 'Media', color: '#EA580C', bgColor: '#FFF7ED' };
    return { level: 'Baja', color: '#DC2626', bgColor: '#FEF2F2' };
  };

  const compatibility = getCompatibilityLevel(item.score);
  const scorePercentage = item.score ? Math.round(item.score * 100) : 0;

  if (isHeroCard) {
    return (
      <View style={styles.heroCardContainer}>
        <LinearGradient
          colors={['#300615', '#45081E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View className="flex-row justify-between items-start mb-4">
            <WineImage name={item.wineName} size={48} rounded className="mr-3" />
            <View className="flex-1">
              <Text style={styles.heroWineTitle} numberOfLines={2}>{item.wineName}</Text>
              <Text style={styles.heroWineDetail}>
                {item.type} • {item.region}
              </Text>
            </View>
            <TouchableOpacity 
              className="p-2" 
              onPress={() => onToggleFavorite(item)}
              style={{ minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
            >
              <Ionicons
                name={favoriteIconName(!!item.isFavorite, togglingFavorites.has(item.wineId))}
                size={22}
                color={favoriteIconColor(!!item.isFavorite, togglingFavorites.has(item.wineId))}
              />
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text style={styles.heroCompatibilityLabel}>
                Compatibilidad: {compatibility.level}
              </Text>
              <Text style={styles.heroScorePercentage}>
                {scorePercentage}%
              </Text>
            </View>
            <View style={[styles.compatibilityBar, { backgroundColor: 'rgba(245, 240, 230, 0.3)' }]}>
              <LinearGradient
                colors={scorePercentage >= 80 ? ['#22c55e', '#16a34a'] : scorePercentage >= 60 ? ['#3b82f6', '#2563eb'] : scorePercentage >= 40 ? ['#f59e0b', '#d97706'] : ['#ef4444', '#dc2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.compatibilityFill, 
                  { width: `${scorePercentage}%` }
                ]} 
              />
            </View>
          </View>

          <View style={[styles.wineChips, { marginBottom: 16 }]}>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>{item.winery}</Text>
            </View>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>{item.body}</Text>
            </View>
            {item.grapes && (
              <View style={styles.heroChip}>
                <Text style={styles.heroChipText}>{item.grapes}</Text>
              </View>
            )}
          </View>

          {loadingRating ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#F5F0E6" />
            </View>
          ) : (
            <View>
              <View className="flex-row justify-center my-3">
                {[1, 2, 3, 4, 5].map((i) => {
                  const ratingToShow = isEditing ? selectedRating : (selectedRating ?? originalRating);
                  const filled = ratingToShow !== null && i <= ratingToShow;
                  return (
                    <TouchableOpacity key={i} onPress={() => onToggleStar(i)} className="px-2">
                      <Ionicons 
                        name={filled ? 'star' : 'star-outline'} 
                        size={28} 
                        color={filled ? '#FACC15' : '#9CA3AF'} 
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
              {originalRating !== null && !isEditing && selectedRating === originalRating ? (
                <TouchableOpacity 
                  style={styles.heroSecondaryAction}
                  onPress={onStartEditing}
                >
                  <Text style={[styles.actionText, { color: '#F5F0E6' }]}>
                    Editar calificación
                  </Text>
                </TouchableOpacity>
              ) : (isEditing || (selectedRating !== null && originalRating === null) || (selectedRating !== null && selectedRating !== originalRating)) && (
                <View className="mt-3">
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="¿Qué te pareció este vino? Contanos tu opinión."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    value={review}
                    onChangeText={setReview}
                    textAlignVertical="top"
                  />
                  <TouchableOpacity 
                    style={styles.heroPrimaryAction}
                    onPress={onSaveRating}
                    disabled={saving || !userId}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#3E2723" />
                    ) : (
                      <Text style={[styles.actionText, { color: '#3E2723' }]}>
                        {originalRating !== null ? 'Actualizar experiencia' : 'Registrar experiencia'}
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
  }

  return (
    <View style={styles.wineCardContainer}>
      <LinearGradient
        colors={['#17030B', '#20040E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.wineCard}
      >
        <View className="flex-row justify-between items-start mb-3">
          <WineImage name={item.wineName} size={48} rounded className="mr-3" />
          <View className="flex-1">
            <Text style={styles.wineTitle} numberOfLines={2}>{item.wineName}</Text>
          </View>
          <TouchableOpacity 
            className="p-2" 
            onPress={() => onToggleFavorite(item)}
            style={{ minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
          >
            <Ionicons
              name={favoriteIconName(!!item.isFavorite, togglingFavorites.has(item.wineId))}
              size={22}
              color={favoriteIconColor(!!item.isFavorite, togglingFavorites.has(item.wineId))}
            />
          </TouchableOpacity>
        </View>

        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text style={styles.compatibilityLabel}>
              Compatibilidad: {compatibility.level}
            </Text>
            <Text style={styles.scorePercentage}>
              {scorePercentage}%
            </Text>
          </View>
          <View style={styles.compatibilityBar}>
            <LinearGradient
              colors={scorePercentage >= 80 ? ['#22c55e', '#16a34a'] : scorePercentage >= 60 ? ['#3b82f6', '#2563eb'] : scorePercentage >= 40 ? ['#f59e0b', '#d97706'] : ['#ef4444', '#dc2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.compatibilityFill, 
                { width: `${scorePercentage}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.wineChips}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item.winery}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item.type}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item.body}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item.region}</Text>
          </View>
        </View>

        {loadingRating ? (
          <View className="items-center py-4">
            <ActivityIndicator size="small" color="#CECCCD" />
          </View>
        ) : (
          <View>
            <View className="flex-row justify-center my-3">
              {[1, 2, 3, 4, 5].map((i) => {
                const ratingToShow = isEditing ? selectedRating : (selectedRating ?? originalRating);
                const filled = ratingToShow !== null && i <= ratingToShow;
                return (
                  <TouchableOpacity key={i} onPress={() => onToggleStar(i)} className="px-2">
                    <Ionicons 
                      name={filled ? 'star' : 'star-outline'} 
                      size={28} 
                      color={filled ? '#FACC15' : '#9CA3AF'} 
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            {originalRating !== null && !isEditing && selectedRating === originalRating ? (
              <TouchableOpacity 
                style={styles.secondaryAction}
                onPress={onStartEditing}
              >
                <Text style={[styles.actionText, { color: '#6B1E3A' }]}>
                  Editar calificación
                </Text>
              </TouchableOpacity>
            ) : (isEditing || (selectedRating !== null && originalRating === null) || (selectedRating !== null && selectedRating !== originalRating)) && (
              <View className="mt-3">
                <TextInput
                  style={styles.reviewInput}
                  placeholder="¿Qué te pareció este vino? Contanos tu opinión."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
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
                    <Text style={[styles.actionText, { color: '#F5F0E6' }]}>
                      {originalRating !== null ? 'Actualizar experiencia' : 'Registrar experiencia'}
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
  heroCardContainer: {
    margin: 8,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  heroCard: {
    padding: 24,
    minHeight: 200,
  },
  wineCardContainer: {
    margin: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wineCard: {
    padding: 20,
  },
  heroWineTitle: {
    color: '#F5F0E6',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
    textAlign: 'center',
  },
  heroWineDetail: {
    color: '#F8D7DA',
    opacity: 1,
    marginBottom: 4,
    fontSize: 16,
    textAlign: 'center',
  },
  heroCompatibilityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F5F0E6',
    marginBottom: 6,
  },
  heroScorePercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5F0E6',
  },
  wineTitle: {
    color: '#CECCCD',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  compatibilityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CECCCD',
    marginBottom: 4,
  },
  scorePercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#CECCCD',
  },
  compatibilityBar: {
    height: 6,
    backgroundColor: '#E7DFD6',
    borderRadius: 3,
    marginVertical: 8,
    overflow: 'hidden',
  },
  compatibilityFill: {
    height: '100%',
    borderRadius: 3,
  },
  wineChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 8,
  },
  heroChip: {
    backgroundColor: '#F5F0E6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  heroChipText: {
    color: '#6B1E3A',
    fontSize: 12,
    fontWeight: '600',
  },
  chip: {
    backgroundColor: '#F8D7DA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: {
    color: '#3E2723',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  heroPrimaryAction: {
    backgroundColor: '#FFD54F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
  },
  heroSecondaryAction: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F5F0E6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryAction: {
    backgroundColor: '#6B1E3A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  secondaryAction: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6B1E3A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewInput: {
    marginBottom: 12,
    padding: 12,
    minHeight: 80,
    borderRadius: 8,
    backgroundColor: '#4A1E2E',
    color: '#F5F0E6',
    borderWidth: 1,
    borderColor: '#6B1E3A',
    fontSize: 14,
  },
});

export default RecommendationItem;



