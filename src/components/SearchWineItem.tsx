import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import WineImage from "@/components/WineImage";
import { favoriteIconColor, favoriteIconName } from '@/lib/favorites';

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
  // DEBUG: Log item data with more details
  console.log(`\n=== SearchWineItem Render: ${item.wineName} ===`);
  console.log(`  WineId: ${item.wineId}`);
  console.log(`  Score: ${item.score} (type: ${typeof item.score})`);
  console.log(`  Score is undefined: ${item.score === undefined}`);
  console.log(`  Score is null: ${item.score === null}`);
  console.log(`  Score is valid number: ${typeof item.score === 'number' && !isNaN(item.score)}`);
  console.log(`  Score in valid range (0-100): ${item.score !== undefined && item.score !== null && item.score >= 0 && item.score <= 100}`);

  // Calculate compatibility percentage from score (0-100 scale from backend)
  const getCompatibilityInfo = (score?: number) => {
    console.log(`  [getCompatibilityInfo] Input score: ${score}`);

    if (score === undefined || score === null || score < 0 || score > 100) {
      console.log(`  [getCompatibilityInfo] No compatibility info for ${item.wineName}. Score:`, score);
      return null;
    }

    const percentage = Math.round(score);
    console.log(`  [getCompatibilityInfo] Rounded percentage: ${percentage}`);

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

    console.log(`  [getCompatibilityInfo] Result:`, result);
    return result;
  };

  const compatibilityInfo = getCompatibilityInfo(item.score);
  console.log(`  Final compatibilityInfo:`, compatibilityInfo);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/wine/${item.wineId}`)}
      activeOpacity={0.7}
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

            {/* Compatibility Score */}
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

      {/* Action Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push(`/wine/${item.wineId}`)}
      >
        <Text style={styles.actionButtonText}>
          Calificar
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E191B',
    borderWidth: 1,
    borderColor: '#382E32',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
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
  actionButton: {
    backgroundColor: '#6B1E3A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  actionButtonText: {
    color: '#F5F0E6',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SearchWineItem;
