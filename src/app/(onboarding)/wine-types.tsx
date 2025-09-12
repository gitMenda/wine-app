import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import OnboardingOption from '@/components/OnboardingOption';

const wineTypeOptions = [
  {
    id: 'red',
    title: 'Red Wines',
    description: 'Cabernet, Merlot, Pinot Noir, Shiraz'
  },
  {
    id: 'white',
    title: 'White Wines',
    description: 'Chardonnay, Sauvignon Blanc, Riesling, Pinot Grigio'
  },
  {
    id: 'rose',
    title: 'Rosé Wines',
    description: 'Light, refreshing pink wines'
  },
  {
    id: 'sparkling',
    title: 'Sparkling Wines',
    description: 'Champagne, Prosecco, Cava'
  },
  {
    id: 'dessert',
    title: 'Dessert Wines',
    description: 'Sweet wines perfect for after dinner'
  },
  {
    id: 'fortified',
    title: 'Fortified Wines',
    description: 'Port, Sherry, Madeira'
  }
];

export default function WineTypesScreen() {
  const { top } = useSafeAreaInsets();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleContinue = () => {
    if (selectedTypes.length > 0) {
      router.push('/(onboarding)/bodies');
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <ScrollView className="flex-1 px-8 py-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-black dark:text-white mb-2">
            Which wine types interest you?
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Select all that apply. You can always change this later.
          </Text>
        </View>

        <View className="mb-8">
          {wineTypeOptions.map((option) => (
            <OnboardingOption
              key={option.id}
              title={option.title}
              description={option.description}
              isSelected={selectedTypes.includes(option.id)}
              onPress={() => toggleType(option.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="px-8 pb-8">
        <Text className="text-center text-gray-500 dark:text-gray-400 mb-4">
          {selectedTypes.length} selected
        </Text>
        <Button
          title="Continue"
          onPress={handleContinue}
          variant={selectedTypes.length > 0 ? "primary" : "secondary"}
          disabled={selectedTypes.length === 0}
        />
      </View>
    </View>
  );
}