import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, StyleSheet} from 'react-native';
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
  wine_types?: string[];  // Multiple wine types
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

  const handleMinAbvChange = (value: number) => {
    // Ensure min doesn't exceed max
    const maxAbv = filters.max_abv || 20;
    const newMin = Math.min(value, maxAbv);
    setFilters(prev => ({ ...prev, min_abv: newMin }));
  };

  const handleMaxAbvChange = (value: number) => {
    // Ensure max doesn't go below min
    const minAbv = filters.min_abv || 0;
    const newMax = Math.max(value, minAbv);
    setFilters(prev => ({ ...prev, max_abv: newMax }));
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
      <View className="flex-1" style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros de búsqueda</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#CECCCD" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4">
            <View className="mb-4">
              <Text style={styles.label}>Tipo de vino</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Tinto, Blanco, Rosado..."
                placeholderTextColor="#6B7280"
                value={filters.wine_type}
                onChangeText={(text) => handleChange('wine_type', text || undefined)}
              />
            </View>

            <View className="mb-4">
              <Text style={styles.label}>Bodega</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre de la bodega"
                placeholderTextColor="#6B7280"
                value={filters.winery}
                onChangeText={(text) => handleChange('winery', text || undefined)}
              />
            </View>

            <View className="mb-4">
              <Text style={styles.label}>País</Text>
              <TextInput
                style={styles.input}
                placeholder="País de origen"
                placeholderTextColor="#6B7280"
                value={filters.country}
                onChangeText={(text) => handleChange('country', text || undefined)}
              />
            </View>

            <View className="mb-4">
              <Text style={styles.label}>Región</Text>
              <TextInput
                style={styles.input}
                placeholder="Región de origen"
                placeholderTextColor="#6B7280"
                value={filters.region}
                onChangeText={(text) => handleChange('region', text || undefined)}
              />
            </View>


            <View className="mb-6">
              <Text style={styles.label}>Graduación alcohólica (ABV)</Text>
              <View style={styles.abvLabels}>
                <Text style={styles.abvValue}>Mínimo: {(filters.min_abv || 0).toFixed(1)}%</Text>
                <Text style={styles.abvValue}>Máximo: {(filters.max_abv || 20).toFixed(1)}%</Text>
              </View>

              {/* Min Slider */}
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>Min</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={20}
                  step={0.5}
                  value={filters.min_abv || 0}
                  onValueChange={handleMinAbvChange}
                  minimumTrackTintColor="#6B1E3A"
                  maximumTrackTintColor="#374151"
                  thumbTintColor="#6B1E3A"
                />
              </View>

              {/* Max Slider */}
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>Max</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={20}
                  step={0.5}
                  value={filters.max_abv || 20}
                  onValueChange={handleMaxAbvChange}
                  minimumTrackTintColor="#6B1E3A"
                  maximumTrackTintColor="#374151"
                  thumbTintColor="#6B1E3A"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Limpiar"
              variant="secondary"
              onPress={handleClear}
              className="flex-1 mr-2"
            />
            <Button
              title="Aplicar"
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

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#0F0105',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 'auto',
    height: '80%',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  modalTitle: {
    color: '#CECCCD',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: '#CECCCD',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0D0D0D',
    color: '#CECCCD',
    fontSize: 14,
  },
  abvLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  abvValue: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    color: '#CECCCD',
    fontSize: 14,
    fontWeight: '600',
    width: 40,
    marginRight: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
});