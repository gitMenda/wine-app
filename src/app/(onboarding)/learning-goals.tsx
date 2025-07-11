import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import OnboardingOption from '@/components/OnboardingOption';
import Layout from '@/components/Layout';

const learningGoalOptions = [
  {
    id: 'food-pairing',
    title: 'Food Pairing',
    description: 'Learn which wines go with different dishes'
  },
  {
    id: 'tasting-skills',
    title: 'Tasting Skills',
    description: 'Develop my palate and tasting vocabulary'
  },
  {
    id: 'wine-regions',
    title: 'Wine Regions',
    description: 'Explore wines from different countries and regions'
  },
  {
    id: 'wine-making',
    title: 'Wine Making',
    description: 'Understand how wine is produced'
  },
  {
    id: 'collecting',
    title: 'Wine Collecting',
    description: 'Build a wine collection and learn about aging'
  },
  {
    id: 'social-enjoyment',
    title: 'Social Enjoyment',
    description: 'Simply enjoy wine with friends and family'
  }
];

export default function LearningGoalsScreen() {
  const { top } = useSafeAreaInsets();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = () => {
    if (selectedGoals.length > 0) {
      router.push('/(onboarding)/complete');
    }
  };

  return (
    <Layout>
    <View className="flex-1 bg-gray-900" style={{ paddingTop: top }}>
      <ScrollView className="flex-1 px-8 py-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-black dark:text-white mb-2">
            What are your wine goals?
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            What would you like to learn or achieve with wine?
          </Text>
        </View>

        <View className="mb-8">
          {learningGoalOptions.map((option) => (
            <OnboardingOption
              key={option.id}
              title={option.title}
              description={option.description}
              isSelected={selectedGoals.includes(option.id)}
              onPress={() => toggleGoal(option.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="px-8 pb-8">
        <Text className="text-center text-gray-500 dark:text-gray-400 mb-4">
          {selectedGoals.length} selected
        </Text>
        <Button
          title="Almost Done!"
          onPress={handleContinue}
          variant={selectedGoals.length > 0 ? "primary" : "secondary"}
          disabled={selectedGoals.length === 0}
        />
      </View>
    </View>
    </Layout>
  );
}