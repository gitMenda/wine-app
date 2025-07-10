import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import OnboardingOption from '@/components/OnboardingOption';

const occasionOptions = [
  {
    id: 'dinner-parties',
    title: 'Dinner Parties',
    description: 'Hosting friends and family'
  },
  {
    id: 'romantic-dinners',
    title: 'Romantic Dinners',
    description: 'Special occasions with your partner'
  },
  {
    id: 'casual-evenings',
    title: 'Casual Evenings',
    description: 'Relaxing at home after work'
  },
  {
    id: 'celebrations',
    title: 'Celebrations',
    description: 'Birthdays, anniversaries, achievements'
  },
  {
    id: 'business-meals',
    title: 'Business Meals',
    description: 'Professional dining occasions'
  },
  {
    id: 'gifts',
    title: 'Gifts',
    description: 'Wine as presents for others'
  }
];

export default function OccasionsScreen() {
  const { top } = useSafeAreaInsets();
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);

  const toggleOccasion = (occasionId: string) => {
    setSelectedOccasions(prev => 
      prev.includes(occasionId) 
        ? prev.filter(id => id !== occasionId)
        : [...prev, occasionId]
    );
  };

  const handleContinue = () => {
    if (selectedOccasions.length > 0) {
      router.push('/(onboarding)/tasting-notes');
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <ScrollView className="flex-1 px-8 py-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-black dark:text-white mb-2">
            When do you typically enjoy wine?
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Select all occasions that apply to you.
          </Text>
        </View>

        <View className="mb-8">
          {occasionOptions.map((option) => (
            <OnboardingOption
              key={option.id}
              title={option.title}
              description={option.description}
              isSelected={selectedOccasions.includes(option.id)}
              onPress={() => toggleOccasion(option.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="px-8 pb-8">
        <Text className="text-center text-gray-500 dark:text-gray-400 mb-4">
          {selectedOccasions.length} selected
        </Text>
        <Button
          title="Continue"
          onPress={handleContinue}
          variant={selectedOccasions.length > 0 ? "primary" : "secondary"}
          disabled={selectedOccasions.length === 0}
        />
      </View>
    </View>
  );
}