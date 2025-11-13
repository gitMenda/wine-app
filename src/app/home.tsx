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
      <View style={{ backgroundColor: '#F8D7DA', paddingTop: top, paddingBottom: 24, paddingHorizontal: 24 }}>
        <View className="flex-row justify-between items-center">
          <View>
            <Text style={{ color: '#3E2723', fontSize: 24, fontWeight: 'bold' }}>TuVino</Text>
            <Text style={{ color: '#6B1E3A', marginTop: 4, fontSize: 14 }}>El camino simple a tu copa perfecta.</Text>
          </View>
          <TouchableOpacity 
            style={{ backgroundColor: '#6B1E3A', padding: 12, borderRadius: 50 }}

            onPress={() => router.push('/profile')}
          >
            <UserRound color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
        {/* Welcome Section - Minimized */}
        <View className="mb-4">
          <Text className="text-white text-xl font-semibold mb-1">Hola, ¡Bienvenido!</Text>
          <Text className="text-gray-400 text-sm">¿Qué deseás hacer hoy?</Text>
        </View>

        {/* Hero Card - Sugerencias */}
        <View className="mb-8">
          <TouchableOpacity 
            className="rounded-3xl shadow-2xl overflow-hidden"
            style={{ 
              backgroundColor: '#6B1E3A', 
              minHeight: 220,
              borderWidth: 2,
              borderColor: '#8B2E4A'
            }}
            onPress={() => router.push('/recommendations')}
          >
            {/* Badge */}
            <View 
              className="absolute top-4 right-4 px-3 py-1 rounded-full z-10"
              style={{ backgroundColor: '#FFD54F' }}
            >
              <Text className="text-xs font-bold" style={{ color: '#3E2723' }}>Recomendado</Text>
            </View>

            <View className="px-8 py-10">
              <View className="items-center mb-8">
                {/* Large Icon */}
                <View 
                  className="p-6 rounded-full mb-5"
                  style={{ backgroundColor: '#F5F0E6' }}
                >
                  <WandSparkles color="#6B1E3A" size={42} />
                </View>
                
                {/* Hero Text */}
                <Text className="text-2xl font-bold text-center mb-3" style={{ color: '#F5F0E6' }}>
                  Sugerencias
                </Text>
                <Text className="text-lg text-center mb-8" style={{ color: '#F8D7DA' }}>
                  Obtené recomendaciones en base a tus gustos.
                </Text>
              </View>

              {/* CTA Button - Enhanced visibility */}
              <TouchableOpacity 
                className="rounded-xl items-center shadow-lg"
                style={{ 
                  backgroundColor: '#FFD54F',
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  minHeight: 48
                }}
                onPress={() => router.push('/recommendations')}
              >
                <Text className="text-xl font-bold" style={{ color: '#3E2723' }}>
                  Comenzar ahora
                </Text>
              </TouchableOpacity>
            </View>

            {/* Subtle decoration */}
            <View 
              className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full opacity-10"
              style={{ backgroundColor: '#F5F0E6' }}
            />
            <View 
              className="absolute -top-2 -left-2 w-12 h-12 rounded-full opacity-10"
              style={{ backgroundColor: '#F5F0E6' }}
            />
          </TouchableOpacity>
        </View>

        {/* Secondary Features Grid */}
        <View className="flex-row flex-wrap gap-4 mb-10">
          {/* Profile Card */}
          <TouchableOpacity 
            className="flex-1 min-w-[45%] rounded-2xl shadow-lg"
            style={{ 
              backgroundColor: '#F5F0E6', // Cork Beige - unified background
              padding: 20,
              minHeight: 120
            }}
            onPress={() => router.push('/ratings')}
          >
            <View className="p-3 rounded-full w-12 h-12 items-center justify-center mb-4" style={{ backgroundColor: '#3E2723' }}>
              <Wine color="#F5F0E6" size={24} />
            </View>
            <Text className="text-lg font-semibold mb-2" style={{ color: '#3E2723' }}>Mis experiencias</Text>
            <Text className="text-sm" style={{ color: '#3E2723', opacity: 0.7 }}>Reviví catas, guardá favoritos y ajustá tus gustos.</Text>
          </TouchableOpacity>

          {/* Search Card */}
          <TouchableOpacity 
            className="flex-1 min-w-[45%] rounded-2xl shadow-lg"
            style={{ 
              backgroundColor: '#F5F0E6', // Cork Beige - unified background
              padding: 20,
              minHeight: 120
            }}
            onPress={() => router.push('/search')}
          >
            <View className="p-3 rounded-full w-12 h-12 items-center justify-center mb-4" style={{ backgroundColor: '#3E2723' }}>
              <Search color="#F5F0E6" size={24} />
            </View>
            <Text className="text-lg font-semibold mb-2" style={{ color: '#3E2723' }}>Catálogo</Text>
            <Text className="text-sm" style={{ color: '#3E2723', opacity: 0.7 }}>Filtrá por estilo, precio y región sin perderte.</Text>
          </TouchableOpacity>

          {/* Scan Card */}
          <TouchableOpacity 
            className="w-full rounded-2xl shadow-lg"
            style={{ 
              backgroundColor: '#F5F0E6', // Cork Beige - unified background
              padding: 20,
              minHeight: 80
            }}
            onPress={() => router.push('/scan')}
          >
            <View className="flex-row items-center">
              <View className="p-3 rounded-full w-12 h-12 items-center justify-center mr-4" style={{ backgroundColor: '#3E2723' }}>
                <Camera color="#F5F0E6" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold mb-1" style={{ color: '#3E2723' }}>Escanear carta</Text>
                <Text className="text-sm" style={{ color: '#3E2723', opacity: 0.7 }}>Fotografiá la carta y descubrí qué se adapta a vos.</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}