import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { apiClient } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { Filter, X } from 'lucide-react-native';
import { toggleFavoriteApi, favoriteIconColor, favoriteIconName } from '@/lib/favorites';
import WineImage from "@/components/WineImage";
import FilterModal, { WineFilters } from '@/components/FilterModal';
import { useAuth } from '@/hooks/useAuth';

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
        backgroundColor: '#000000', // Black background like home
    },
    header: {
        backgroundColor: '#F8D7DA', // Rosé Blush header
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    headerTitle: {
        color: '#3E2723', // Barrel Brown
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: '#6B1E3A', // Malbec Plum
        marginTop: 4,
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
    },
    loadingText: {
        color: '#F5F0E6', // Cork Beige
        marginTop: 16,
        fontSize: 16,
    },
    wineCard: {
        backgroundColor: '#F5F0E6', // Cork Beige cards
        padding: 20,
        margin: 8,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    wineTitle: {
        color: '#3E2723', // Barrel Brown
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },
    wineDetail: {
        color: '#3E2723', // Barrel Brown
        opacity: 0.7,
        marginBottom: 4,
        fontSize: 14,
    },
    errorContainer: {
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#D32F2F', // Garnacha Red for errors
        marginBottom: 16,
        textAlign: 'center',
        fontSize: 16,
    },
    heroCard: {
        backgroundColor: '#6B1E3A', // Malbec Plum like home screen
        padding: 24,
        margin: 8,
        borderRadius: 24,
        minHeight: 200,
        borderWidth: 2,
        borderColor: '#8B2E4A', // Darker border
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    heroWineTitle: {
        color: '#F5F0E6', // Cork Beige on dark background
        fontSize: 22,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
        textAlign: 'center',
    },
    heroWineDetail: {
        color: '#F8D7DA', // Rosé Blush for subtitles
        opacity: 1,
        marginBottom: 4,
        fontSize: 16,
        textAlign: 'center',
    },
    heroCompatibilityLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F5F0E6', // Cork Beige on dark
        marginBottom: 6,
        textAlign: 'center',
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
        borderColor: '#F5F0E6', // Cork Beige border on dark background
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
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
    compatibilityLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3E2723',
        marginBottom: 4,
    },
    wineChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginVertical: 8,
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
    filterChip: {
        backgroundColor: '#6B1E3A',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
        marginBottom: 8,
    },
    filterChipText: {
        color: '#F5F0E6',
        fontSize: 14,
        fontWeight: '500',
        marginRight: 4,
    },
});

