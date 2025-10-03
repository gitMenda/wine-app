import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

// Tipos actualizados según la estructura de la base de datos
export interface PreferenceCategory {
  id: number;
  name: string;
  description: string;
}

export interface PreferenceOption {
  id: number;
  option: string;
  description: string;
  value: number;
  category: PreferenceCategory;
}

export interface OnboardingData {
  experienceLevel: string;
  preferredTypes: string[];
  budget: string;
  occasions: string[];
  tastingNotes: string[];
  learningGoals: string[];
  selectedOptionIds: number[];
}

interface OnboardingContextType {
  isCompleted: boolean;
  data: OnboardingData;
  loading: boolean;
  loadingOptions: boolean;
  apiOptions: PreferenceOption[];
  getOptionsForCategory: (categoryName: string) => PreferenceOption[];
  isOptionSelected: (optionId: number) => boolean;
  toggleOptionSelection: (optionId: number) => void;
  completeOnboarding: (onboardingData: Omit<OnboardingData, 'selectedOptionIds'>) => Promise<boolean>;
  updateExperienceLevel: (level: string) => void;
  updatePreferredTypes: (types: string[]) => void;
  updateBudget: (budget: string) => void;
  updateOccasions: (occasions: string[]) => void;
  updateTastingNotes: (notes: string[]) => void;
  updateLearningGoals: (goals: string[]) => void;
}

const initialData: OnboardingData = {
  experienceLevel: '',
  preferredTypes: [],
  budget: '',
  occasions: [],
  tastingNotes: [],
  learningGoals: [],
  selectedOptionIds: []
};

// Hacemos el contexto persistente durante toda la aplicación
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Variable para almacenar los datos entre rerenders
let persistentData = {
  ...initialData
};

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  // Inicializar estado con datos persistentes
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [data, setData] = useState<OnboardingData>(persistentData);
  const [apiOptions, setApiOptions] = useState<PreferenceOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // ID de usuario fijo para las llamadas a la API
  const HARDCODED_USER_ID = "23847412-8ab0-46fc-81b1-81b4193227e6";

  useEffect(() => {
    loadOptionsFromAPI();
  }, []);

  const loadOptionsFromAPI = async () => {
    if (apiOptions.length > 0) return; // No cargar si ya tenemos opciones

    setLoadingOptions(true);
    try {
      const options = await apiClient.get('/preferences/options');
      console.log('API response received with', options.length, 'options');
      setApiOptions(options);
    } catch (error) {
      console.error('Error loading preference options:', error);
      setTimeout(() => loadOptionsFromAPI(), 3000);
    } finally {
      setLoadingOptions(false);
    }
  };

  // Obtener opciones filtradas por categoría
  const getOptionsForCategory = (categoryName: string): PreferenceOption[] => {
    return apiOptions.filter(option => 
      option.category && option.category.name === categoryName
    );
  };

  // Comprobar si una opción está seleccionada
  const isOptionSelected = (optionId: number): boolean => {
    return persistentData.selectedOptionIds.includes(optionId);
  };

  // Seleccionar o deseleccionar una opción de API
  const toggleOptionSelection = (optionId: number): void => {
    console.log('Toggle option:', optionId);
    
    const currentSelected = [...persistentData.selectedOptionIds];
    const index = currentSelected.indexOf(optionId);
    
    if (index >= 0) {
      currentSelected.splice(index, 1);
    } else {
      currentSelected.push(optionId);
    }
    
    console.log('Updated selections:', currentSelected);
    
    // Actualizar tanto el estado como la variable persistente
    persistentData = {
      ...persistentData,
      selectedOptionIds: currentSelected
    };
    
    setData(persistentData);
  };

  const completeOnboarding = async (onboardingData: Omit<OnboardingData, 'selectedOptionIds'>) => {
    setLoading(true);
    try {
      // Actualizar datos persistentes
      persistentData = {
        ...persistentData,
        ...onboardingData
      };

      // Verificar selecciones
      if (persistentData.selectedOptionIds.length === 0) {
        throw new Error('Por favor selecciona al menos una opción en cada categoría');
      }

      const payload = {
        option_ids: persistentData.selectedOptionIds
      };
      
      console.log('Sending onboarding data to API:', payload);
      
      // URL para la petición
      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/preferences/users/${HARDCODED_USER_ID}/onboarding`;
      
      // Usar fetch directamente para tener control total sobre el formato
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', response.status, errorText);
        throw new Error(`Error de API: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('API response success:', responseData);
      
      setIsCompleted(true);
      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Funciones para actualizar datos con persistencia
  const updateExperienceLevel = (level: string) => {
    persistentData = { ...persistentData, experienceLevel: level };
    setData(persistentData);
  };
  
  const updatePreferredTypes = (types: string[]) => {
    persistentData = { ...persistentData, preferredTypes: types };
    setData(persistentData);
  };
  
  const updateBudget = (budget: string) => {
    persistentData = { ...persistentData, budget: budget };
    setData(persistentData);
  };
  
  const updateOccasions = (occasions: string[]) => {
    persistentData = { ...persistentData, occasions: occasions };
    setData(persistentData);
  };
  
  const updateTastingNotes = (notes: string[]) => {
    persistentData = { ...persistentData, tastingNotes: notes };
    setData(persistentData);
  };
  
  const updateLearningGoals = (goals: string[]) => {
    persistentData = { ...persistentData, learningGoals: goals };
    setData(persistentData);
  };

  return (
    <OnboardingContext.Provider value={{
      isCompleted,
      data: persistentData, // Usar datos persistentes
      loading,
      loadingOptions,
      apiOptions,
      getOptionsForCategory,
      isOptionSelected,
      toggleOptionSelection,
      completeOnboarding,
      updateExperienceLevel,
      updatePreferredTypes,
      updateBudget,
      updateOccasions,
      updateTastingNotes,
      updateLearningGoals,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};