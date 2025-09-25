import { Link } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@/components/Button";
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function Page() {
  const { user, loading: authLoading } = useAuth();
  const { isCompleted, loading: onboardingLoading } = useOnboarding();

  // useEffect(() => {
  //   // Redirige al onboarding si el usuario está autenticado pero no lo completó
  //   if (!authLoading && !onboardingLoading && user && isCompleted === false) {
  //     router.replace('/(onboarding)/welcome');
  //   }
  // }, [user, isCompleted, authLoading, onboardingLoading]);

  // Muestra loading mientras se chequea auth y onboarding
  if (authLoading || onboardingLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex flex-1">
      <Header />
      <Content user={user} />
      <Footer />
    </View>
  );
}

function Content({ user }: { user: any }) {
  return (
    <View className="flex-1">
      <View className="py-12 md:py-24 lg:py-32 xl:py-48">
        <View className="px-4 md:px-6">
          <View className="flex flex-col items-center gap-2 text-center px-3 justify-between flex-col h-full py-48">
            <View className="gap-3 w-full">
              <Text
                role="heading"
                className="text-3xl text-center native:text-5xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
              >
                Welcome to
              </Text>
              <Text
                role="heading"
                className="text-3xl text-burgundy-600 text-center native:text-5xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
              >
                TuVino
              </Text>
              <Text className="mx-auto max-w-[700px] text-lg text-center text-gray-700 md:text-xl dark:text-gray-400">
                Your first wine advisor 
              </Text>
            </View>

            <View className="gap-3 w-full">
              {user ? (
                <Button
                  title="Continue to App"
                  onPress={() => router.push('/home')}
                  variant="primary"
                />
              ) : (
                <>
                  <Button
                    title="Log in"
                    onPress={() => router.push('/login')}
                    variant="primary"
                  />
                  <Button
                    title="Register"
                    onPress={() => {}}
                    variant="secondary"
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function Header() {
  const { top } = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: top }}>
      <View className="px-4 lg:px-6 h-14 flex items-center flex-row justify-between">
        <Link className="font-bold flex-1 items-center justify-center" href="/">
          <Text>TuVino</Text>
        </Link>
        <View className="flex flex-row gap-4 sm:gap-6">
          <Link
            className="text-md font-medium hover:underline web:underline-offset-4"
            href="/"
          >
            <Text>About</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

function Footer() {
  const { bottom } = useSafeAreaInsets();
  return (
    <View
      className="flex shrink-0 bg-gray-100 native:hidden"
      style={{ paddingBottom: bottom }}
    >
      <View className="py-6 flex-1 items-start px-4 md:px-6 ">
        <Text className={"text-center text-gray-700"}>
          © {new Date().getFullYear()} Me
        </Text>
      </View>
    </View>
  );
}
