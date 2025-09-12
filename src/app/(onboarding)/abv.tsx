import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import OnboardingOption from '@/components/OnboardingOption';

const abvOptions = [
  { 
    id: 'low', 
    title: 'Low (6-11%)', 
    description: 'Light and fresh wines' 
  },
  { 
    id: 'medium', 
    title: 'Medium (12-14%)', description: 'Most wines' 
  },
  { 
    id: 'high', 
    title: 'High (15%+)', description: 'Powerful and warm wines' 
  },
];

export default function AbvScreen() {
  const { top } = useSafeAreaInsets();
  const [selectedAbv, setSelectedAbv] = useState<string>('');

  const handleContinue = () => {
    if (selectedAbv) {
      router.push('/(onboarding)/acidity');
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <ScrollView className="flex-1 px-8 py-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-black dark:text-white mb-2">
            What alcohol level do you prefer?
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Choose according to your preference for alcohol intensity.
          </Text>
        </View>
        <View className="mb-8">
          {abvOptions.map((option) => (
            <OnboardingOption
              key={option.id}
              title={option.title}
              description={option.description}
              isSelected={selectedAbv === option.id}
              onPress={() => setSelectedAbv(option.id)}
            />
          ))}
        </View>
      </ScrollView>
      <View className="px-8 pb-8">
        <Button
          title="Continue"
          onPress={handleContinue}
          variant={selectedAbv ? "primary" : "secondary"}
          disabled={!selectedAbv}
        />
      </View>
    </View>
  );
}