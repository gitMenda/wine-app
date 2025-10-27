import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
    UserRound,
    Wine,
    WandSparkles,
    Search,
    Camera,
} from "lucide-react-native";
import { router } from 'expo-router';
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="bg-burgundy-900 pt-12 pb-6 px-6" style={{ paddingTop: top }}>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold">TuVino</Text>
            <Text className="text-burgundy-200 mt-1">El camino simple a tu copa perfecta.</Text>
          </View>
          <TouchableOpacity className="bg-burgundy-700 p-3 rounded-full">
            <UserRound color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View className="mb-10">
          <Text className="text-white text-3xl font-bold mb-2">Hola, ¡Bienvenido!</Text>
          <Text className="text-gray-300 text-lg">¿Qué deseas hacer hoy?</Text>
        </View>

        {/* Main Features Grid */}
        <View className="flex-row flex-wrap gap-4 mb-10">
          {/* Profile Card */}
          <TouchableOpacity 
            className="flex-1 min-w-[45%] bg-burgundy-800 rounded-2xl p-5 shadow-lg"
            onPress={() => router.push('/ratings')}
          >
            <View className="bg-burgundy-700 p-3 rounded-full w-12 h-12 items-center justify-center mb-4">
              <Wine color="white" size={24} />
            </View>
            <Text className="text-white text-lg font-semibold mb-2">Mis experiencias</Text>
            <Text className="text-gray-300 text-sm">Explorá tus favoritos y experiencias registradas</Text>
          </TouchableOpacity>

          {/* Search Card */}
          <TouchableOpacity 
            className="flex-1 min-w-[45%] bg-burgundy-800 rounded-2xl p-5 shadow-lg"
            onPress={() => router.push('/search')}
          >
            <View className="bg-burgundy-700 p-3 rounded-full w-12 h-12 items-center justify-center mb-4">
              <Search color="white" size={24} />
            </View>
            <Text className="text-white text-lg font-semibold mb-2">Catálogo</Text>
            <Text className="text-gray-300 text-sm">Explorá nuestro catálogo y encontrá tu vino ideal</Text>
          </TouchableOpacity>

          {/* Recommendation Card */}
          <TouchableOpacity 
            className="flex-1 min-w-[45%] bg-burgundy-800 rounded-2xl p-5 shadow-lg"
            onPress={() => router.push('/recommendations')}
          >
            <View className="bg-burgundy-700 p-3 rounded-full w-12 h-12 items-center justify-center mb-4">
              <WandSparkles color="white" size={24} />
            </View>
            <Text className="text-white text-lg font-semibold mb-2">Sugerencias</Text>
            <Text className="text-gray-300 text-sm">Descubrí los mejores vinos con nuestras recomendaciones personalizadas...</Text>
          </TouchableOpacity>

          {/* Scan Card */}
          <TouchableOpacity 
            className="flex-1 min-w-[45%] bg-burgundy-800 rounded-2xl p-5 shadow-lg"
            onPress={() => router.push('/scan')}
          >
            <View className="bg-burgundy-700 p-3 rounded-full w-12 h-12 items-center justify-center mb-4">
              <Camera color="white" size={24} />
            </View>
            <Text className="text-white text-lg font-semibold mb-2">Escanear carta</Text>
            <Text className="text-gray-300 text-sm">Fotografiá una carta de vinos y obtené los que más se adaptan a tus gustos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}