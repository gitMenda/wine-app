"use client"

import { ScrollView, Text, View } from "react-native"
import WineCard from "@/components/WineCard"
import { useUserProfile } from "@/hooks/useUserProfile"

// Mock data for wines
const lastTriedWines = [
  {
    id: 1,
    name: "Château Margaux 2015",
    region: "Bordeaux, France",
    type: "Red Wine",
    rating: 4.8,
    year: 2015,
    image: "/placeholder.svg?height=120&width=80",
  },
  {
    id: 2,
    name: "Dom Pérignon 2012",
    region: "Champagne, France",
    type: "Champagne",
    rating: 4.9,
    year: 2012,
    image: "/placeholder.svg?height=120&width=80",
  },
  {
    id: 3,
    name: "Opus One 2018",
    region: "Napa Valley, USA",
    type: "Red Wine",
    rating: 4.7,
    year: 2018,
    image: "/placeholder.svg?height=120&width=80",
  },
]

const favoriteWines = [
  {
    id: 4,
    name: "Barolo Brunate 2017",
    region: "Piedmont, Italy",
    type: "Red Wine",
    rating: 4.6,
    year: 2017,
    image: "/placeholder.svg?height=120&width=80",
  },
  {
    id: 5,
    name: "Sancerre Les Monts 2020",
    region: "Loire Valley, France",
    type: "White Wine",
    rating: 4.5,
    year: 2020,
    image: "/placeholder.svg?height=120&width=80",
  },
  {
    id: 6,
    name: "Caymus Cabernet 2019",
    region: "Napa Valley, USA",
    type: "Red Wine",
    rating: 4.4,
    year: 2019,
    image: "/placeholder.svg?height=120&width=80",
  },
]

export default function HomeScreen() {
    const { profile, loading, error } = useUserProfile()
    if (loading) return <Text>Loading...</Text>
    if (error) return <Text>Error: {error}</Text>

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-12 pb-6">
          {/* Welcome Section */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-white mb-2">Welcome back,</Text>
            <Text className="text-3xl font-bold text-burgundy-500">{profile?.nombre}</Text>
            <Text className="text-gray-400 text-base mt-2">Ready to discover your next favorite wine?</Text>
          </View>

          {/* Last Tried Wines Section */}
          <View className="mb-8">
            <Text className="text-xl font-semibold text-white mb-4">Recently Tried</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
              <View className="flex-row gap-4">
                {lastTriedWines.map((wine) => (
                  <WineCard key={wine.id} wine={wine} />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Favorite Wines Section */}
          <View className="mb-8">
            <Text className="text-xl font-semibold text-white mb-4">Your Favorites</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
              <View className="flex-row gap-4">
                {favoriteWines.map((wine) => (
                  <WineCard key={wine.id} wine={wine} />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Wine Stats Section */}
          <View className="bg-gray-800 rounded-3xl p-6 mb-6">
            <Text className="text-lg font-semibold text-white mb-4">Your Wine Journey</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-burgundy-500">24</Text>
                <Text className="text-gray-400 text-sm">Wines Tried</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-burgundy-500">6</Text>
                <Text className="text-gray-400 text-sm">Favorites</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-burgundy-500">4.6</Text>
                <Text className="text-gray-400 text-sm">Avg Rating</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="bg-gray-800 rounded-3xl p-6">
            <Text className="text-lg font-semibold text-white mb-4">Quick Actions</Text>
            <View className="gap-3">
              <View className="bg-gray-700 rounded-xl p-4 flex-row items-center">
                <View className="w-10 h-10 bg-burgundy-600 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-bold">+</Text>
                </View>
                <View>
                  <Text className="text-white font-medium">Add New Wine</Text>
                  <Text className="text-gray-400 text-sm">Rate and review a wine</Text>
                </View>
              </View>
              <View className="bg-gray-700 rounded-xl p-4 flex-row items-center">
                <View className="w-10 h-10 bg-burgundy-600 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-bold">🔍</Text>
                </View>
                <View>
                  <Text className="text-white font-medium">Discover Wines</Text>
                  <Text className="text-gray-400 text-sm">Find wines you might like</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
