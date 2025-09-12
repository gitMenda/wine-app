import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import OnboardingOption from '@/components/OnboardingOption';

const bodyOptions = [
  { 
    id: 'light', 
    title: 'Light-Bodied', 
    description: 'Fresh and easy to drink wines' 
  },
  { 
    id: 'medium', 
    title: 'Medium-Bodied', 
    description: 'Balanced between freshness and structure' 
  },
  { 
    id: 'full', 
    title: 'Full-Bodied', 
    description: 'Intense and structured wines' 
  },
  { 
    id: 'very-full', 
    title: 'Very Full-Bodied', 
    description: 'Powerful and dense wines' 
  },
];

export default function BodiesScreen() {
  const { top } = useSafeAreaInsets();
  const [selectedBody, setSelectedBody] = useState<string>('');

  const handleContinue = () => {
    if (selectedBody) {
      router.push('/(onboarding)/intensities');
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <ScrollView className="flex-1 px-8 py-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-black dark:text-white mb-2">
            What body do you prefer in wine?
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Body is the weight or fullness of the wine in your mouth.
          </Text>
        </View>
        <View className="mb-8">
          {bodyOptions.map((option) => (
            <OnboardingOption
              key={option.id}
              title={option.title}
              description={option.description}
              isSelected={selectedBody === option.id}
              onPress={() => setSelectedBody(option.id)}
            />
          ))}
        </View>
      </ScrollView>
      <View className="px-8 pb-8">
        <Button
          title="Continue"
          onPress={handleContinue}
          variant={selectedBody ? "primary" : "secondary"}
          disabled={!selectedBody}
        />
      </View>
    </View>
  );
}