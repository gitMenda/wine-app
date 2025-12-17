import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import WineImage from "@/components/WineImage";
import { favoriteIconColor, favoriteIconName } from '@/lib/favorites';

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

interface SearchWineItemProps {
  item: Wine;
  onToggleFavorite: (wine: Wine) => void;
  togglingFavorites: Set<number>;
}

const SearchWineItem: React.FC<SearchWineItemProps> = ({
  item,
  onToggleFavorite,
  togglingFavorites,
}) => {

  const getCompatibilityInfo = (score?: number) => {
    if (score === undefined || score === null || score < 0 || score > 100) {
      return null;
    }

    const percentage = Math.round(score);
    let result: { percentage: number; label: string; color: string };
    if (percentage >= 80) {
      result = { percentage, label: 'Muy alta', color: '#22c55e' };
    } else if (percentage >= 60) {
      result = { percentage, label: 'Alta', color: '#3b82f6' };
    } else if (percentage >= 40) {
      result = { percentage, label: 'Media', color: '#f59e0b' };
    } else {
      result = { percentage, label: 'Baja', color: '#ef4444' };
    }
    return result;
  };

  const compatibilityInfo = getCompatibilityInfo(item.score);

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => router.push(`/wine/${item.wineId}`)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#0D0D0D', '#0E0E0E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View className="flex-row items-start">
          <WineImage name={item.wineName} size={48} rounded className="mr-3" />

          <View className="flex-1 flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text style={styles.wineTitle} numberOfLines={2}>
                {item.wineName}
              </Text>
              {item.winery && (
                <Text style={styles.wineryText} numberOfLines={1}>
                  {item.winery}
                </Text>
              )}
              {item.region && (
                <Text style={styles.regionText} numberOfLines={1}>
                  {item.region}{item.country ? `, ${item.country}` : ''}
                </Text>
              )}

              {compatibilityInfo && (
                <View className="flex-row items-center mt-1">
                  <Text style={[styles.compatibilityText, { color: compatibilityInfo.color }]}>
                    Compatibilidad: {compatibilityInfo.label} ({compatibilityInfo.percentage}%)
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite(item);
              }}
              className="p-1 ml-2"
            >
              <Ionicons
                name={favoriteIconName(!!item.isFavorite, togglingFavorites.has(item.wineId))}
                size={24}
                color={favoriteIconColor(!!item.isFavorite, togglingFavorites.has(item.wineId))}
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
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
});

export default SearchWineItem;
