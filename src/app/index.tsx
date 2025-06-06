import React from "react";
import { Text, View } from "react-native";
import Button from "@/components/Button"
import { useRouter } from "expo-router"

export default function Page() {
  return (
    <View className="flex flex-1 bg-white dark:bg-black">
      <Content />
    </View>
  );
}

function Content() {
  const router = useRouter();
  return (
    <View className="flex-1">
      <View className="py-12 md:py-24 lg:py-32 xl:py-48">
        <View className="px-4 md:px-6">
          <View className="flex flex-col items-center gap-6 text-center px-3 justify-center h-full">
            <View className="gap-2 w-full mb-8">
              <Text
                role="heading"
                className="text-3xl dark:text-white text-center native:text-5xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
              >
                Welcome to
              </Text>
              <Text
                role="heading"
                className="text-3xl text-burgundy-600 text-center native:text-5xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
              >
                TuVino
              </Text>
              <Text className="mx-auto max-w-[700px] text-lg text-center text-gray-700 md:text-xl dark:text-gray-200">
                Your first wine advisor 
              </Text>
            </View>

            <View className="gap-3 w-full">
              <Button
                title="Login"
                onPress={() => router.push('/login')}
                variant="primary"
              />
              <Button
                title="Register"
                onPress={() => router.push('/signup')}
                variant="secondary"
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

