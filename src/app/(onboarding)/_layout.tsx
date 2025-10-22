import { Stack } from 'expo-router';
import {OnboardingProvider} from "@/hooks/useOnboarding";

export default function OnboardingLayout() {
  return (
      <OnboardingProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="experience" />
          <Stack.Screen name="wine-types" />
          <Stack.Screen name="bodies" />
          <Stack.Screen name="intensities" />
          <Stack.Screen name="dryness" />
          <Stack.Screen name="abv" />
          <Stack.Screen name="acidity" />
          <Stack.Screen name="budget" />
          <Stack.Screen name="occasions" />
          <Stack.Screen name="tasting-notes" />
          <Stack.Screen name="learning-goals" />
          <Stack.Screen name="complete" />
        </Stack>
      </OnboardingProvider>
  );
}