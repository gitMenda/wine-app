import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { apiClient } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
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

  const renderItem = ({ item }: { item: Wine }) => (
    <View className="bg-gray-800 p-4 m-2 rounded-lg shadow-md border border-gray-600">
      <TouchableOpacity onPress={() => router.push(`/wine/${item.wineId}`)}>
        <View className="flex-row justify-between items-center mb-2">
          <WineImage name={item.wineName} size={48} rounded className="mr-3" />
          <Text className="text-xl font-bold text-white flex-1 mr-2" numberOfLines={2}>{item.wineName}</Text>
          <TouchableOpacity className="p-1" onPress={() => onToggleFavorite(item)}>
            <Ionicons
              name={favoriteIconName(!!item.isFavorite, togglingFavorites.has(item.wineId))}
              size={22}
              color={favoriteIconColor(!!item.isFavorite, togglingFavorites.has(item.wineId))}
            />
          </TouchableOpacity>
        </View>
        <Text className="text-gray-300 mb-1">Tipo: {item.type}</Text>
        <Text className="text-gray-300 mb-1">País: {item.country}</Text>
        <Text className="text-gray-300 mb-1">Región: {item.region}</Text>
        <Text className="text-gray-300">Bodega: {item.winery}</Text>
      </TouchableOpacity>
      <View className="mt-3" />
      <Button
        title="¿Probaste este vino?"
        variant="secondary"
        onPress={() => router.push(`/wine/${item.wineId}`)}
      />
    </View>
  );

  return (
    <View className="flex-1 p-4 pt-8 dark:bg-gray-900">
      <Text className="text-2xl font-bold mb-4 text-white">Buscar Vinos</Text>
      
      <View className="flex-row items-center mb-4">
        <TextInput
          className="border border-gray-600 p-2 flex-1 rounded bg-gray-800 text-white"
          placeholder="Ingresa el nombre del vino..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity 
          className="ml-2 p-2 bg-burgundy-600 rounded"
          onPress={() => handleSearch()}
        >
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {renderFiltersButton()}
      
      {loading && <Text className="mt-4 text-white">Cargando...</Text>}
      
      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.wineId.toString()}
          renderItem={renderItem}
          className="mt-2"
        />
      ) : (
        !loading && query && (
          <View className="flex-1 justify-center items-center">
            <Text className="text-white text-lg">No se encontraron resultados</Text>
          </View>
        )
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