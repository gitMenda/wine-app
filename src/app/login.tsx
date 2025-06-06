import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View className="flex-1 justify-center px-8 bg-white dark:bg-black">
      <Text className="text-3xl font-bold mb-8 text-center text-black dark:text-white">
        Login
      </Text>

      <TextInput
        className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4 text-black dark:text-white"
        placeholder="Email"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-6 text-black dark:text-white"
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity className="bg-blue-600 p-4 rounded-lg mb-4">
        <Text className="text-white text-center font-semibold">Login</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text className="text-blue-500 text-center mb-2">Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text className="text-gray-500 text-center">
          Don't have an account? <Text className="text-blue-500">Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
