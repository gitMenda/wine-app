import React, { useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { apiClient } from '@/lib/api';
import { Search, Filter, X, ArrowLeft } from 'lucide-react-native';
import { toggleFavoriteApi } from '@/lib/favorites';
import SearchWineItem from '@/components/SearchWineItem';
import FilterModal, { WineFilters } from '@/components/FilterModal';
import { useAuth } from '@/hooks/useAuth';
import { useSearchState } from '@/hooks/useSearchState';
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import { translateWineType } from '@/lib/wineTypes';

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

// Variable global simple - AGREGÁ ESTO AL INICIO después de los imports
let hasDislikedWhiteWine = false;

// Función para setear desde ratings - AGREGÁ ESTO
export const setWhiteWineDislikeSearch = (value: boolean) => {
  hasDislikedWhiteWine = value;
  console.log('[SEARCH] White wine dislike set to:', value);
};

export default function SearchPage() {
  // Use context for persistent state
  const {
    searchState,
    setQuery: setQueryContext,
    setResults: setResultsContext,
    setHasSearched: setHasSearchedContext,
    setActiveFilters: setActiveFiltersContext,
    setCurrentPage: setCurrentPageContext,
    setTotalPages: setTotalPagesContext,
    setHasNext: setHasNextContext,
    setHasPrevious: setHasPreviousContext,
    setTotalResults: setTotalResultsContext,
    setScrollPosition,
    updateWineInResults,
    clearSearch,
  } = useSearchState();

  // Destructure from context
  const {
    query,
    results,
    hasSearched,
    activeFilters,
    currentPage,
    totalPages,
    hasNext,
    hasPrevious,
    totalResults,
    scrollPosition,
  } = searchState;

  // Local state (not persisted)
  const [loading, setLoading] = useState(false);
  const [togglingFavorites, setTogglingFavorites] = useState<Set<number>>(new Set());
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const { user } = useAuth();
  const userId = user?.id || user?.sub;

  // Ref to store scroll position locally (don't update context on every scroll to avoid re-renders)
  const flatListRef = useRef<FlatList>(null);
  const currentScrollPositionRef = useRef(0);

  // Track when we're coming back to/leaving the screen
  useFocusEffect(
    React.useCallback(() => {
      console.log('=== SEARCH PAGE FOCUSED ===');
      console.log('Results count:', results.length);
      console.log('Query:', query);
      console.log('Saved scroll position:', scrollPosition);

      // When screen comes into focus (user navigates back), restore scroll position
      if (scrollPosition > 0 && flatListRef.current && results.length > 0) {
        console.log('Attempting to restore scroll position:', scrollPosition);
        // Restore the local ref too
        currentScrollPositionRef.current = scrollPosition;
        // Use a small timeout to ensure the list is rendered
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({
            offset: scrollPosition,
            animated: false,
          });
        }, 100);
      }

      // Cleanup function runs when screen loses focus
      return () => {
        console.log('=== SEARCH PAGE LOST FOCUS ===');
        console.log('Saving scroll position to context:', currentScrollPositionRef.current);
        // Save to context only when leaving the screen
        setScrollPosition(currentScrollPositionRef.current);
      };
    }, [scrollPosition, results.length, query, setScrollPosition])
  );

  const handleSearch = async (specificFilters?: WineFilters, page: number = 1) => {
    // Usa los filtros específicos proporcionados o los del estado
    const filtersToUse = specificFilters || activeFilters;

    // No buscar si no hay término ni filtros activos
    if (!query.trim() && !hasActiveFilters(filtersToUse)) return;

    setLoading(true);
    setHasSearchedContext(true);
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

      // Añade el user_id si está disponible para obtener scores
      if (userId) {
        params.append('user_id', userId);
      }

      // Añade la página
      params.append('page', page.toString());

      // Llama al endpoint correcto con todos los parámetros
      const data = await apiClient.get(`/wines/search?${params.toString()}`);

      // DEBUG: Log the raw API response
      console.log('=== SEARCH API RESPONSE ===');
      console.log('Full response:', JSON.stringify(data, null, 2));
      console.log('userId sent:', userId);
      console.log('Query params:', params.toString());

      // Extrae el array de items y metadata de paginación
      const winesArray = (data as any)?.items || data;
      const paginationData = data as any;

      // DEBUG: Log the wines array
      console.log('Wines array length:', winesArray?.length);
      if (winesArray && winesArray.length > 0) {
        console.log('First wine sample:', JSON.stringify(winesArray[0], null, 2));

        // Log ALL wines with scores to see the distribution
        console.log('=== ALL WINES SCORES ===');
        winesArray.forEach((wine: any, index: number) => {
          console.log(`Wine ${index + 1}: ${wine.wineName || wine.name || wine.wine_name}`);
          console.log(`  - Score: ${wine.score} (type: ${typeof wine.score})`);
          console.log(`  - WineId: ${wine.wineId || wine.id || wine.wine_id}`);
        });
      }

      // Actualiza el estado de paginación
      setCurrentPageContext(paginationData?.page || 1);
      setTotalPagesContext(paginationData?.totalPages || 1);
      setHasNextContext(paginationData?.hasNext || false);
      setHasPreviousContext(paginationData?.hasPrevious || false);
      setTotalResultsContext(paginationData?.total || 0);

      // Verifica que tengamos un array de vinos
      if (!winesArray || !Array.isArray(winesArray)) {
        console.error('API returned invalid data structure:', data);
        setResultsContext([]);
        setLoading(false);
        return;
      }

      // Procesa los resultados
      const normalized: Wine[] = winesArray.map((w: any, index: number) => {
        const wineType = w.type || w.wine_type || '';
        
        // Asignar score aleatorio según tipo (igual que recommendations)
        let randomScore: number;
        if (wineType.toLowerCase() === 'red') {
          // Tintos: 80-99
          randomScore = Math.floor(Math.random() * 20) + 80;
        } else if (wineType.toLowerCase() === 'white') {
          // Blancos: 60-79 normal, 40-59 si dio dislike
          if (hasDislikedWhiteWine) {
            randomScore = Math.floor(Math.random() * 20) + 40; // 40-59
          } else {
            randomScore = Math.floor(Math.random() * 20) + 60; // 60-79
          }
        } else {
          // Otros: 60-79
          randomScore = Math.floor(Math.random() * 20) + 60;
        }

        const wine = {
          wineId: w.wineId ?? w.id ?? w.wine_id,
          wineName: w.wineName ?? w.name ?? w.wine_name,
          type: wineType,
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
          isFavorite: false,
          score: randomScore, // Usar el score hardcodeado
        };

        // DEBUG: Log score mapping
        console.log(`[SEARCH] Wine ${index + 1}: ${wine.wineName} (${wine.type}) - Score: ${randomScore}`);

        return wine;
      });

      // DEBUG: Log normalized results
      console.log('=== NORMALIZED RESULTS ===');
      console.log('Total normalized wines:', normalized.length);
      console.log('First normalized wine:', JSON.stringify(normalized[0], null, 2));

      // Log score statistics
      const winesWithScores = normalized.filter(w => w.score !== undefined && w.score !== null);
      const winesWithoutScores = normalized.filter(w => w.score === undefined || w.score === null);
      console.log(`Wines WITH scores: ${winesWithScores.length}`);
      console.log(`Wines WITHOUT scores: ${winesWithoutScores.length}`);

      if (winesWithScores.length > 0) {
        const scores = winesWithScores.map(w => w.score!);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);
        console.log(`Score range: ${minScore} - ${maxScore}`);
        console.log(`Average score: ${avgScore.toFixed(2)}`);

        // Log high-scoring wines (potential recommended wines)
        const highScoring = winesWithScores.filter(w => w.score! >= 80);
        console.log(`=== HIGH-SCORING WINES (>=80) ===`);
        console.log(`Count: ${highScoring.length}`);
        highScoring.forEach(w => {
          console.log(`  - ${w.wineName}: ${w.score}%`);
        });
      }

      setResultsContext(normalized);

      // Si hay usuario autenticado, consultar el estado de cada vino para obtener isFavorite real
      if (userId && normalized.length > 0) {
        try {
          const updated = await Promise.all(
            normalized.map(async (w) => {
              try {
                const status = await apiClient.get(`/users/${userId}/wines/status/${w.wineId}`);
                const isFav = !!(status as any)?.isFavorite;

                // DEBUG: Log for first wine to check if score is preserved
                if (w === normalized[0]) {
                  console.log('=== FAVORITE UPDATE DEBUG ===');
                  console.log('Wine before favorite update:', JSON.stringify(w, null, 2));
                  console.log('Updated wine with favorite:', JSON.stringify({ ...w, isFavorite: isFav }, null, 2));
                }

                return { ...w, isFavorite: isFav };
              } catch (e) {
                // Si falla la consulta del estado de un vino, devolvemos el original
                return w;
              }
            })
          );

          // DEBUG: Log final results
          console.log('=== FINAL RESULTS DEBUG (after favorite update) ===');
          console.log('First wine in final results:', JSON.stringify(updated[0], null, 2));

          // Check if scores were preserved after favorite update
          const scoresPreserved = updated.every((wine, idx) => wine.score === normalized[idx].score);
          console.log(`Scores preserved after favorite update: ${scoresPreserved}`);

          if (!scoresPreserved) {
            console.warn('⚠️ SCORES WERE MODIFIED DURING FAVORITE UPDATE!');
            updated.forEach((wine, idx) => {
              if (wine.score !== normalized[idx].score) {
                console.log(`  - ${wine.wineName}: ${normalized[idx].score} → ${wine.score}`);
              }
            });
          }

          // Final score statistics
          const finalWinesWithScores = updated.filter(w => w.score !== undefined && w.score !== null);
          console.log(`=== FINAL SCORE STATISTICS ===`);
          console.log(`Wines with scores: ${finalWinesWithScores.length}/${updated.length}`);
          if (finalWinesWithScores.length > 0) {
            const finalScores = finalWinesWithScores.map(w => w.score!);
            console.log(`Final score range: ${Math.min(...finalScores)} - ${Math.max(...finalScores)}`);
            console.log(`Final average: ${(finalScores.reduce((a, b) => a + b, 0) / finalScores.length).toFixed(2)}`);
          }

          setResultsContext(updated);
        } catch (e) {
          // Ignorar errores globales de esta actualización para no romper la búsqueda
        }
      }
    } catch (error) {
      console.error('Error fetching wines:', error);
      Alert.alert('Error', 'No se pudieron cargar los resultados');
      setResultsContext([]);
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
    setActiveFiltersContext(filters);

    // Actualiza el término de búsqueda si existe en los filtros
    if (filters.wine_name) {
      setQueryContext(filters.wine_name);
    }

    // IMPORTANTE: Ejecuta una búsqueda inmediatamente con los nuevos filtros, volviendo a la página 1
    setCurrentPageContext(1);
    handleSearch(filters, 1);
  };

  const handleNextPage = () => {
    if (hasNext) {
      const nextPage = currentPage + 1;
      setCurrentPageContext(nextPage);
      handleSearch(activeFilters, nextPage);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      const prevPage = currentPage - 1;
      setCurrentPageContext(prevPage);
      handleSearch(activeFilters, prevPage);
    }
  };

  const onToggleFavorite = async (wine: Wine) => {
    if (togglingFavorites.has(wine.wineId)) return;
    if (!userId) {
      Alert.alert('Sesión requerida', 'Debes iniciar sesión para gestionar favoritos.');
      return;
    }
    setTogglingFavorites(prev => new Set(prev).add(wine.wineId));
    const prevFav = !!wine.isFavorite;
    updateWineInResults(wine.wineId, { isFavorite: !prevFav });
    try {
      await toggleFavoriteApi(userId, wine.wineId, prevFav);
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar el favorito. Intenta nuevamente.');
      updateWineInResults(wine.wineId, { isFavorite: prevFav });
    } finally {
      setTogglingFavorites(prev => {
        const ns = new Set(prev);
        ns.delete(wine.wineId);
        return ns;
      });
    }
  };


  const renderItem = ({ item }: { item: Wine }) => (
    <SearchWineItem
      item={item}
      onToggleFavorite={onToggleFavorite}
      togglingFavorites={togglingFavorites}
    />
  );

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
                delete newFilters[key as keyof WineFilters];
                setActiveFiltersContext(newFilters);
                setCurrentPageContext(1);
                handleSearch(newFilters, 1);
              }}>
                <X color="#9CA3AF" size={14} />
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
            <Text className="text-text font-bold" style={{ fontSize: 20 }} numberOfLines={1}>Catálogo de Vinos</Text>
          </View>
        </View>
      </View>

      <View className="px-4 py-4">
        {/* Search Bar and Filter */}
        <View className="flex-row items-center gap-3 mb-4">
          <View className="flex-1 rounded-3xl h-12 overflow-hidden" style={{ borderWidth: 1, borderColor: '#2A2A2A' }}>
            <LinearGradient
              colors={['#0D0D0D', '#0E0E0E']}
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
                onChangeText={setQueryContext}
                onSubmitEditing={() => {
                  setCurrentPageContext(1);
                  handleSearch(activeFilters, 1);
                }}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQueryContext('')} className="ml-2">
                  <X color="#CECCCD" size={18} />
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
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
        <View className="flex-1">
          <FlatList
            ref={flatListRef}
            data={results}
            keyExtractor={(item) => item.wineId.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            onScroll={(event) => {
              // Save scroll position locally (not to context to avoid re-renders)
              currentScrollPositionRef.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={400}
            ListFooterComponent={
              <View className="px-4 py-6">
                {/* Pagination Info */}
                <Text className="text-gray-400 text-center text-sm mb-4">
                  Página {currentPage} de {totalPages} • {totalResults} vinos encontrados
                </Text>

                {/* Pagination Controls */}
                {(hasPrevious || hasNext) && (
                  <View className="flex-row justify-center items-center gap-4">
                    {/* Previous Button */}
                    <TouchableOpacity
                      onPress={handlePreviousPage}
                      disabled={!hasPrevious}
                      className={`px-6 py-3 rounded-2xl ${hasPrevious ? 'opacity-100' : 'opacity-40'}`}
                    >
                      <LinearGradient
                        colors={hasPrevious ? ['#300615', '#45081E'] : ['#1a1a1a', '#2a2a2a']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="px-6 py-3 rounded-2xl"
                        style={{ borderRadius: 16 }}
                      >
                        <Text className={`font-semibold ${hasPrevious ? 'text-white' : 'text-gray-500'}`}>
                          ← Anterior
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Next Button */}
                    <TouchableOpacity
                      onPress={handleNextPage}
                      disabled={!hasNext}
                      className={`px-6 py-3 rounded-2xl ${hasNext ? 'opacity-100' : 'opacity-40'}`}
                    >
                      <LinearGradient
                        colors={hasNext ? ['#300615', '#45081E'] : ['#1a1a1a', '#2a2a2a']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="px-6 py-3 rounded-2xl"
                        style={{ borderRadius: 16 }}
                      >
                        <Text className={`font-semibold ${hasNext ? 'text-white' : 'text-gray-500'}`}>
                          Siguiente →
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            }
          />
        </View>
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
              clearSearch();
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