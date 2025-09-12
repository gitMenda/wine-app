import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import OnboardingOption from '@/components/OnboardingOption';

const drynessOptions = [
  { 
    id: 'dry', 
    title: 'Dry', 
    description: 'No sweetness' 
  },
  { 
    id: 'semi-dry', 
    title: 'Semi-Dry', description: 'Slightly sweet' 
  },
  { 
    id: 'sweet', 
    title: 'Sweet', description: 'Noticeably sweet' 
  },
];

export default function DrynessScreen() {
  const { top } = useSafeAreaInsets();
  const [selectedDryness, setSelectedDryness] = useState<string>('');

  const handleContinue = () => {
    if (selectedDryness) {
      router.push('/(onboarding)/abv');
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <ScrollView className="flex-1 px-8 py-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-black dark:text-white mb-2">
            How sweet do you like your wine?
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Sweetness ranges from dry (no sugar) to sweet.
          </Text>
        </View>
        <View className="mb-8">
          {drynessOptions.map((option) => (
            <OnboardingOption
              key={option.id}
              title={option.title}
              description={option.description}
              isSelected={selectedDryness === option.id}
              onPress={() => setSelectedDryness(option.id)}
            />
          ))}
        </View>
      </ScrollView>
      <View className="px-8 pb-8">
        <Button
          title="Continue"
          onPress={handleContinue}
          variant={selectedDryness ? "primary" : "secondary"}
          disabled={!selectedDryness}
        />
      </View>
    </View>
  );
}