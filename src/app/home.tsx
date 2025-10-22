import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
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
            <Text className="text-burgundy-200 mt-1">Descubre tu próxima copa perfecta</Text>
          </View>
          <TouchableOpacity className="bg-burgundy-700 p-3 rounded-full">
            <FontAwesome name="user" color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View className="mb-10">
          <Text className="text-white text-3xl font-bold mb-2">Hola, ¡Bienvenido!</Text>
          <Text className="text-gray-300 text-lg">¿Qué deseas explorar hoy?</Text>
        </View>

        {/* Main Features Grid */}
        <View className="flex-row flex-wrap gap-4 mb-10">
          {/* Profile Card */}
          <TouchableOpacity 
            className="flex-1 min-w-[45%] bg-burgundy-800 rounded-2xl p-5 shadow-lg"
            onPress={() => router.push('/profile')}
          >
            <View className="bg-burgundy-700 p-3 rounded-full w-12 h-12 items-center justify-center mb-4">
              <FontAwesome name="user" color="white" size={24} />
            </View>
            <Text className="text-white text-lg font-semibold mb-2">Mi Perfil</Text>
            <Text className="text-gray-300 text-sm">Preferencias y gustos</Text>
          </TouchableOpacity>

          {/* Search Card */}
          <TouchableOpacity 
            className="flex-1 min-w-[45%] bg-burgundy-800 rounded-2xl p-5 shadow-lg"
            onPress={() => router.push('/search')}
          >
            <View className="bg-burgundy-700 p-3 rounded-full w-12 h-12 items-center justify-center mb-4">
              <Ionicons name="search" color="white" size={24} />
            </View>
            <Text className="text-white text-lg font-semibold mb-2">Buscar Vinos</Text>
            <Text className="text-gray-300 text-sm">Explora catálogo</Text>
          </TouchableOpacity>

          {/* Recommendation Card */}
          <TouchableOpacity 
            className="flex-1 min-w-[45%] bg-burgundy-800 rounded-2xl p-5 shadow-lg"
            onPress={() => router.push('/recommendations')}
          >
            <View className="bg-burgundy-700 p-3 rounded-full w-12 h-12 items-center justify-center mb-4">
              <MaterialIcons name="wine-bar" color="white" size={24} />
            </View>
            <Text className="text-white text-lg font-semibold mb-2">Recomendaciones</Text>
            <Text className="text-gray-300 text-sm">Para ti</Text>
          </TouchableOpacity>

          {/* Scan Card */}
          <TouchableOpacity 
            className="flex-1 min-w-[45%] bg-burgundy-800 rounded-2xl p-5 shadow-lg"
            onPress={() => router.push('/scan')}
          >
            <View className="bg-burgundy-700 p-3 rounded-full w-12 h-12 items-center justify-center mb-4">
              <FontAwesome name="camera" color="white" size={24} />
            </View>
            <Text className="text-white text-lg font-semibold mb-2">Escanear Carta</Text>
            <Text className="text-gray-300 text-sm">En restaurantes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}