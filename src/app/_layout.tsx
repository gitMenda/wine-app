import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { OnboardingProvider } from "@/hooks/useOnboarding";
import { Text, ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import { Slot } from "expo-router";

// Auth guard component that handles redirects
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth(); // Fixed: use 'loading' instead of 'authLoading'
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait until auth state is loaded

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    console.log("Auth guard check:", {
      user: user ? "authenticated" : "not authenticated",
      segment: segments[0],
      onboardingCompleted: user?.onboardingCompleted,
    });

    if (!user && !inAuthGroup && segments[0] !== "login" && segments[0] !== "register") {
      // Redirect to login if not authenticated
      console.log("User not authenticated, redirecting to login");
      router.replace("/login");
    } else if (user) {
      // If user is authenticated
      const needsOnboarding = user.onboardingCompleted === false;

      if (needsOnboarding && !inOnboardingGroup) {
        console.log("User needs onboarding, redirecting...");
        // Add a delay to ensure contexts are ready
        setTimeout(() => {
          router.replace("/(onboarding)/welcome");
        }, 300);
      } else if (!needsOnboarding && (inAuthGroup || inOnboardingGroup)) {
        // If onboarding is complete but user is in auth or onboarding screens
        router.replace("/");
      }
    }
  }, [user, segments, loading]);

  // Show loading indicator while auth state is being determined
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#722F37" />
        <Text style={{ marginTop: 10 }}>Cargando...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OnboardingProvider>
          <AuthGuard>
            <Slot />
          </AuthGuard>
        </OnboardingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
