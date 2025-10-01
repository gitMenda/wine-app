import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface OnboardingData {
  experienceLevel: string;
  preferredTypes: string[];
  budget: string;
  occasions: string[];
  tastingNotes: string[];
  learningGoals: string[];
}

export function useOnboarding() {
  const { user, loading: authLoading } = useAuth();
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [data, setData] = useState<OnboardingData>({
    experienceLevel: '',
    preferredTypes: [],
    budget: '',
    occasions: [],
    tastingNotes: [],
    learningGoals: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadOnboardingStatus();
    } else if (!authLoading && !user) {
      // User not authenticated
      setIsCompleted(null);
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadOnboardingStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading onboarding status:', error);
        setIsCompleted(false);
      } else {
        setIsCompleted(userData.onboarding_completed);
      }
    } catch (error) {
      console.error('Error loading onboarding status:', error);
      setIsCompleted(false);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async (onboardingData: OnboardingData) => {
    if (!user) {
      throw new Error('User must be authenticated to complete onboarding');
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          onboarding_completed: true,
          onboarding_data: onboardingData,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error completing onboarding:', error);
        throw error;
      }

      setIsCompleted(true);
      setData(onboardingData);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const resetOnboarding = async () => {
    if (!user) {
      throw new Error('User must be authenticated to reset onboarding');
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          onboarding_completed: false,
          onboarding_data: null,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error resetting onboarding:', error);
        throw error;
      }

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
      throw error;
    }
  };

  return {
    isCompleted,
    data,
    loading,
    completeOnboarding,
    resetOnboarding
  };
}