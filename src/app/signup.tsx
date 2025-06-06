import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  return (
    <View className="flex-1 justify-center px-8 bg-white dark:bg-black">
        <Text className="text-3xl font-bold mb-8 text-center text-black dark:text-white">
            Sign Up
        </Text>

        <TextField
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
        />

        <TextField
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
        />

        <TextField
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
        />

      <Button
        title='Sign Up'
        onPress={() => {}}
        className='mb-4'
      />

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text className="text-gray-500 text-center">
          Already have an account? <Text className="text-burgundy-500">Log in</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
