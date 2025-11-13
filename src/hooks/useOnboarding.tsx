import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

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
  name: string;
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
  updateName: (name: string) => void;
  updateExperienceLevel: (level: string) => void;
  updatePreferredTypes: (types: string[]) => void;
  updateBudget: (budget: string) => void;
  updateOccasions: (occasions: string[]) => void;
  updateTastingNotes: (notes: string[]) => void;
  updateLearningGoals: (goals: string[]) => void;
}

const initialData: OnboardingData = {
  name: '',
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


  const { user } = useAuth();

  useEffect(() => {
    // Solo cargar cuando el componente se monta y el usuario está autenticado
    if (user && user.id) {
      loadOptionsFromAPI();
    }
  }, [user]);

  const loadOptionsFromAPI = async () => {
    if (apiOptions.length > 0) return; // No cargar si ya tenemos opciones

    setLoadingOptions(true);
    try {
      const options = await apiClient.get('/preferences/options');
      console.log('API response received with', options.length, 'options');
      setApiOptions(options);
    } catch (error) {
      console.error('Error loading preference options:', error);
      // ELIMINAR ESTA LÍNEA - ES LA CAUSANTE DEL BUCLE INFINITO:
      // setTimeout(() => loadOptionsFromAPI(), 3000);
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

      // Helper para obtener el ID seleccionado por categoría
      const getSelectedId = (categoryName: string): number | null => {
        const optionsInCategory = apiOptions.filter(
          (opt) => opt.category && opt.category.name === categoryName
        );
        const selectedInCategory = optionsInCategory.filter((opt) =>
          persistentData.selectedOptionIds.includes(opt.id)
        );
        if (selectedInCategory.length === 0) return null;
        // Tomar el primer ID seleccionado (asumiendo 1 selección por categoría)
        return selectedInCategory[0].id;
      };

      // Obtener IDs requeridos
      const typeVal = getSelectedId('types');
      const bodyVal = getSelectedId('bodies');
      const intensityVal = getSelectedId('intensities');
      const drynessVal = getSelectedId('dryness');
      const abvVal = getSelectedId('abv');

      // Validaciones específicas
      if (
        typeVal === null ||
        bodyVal === null ||
        intensityVal === null ||
        drynessVal === null ||
        abvVal === null
      ) {
        throw new Error('Por favor selecciona al menos una opción en cada categoría (tipo, cuerpo, intensidad, sequedad y ABV)');
      }

      const payload = {
        name: (persistentData.name || '').trim(),
        type: typeVal,
        body: bodyVal,
        intensity: intensityVal,
        dryness: drynessVal,
        abv: abvVal,
      };
      
      console.log('Sending onboarding data to API:', payload);
      
      // Validar que existe un usuario autenticado
      if (!user?.id) {
        throw new Error('No hay usuario autenticado para completar el onboarding');
      }

      // Enviar los datos usando apiClient para manejar autenticación y refresh de token
      const endpoint = `/users/${user.id}/preferences`;
      const responseData = await apiClient.post(endpoint, payload);
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

  const updateName = (name: string) => {
    persistentData = { ...persistentData, name };
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
      updateName, 
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