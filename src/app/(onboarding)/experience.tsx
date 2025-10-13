import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import OnboardingOption from '@/components/OnboardingOption';
import { useOnboarding } from '@/hooks/useOnboarding';

const experienceOptions = [
  {
    id: 'beginner',
    title: 'Principiante en Vinos',
    description: 'Soy nuevo en el vino y quiero aprender lo básico'
  },
  {
    id: 'casual',
    title: 'Beber Casual',
    description: 'Disfruto del vino ocasionalmente, pero quiero explorar más'
  },
  {
    id: 'enthusiast',
    title: 'Entusiasta del Vino',
    description: 'Tengo algo de conocimiento y disfruto probar diferentes vinos'
  },
  {
    id: 'expert',
    title: 'Experto en Vinos',
    description: 'Tengo un amplio conocimiento sobre vinos y un paladar refinado'
  }
];

export default function ExperienceScreen() {
  const { top } = useSafeAreaInsets();
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const { updateExperienceLevel } = useOnboarding();

  const handleSelectExperience = (experienceId: string) => {
    setSelectedExperience(experienceId);
    updateExperienceLevel(experienceId);
  };

  const handleContinue = () => {
    if (selectedExperience) {
      router.push('/(onboarding)/wine-types');
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
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
              onPress={() => handleSelectExperience(option.id)}
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
  );
}