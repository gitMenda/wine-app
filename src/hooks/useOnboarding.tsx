import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingData {
  experienceLevel: string;
  preferredTypes: string[];
  budget: string;
  occasions: string[];
  tastingNotes: string[];
  learningGoals: string[];
}

const ONBOARDING_KEY = '@onboarding_completed';
const ONBOARDING_DATA_KEY = '@onboarding_data';

export function useOnboarding() {
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [data, setData] = useState<OnboardingData>({
    experienceLevel: '',
    preferredTypes: [],
    budget: '',
    occasions: [],
    tastingNotes: [],
    learningGoals: []
  });

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      const savedData = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
      
      setIsCompleted(completed === 'true');
      if (savedData) {
        setData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading onboarding status:', error);
      setIsCompleted(false);
    }
  };

  const completeOnboarding = async (onboardingData: OnboardingData) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      await AsyncStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(onboardingData));
      setIsCompleted(true);
      setData(onboardingData);
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      await AsyncStorage.removeItem(ONBOARDING_DATA_KEY);
      setIsCompleted(false);
      setData({
        experienceLevel: '',
        preferredTypes: [],
        budget: '',
        occasions: [],
        tastingNotes: [],
        learningGoals: []
      });
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  return {
    isCompleted,
    data,
    completeOnboarding,
    resetOnboarding
  };
}