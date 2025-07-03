"use client"

import Button from "@/components/Button"
import TextField from "@/components/TextField"
import { useRouter } from "expo-router"
import { useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"

export default function SignupScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  return (
      <View className="flex-1 px-6 bg-gray-900 rounded-3xl p-8 pt-24">
        <View className="mb-8">
          <Text className="text-2xl font-semibold text-white mb-2">Create your account</Text>
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

        <View className="mb-4">
          <Text className="text-gray-400 text-sm mb-3">Confirm your password</Text>
          <TextField
            placeholder="••••••••••••"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            variant="dark"
          />
        </View>

        <View className="flex-row items-center mb-6">
          <TouchableOpacity className="flex-row items-center" onPress={() => setRememberMe(!rememberMe)}>
            <View
              className={`w-4 h-4 rounded border mr-2 ${rememberMe ? "bg-burgundy-600 border-burgundy-600" : "border-gray-500"}`}
            />
            <Text className="text-gray-400 text-sm">Remember me</Text>
          </TouchableOpacity>
        </View>

        <Button title="Sign up" onPress={() => {}} variant="primary" className="mb-6" />

        <View className="items-center mb-6">
          <Text className="text-gray-500 text-sm">Or</Text>
        </View>

        <View className="gap-3 mb-6">
          <Button title="Sign up with Google" onPress={() => {}} variant="social" className="mb-0" />
          <Button title="Sign up with Facebook" onPress={() => {}} variant="social" className="mb-0" />
        </View>

        <View className="items-center">
          <TouchableOpacity onPress={() => router.push("/")}>
            <Text className="text-gray-400 text-sm">
              Already have an account? <Text className="text-burgundy-500">Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
  )
}
