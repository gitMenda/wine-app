import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';

export default function WelcomeScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-gray-900" style={{ paddingTop: top }}>
      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-burgundy-600 mb-4">
            Welcome to TuVino! 🍷
          </Text>
          <Text className="text-lg text-center text-gray-700 dark:text-gray-300 leading-relaxed">
            Let's personalize your wine journey with a few quick questions. 
            This will help us recommend the perfect wines for you.
          </Text>
        </View>

        <View className="space-y-4">
          <View className="bg-burgundy-50 dark:bg-burgundy-900/20 p-4 rounded-lg">
            <Text className="text-burgundy-700 dark:text-burgundy-300 text-center font-medium">
              ✨ Takes less than 2 minutes
            </Text>
          </View>
          
          <Button
            title="Get Started"
            onPress={() => router.push('/(onboarding)/experience')}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
}