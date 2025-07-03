import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

interface TextFieldProps extends TextInputProps {
  className?: string;
}

export default function TextField({ className = '', ...props }: TextFieldProps) {
  return (
    <TextInput
      className={`rounded-2xl border border-gray-300 dark:border-gray-600 p-4 mb-4 text-black dark:text-white ${className}`}
      placeholderTextColor="#888"
      {...props}
    />
  );
}
