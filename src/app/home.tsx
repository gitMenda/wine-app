import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';

export default function HomePage() {
  return (
    <View className="flex-1 bg-black dark justify-center items-center p-4">  // Fondo negro y dark mode
      <Text className="text-4xl font-bold text-white mb-8">Bienvenido a TuVino</Text>
      <Text className="text-lg text-gray-300 mb-8 text-center">
        Tu asesor de vinos personal. Encuentra el vino perfecto para ti.
      </Text>
      <Button
        title="Buscar Vinos"
        onPress={() => router.push('/search')}
        variant="primary"
      />
    </View>
  );
}