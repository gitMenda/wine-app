import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function CompleteScreen() {
  const { completeOnboarding, data } = useOnboarding();
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const handleComplete = async () => {
      // Evitar ejecución múltiple
      if (hasCompleted) return;

      // Validar que se han seleccionado opciones
      if (data.selectedOptionIds.length === 0) {
        Alert.alert(
          "Preferencias incompletas",
          "Por favor vuelve atrás y selecciona al menos una opción en cada categoría de vino.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }

      setHasCompleted(true);

      try {
        console.log('Completing onboarding with options:', data.selectedOptionIds);

        await completeOnboarding({
          experienceLevel: data.experienceLevel || 'casual',
          preferredTypes: data.preferredTypes || [],
          budget: data.budget || 'mid-range',
          occasions: data.occasions || [],
          tastingNotes: data.tastingNotes || [],
          learningGoals: data.learningGoals || []
        });

        // Redirect directly to home
        router.replace('/');
      } catch (error) {
        console.error('Error al completar el onboarding:', error);
        setHasCompleted(false);
        Alert.alert(
          "Error",
          "No pudimos guardar tus preferencias. Por favor intenta nuevamente.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    };

    handleComplete();
  }, [data, completeOnboarding, hasCompleted]);

  return (
    <View className="flex-1 bg-white dark:bg-black justify-center items-center">
      <ActivityIndicator size="large" color="#6B1E3A" />
      <Text className="mt-4 text-gray-600 dark:text-gray-400">Completando tu perfil...</Text>
    </View>
  );
}