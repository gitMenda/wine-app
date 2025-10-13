import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor llená todos los campos');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        Alert.alert('Error', 'Las credenciales ingresadas no son validas');
      } else {
        // Navigation will be handled by the auth state change
        router.replace('/');
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado. Intente de nuevo en unos momentos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-8 bg-white dark:bg-black">
      <Text className="text-3xl font-bold mb-8 text-center text-black dark:text-white">
        Ingresar con cuenta existente
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
        placeholder="Contraseña"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity 
        className="bg-blue-600 p-4 rounded-lg mb-4"
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text className="text-blue-500 text-center mb-2">Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text className="text-gray-500 text-center">
          Todavía no tenes una cuenta? Registrate <Text className="text-blue-500" onPress={() => router.push('/register')}>acá</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
