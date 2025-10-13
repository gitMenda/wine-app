import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import OnboardingOption from '@/components/OnboardingOption';

const budgetOptions = [
  {
    id: 'budget',
    title: 'Económico',
    description: 'Menos de $15 por botella'
  },
  {
    id: 'mid-range',
    title: 'Gama Media',
    description: '$15 - $30 por botella'
  },
  {
    id: 'premium',
    title: 'Premium',
    description: '$30 - $60 por botella'
  },
  {
    id: 'luxury',
    title: 'De Lujo',
    description: '$60+ por botella'
  },
  {
    id: 'varies',
    title: 'Varía',
    description: 'Diferentes presupuestos para diferentes ocasiones'
  }
];

export default function BudgetScreen() {
  const { top } = useSafeAreaInsets();
  const [selectedBudget, setSelectedBudget] = useState<string>('');

  const handleContinue = () => {
    if (selectedBudget) {
      router.push('/(onboarding)/occasions');
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <ScrollView className="flex-1 px-8 py-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-black dark:text-white mb-2">
            What's your typical wine budget?
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            This helps us recommend wines in your price range.
          </Text>
        </View>

        <View className="mb-8">
          {budgetOptions.map((option) => (
            <OnboardingOption
              key={option.id}
              title={option.title}
              description={option.description}
              isSelected={selectedBudget === option.id}
              onPress={() => setSelectedBudget(option.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="px-8 pb-8">
        <Button
          title="Continue"
          onPress={handleContinue}
          variant={selectedBudget ? "primary" : "secondary"}
          disabled={!selectedBudget}
        />
      </View>
    </View>
  );
}