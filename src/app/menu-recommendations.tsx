import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Sparkles, Wine, DollarSign } from 'lucide-react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MenuWineRecommendation } from '@/types/menu';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#F8D7DA',
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: '#3E2723',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#6B1E3A',
    marginTop: 4,
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: '#F5F0E6',
    padding: 20,
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    color: '#3E2723',
    fontSize: 16,
    lineHeight: 24,
  },
  heroWineCard: {
    backgroundColor: '#6B1E3A',
    padding: 24,
    margin: 16,
    borderRadius: 24,
    minHeight: 200,
    borderWidth: 2,
    borderColor: '#8B2E4A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  regularWineCard: {
    backgroundColor: '#F5F0E6',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroWineName: {
    color: '#F5F0E6',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  regularWineName: {
    color: '#3E2723',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  heroReason: {
    color: '#F8D7DA',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  regularReason: {
    color: '#3E2723',
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  heroChip: {
    backgroundColor: '#F5F0E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  regularChip: {
    backgroundColor: '#F8D7DA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroChipText: {
    color: '#6B1E3A',
    fontSize: 13,
    fontWeight: '600',
  },
  regularChipText: {
    color: '#3E2723',
    fontSize: 13,
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
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFD54F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10,
  },
  badgeText: {
    color: '#3E2723',
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconCircle: {
    padding: 16,
    borderRadius: 50,
    backgroundColor: '#F5F0E6',
    alignSelf: 'center',
    marginBottom: 16,
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
  const { top } = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  // Parse the recommendations data from params
  const summary = params.summary as string || 'Encontramos vinos perfectos para vos en este menú.';
  const recommendationsData = params.recommendations as string;
  
  let recommendations: MenuWineRecommendation[] = [];
  try {
    recommendations = recommendationsData ? JSON.parse(recommendationsData) : [];
  } catch (e) {
    console.error('Error parsing recommendations:', e);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: top }]}>
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft color="#3E2723" size={24} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text style={styles.headerTitle}>Recomendaciones del Menú</Text>
            <Text style={styles.headerSubtitle}>
              Análisis completado con IA
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View className="flex-row items-start mb-3">
            <View style={{ marginRight: 12 }}>
              <Sparkles color="#6B1E3A" size={24} />
            </View>
            <View className="flex-1">
              <Text className="font-bold mb-2" style={{ color: '#3E2723', fontSize: 16 }}>
                Análisis del menú
              </Text>
              <Text style={styles.summaryText}>
                {summary}
              </Text>
            </View>
          </View>
        </View>

        {/* Top Recommendation - Hero Card */}
        {recommendations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Tu mejor opción</Text>
            <View style={styles.heroWineCard}>
              {/* Best Match Badge */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Mejor Match</Text>
              </View>

              {/* Icon */}
              <View style={styles.iconCircle}>
                <Wine color="#6B1E3A" size={32} />
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
                    <Wine color="#6B1E3A" size={14} />
                    <Text style={styles.heroChipText}>{recommendations[0].wine_type}</Text>
                  </View>
                )}
                {recommendations[0].estimated_price && (
                  <View style={styles.heroChip}>
                    <DollarSign color="#6B1E3A" size={14} />
                    <Text style={styles.heroChipText}>{recommendations[0].estimated_price}</Text>
                  </View>
                )}
              </View>

              {/* Decorative circles */}
              <View 
                className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full opacity-10"
                style={{ backgroundColor: '#F5F0E6' }}
              />
              <View 
                className="absolute -top-2 -left-2 w-12 h-12 rounded-full opacity-10"
                style={{ backgroundColor: '#F5F0E6' }}
              />
            </View>
          </>
        )}

        {/* Other Recommendations */}
        {recommendations.length > 1 && (
          <>
            <Text style={styles.sectionTitle}>Otras excelentes opciones</Text>
            {recommendations.slice(1).map((wine, index) => (
              <View key={index} style={styles.regularWineCard}>
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
                      <Wine color="#3E2723" size={14} />
                      <Text style={styles.regularChipText}>{wine.wine_type}</Text>
                    </View>
                  )}
                  {wine.estimated_price && (
                    <View style={styles.regularChip}>
                      <DollarSign color="#3E2723" size={14} />
                      <Text style={styles.regularChipText}>{wine.estimated_price}</Text>
                    </View>
                  )}
                </View>
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