import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import OnboardingOption from '@/components/OnboardingOption';

const intensityOptions = [
  { 
    id: 'soft', 
    title: 'Soft', 
    description: 'Delicate aromas and flavors' 
  },
  { 
    id: 'medium', 
    title: 'Medium', 
    description: 'Noticeable aromas and flavors' 
  },
  { 
    id: 'intense', 
    title: 'Intense', 
    description: 'Very pronounced aromas and flavors' 
  },
];

export default function IntensitiesScreen() {
  const { top } = useSafeAreaInsets();
  const [selectedIntensity, setSelectedIntensity] = useState<string>('');

  const handleContinue = () => {
    if (selectedIntensity) {
      router.push('/(onboarding)/dryness');
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <ScrollView className="flex-1 px-8 py-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-black dark:text-white mb-2">
            What intensity do you prefer in wine?
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Intensity is the strength of the wine's aromas and flavors.
          </Text>
        </View>
        <View className="mb-8">
          {intensityOptions.map((option) => (
            <OnboardingOption
              key={option.id}
              title={option.title}
              description={option.description}
              isSelected={selectedIntensity === option.id}
              onPress={() => setSelectedIntensity(option.id)}
            />
          ))}
        </View>
      </ScrollView>
      <View className="px-8 pb-8">
        <Button
          title="Continue"
          onPress={handleContinue}
          variant={selectedIntensity ? "primary" : "secondary"}
          disabled={!selectedIntensity}
        />
      </View>
    </View>
  );
}