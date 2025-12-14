import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { apiClient } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { Search, Filter, X, ArrowLeft } from 'lucide-react-native';
import { toggleFavoriteApi, favoriteIconColor, favoriteIconName } from '@/lib/favorites';
import WineImage from "@/components/WineImage";
import FilterModal, { WineFilters } from '@/components/FilterModal';
import { useAuth } from '@/hooks/useAuth';
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";

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


  const renderItem = ({ item }: { item: Wine }) => (
    <View className="bg-[#F5F0E6] p-5 mx-4 mb-4 rounded-2xl shadow-lg">
      <TouchableOpacity onPress={() => router.push(`/wine/${item.wineId}`)}>
        {/* Badges */}
        {item.isFavorite && (
          <View className="bg-[#FFD54F] px-2 py-1 rounded-lg mb-2 self-start">
            <Text className="text-[#3E2723] text-xs font-bold">⭐ Favorito</Text>
          </View>
        )}

        {/* Wine Header */}
        <View className="flex-row justify-between items-start mb-3">
          <WineImage name={item.wineName} size={48} rounded className="mr-3" />
          <Text className="text-[#3E2723] text-lg font-bold flex-1 mr-2" numberOfLines={2}>
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
        <View className="flex-row flex-wrap gap-1.5 my-2">
          <View className="bg-[#F8D7DA] px-2.5 py-1.5 rounded-xl">
            <Text className="text-[#3E2723] text-xs font-medium">{item.winery}</Text>
          </View>
          <View className="bg-[#F8D7DA] px-2.5 py-1.5 rounded-xl">
            <Text className="text-[#3E2723] text-xs font-medium">{item.type}</Text>
          </View>
          {item.body && (
            <View className="bg-[#F8D7DA] px-2.5 py-1.5 rounded-xl">
              <Text className="text-[#3E2723] text-xs font-medium">{item.body}</Text>
            </View>
          )}
          <View className="bg-[#F8D7DA] px-2.5 py-1.5 rounded-xl">
            <Text className="text-[#3E2723] text-xs font-medium">{item.region}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Action Button */}
      <TouchableOpacity 
        className="bg-[#6B1E3A] py-3 px-4 rounded-lg mt-3"
        onPress={() => router.push(`/wine/${item.wineId}`)}
      >
        <Text className="text-[#F5F0E6] text-sm font-semibold text-center">
          ¿Lo conocés? Contanos tu experiencia
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderActiveFilters = () => {
    if (!hasActiveFilters()) return null;

    return (
      <View className="flex-row flex-wrap mb-4">
        {Object.entries(activeFilters).map(([key, value]) => {
          if (!value || value === '' || key === 'wine_name') return null;
          return (
            <View key={key} className="bg-[#6B1E3A] px-3 py-2 rounded-2xl mr-2 flex-row items-center">
              <Text className="text-[#F5F0E6] text-sm font-semibold mr-1">{value}</Text>
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
    <View className="flex-1">
      {/* Header */}
      <View className="pb-6 px-6">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft color="#CECCCD" size={24} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-text text-2xl font-bold">Catálogo de Vinos</Text>
          </View>
        </View>
      </View>

      <View className="px-4 py-4">
        {/* Search Bar and Filter */}
        <View className="flex-row items-center gap-3 mb-4">
          <View className="flex-1 rounded-3xl h-12 overflow-hidden border border-border">
            <LinearGradient
              colors={['#17030B', '#20040E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 flex-row items-center px-4"
              style={{ borderRadius: 24 }}
            >
              <Search color="#e6b3c4" size={16} />
              <TextInput
                className="flex-1 text-burgundy-100 text-md ml-2 py-0 h-full bg-transparent"
                placeholder="Buscar"
                placeholderTextColor="#e6b3c4"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => handleSearch()}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} className="ml-2">
                  <X color="#CECCCD" size={18} />
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
          <TouchableOpacity 
            onPress={() => setIsFilterModalVisible(true)}
            className="rounded-3xl h-12 w-12 overflow-hidden border border-border"
          >
            <LinearGradient
              colors={['#17030B', '#20040E']}
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
          <Text className="text-white text-2xl font-bold text-center mb-3">
            No encontramos vinos
          </Text>
          <Text className="text-gray-400 text-base text-center mb-6">
            Probá con otros términos de búsqueda o ajustá los filtros para explorar más opciones
          </Text>
          <TouchableOpacity 
            className="rounded-3xl overflow-hidden border border-primary"
            onPress={() => {
              setQuery('');
              setActiveFilters({});
              setResults([]);
              setHasSearched(false);
            }}
          >
            <LinearGradient
              colors={['#300615', '#45081E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-6 py-3 items-center"
              style={{ borderRadius: 16 }}
            >
              <Text className="text-white font-semibold">Limpiar búsqueda</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        // Initial State
        <View className="flex-1 justify-center items-center px-8">
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