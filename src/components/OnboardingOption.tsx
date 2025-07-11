import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

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
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`
        border rounded-lg p-4 mb-3 transition-all duration-200
        ${isSelected 
          ? 'border-green-500 bg-green-50' 
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        }
      `}
    >
      <Text className={`
        font-semibold text-base mb-1
        ${isSelected 
          ? 'text-green-700' 
          : 'text-black dark:text-white'
        }
      `}>
        {title}
      </Text>
      {description && (
        <Text className={`
          text-sm
          ${isSelected 
            ? 'text-green-600' 
            : 'text-gray-600 dark:text-gray-400'
          }
        `}>
          {description}
        </Text>
      )}
    </TouchableOpacity>
  );
}