export default function RecommendationsPage() {
  const { user } = useAuth();
  const userId = user?.id || user?.sub;
  const [results, setResults] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingFavorites, setTogglingFavorites] = useState<Set<number>>(new Set());
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  
  // Estados para filtros
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<RecommendationFilters>({});

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
      const recs = (data?.recommendations ?? []) as any[];
      const normalized: Wine[] = recs.map((w: any) => ({
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
        score: typeof w.score === 'number' ? Math.max(0, Math.min(1, w.score)) : undefined,
      }));
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

    return (
      <View className="flex-row flex-wrap mb-4">
        {Object.entries(activeFilters).map(([key, value]) => {
          if (!value || value === '' || key === 'wine_name') return null;
          return (
            <View key={key} style={styles.filterChip}>
              <Text style={styles.filterChipText}>{value}</Text>
              <TouchableOpacity onPress={() => {
                const newFilters = { ...activeFilters };
                delete newFilters[key as keyof RecommendationFilters];
                setActiveFilters(newFilters);
                fetchRecommendations(newFilters);
              }}>
                <X color="#F5F0E6" size={16} />
              </TouchableOpacity>
            </View>
          );
        })}
        <TouchableOpacity 
          className="ml-2 px-3 py-1 bg-red-600 rounded-full"
          onPress={clearFilters}
        >
          <Text className="text-white text-xs font-semibold">Limpiar todo</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getCompatibilityLevel = (score?: number) => {
    if (!score) return { level: 'Sin datos', color: '#9CA3AF', bgColor: '#F3F4F6' };
    if (score >= 0.8) return { level: 'Muy alta', color: '#059669', bgColor: '#ECFDF5' };
    if (score >= 0.6) return { level: 'Alta', color: '#0891B2', bgColor: '#F0F9FF' };
    if (score >= 0.4) return { level: 'Media', color: '#EA580C', bgColor: '#FFF7ED' };
    return { level: 'Baja', color: '#DC2626', bgColor: '#FEF2F2' };
  };

  const onToggleFavorite = async (wine: Wine) => {
    if (togglingFavorites.has(wine.wineId)) return;
    if (!userId) {
      Alert.alert('Sesión requerida', 'Debes iniciar sesión para gestionar favoritos.');
      return;
    }
    setTogglingFavorites(prev => new Set(prev).add(wine.wineId));
    const prevFav = !!wine.isFavorite;
    setResults(prev => prev.map(w => w.wineId === wine.wineId ? { ...w, isFavorite: !prevFav } : w));
    try {
      await toggleFavoriteApi(userId, wine.wineId, prevFav);
      Alert.alert('', prevFav ? 'Eliminado de favoritos' : 'Guardado en tus experiencias');
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar el favorito. Intenta nuevamente.');
      setResults(prev => prev.map(w => w.wineId === wine.wineId ? { ...w, isFavorite: prevFav } : w));
    } finally {
      setTogglingFavorites(prev => {
        const ns = new Set(prev);
        ns.delete(wine.wineId);
        return ns;
      });
    }
  };

  const renderItem = ({ item, index }: { item: Wine; index: number }) => {
    const isHeroCard = index === 0; // Only first recommendation as hero card
    const compatibility = getCompatibilityLevel(item.score);
    
    if (isHeroCard) {
      return (
        <View style={styles.heroCard}>
          {/* Wine Header */}
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

          {/* Compatibility Meter */}
          <View className="mb-4">
            <Text style={styles.heroCompatibilityLabel}>
              Compatibilidad: {compatibility.level}
            </Text>
            <View style={[styles.compatibilityBar, { backgroundColor: 'rgba(245, 240, 230, 0.3)' }]}>
              <View 
                style={[
                  styles.compatibilityFill, 
                  { 
                    width: `${(item.score || 0) * 100}%`, 
                    backgroundColor: '#FFD54F' 
                  }
                ]} 
              />
            </View>
          </View>

          {/* Wine Details Chips */}
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

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.heroPrimaryAction}
              onPress={() => router.push(`/wine/${item.wineId}`)}
            >
              <Text style={[styles.actionText, { color: '#3E2723' }]}>Ver detalles</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.heroSecondaryAction}
              onPress={() => Alert.alert('', 'Vamos a mostrarte menos vinos similares')}
            >
              <Text style={[styles.actionText, { color: '#F5F0E6' }]}>Menos como este</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Regular card for items beyond top 3
    return (
      <View style={styles.wineCard}>
        {/* Wine Header */}
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

        {/* Compatibility Meter */}
        <View className="mb-3">
          <Text style={styles.compatibilityLabel}>
            Compatibilidad: {compatibility.level}
          </Text>
          <View style={styles.compatibilityBar}>
            <View 
              style={[
                styles.compatibilityFill, 
                { 
                  width: `${(item.score || 0) * 100}%`, 
                  backgroundColor: compatibility.color 
                }
              ]} 
            />
          </View>
        </View>

        {/* Wine Details Chips */}
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

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryAction}
            onPress={() => router.push(`/wine/${item.wineId}`)}
          >
            <Text style={[styles.actionText, { color: '#F5F0E6' }]}>Ver detalles</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryAction}
            onPress={() => Alert.alert('', 'Vamos a mostrarte menos vinos similares')}
          >
            <Text style={[styles.actionText, { color: '#6B1E3A' }]}>Menos como este</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

    if (loading) {
        return (
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Sugerencias</Text>
                    <Text style={styles.headerSubtitle}>Encontrando los mejores vinos para vos...</Text>
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
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tus recomendaciones</Text>
                <Text style={styles.headerSubtitle}>
                    Vinos seleccionados según tus gustos. Ajustá tus preferencias para mejorar los resultados.
                </Text>
            </View>
            
            {/* Content */}
            <View className="flex-1 px-4 py-4">
                {/* Filter Button */}
                <TouchableOpacity 
                  className="flex-row items-center justify-center py-3 px-4 rounded-xl mb-4"
                  style={{ backgroundColor: hasActiveFilters() ? '#6B1E3A' : '#F5F0E6' }}
                  onPress={() => setIsFilterModalVisible(true)}
                >
                  <Filter 
                    color={hasActiveFilters() ? '#F5F0E6' : '#6B1E3A'} 
                    size={18} 
                  />
                  <Text 
                    className="ml-2 font-semibold"
                    style={{ color: hasActiveFilters() ? '#F5F0E6' : '#6B1E3A' }}
                  >
                    {hasActiveFilters() ? `Filtros (${Object.values(activeFilters).filter(v => v !== undefined && v !== '').length})` : 'Filtrar recomendaciones'}
                  </Text>
                </TouchableOpacity>

                {/* Active Filters Chips */}
                {renderActiveFilters()}

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
                        data={showAllRecommendations ? results : results.slice(0, 3)}
                        keyExtractor={(item) => item.wineId.toString()}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            <View className="mb-4">
                                <Text style={[styles.wineDetail, { fontSize: 16, marginBottom: 8 }]}>
                                    {showAllRecommendations ? results.length : Math.min(3, results.length)} de {results.length} recomendaciones
                                    {hasActiveFilters() && (
                                      <Text style={{ color: '#6B1E3A' }}> (filtradas)</Text>
                                    )}
                                </Text>
                            </View>
                        }
                        ListFooterComponent={
                          !showAllRecommendations && results.length > 3 ? (
                            <View className="mt-6 mb-4">
                              <TouchableOpacity 
                                style={styles.primaryAction}
                                onPress={() => setShowAllRecommendations(true)}
                              >
                                <Text style={[styles.actionText, { color: '#F5F0E6' }]}>
                                  Ver más recomendaciones ({results.length - 3} restantes)
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ) : null
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
        </View>
    );
}
