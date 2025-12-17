import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import Button from '@/components/Button';
import { apiClient } from '@/lib/api';
import { Filter, X, ArrowLeft } from 'lucide-react-native';
import { toggleFavoriteApi } from '@/lib/favorites';
import FilterModal, { WineFilters } from '@/components/FilterModal';
import { useAuth } from '@/hooks/useAuth';
import RecommendationItem from '@/components/RecommendationItem';
import { translateWineType } from '@/lib/wineTypes';
import Toast from '@/components/Toast';

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

interface RecommendationFilters {
  wine_name?: string;
  wine_type?: string;
  body?: string;
  dryness?: string;
  winery?: string;
  country?: string;
  region?: string;
  min_abv?: number;
  max_abv?: number;
}

const styles = StyleSheet.create({
    scoreText: {
        marginTop: 4,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#F5F0E6', // Cork Beige
        marginTop: 16,
        fontSize: 16,
    },
    wineTitle: {
        color: '#3E2723',
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },
    wineDetail: {
        color: '#3E2723',
        opacity: 0.7,
        marginBottom: 4,
        fontSize: 14,
    },
    errorContainer: {
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#D32F2F',
        marginBottom: 16,
        textAlign: 'center',
        fontSize: 16,
    },
    primaryAction: {
        backgroundColor: '#6B1E3A',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        flex: 1,
    },
    actionText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default function RecommendationsPage() {
  const { user } = useAuth();
  const userId = user?.id || user?.sub;
  const [results, setResults] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingFavorites, setTogglingFavorites] = useState<Set<number>>(new Set());

  // Estados para filtros
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<RecommendationFilters>({});

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const fetchRecommendations = async (filters: RecommendationFilters = {}) => {
    if (!userId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      // Parámetros obligatorios
      params.append('user_id', userId);
      params.append('limit', '10');
      params.append('use_cache', 'true');
      
      // Agregar filtros opcionales si existen
      if (filters.wine_type) params.append('wine_type', filters.wine_type);
      if (filters.body) params.append('body', filters.body);
      if (filters.dryness) params.append('dryness', filters.dryness);
      if (filters.min_abv !== undefined) params.append('abv', filters.min_abv.toString());
      if (filters.winery) params.append('winery', filters.winery);
      if (filters.country) params.append('country', filters.country);
      if (filters.region) params.append('region', filters.region);

      const data = await apiClient.get(`/users/recommendations?${params.toString()}`);

      // DEBUG: Log raw API response
      console.log('=== RECOMMENDATIONS API RESPONSE ===');
      console.log('Full response:', JSON.stringify(data, null, 2));
      console.log('userId:', userId);
      console.log('Query params:', params.toString());

      const recs = (data?.recommendations ?? []) as any[];

      // DEBUG: Log all recommendation scores from backend
      console.log('=== RAW RECOMMENDATION SCORES FROM BACKEND ===');
      console.log(`Total recommendations: ${recs.length}`);
      recs.forEach((w: any, index: number) => {
        console.log(`\nRecommendation ${index + 1}: ${w.wineName || w.name || w.wine_name}`);
        console.log(`  Raw score from backend: ${w.score} (type: ${typeof w.score})`);
        console.log(`  WineId: ${w.wineId || w.id || w.wine_id}`);
      });

      const normalized: Wine[] = recs.map((w: any, index: number) => {
        const rawScore = w.score;
        // Backend sends scores in 0-100 range, so just pass it through (no clamping to 0-1!)
        const normalizedScore = typeof w.score === 'number' ? w.score : undefined;

        // DEBUG: Log score transformation for each wine
        console.log(`\n=== SCORE TRANSFORMATION (Wine ${index + 1}) ===`);
        console.log(`Wine: ${w.wineName || w.name || w.wine_name}`);
        console.log(`Raw backend score: ${rawScore}`);
        console.log(`Normalized score (0-100): ${normalizedScore}`);
        console.log(`Score type: ${typeof normalizedScore}`);

        return {
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
          score: normalizedScore,
        };
      });

      // DEBUG: Log final normalized results
      console.log('\n=== NORMALIZED RECOMMENDATIONS ===');
      console.log(`Total: ${normalized.length}`);
      normalized.forEach((wine, index) => {
        console.log(`${index + 1}. ${wine.wineName}: score = ${wine.score}`);
      });

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
    fetchRecommendations(activeFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const hasActiveFilters = (filters = activeFilters) => {
    return Object.values(filters).some(value => 
      value !== undefined && value !== '' && value !== null
    );
  };

  const handleApplyFilters = (filters: RecommendationFilters) => {
    setActiveFilters(filters);
    fetchRecommendations(filters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    fetchRecommendations({});
  };

  const renderActiveFilters = () => {
    if (!hasActiveFilters()) return null;

    const getDisplayValue = (key: string, value: any): string => {
      if (key === 'wine_type') {
        return translateWineType(value) || value;
      }
      return value;
    };

    return (
      <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
        {Object.entries(activeFilters).map(([key, value]) => {
          if (!value || value === '' || key === 'wine_name') return null;
          return (
            <View
              key={key}
              style={{
                backgroundColor: 'rgba(42, 42, 42, 0.5)',
                borderWidth: 1,
                borderColor: '#2A2A2A',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#D1D5DB', fontSize: 13, fontWeight: '500', marginRight: 6 }}>
                {getDisplayValue(key, value)}
              </Text>
              <TouchableOpacity onPress={() => {
                const newFilters = { ...activeFilters };
                delete newFilters[key as keyof RecommendationFilters];
                setActiveFilters(newFilters);
                fetchRecommendations(newFilters);
              }}>
                <X color="#9CA3AF" size={14} />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };


  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const onToggleFavorite = async (wine: Wine) => {
    if (togglingFavorites.has(wine.wineId)) return;
    if (!userId) {
      showToast('Debes iniciar sesión para gestionar favoritos.', 'error');
      return;
    }
    setTogglingFavorites(prev => new Set(prev).add(wine.wineId));
    const prevFav = !!wine.isFavorite;
    setResults(prev => prev.map(w => w.wineId === wine.wineId ? { ...w, isFavorite: !prevFav } : w));
    try {
      await toggleFavoriteApi(userId, wine.wineId, prevFav);
      showToast(prevFav ? 'Eliminado de favoritos' : 'Guardado en tus experiencias', 'success');
    } catch (e) {
      showToast('No se pudo actualizar el favorito. Intenta nuevamente.', 'error');
      setResults(prev => prev.map(w => w.wineId === wine.wineId ? { ...w, isFavorite: prevFav } : w));
    } finally {
      setTogglingFavorites(prev => {
        const ns = new Set(prev);
        ns.delete(wine.wineId);
        return ns;
      });
    }
  };

  const renderItem = ({ item }: { item: Wine }) => {
    return (
      <RecommendationItem
        item={item}
        onToggleFavorite={onToggleFavorite}
        togglingFavorites={togglingFavorites}
        showToast={showToast}
      />
    );
  };

    if (loading) {
        return (
            <View className="flex-1" style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View className="flex-row justify-between items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <ArrowLeft color="#CECCCD" size={24} />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text style={styles.headerTitle} numberOfLines={1}>Sugerencias</Text>
                        </View>
                    </View>
                </View>

                {/* Loading State */}
                <View style={styles.loadingContainer}>
                    <View className="items-center">
                        <ActivityIndicator size="large" color="#6B1E3A" />
                        <Text style={styles.loadingText}>Analizando tus preferencias</Text>
                        <Text style={[styles.loadingText, { fontSize: 14, marginTop: 8, opacity: 0.7 }]}>
                            Esto puede tomar unos segundos...
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background" style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View className="flex-row justify-between items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft color="#CECCCD" size={24} />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text style={styles.headerTitle} numberOfLines={1}>Tus recomendaciones</Text>
                    </View>
                </View>
            </View>
            
            {/* Content */}
            <View className="flex-1 py-4">
                {/* Active Filters Chips */}
                <View className="px-4">
                  {renderActiveFilters()}
                </View>

                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <View className="space-y-2 w-full items-center">
                            <Button title="Reintentar" onPress={() => {
                                if (!userId) {
                                    Alert.alert('Sesión requerida', 'Debes iniciar sesión para ver recomendaciones.');
                                    return;
                                }
                                fetchRecommendations(activeFilters);
                            }} variant="primary" />
                            <Button title="Volver" variant="secondary" onPress={() => router.back()} />
                        </View>
                    </View>
                ) : results.length === 0 ? (
                    /* Empty State */
                    <View className="flex-1 justify-center items-center px-8">
                        <Text style={{ fontSize: 48, marginBottom: 16 }}>🍷</Text>
                        <Text style={styles.wineTitle}>
                          {hasActiveFilters() ? 'No hay recomendaciones con estos filtros.' : 'Aún no hay recomendaciones.'}
                        </Text>
                        <Text style={[styles.wineDetail, { textAlign: 'center', marginTop: 8, marginBottom: 24 }]}>
                          {hasActiveFilters() 
                            ? 'Probá ajustando los filtros para ver más opciones.'
                            : 'Completá tus gustos para obtener sugerencias personalizadas.'
                          }
                        </Text>
                        <View className="w-full space-y-3">
                          {hasActiveFilters() ? (
                            <Button title="Limpiar filtros" variant="primary" onPress={clearFilters} />
                          ) : (
                            <Button title="Editar gustos" variant="primary" onPress={() => router.push('/profile')} />
                          )}
                          <Button title="Explorar catálogo" variant="secondary" onPress={() => router.push('/search')} />
                        </View>
                    </View>
                ) : (
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.wineId.toString()}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            <View className="mb-4 flex-row justify-between items-center px-4">
                                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                                    {results.length} recomendaciones
                                    {hasActiveFilters() && (
                                      <Text style={{ color: '#6B1E3A' }}> (filtradas)</Text>
                                    )}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => setIsFilterModalVisible(true)}
                                  className="rounded-3xl h-12 w-12 overflow-hidden"
                                  style={{ borderWidth: 1, borderColor: '#2A2A2A' }}
                                >
                                  <LinearGradient
                                    colors={['#0D0D0D', '#0E0E0E']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    className="flex-1 items-center justify-center"
                                    style={{ borderRadius: 24 }}
                                  >
                                    <Filter
                                      color={hasActiveFilters() ? "#AA9D15" : "#e6b3c4"}
                                      size={18}
                                    />
                                  </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                )}
            </View>
            
            <FilterModal
              visible={isFilterModalVisible}
              onClose={() => setIsFilterModalVisible(false)}
              onApplyFilters={handleApplyFilters}
              initialFilters={activeFilters}
            />

            {/* Toast Notification */}
            <Toast
              message={toastMessage}
              type={toastType}
              visible={toastVisible}
              onHide={() => setToastVisible(false)}
            />
        </View>
    );
}
