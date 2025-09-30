import React from 'react';
import { View, Text, Image } from 'react-native';

export interface WineImageProps {
  name: string;
  uri?: string | null;
  size?: number; // px
  rounded?: boolean; // true -> rounded-md (8px radius)
  className?: string; // allow tailwind/nativewind overrides
}

// Get initials: first letter of first two words, uppercased
export const getWineInitials = (name: string): string => {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// Deterministic bg color class from name
export const getWineBgClass = (name: string): string => {
  const palette = [
    'bg-purple-500', 'bg-blue-500', 'bg-green-500',
    'bg-yellow-500', 'bg-red-500', 'bg-indigo-500',
    'bg-pink-500', 'bg-teal-500', 'bg-orange-500'
  ];
  if (!name) return palette[0];
  // simple hash based on char codes to distribute better than length%N
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) >>> 0;
  }
  const idx = hash % palette.length;
  return palette[idx];
};

export default function WineImage({ name, uri, size = 48, rounded = true, className = '' }: WineImageProps) {
  const initials = getWineInitials(name || 'Vino');
  const bgClass = getWineBgClass(name || 'Vino');
  const radiusClass = rounded ? 'rounded-md' : '';

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        className={`${radiusClass} ${className}`.trim()}
        resizeMode="cover"
      />
    );
  }

  // Choose text size based on container size
  const textSizeClass = size >= 64 ? 'text-xl' : size >= 48 ? 'text-lg' : 'text-base';

  return (
    <View
      style={{ width: size, height: size }}
      className={`${radiusClass} ${bgClass} justify-center items-center ${className}`.trim()}
    >
      <Text className={`text-white font-bold ${textSizeClass}`}>{initials}</Text>
    </View>
  );
}
