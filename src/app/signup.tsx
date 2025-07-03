"use client"

import Button from "@/components/Button"
import TextField from "@/components/TextField"
import { authServiceInstance } from "@/modules/auth/AuthService"
import { useRouter } from "expo-router"
import { useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { z } from "zod";
import Layout from "@/components/Layout"

const loginSchema = z
  .object({
    name: z.string().min(1, "Debe ingresar su nombre"),
    email: z.string().email("Debe ingresar un email válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"], // set the error on confirmPassword field
    message: "Las contraseñas no coinciden",
  });

export default function SignupScreen() {
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const validate = () => {
    const result = loginSchema.safeParse({ name, email, password, confirmPassword })
    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {}
      result.error.errors.forEach(err => {
        const field = err.path[0]
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return false
    } else {
      setErrors({})
      return true
    }
  }

  const handleSignUp = async ({
    name,
    email,
    password,
    confirmPassword,
  }: z.infer<typeof loginSchema>) => {

    if(!validate()) return
    // Handle sign up logic here
    console.log("Sign up with:", { name, email, password, confirmPassword, rememberMe })
    try {
      await authServiceInstance.signUp( name, email, password);
      //route to home
    } catch (error) {
      console.error("Error during sign up:", error);
    }
  }

  return (
    <Layout scrollable>
      <View className="px-6 rounded-3xl p-8 pt-12">
        <View className="mb-8">
          <Text className="text-2xl font-semibold text-white mb-2">Create your account</Text>
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 text-sm mb-3">Your name</Text>
          <TextField
            placeholder="Your Name"
            autoCapitalize="none"
            value={name}
            onChangeText={setName}
            variant="dark"
            error={!!errors.name}
            errorMessage={errors.name}
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 text-sm mb-3">Your number & email address</Text>
          <TextField
            placeholder="user@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            variant="dark"
            error={!!errors.email}
            errorMessage={errors.email}
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
            error={!!errors.password}
            errorMessage={errors.password}
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
            error={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword}
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

        <Button
          title="Sign up"
          onPress={() => handleSignUp({ name, email, password, confirmPassword })}
          variant="primary"
          className="mb-6"
          disabled={!name || !email || !password || !confirmPassword || Object.keys(errors).length > 0}
        />

        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-700" />
          <Text className="text-gray-500 text-sm px-3">Or</Text>
          <View className="flex-1 h-px bg-gray-700" />
        </View>

        <View className="gap-3 mb-6">
          <Button title="Sign up with Google" onPress={() => {}} variant="social" className="mb-0" />
        </View>

        <View className="items-center">
          <TouchableOpacity onPress={() => router.push("/")}>
            <Text className="text-gray-400 text-sm">
              Already have an account? <Text className="text-burgundy-500">Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </Layout>
  )
}
