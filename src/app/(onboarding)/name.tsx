import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function NameScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { data, updateName } = useOnboarding();
  const [name, setName] = useState<string>(data.name || '');

  useEffect(() => {
    setName(data.name || '');
  }, [data.name]);

  const handleContinue = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Nombre requerido', 'Por favor ingresa tu nombre para continuar.');
      return;
    }
    updateName(trimmed);
    router.push('/(onboarding)/wine-types');
  };

  return (
    <KeyboardAvoidingKeyboardWrapper>
      <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
        <View className="flex-1 px-8 py-6">
          <View className="mb-8">
            <Text className="text-2xl font-bold text-black dark:text-white mb-2">
              ¿Cuál es tu nombre?
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">
              Empecemos con tu nombre para personalizar tu experiencia.
            </Text>
          </View>

          <TextInput
            className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-black dark:text-white"
            placeholder="Tu nombre"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </View>

        <View className="px-8 pb-8" style={{ paddingBottom: bottom || 16 }}>
          <Button
            title="Continuar"
            onPress={handleContinue}
            variant={name.trim() ? 'primary' : 'secondary'}
            disabled={!name.trim()}
          />
        </View>
      </View>
    </KeyboardAvoidingKeyboardWrapper>
  );
}

function KeyboardAvoidingKeyboardWrapper({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        {children}
      </KeyboardAvoidingView>
    );
  }
  return <>{children}</>;
}
