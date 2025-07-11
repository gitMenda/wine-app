import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import OnboardingOption from '@/components/OnboardingOption';
import Layout from '@/components/Layout';

const experienceOptions = [
  {
    id: 'beginner',
    title: 'Wine Beginner',
    description: 'I\'m new to wine and want to learn the basics'
  },
  {
    id: 'casual',
    title: 'Casual Drinker',
    description: 'I enjoy wine occasionally but want to explore more'
  },
  {
    id: 'enthusiast',
    title: 'Wine Enthusiast',
    description: 'I have some knowledge and enjoy trying different wines'
  },
  {
    id: 'expert',
    title: 'Wine Expert',
    description: 'I have extensive wine knowledge and refined palate'
  }
];

export default function ExperienceScreen() {
  const { top } = useSafeAreaInsets();
  const [selectedExperience, setSelectedExperience] = useState<string>('');

  const handleContinue = () => {
    if (selectedExperience) {
      // Store the selection and navigate to next screen
      router.push('/(onboarding)/wine-types');
    }
  };

  return (
    <Layout>
    <View className="flex-1 bg-gray-900" style={{ paddingTop: top }}>
      <ScrollView className="flex-1 px-8 py-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-black dark:text-white mb-2">
            What's your wine experience level?
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            This helps us tailor recommendations to your knowledge level.
          </Text>
        </View>

        <View className="mb-8">
          {experienceOptions.map((option) => (
            <OnboardingOption
              key={option.id}
              title={option.title}
              description={option.description}
              isSelected={selectedExperience === option.id}
              onPress={() => setSelectedExperience(option.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="px-8 pb-8">
        <Button
          title="Continue"
          onPress={handleContinue}
          variant={selectedExperience ? "primary" : "secondary"}
          disabled={!selectedExperience}
        />
      </View>
    </View>
    </Layout>
  );
}