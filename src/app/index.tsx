"use client"

import { useState } from "react"
import { Text, View, TouchableOpacity } from "react-native"
import Button from "@/components/Button"
import TextField from "@/components/TextField"
import { useRouter } from "expo-router"
import { z } from "zod"
import { authServiceInstance } from "@/modules/auth/AuthService"


const loginSchema = z.object({
  email: z.string().email(),
  password: z
    .string(),
});

export default function Page() {
  return (
    <View className="flex flex-1 bg-gray-900">
      <Content />
    </View>
  )
}

function Content() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = async ({
    email,
    password,
  }: z.infer<typeof loginSchema>) => {
    try {
      await authServiceInstance.login(email, password);
      router.push("/home");
    } catch (error) {
      console.error(error);
    }
  };

  return (
      <View className="flex-1 bg-gray-900 rounded-3xl p-6 pt-24">
        <View className="mb-8">
          <Text className="text-2xl font-semibold text-white mb-2">Login to your account</Text>
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 text-sm mb-3">Your number & email address</Text>
          <TextField
            placeholder="uiuxdesigner@gmail.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            variant="dark"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 text-sm mb-3">Enter your password</Text>
          <TextField
            placeholder="••••••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            variant="dark"
          />
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity className="flex-row items-center" onPress={() => setRememberMe(!rememberMe)}>
            <View
              className={`w-4 h-4 rounded border mr-2 ${rememberMe ? "bg-burgundy-600 border-burgundy-600" : "border-gray-500"}`}
            />
            <Text className="text-gray-400 text-sm">Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text className="text-burgundy-500 text-sm">Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <Button title="Log in" onPress={() => handleLogin({ email, password })} variant="primary" className="mb-6" />

        <View className="items-center mb-6">
          <Text className="text-gray-500 text-sm">Or</Text>
        </View>

        <View className="gap-3 mb-6">
          <Button title="Sign up with Google" onPress={() => {}} variant="social" className="mb-0" />
          <Button title="Sign up with Facebook" onPress={() => {}} variant="social" className="mb-0" />
        </View>

        <View className="items-center">
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text className="text-gray-400 text-sm">
              Don't have an account? <Text className="text-burgundy-500">Create an account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
  )
}
