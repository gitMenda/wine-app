import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Sparkles, Wine, DollarSign, ChevronDown, ChevronUp } from 'lucide-react-native';
import { MenuWineRecommendation } from '@/types/menu';
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";

cssInterop(LinearGradient, {
  className: "style",
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'transparent',
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: '#CECCCD',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#CECCCD',
    marginTop: 4,
    fontSize: 14,
    opacity: 0.8,
  },
  heroWineCard: {
    margin: 16,
    borderRadius: 24,
    minHeight: 140,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroWineCardInner: {
    padding: 20,
    borderRadius: 24,
  },
  regularWineCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    minHeight: 140,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  regularWineCardInner: {
    padding: 20,
    borderRadius: 24,
  },
  heroWineName: {
    color: '#CECCCD',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  regularWineName: {
    color: '#CECCCD',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  heroReason: {
    color: '#CECCCD',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
    marginBottom: 12,
  },
  regularReason: {
    color: '#CECCCD',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  heroChip: {
    backgroundColor: 'rgba(204, 204, 205, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  regularChip: {
    backgroundColor: 'rgba(204, 204, 205, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroChipText: {
    color: '#CECCCD',
    fontSize: 12,
    fontWeight: '500',
  },
  regularChipText: {
    color: '#CECCCD',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#6B1E3A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#F5F0E6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#AA9D15',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    color: '#0E0206',
    fontSize: 11,
    fontWeight: 'bold',
  },
  iconCircle: {
    padding: 12,
    borderRadius: 50,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F5F0E6',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
});

export default function MenuRecommendationsScreen() {
  const params = useLocalSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse the recommendations data from params
  const summary = params.summary as string || 'Encontramos vinos perfectos para vos en este menú.';
  const recommendationsData = params.recommendations as string;

  let recommendations: MenuWineRecommendation[] = [];
  try {
    recommendations = recommendationsData ? JSON.parse(recommendationsData) : [];
  } catch (e) {
    console.error('Error parsing recommendations:', e);
  }

  // Count lines in summary text (rough estimate: ~40 chars per line on mobile)
  const estimatedLines = Math.ceil(summary.length / 40);
  const needsExpansion = estimatedLines > 10;

  return (
    <View className="flex-1" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft color="#CECCCD" size={24} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text style={styles.headerTitle} numberOfLines={1}>Recomendaciones del Menú</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Summary Section - No Card */}
        <View className="px-4 mb-6 mt-2">
          <View className="flex-row items-center mb-3">
            <Sparkles color="#AA9D15" size={20} />
            <Text className="font-bold ml-2" style={{ color: '#CECCCD', fontSize: 16 }}>
              Análisis del menú
            </Text>
          </View>
          <Text
            style={{ color: '#CECCCD', fontSize: 14, lineHeight: 20 }}
            numberOfLines={needsExpansion && !isExpanded ? 10 : undefined}
          >
            {summary}
          </Text>
          {needsExpansion && (
            <TouchableOpacity
              onPress={() => setIsExpanded(!isExpanded)}
              className="flex-row items-center mt-2"
            >
              <Text style={{ color: '#AA9D15', fontSize: 14, fontWeight: '600' }}>
                {isExpanded ? 'Leer menos' : 'Leer más'}
              </Text>
              {isExpanded ? (
                <ChevronUp color="#AA9D15" size={16} style={{ marginLeft: 4 }} />
              ) : (
                <ChevronDown color="#AA9D15" size={16} style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Top Recommendation - Hero Card */}
        {recommendations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Tu mejor opción</Text>
            <View style={styles.heroWineCard} className="border border-primary">
              <LinearGradient
                colors={['#300615', '#45081E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroWineCardInner}
              >
                {/* Best Match Badge */}
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Mejor Match</Text>
                </View>

                {/* Icon */}
                <View style={styles.iconCircle} className="bg-secondary">
                  <Wine color="#CECCCD" size={24} />
                </View>

                {/* Wine Name */}
                <Text style={styles.heroWineName}>
                  {recommendations[0].wine_name}
                </Text>

                {/* Reason */}
                <Text style={styles.heroReason}>
                  {recommendations[0].reason}
                </Text>

                {/* Details */}
                <View style={styles.detailsRow}>
                  {recommendations[0].wine_type && (
                    <View style={styles.heroChip}>
                      <Wine color="#CECCCD" size={12} />
                      <Text style={styles.heroChipText}>{recommendations[0].wine_type}</Text>
                    </View>
                  )}
                  {recommendations[0].estimated_price && (
                    <View style={styles.heroChip}>
                      <DollarSign color="#CECCCD" size={12} />
                      <Text style={styles.heroChipText}>{recommendations[0].estimated_price}</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </View>
          </>
        )}

        {/* Other Recommendations */}
        {recommendations.length > 1 && (
          <>
            <Text style={styles.sectionTitle}>Otras opciones</Text>
            {recommendations.slice(1).map((wine, index) => (
              <View key={index} style={styles.regularWineCard}>
                <LinearGradient
                  colors={['#0D0D0D', '#0E0E0E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.regularWineCardInner}
                >
                  {/* Wine Name */}
                  <Text style={styles.regularWineName}>
                    {wine.wine_name}
                  </Text>

                  {/* Reason */}
                  <Text style={styles.regularReason}>
                    {wine.reason}
                  </Text>

                  {/* Details */}
                  <View style={styles.detailsRow}>
                    {wine.wine_type && (
                      <View style={styles.regularChip}>
                        <Wine color="#CECCCD" size={12} />
                        <Text style={styles.regularChipText}>{wine.wine_type}</Text>
                      </View>
                    )}
                    {wine.estimated_price && (
                      <View style={styles.regularChip}>
                        <DollarSign color="#CECCCD" size={12} />
                        <Text style={styles.regularChipText}>{wine.estimated_price}</Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </View>
            ))}
          </>
        )}

        {/* Empty State */}
        {recommendations.length === 0 && (
          <View className="flex-1 justify-center items-center px-8 py-16">
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🍷</Text>
            <Text style={{ color: '#F5F0E6', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
              No hay recomendaciones
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 15, textAlign: 'center' }}>
              No pudimos encontrar vinos en el menú que coincidan con tus gustos.
            </Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/recommendations')}
        >
          <Text style={styles.actionButtonText}>
            Ver todas mis recomendaciones
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}