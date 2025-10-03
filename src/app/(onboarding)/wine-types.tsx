import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import OnboardingOption from '@/components/OnboardingOption';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function WineTypesScreen() {
  const { top } = useSafeAreaInsets();
  const { 
    getOptionsForCategory, 
    isOptionSelected, 
    toggleOptionSelection,
    loadingOptions,
    updatePreferredTypes,
    data 
  } = useOnboarding();
  
  const wineTypeOptions = getOptionsForCategory('types');
  
  console.log('Wine type options:', wineTypeOptions.length);
  console.log('Current selections:', data.selectedOptionIds);
  
  // Para mantener compatibilidad con el flujo actual de decoy screens
  const selectedTypes = wineTypeOptions
    .filter(option => isOptionSelected(option.id))
    .map(option => option.option.toLowerCase());

  const handleToggle = (option: any) => {
    console.log('Toggling option:', option.id, option.option);
    toggleOptionSelection(option.id);
    
    // También actualizamos el estado de decoy para mantener compatibilidad
    const newSelected = isOptionSelected(option.id) 
      ? selectedTypes.filter(type => type !== option.option.toLowerCase())
      : [...selectedTypes, option.option.toLowerCase()];
    
    updatePreferredTypes(newSelected);
  };

  const handleContinue = () => {
    if (wineTypeOptions.some(opt => isOptionSelected(opt.id))) {
      router.push('/(onboarding)/bodies');
    }
  };

  if (loadingOptions) {
    return (
      <View className="flex-1 bg-white dark:bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#7c2d12" />
        <Text className="mt-4 text-gray-600 dark:text-gray-400">Cargando opciones...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <ScrollView className="flex-1 px-8 py-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-black dark:text-white mb-2">
            Which wine types interest you?
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Select all that apply. You can always change this later.
          </Text>
        </View>

        <View className="mb-8">
          {wineTypeOptions.length > 0 ? (
            wineTypeOptions.map((option) => (
              <OnboardingOption
                key={option.id}
                title={option.option}
                description={option.description}
                isSelected={isOptionSelected(option.id)}
                onPress={() => handleToggle(option)}
              />
            ))
          ) : (
            <Text className="text-center text-gray-500 py-4">
              No se encontraron opciones disponibles
            </Text>
          )}
        </View>
      </ScrollView>

      <View className="px-8 pb-8">
        <Text className="text-center text-gray-500 dark:text-gray-400 mb-4">
          {selectedTypes.length} selected
        </Text>
        <Button
          title="Continue"
          onPress={handleContinue}
          variant={selectedTypes.length > 0 ? "primary" : "secondary"}
          disabled={selectedTypes.length === 0}
        />
      </View>
    </View>
  );
}