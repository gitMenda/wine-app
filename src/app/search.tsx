import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiClient } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { Search, Filter, X } from 'lucide-react-native';
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
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [togglingFavorites, setTogglingFavorites] = useState<Set<number>>(new Set());
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<WineFilters>({});
  const { user } = useAuth();
  const userId = user?.id || user?.sub;

  const handleSearch = async (specificFilters?: WineFilters) => {
    // Usa los filtros específicos proporcionados o los del estado
    const filtersToUse = specificFilters || activeFilters;
    
    // No buscar si no hay término ni filtros activos
    if (!query.trim() && !hasActiveFilters(filtersToUse)) return;
    
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      
      // Añade el término de búsqueda
      if (query.trim()) {
        params.append('wine_name', query);
      }
      
      // Añade todos los filtros activos
      if (filtersToUse.wine_type) params.append('wine_type', filtersToUse.wine_type);
      if (filtersToUse.winery) params.append('winery', filtersToUse.winery);
      if (filtersToUse.country) params.append('country', filtersToUse.country);
      if (filtersToUse.region) params.append('region', filtersToUse.region);
      if (filtersToUse.min_abv !== undefined) params.append('min_abv', filtersToUse.min_abv.toString());
      if (filtersToUse.max_abv !== undefined) params.append('max_abv', filtersToUse.max_abv.toString());

      // Llama al endpoint correcto con todos los parámetros
      const data = await apiClient.get(`/wines/search?${params.toString()}`);
      
      // Procesa los resultados
      const normalized: Wine[] = (data as any[]).map((w: any) => ({
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
        // Por defecto, asumir no favorito. Luego lo confirmamos con el endpoint de status si hay sesión.
        isFavorite: false,
      }));
      setResults(normalized);

      // Si hay usuario autenticado, consultar el estado de cada vino para obtener isFavorite real
      if (userId && normalized.length > 0) {
        try {
          const updated = await Promise.all(
            normalized.map(async (w) => {
              try {
                const status = await apiClient.get(`/users/${userId}/wines/status/${w.wineId}`);
                const isFav = !!(status as any)?.isFavorite;
                return { ...w, isFavorite: isFav };
              } catch (e) {
                // Si falla la consulta del estado de un vino, devolvemos el original
                return w;
              }
            })
          );
          setResults(updated);
        } catch (e) {
          // Ignorar errores globales de esta actualización para no romper la búsqueda
        }
      }
    } catch (error) {
      console.error('Error fetching wines:', error);
      Alert.alert('Error', 'No se pudieron cargar los resultados');
      setResults([]);
    }
    setLoading(false);
  };

  const hasActiveFilters = (filters = activeFilters) => {
    return Object.values(filters).some(value => 
      value !== undefined && value !== '' && value !== null
    );
  };

  const handleApplyFilters = (filters: WineFilters) => {
    // Actualiza los filtros en el estado
    setActiveFilters(filters);
    
    // Actualiza el término de búsqueda si existe en los filtros
    if (filters.wine_name) {
      setQuery(filters.wine_name);
    }
    
    // IMPORTANTE: Ejecuta una búsqueda inmediatamente con los nuevos filtros
    handleSearch(filters);
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

  const renderFiltersButton = () => (
    <TouchableOpacity 
      className={`flex-row items-center ${hasActiveFilters() ? 'bg-burgundy-600' : 'bg-gray-700'} px-3 py-2 rounded-md mb-4`}
      onPress={() => setIsFilterModalVisible(true)}
    >
      <Ionicons name="filter" size={18} color="white" />
      <Text className="text-white ml-1">
        {hasActiveFilters() ? 'Filtros activos' : 'Filtros'}
      </Text>
      {hasActiveFilters() && (
        <View className="bg-white rounded-full w-5 h-5 ml-2 flex items-center justify-center">
          <Text className="text-burgundy-600 text-xs font-bold">
            {Object.values(activeFilters).filter(v => v !== undefined && v !== '').length}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

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
    searchContainer: {
      backgroundColor: '#F5F0E6',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      color: '#3E2723',
      fontSize: 16,
      marginLeft: 8,
    },
    wineCard: {
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
    wineName: {
      color: '#3E2723',
      fontSize: 18,
      fontWeight: 'bold',
      flex: 1,
      marginRight: 8,
    },
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginVertical: 8,
    },
    chip: {
      backgroundColor: '#F8D7DA',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    chipText: {
      color: '#3E2723',
      fontSize: 12,
      fontWeight: '500',
    },
    badge: {
      backgroundColor: '#FFD54F',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      marginBottom: 8,
      alignSelf: 'flex-start',
    },
    badgeText: {
      color: '#3E2723',
      fontSize: 11,
      fontWeight: 'bold',
    },
    actionButton: {
      backgroundColor: '#6B1E3A',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      marginTop: 12,
    },
    actionButtonText: {
      color: '#F5F0E6',
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
    },
    filterChip: {
      backgroundColor: '#6B1E3A',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    filterChipText: {
      color: '#F5F0E6',
      fontSize: 13,
      fontWeight: '600',
      marginRight: 4,
    },
  });

  const renderItem = ({ item }: { item: Wine }) => (
    <View style={styles.wineCard}>
      <TouchableOpacity onPress={() => router.push(`/wine/${item.wineId}`)}>
        {/* Badges */}
        {item.isFavorite && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>⭐ Favorito</Text>
          </View>
        )}

        {/* Wine Header */}
        <View className="flex-row justify-between items-start mb-3">
          <WineImage name={item.wineName} size={48} rounded className="mr-3" />
          <Text style={styles.wineName} numberOfLines={2}>
            {item.wineName}
          </Text>
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

        {/* Wine Details Chips */}
        <View style={styles.chipsContainer}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item.winery}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item.type}</Text>
          </View>
          {item.body && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{item.body}</Text>
            </View>
          )}
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item.region}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Action Button */}
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => router.push(`/wine/${item.wineId}`)}
      >
        <Text style={styles.actionButtonText}>
          ¿Lo conocés? Contanos tu experiencia
        </Text>
      </TouchableOpacity>
    </View>
  );

  const { top } = useSafeAreaInsets();

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
                delete newFilters[key as keyof WineFilters];
                setActiveFilters(newFilters);
                handleSearch(newFilters);
              }}>
                <X color="#F5F0E6" size={16} />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: top }]}>
        <Text style={styles.headerTitle}>Catálogo de Vinos</Text>
        <Text style={{ color: '#6B1E3A', marginTop: 4, fontSize: 14 }}>
          Explorá, filtrá y encontrá tu próximo favorito
        </Text>
      </View>

      <View className="px-4 py-4">
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#6B1E3A" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscá por nombre, estilo o región…"
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X color="#6B1E3A" size={20} />
            </TouchableOpacity>
          )}
        </View>

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
            {hasActiveFilters() ? `Filtros (${Object.values(activeFilters).filter(v => v !== undefined && v !== '').length})` : 'Filtros avanzados'}
          </Text>
        </TouchableOpacity>

        {/* Active Filters Chips */}
        {renderActiveFilters()}
      </View>
      
      {/* Results */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6B1E3A" />
          <Text className="text-white text-lg mt-4">Buscando vinos...</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 8 }}>
            Esto puede tomar unos segundos
          </Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.wineId.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      ) : hasSearched ? (
        // Empty State with illustration - only show after a search has been performed
        <View className="flex-1 justify-center items-center px-8">
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🍷</Text>
          <Text className="text-white text-2xl font-bold text-center mb-3">
            No encontramos vinos
          </Text>
          <Text className="text-gray-400 text-base text-center mb-6">
            Probá con otros términos de búsqueda o ajustá los filtros para explorar más opciones
          </Text>
          <TouchableOpacity 
            className="px-6 py-3 rounded-xl"
            style={{ backgroundColor: '#6B1E3A' }}
            onPress={() => {
              setQuery('');
              setActiveFilters({});
              setResults([]);
              setHasSearched(false);
            }}
          >
            <Text className="text-white font-semibold">Limpiar búsqueda</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Initial State
        <View className="flex-1 justify-center items-center px-8">
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🔍</Text>
          <Text className="text-white text-2xl font-bold text-center mb-3">
            Comenzá tu búsqueda
          </Text>
          <Text className="text-gray-400 text-base text-center">
            Usá la barra de búsqueda o los filtros para encontrar el vino perfecto
          </Text>
        </View>
      )}
      
      <FilterModal 
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={{...activeFilters, wine_name: query}}
      />
    </View>
  );
}