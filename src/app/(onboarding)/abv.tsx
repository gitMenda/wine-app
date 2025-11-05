import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import OnboardingOption from '@/components/OnboardingOption';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function AbvScreen() {
  const { top } = useSafeAreaInsets();
  const { 
    getOptionsForCategory, 
    isOptionSelected, 
    toggleOptionSelection,
    loadingOptions 
  } = useOnboarding();
  
  const abvOptions = getOptionsForCategory('abv');
  
  const selectedAbv = abvOptions
    .filter(option => isOptionSelected(option.id))
    .map(option => option.option);

  const handleToggle = (option: any) => {
    toggleOptionSelection(option.id);
  };

  const handleContinue = () => {
    if (abvOptions.some(opt => isOptionSelected(opt.id))) {
      router.push('/(onboarding)/acidity');
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
            ¿Qué tanto alcohol preferis en un vino?
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Elegí de acuerdo a tu preferencia en cuanto a la cantidad de alcohol.
          </Text>
        </View>
        <View className="mb-8">
          {abvOptions.map((option) => (
            <OnboardingOption
              key={option.id}
              title={option.option}
              description={option.description}
              isSelected={isOptionSelected(option.id)}
              onPress={() => handleToggle(option)}
            />
          ))}
        </View>
      </ScrollView>
      <View className="px-8 pb-8">
        <Text className="text-center text-gray-500 dark:text-gray-400 mb-4">
          {selectedAbv.length} selected
        </Text>
        <Button
          title="Continue"
          onPress={handleContinue}
          variant={selectedAbv.length > 0 ? "primary" : "secondary"}
          disabled={selectedAbv.length === 0}
        />
      </View>
    </View>
  );
}