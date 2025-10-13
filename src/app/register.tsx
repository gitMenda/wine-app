import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        Alert.alert('Registration Error', error.message);
      } else {
        // signUp auto logs in; navigate to home
        router.replace('/');
      }
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-8 bg-white dark:bg-black">
      <Text className="text-3xl font-bold mb-8 text-center text-black dark:text-white">
        Sign Up
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
        className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4 text-black dark:text-white"
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-6 text-black dark:text-white"
        placeholder="Confirm Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        className="bg-blue-600 p-4 rounded-lg mb-4"
        onPress={handleRegister}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold">
          {loading ? 'Creating account...' : 'Create account'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text className="text-gray-500 text-center">
          Already have an account? <Text className="text-blue-500">Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
