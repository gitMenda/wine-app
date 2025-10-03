import { useColorScheme, View } from "react-native";
import "../global.css";
import { Slot } from "expo-router";
import { AuthProvider } from "@/hooks/useAuth";
import { OnboardingProvider } from '@/hooks/useOnboarding';
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OnboardingProvider>
          <View className={colorScheme === "dark" ? "dark" : ""} style={{ flex: 1 }}>
            <Slot />
          </View>
        </OnboardingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
