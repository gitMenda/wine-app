import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  const setQuery = (query: string) => {
    setSearchState(prev => ({ ...prev, query }));
  };

  const setResults = (results: Wine[]) => {
    setSearchState(prev => ({ ...prev, results }));
  };

  const setHasSearched = (hasSearched: boolean) => {
    setSearchState(prev => ({ ...prev, hasSearched }));
  };

  const setActiveFilters = (activeFilters: WineFilters) => {
    setSearchState(prev => ({ ...prev, activeFilters }));
  };

  const setCurrentPage = (currentPage: number) => {
    setSearchState(prev => ({ ...prev, currentPage }));
  };

  const setTotalPages = (totalPages: number) => {
    setSearchState(prev => ({ ...prev, totalPages }));
  };

  const setHasNext = (hasNext: boolean) => {
    setSearchState(prev => ({ ...prev, hasNext }));
  };

  const setHasPrevious = (hasPrevious: boolean) => {
    setSearchState(prev => ({ ...prev, hasPrevious }));
  };

  const setTotalResults = (totalResults: number) => {
    setSearchState(prev => ({ ...prev, totalResults }));
  };

  const setScrollPosition = (scrollPosition: number) => {
    setSearchState(prev => ({ ...prev, scrollPosition }));
  };

  const updateWineInResults = (wineId: number, updates: Partial<Wine>) => {
    setSearchState(prev => ({
      ...prev,
      results: prev.results.map(wine =>
        wine.wineId === wineId ? { ...wine, ...updates } : wine
      ),
    }));
  };

  const clearSearch = () => {
    setSearchState(initialState);
  };

  return (
    <SearchContext.Provider
      value={{
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
      }}
    >
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
