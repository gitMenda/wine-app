import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import OnboardingOption from '@/components/OnboardingOption';

const tastingNoteOptions = [
  {
    id: 'fruity',
    title: 'Afrutado',
    description: 'Sabores de frutas del bosque, cítricas y tropicales'
  },
  {
    id: 'earthy',
    title: 'Terroso',
    description: 'Notas minerales, de suelo y de champiñones'
  },
  {
    id: 'spicy',
    title: 'Especiado',
    description: 'Sabores de pimienta, canela y clavo'
  },
  {
    id: 'floral',
    title: 'Floral',
    description: 'Aromas de rosa, violeta y lavanda'
  },
  {
    id: 'oaky',
    title: 'Amaderado',
    description: 'Vainilla, tostado, humo de la crianza en barrica'
  },
  {
    id: 'crisp',
    title: 'Fresco y Vivo',
    description: 'Vinos limpios, brillantes y refrescantes'
  }
];

export default function TastingNotesScreen() {
  const { top } = useSafeAreaInsets();
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);

  const toggleNote = (noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleContinue = () => {
    if (selectedNotes.length > 0) {
      router.push('/(onboarding)/learning-goals');
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <ScrollView className="flex-1 px-8 py-6">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-black dark:text-white mb-2">
            What flavors do you enjoy?
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Select the tasting notes that appeal to you most.
          </Text>
        </View>

        <View className="mb-8">
          {tastingNoteOptions.map((option) => (
            <OnboardingOption
              key={option.id}
              title={option.title}
              description={option.description}
              isSelected={selectedNotes.includes(option.id)}
              onPress={() => toggleNote(option.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="px-8 pb-8">
        <Text className="text-center text-gray-500 dark:text-gray-400 mb-4">
          {selectedNotes.length} selected
        </Text>
        <Button
          title="Continue"
          onPress={handleContinue}
          variant={selectedNotes.length > 0 ? "primary" : "secondary"}
          disabled={selectedNotes.length === 0}
        />
      </View>
    </View>
  );
}