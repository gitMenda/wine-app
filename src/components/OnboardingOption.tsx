import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

cssInterop(LinearGradient, {
  className: 'style',
});

interface OnboardingOptionProps {
  title: string;
  description?: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function OnboardingOption({
  title,
  description,
  isSelected,
  onPress
}: OnboardingOptionProps) {
  if (isSelected) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="mb-3 overflow-hidden"
        style={styles.selectedContainer}
      >
        <LinearGradient
          colors={['#300615', '#45081E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-4"
          style={{ borderRadius: 12 }}
        >
          <Text className="font-semibold text-base mb-1 text-white">
            {title}
          </Text>
          {description && (
            <Text className="text-sm text-gray-300">
              {description}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-xl p-4 mb-3"
      style={styles.unselectedContainer}
    >
      <Text className="font-semibold text-base mb-1 text-white">
        {title}
      </Text>
      {description && (
        <Text className="text-sm text-gray-300">
          {description}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  selectedContainer: {
    borderWidth: 1,
    borderColor: '#6B1E3A',
    borderRadius: 12,
  },
  unselectedContainer: {
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
});