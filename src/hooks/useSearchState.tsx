import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

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

interface WineFilters {
  wine_name?: string;
  wine_type?: string;
  winery?: string;
  country?: string;
  region?: string;
  min_abv?: number;
  max_abv?: number;
}

interface SearchState {
  query: string;
  results: Wine[];
  hasSearched: boolean;
  activeFilters: WineFilters;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  totalResults: number;
  scrollPosition: number;
}

interface SearchContextType {
  searchState: SearchState;
  setQuery: (query: string) => void;
  setResults: (results: Wine[]) => void;
  setHasSearched: (hasSearched: boolean) => void;
  setActiveFilters: (filters: WineFilters) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setHasNext: (hasNext: boolean) => void;
  setHasPrevious: (hasPrevious: boolean) => void;
  setTotalResults: (total: number) => void;
  setScrollPosition: (position: number) => void;
  updateWineInResults: (wineId: number, updates: Partial<Wine>) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const initialState: SearchState = {
  query: '',
  results: [],
  hasSearched: false,
  activeFilters: {},
  currentPage: 1,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
  totalResults: 0,
  scrollPosition: 0,
};

export function SearchStateProvider({ children }: { children: ReactNode }) {
  const [searchState, setSearchState] = useState<SearchState>(initialState);

  const setQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query }));
  }, []);

  const setResults = useCallback((results: Wine[]) => {
    setSearchState(prev => ({ ...prev, results }));
  }, []);

  const setHasSearched = useCallback((hasSearched: boolean) => {
    setSearchState(prev => ({ ...prev, hasSearched }));
  }, []);

  const setActiveFilters = useCallback((activeFilters: WineFilters) => {
    setSearchState(prev => ({ ...prev, activeFilters }));
  }, []);

  const setCurrentPage = useCallback((currentPage: number) => {
    setSearchState(prev => ({ ...prev, currentPage }));
  }, []);

  const setTotalPages = useCallback((totalPages: number) => {
    setSearchState(prev => ({ ...prev, totalPages }));
  }, []);

  const setHasNext = useCallback((hasNext: boolean) => {
    setSearchState(prev => ({ ...prev, hasNext }));
  }, []);

  const setHasPrevious = useCallback((hasPrevious: boolean) => {
    setSearchState(prev => ({ ...prev, hasPrevious }));
  }, []);

  const setTotalResults = useCallback((totalResults: number) => {
    setSearchState(prev => ({ ...prev, totalResults }));
  }, []);

  const setScrollPosition = useCallback((scrollPosition: number) => {
    setSearchState(prev => ({ ...prev, scrollPosition }));
  }, []);

  const updateWineInResults = useCallback((wineId: number, updates: Partial<Wine>) => {
    setSearchState(prev => ({
      ...prev,
      results: prev.results.map(wine =>
        wine.wineId === wineId ? { ...wine, ...updates } : wine
      ),
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchState(initialState);
  }, []);

  const value = useMemo(() => ({
    searchState,
    setQuery,
    setResults,
    setHasSearched,
    setActiveFilters,
    setCurrentPage,
    setTotalPages,
    setHasNext,
    setHasPrevious,
    setTotalResults,
    setScrollPosition,
    updateWineInResults,
    clearSearch,
  }), [
    searchState,
    setQuery,
    setResults,
    setHasSearched,
    setActiveFilters,
    setCurrentPage,
    setTotalPages,
    setHasNext,
    setHasPrevious,
    setTotalResults,
    setScrollPosition,
    updateWineInResults,
    clearSearch,
  ]);

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchState() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchState must be used within a SearchStateProvider');
  }
  return context;
}
