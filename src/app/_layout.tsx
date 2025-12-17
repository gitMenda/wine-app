import React, { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { OnboardingProvider } from "@/hooks/useOnboarding";
import { SearchStateProvider } from "@/hooks/useSearchState";
import { Text, ActivityIndicator, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import "../global.css";
import { Slot } from "expo-router";
import { apiClient } from "@/lib/api";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";

cssInterop(LinearGradient, {
  className: "style",
});

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
      return;
    }

    // If authenticated, perform server-side onboarding check on non-auth routes
    const shouldCheckServer = !!user && !inOnboardingGroup && segments[0] !== "login" && segments[0] !== "register";
    if (shouldCheckServer && user?.id) {
      let cancelled = false;
      (async () => {
        try {
          const profile = await apiClient.get(`/users/${user.id}`);
          const completed = profile?.onboarding_completed ?? profile?.onboardingCompleted;
          if (!cancelled && completed === false) {
            console.log("Server indicates onboarding not completed. Redirecting to welcome.");
            router.replace("/(onboarding)/welcome");
          }
        } catch (e) {
          // Errors like 401 are handled by apiClient (may clear tokens and trigger auth guard next render)
          console.log("Failed to fetch user profile for onboarding check", e);
        }
      })();
      return;
    }

    // If user manually navigates to auth or onboarding but already completed, send home
    if (user) {
      const needsOnboardingLocal = user.onboardingCompleted === false;
      if (!needsOnboardingLocal && (inAuthGroup || inOnboardingGroup)) {
        router.replace("/");
      }
    }
  }, [user, segments, loading]);

  // Show loading indicator while auth state is being determined
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#45081E" />
        <Text style={{ marginTop: 10 }}>Cargando...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

function SafeAreaWrapper({ children }: { children: React.ReactNode }) {
  const { top, bottom } = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#0E0206', '#0C0105', '#080203', '#050102', '#000000']}
      locations={[0, 0.2, 0.4, 0.7, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1, paddingTop: top + 16, paddingBottom: bottom }}
    >
      {children}
    </LinearGradient>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OnboardingProvider>
          <SearchStateProvider>
            <AuthGuard>
              <SafeAreaWrapper>
                <Slot />
              </SafeAreaWrapper>
            </AuthGuard>
          </SearchStateProvider>
        </OnboardingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
