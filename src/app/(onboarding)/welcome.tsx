import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';

export default function WelcomeScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-12">
          <Text className="text-3xl font-bold text-burgundy-600 mb-4">
            ¡Bienvenido a TuVino! 🍷
          </Text>
          <Text className="text-lg text-center text-gray-700 dark:text-gray-300 leading-relaxed">
              Queremos que tu experiencia con el vino sea única.
              Respondé unas preguntas rápidas para ayudarte a descubrir los mejores vinos.
          </Text>
        </View>

        <View className="space-y-4">
          <View className="bg-burgundy-50 dark:bg-burgundy-900/20 p-4 rounded-lg">
            <Text className="text-burgundy-700 dark:text-burgundy-300 text-center font-medium">
              ✨ Te va a llevar menos de 2 minutos
            </Text>
          </View>
          
          <Button
            title="Empezar"
            onPress={() => router.push('/(onboarding)/name')}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
}