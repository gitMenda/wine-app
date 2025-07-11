import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import { useOnboarding } from '@/hooks/useOnboarding';
import Layout from '@/components/Layout';

export default function CompleteScreen() {
  const { top } = useSafeAreaInsets();
  const { completeOnboarding } = useOnboarding();

  const handleComplete = async () => {
    // In a real app, you would collect all the answers from previous screens
    // For now, we'll use mock data
    const mockOnboardingData = {
      experienceLevel: 'casual',
      preferredTypes: ['red', 'white'],
      budget: 'mid-range',
      occasions: ['dinner-parties', 'casual-evenings'],
      tastingNotes: ['fruity', 'crisp'],
      learningGoals: ['food-pairing', 'tasting-skills']
    };
    console.log('Completing onboarding with data:', mockOnboardingData);
    try {
      await completeOnboarding(mockOnboardingData);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return;
    }
    console.log('Onboarding completed successfully');
    router.replace('/home');
  };

  return (
    <Layout>
    <View className="flex-1 bg-gray-900 justify-center" style={{ paddingTop: top }}>
      <View className="px-8">
        <View className="items-center mb-12">
          <Text className="text-6xl mb-6">🎉</Text>
          <Text className="text-3xl font-bold text-burgundy-600 mb-4 text-center">
            You're All Set!
          </Text>
          <Text className="text-lg text-center text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            Thank you for completing your wine profile. We'll use this information 
            to provide personalized recommendations just for you.
          </Text>
        </View>

        <View className="space-y-4">
          <View className="bg-burgundy-50 dark:bg-burgundy-900/20 p-6 rounded-lg">
            <Text className="text-burgundy-700 dark:text-burgundy-300 text-center font-medium mb-2">
              🍷 Your Wine Journey Begins Now
            </Text>
            <Text className="text-burgundy-600 dark:text-burgundy-400 text-center text-sm">
              Discover personalized recommendations, learn about wine regions, 
              and track your tasting notes.
            </Text>
          </View>
          
          <Button
            title="Start Exploring"
            onPress={handleComplete}
            variant="primary"
          />
        </View>
      </View>
    </View>
    </Layout>
  );
}