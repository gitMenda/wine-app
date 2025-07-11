import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { authServiceInstance } from '@/modules/auth/AuthService';

export interface OnboardingData {
  experienceLevel: string;
  preferredTypes: string[];
  budget: string;
  occasions: string[];
  tastingNotes: string[];
  learningGoals: string[];
}

export function useOnboarding() {
  const [userId, setUserId] = useState<string | null>(null);
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

  // Load user and onboarding status on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const user = await authServiceInstance.getUser();
        if (user) {
          setUserId(user.userId);
          await loadOnboardingStatus(user.userId);
        } else {
          // User not authenticated
          setUserId(null);
          setIsCompleted(null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUserId(null);
        setIsCompleted(null);
      } finally {
        setLoading(false);
      }
    };

    init();

    // Optional: Subscribe to user changes
    const unsubscribe = authServiceInstance.onUserChange((newUser) => {
      if (newUser) {
        setUserId(newUser.userId);
        loadOnboardingStatus(newUser.userId);
      } else {
        setUserId(null);
        setIsCompleted(null);
      }
    });

    // Cleanup subscription if onUserChange returns unsubscribe
    return () => {
      if (typeof unsubscribe === "function") unsubscribe;
    };
  }, []);

  const loadOnboardingStatus = async (uid: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', uid)
        .single();

      if (error) {
        console.error('Error loading onboarding status:', error);
        setIsCompleted(false);
      } else {
        console.log('Onboarding data:', userData);
        setIsCompleted(userData.onboarding_completed);
  //      if (userData.onboarding_data) {
    //      setData(userData.onboarding_data);
      //  }
      }
    } catch (error) {
      console.error('Error loading onboarding status:', error);
      setIsCompleted(false);
    }
  };

  const completeOnboarding = async (onboardingData: OnboardingData) => {
    if (!userId) {
      throw new Error('User must be authenticated to complete onboarding');
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          onboarding_completed: true,
  //        onboarding_data: onboardingData,
        })
        .eq('id', userId);

      if (error) {
        console.error('Error completing onboarding:', error);
        throw error;
      }
      console.log('Onboarding completed and updated');
      setIsCompleted(true);
      setData(onboardingData);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const resetOnboarding = async () => {
    if (!userId) {
      throw new Error('User must be authenticated to reset onboarding');
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          onboarding_completed: false,
   //       onboarding_data: null,
        })
        .eq('id', userId);

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
