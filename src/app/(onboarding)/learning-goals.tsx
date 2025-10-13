import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import OnboardingOption from '@/components/OnboardingOption';

const learningGoalOptions = [
  {
    id: 'food-pairing',
    title: 'Maridaje de Comidas',
    description: 'Aprender qué vinos combinan con diferentes platos'
  },
  {
    id: 'tasting-skills',
    title: 'Habilidades de Cata',
    description: 'Desarrollar mi paladar y vocabulario de cata'
  },
  {
    id: 'wine-regions',
    title: 'Regiones Vinícolas',
    description: 'Explorar vinos de diferentes países y regiones'
  },
  {
    id: 'wine-making',
    title: 'Elaboración de Vinos',
    description: 'Entender cómo se produce el vino'
  },
  {
    id: 'collecting',
    title: 'Coleccionismo de Vinos',
    description: 'Construir una colección de vinos y aprender sobre el envejecimiento'
  },
  {
    id: 'social-enjoyment',
    title: 'Disfrute Social',
    description: 'Simplemente disfrutar del vino con amigos y familiares'
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
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
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
  );
}