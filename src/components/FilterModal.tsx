import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView} from 'react-native';
import Button from './Button';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

interface FilterProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: WineFilters) => void;
  initialFilters: WineFilters;
}

export interface WineFilters {
  wine_name?: string;
  wine_type?: string;
  winery?: string;
  country?: string;
  region?: string;
  min_abv?: number;
  max_abv?: number;
}

export default function FilterModal({ visible, onClose, onApplyFilters, initialFilters }: FilterProps) {
  const [filters, setFilters] = useState<WineFilters>(initialFilters);

  const handleChange = (key: keyof WineFilters, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFilters({
      wine_name: initialFilters.wine_name, // Keep the search term
      wine_type: undefined,
      winery: undefined,
      country: undefined,
      region: undefined,
      min_abv: undefined,
      max_abv: undefined
    });
  };

  // Asegúrate de que handleApply envíe los datos en el formato correcto:
  const handleApply = () => {
    // Eliminar valores undefined o vacíos antes de enviar
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => 
        value !== undefined && value !== "" && value !== null
      )
    );
    
    onApplyFilters(cleanFilters);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/60">
        <View className="bg-gray-800 rounded-t-xl mt-auto h-4/5">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-700">
            <Text className="text-white text-xl font-bold">Filtros de búsqueda</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="p-4">
            <View className="mb-4">
              <Text className="text-white text-lg mb-2">Tipo de vino</Text>
              <TextInput
                className="border border-gray-600 p-2 rounded bg-gray-700 text-white"
                placeholder="Ej: Tinto, Blanco, Rosado..."
                placeholderTextColor="#888"
                value={filters.wine_type}
                onChangeText={(text) => handleChange('wine_type', text || undefined)}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-white text-lg mb-2">Bodega</Text>
              <TextInput
                className="border border-gray-600 p-2 rounded bg-gray-700 text-white"
                placeholder="Nombre de la bodega"
                placeholderTextColor="#888"
                value={filters.winery}
                onChangeText={(text) => handleChange('winery', text || undefined)}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-white text-lg mb-2">País</Text>
              <TextInput
                className="border border-gray-600 p-2 rounded bg-gray-700 text-white"
                placeholder="País de origen"
                placeholderTextColor="#888"
                value={filters.country}
                onChangeText={(text) => handleChange('country', text || undefined)}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-white text-lg mb-2">Región</Text>
              <TextInput
                className="border border-gray-600 p-2 rounded bg-gray-700 text-white"
                placeholder="Región de origen"
                placeholderTextColor="#888"
                value={filters.region}
                onChangeText={(text) => handleChange('region', text || undefined)}
              />
            </View>
            
            <View className="mb-6">
              <Text className="text-white text-lg mb-2">Graduación alcohólica (ABV)</Text>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-400">Min: {filters.min_abv || 0}%</Text>
                <Text className="text-gray-400">Max: {filters.max_abv || 20}%</Text>
              </View>
              <View className="flex-row items-center">
                <TextInput
                  className="border border-gray-600 p-2 rounded bg-gray-700 text-white w-16 mr-2"
                  keyboardType="numeric"
                  value={filters.min_abv?.toString() || ''}
                  onChangeText={(value) => handleChange('min_abv', value ? Number(value) : undefined)}
                />
                <Slider
                  style={{ flex: 1, height: 40 }}
                  minimumValue={0}
                  maximumValue={20}
                  step={0.5}
                  value={filters.min_abv || 0}
                  onValueChange={(value) => handleChange('min_abv', value)}
                  minimumTrackTintColor="#9D174D"
                  maximumTrackTintColor="#505050"
                  thumbTintColor="#9D174D"
                />
              </View>
              <View className="flex-row items-center mt-2">
                <TextInput
                  className="border border-gray-600 p-2 rounded bg-gray-700 text-white w-16 mr-2"
                  keyboardType="numeric"
                  value={filters.max_abv?.toString() || ''}
                  onChangeText={(value) => handleChange('max_abv', value ? Number(value) : undefined)}
                />
                <Slider
                  style={{ flex: 1, height: 40 }}
                  minimumValue={0}
                  maximumValue={20}
                  step={0.5}
                  value={filters.max_abv || 20}
                  onValueChange={(value) => handleChange('max_abv', value)}
                  minimumTrackTintColor="#9D174D"
                  maximumTrackTintColor="#505050"
                  thumbTintColor="#9D174D"
                />
              </View>
            </View>
          </ScrollView>
          
          <View className="p-4 border-t border-gray-700 flex-row justify-between">
            <Button 
              title="Limpiar" 
              variant="secondary"
              onPress={handleClear}
              className="flex-1 mr-2"
            />
            <Button 
              title="Aplicar filtros" 
              variant="primary"
              onPress={handleApply}
              className="flex-1 ml-2"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}