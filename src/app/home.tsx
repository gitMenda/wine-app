import React, {useCallback, useEffect, useState} from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
    UserRound,
    Wine,
    WandSparkles,
    Search,
    Camera,
} from "lucide-react-native";
import { router } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import {apiClient} from "@/lib/api";
import {useAuth} from "@/hooks/useAuth";
import { User } from "@/types"

cssInterop(LinearGradient, {
  className: "style",
});

export default function HomeScreen() {
    const { user } = useAuth();
    const userId = user?.id || user?.sub;

    const [userInfo, setUserInfo] = useState<User>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);
        try {
            const data = await apiClient.get(`/users/${encodeURIComponent(userId)}`);
            const normalized = {
                uid: data?.uid,
                username: data?.username,
                email: data?.email,
                onBoardingCompleted: data?.onBoardingCompleted
            };
            setUserInfo(normalized as User);
        } catch (e: any) {
            console.error('Error fetching user:', e);
            setError('No se pudo cargar el usuario.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchUser();
        }
    }, [fetchUser, userId]);

    return (
    <View className="flex-1">
      {/* Header */}
      <View style={{ paddingBottom: 24, paddingHorizontal: 24 }}>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-text" style={{ fontSize: 24, fontWeight: 'bold' }}>TuVino</Text>
          </View>
          <TouchableOpacity
            className="bg-primary"
            style={{ padding: 12, borderRadius: 50 }}
            onPress={() => router.push('/profile')}
          >
            <UserRound color="#CECCCD" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
        {/* Welcome Section - Minimized */}
        <View className="mb-4">
          <Text className="text-text text-xl font-semibold mb-1">¡Bienvenido {userInfo?.username || ''}!</Text>
          <Text className="text-text text-xl font-semibold mb-1">¿Qué hacemos hoy?</Text>
        </View>

        {/* Hero Card - Sugerencias */}
        <View className="mb-4">
          <TouchableOpacity
            className="w-full rounded-3xl shadow-lg overflow-hidden border border-primary"
            style={{
              minHeight: 120
            }}
            onPress={() => router.push('/recommendations')}
          >
            <LinearGradient
              colors={['#300615', '#45081E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1"
              style={{
                padding: 20,
                borderRadius: 16
              }}
            >
              <View className="p-3 rounded-full w-12 h-12 items-center justify-center mb-4 bg-secondary">
                <WandSparkles color="#CECCCD" size={24} />
              </View>
              <Text className="text-lg font-semibold mb-2 text-text">Sugerencias</Text>
              <Text className="text-sm text-text opacity-70 mb-3">Obtené recomendaciones en base a tus gustos.</Text>
              <TouchableOpacity
                className="rounded-2xl items-center bg-accent self-start"
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                }}
                onPress={(e) => {
                  e.stopPropagation();
                  router.push('/recommendations');
                }}
              >
                <Text className="text-sm font-semibold text-background">
                  Obtener recomendaciones
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Secondary Features Grid */}
        <View className="flex-row flex-wrap gap-4 mb-10">
          {/* Profile Card */}
          <TouchableOpacity
            className="flex-1 min-w-[45%] rounded-3xl shadow-lg overflow-hidden"
            style={{
              minHeight: 120,
              borderWidth: 1,
              borderColor: '#2A2A2A'
            }}
            onPress={() => router.push('/ratings')}
          >
            <LinearGradient
              colors={['#0D0D0D', '#0E0E0E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 rounded-3xl"
              style={{ padding: 20 }}
            >
              <View className="p-3 rounded-full w-12 h-12 items-center justify-center mb-4 bg-primary">
                <Wine color="#CECCCD" size={24} />
              </View>
              <Text className="text-lg font-semibold mb-2 text-text">Mis experiencias</Text>
              <Text className="text-sm text-text opacity-70">Reviví catas, guardá favoritos y ajustá tus gustos.</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Search Card */}
          <TouchableOpacity
            className="flex-1 min-w-[45%] rounded-3xl shadow-lg overflow-hidden"
            style={{
              minHeight: 120,
              borderWidth: 1,
              borderColor: '#2A2A2A'
            }}
            onPress={() => router.push('/search')}
          >
            <LinearGradient
              colors={['#0D0D0D', '#0E0E0E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 rounded-3xl"
              style={{ padding: 20 }}
            >
              <View className="p-3 rounded-full w-12 h-12 items-center justify-center mb-4 bg-primary">
                <Search color="#CECCCD" size={24} />
              </View>
              <Text className="text-lg font-semibold mb-2 text-text">Catálogo</Text>
              <Text className="text-sm text-text opacity-70">Filtrá por estilo, precio y región sin perderte.</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Scan Card */}
          <TouchableOpacity
            className="w-full rounded-3xl shadow-lg overflow-hidden"
            style={{
              minHeight: 80,
              borderWidth: 1,
              borderColor: '#2A2A2A'
            }}
            onPress={() => router.push('/scan')}
          >
            <LinearGradient
              colors={['#0D0D0D', '#0E0E0E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 rounded-3xl"
              style={{ padding: 20 }}
            >
              <View className="flex-row items-center">
                <View className="p-3 rounded-full w-12 h-12 items-center justify-center mr-4 bg-primary">
                  <Camera color="#CECCCD" size={24} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold mb-1 text-text">Escanear carta</Text>
                  <Text className="text-sm text-text opacity-70">Fotografiá la carta y descubrí qué se adapta a vos.</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}