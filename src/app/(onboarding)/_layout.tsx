import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="experience" />
      <Stack.Screen name="wine-types" />
      <Stack.Screen name="budget" />
      <Stack.Screen name="occasions" />
      <Stack.Screen name="tasting-notes" />
      <Stack.Screen name="learning-goals" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}