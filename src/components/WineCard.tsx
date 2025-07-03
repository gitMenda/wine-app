import { Image, Text, TouchableOpacity, View } from "react-native"

interface Wine {
  id: number
  name: string
  region: string
  type: string
  rating: number
  year: number
  image: string
}

interface WineCardProps {
  wine: Wine
  onPress?: () => void
}

export default function WineCard({ wine, onPress }: WineCardProps) {
  return (
    <TouchableOpacity className="bg-gray-800 rounded-2xl p-4 w-48 mr-4" onPress={onPress} activeOpacity={0.8}>
      {/* Wine Image */}
      <View className="items-center mb-3">
        <Image source={{ uri: wine.image }} className="w-16 h-24 rounded-lg" resizeMode="cover" />
      </View>

      {/* Wine Info */}
      <View className="flex-1">
        <Text className="text-white font-semibold text-base mb-1" numberOfLines={2}>
          {wine.name}
        </Text>

        <Text className="text-gray-400 text-sm mb-1" numberOfLines={1}>
          {wine.region}
        </Text>

        <Text className="text-burgundy-500 text-sm mb-2">
          {wine.type} • {wine.year}
        </Text>

        {/* Rating */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-yellow-400 mr-1">⭐</Text>
            <Text className="text-white text-sm font-medium">{wine.rating}</Text>
          </View>

          {/* Heart icon for favorites */}
          <View className="w-6 h-6 items-center justify-center">
            <Text className="text-burgundy-500">♥</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}
