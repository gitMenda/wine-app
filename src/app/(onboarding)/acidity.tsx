import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import OnboardingOption from '@/components/OnboardingOption';

const acidityOptions = [
  { 
    id: 'low', 
    title: 'Low', 
    description: 'Smooth sensation on the palate' 
  },
  { 
    id: 'medium', 
    title: 'Medium', description: 'Balanced, neither too soft nor too fresh' 
  },
  { 
    id: 'high', 
    title: 'High', description: 'Fresh and vibrant sensation' 
  },
];

export default function AcidityScreen() {
  const { top } = useSafeAreaInsets();
  const [selectedAcidity, setSelectedAcidity] = useState<string>('');

  const handleContinue = () => {
    if (selectedAcidity) {
      router.push('/(onboarding)/budget');
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <ScrollView className="flex-1 px-8 py-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-black dark:text-white mb-2">
            What acidity level do you prefer?
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Acidity brings freshness and vibrancy to wine.
          </Text>
        </View>
        <View className="mb-8">
          {acidityOptions.map((option) => (
            <OnboardingOption
              key={option.id}
              title={option.title}
              description={option.description}
              isSelected={selectedAcidity === option.id}
              onPress={() => setSelectedAcidity(option.id)}
            />
          ))}
        </View>
      </ScrollView>
      <View className="px-8 pb-8">
        <Button
          title="Continue"
          onPress={handleContinue}
          variant={selectedAcidity ? "primary" : "secondary"}
          disabled={!selectedAcidity}
        />
      </View>
    </View>
  );
}