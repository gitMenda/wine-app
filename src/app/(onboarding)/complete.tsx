import React, { useState } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function CompleteScreen() {
  const { top } = useSafeAreaInsets();
  const { completeOnboarding, data } = useOnboarding();
  const [submitting, setSubmitting] = useState(false);

  const handleComplete = async () => {
    // Validar que se han seleccionado opciones
    if (data.selectedOptionIds.length === 0) {
      Alert.alert(
        "Preferencias incompletas", 
        "Por favor vuelve atrás y selecciona al menos una opción en cada categoría de vino."
      );
      return;
    }
    
    setSubmitting(true);
    
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
      
      router.replace('/');
    } catch (error) {
      console.error('Error al completar el onboarding:', error);
      Alert.alert(
        "Error", 
        "No pudimos guardar tus preferencias. Por favor intenta nuevamente."
      );
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black justify-center" style={{ paddingTop: top }}>
      <View className="px-8">
        <View className="items-center mb-12">
          <Text className="text-6xl mb-6">🎉</Text>
          <Text className="text-3xl font-bold text-burgundy-600 mb-4 text-center">
            ¡Todo listo!
          </Text>
          <Text className="text-lg text-center text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            Gracias por completar tu perfil de vino. Usaremos esta información
            para brindarte recomendaciones personalizadas solo para ti.
          </Text>
        </View>

        <View className="space-y-4">
          <View className="bg-burgundy-50 dark:bg-burgundy-900/20 p-6 rounded-lg">
            <Text className="text-burgundy-700 dark:text-burgundy-300 text-center font-medium mb-2">
              🍷 Tu viaje vinícola comienza ahora
            </Text>
            <Text className="text-burgundy-600 dark:text-burgundy-400 text-center text-sm">
              Descubre recomendaciones personalizadas, aprende sobre regiones vinícolas
              y guarda tus notas de cata.
            </Text>
          </View>
          
          {submitting ? (
            <View className="items-center py-4">
              <ActivityIndicator size="large" color="#7c2d12" />
              <Text className="mt-2 text-gray-600">Guardando tus preferencias...</Text>
            </View>
          ) : (
            <Button
              title="Comenzar a explorar"
              onPress={handleComplete}
              variant="primary"
            />
          )}
          
          <Text className="text-center text-xs text-gray-500 mt-2">
            Opciones seleccionadas: {data.selectedOptionIds.length}
          </Text>
        </View>
      </View>
    </View>
  );
}