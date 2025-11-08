import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { Settings, Wine, Droplets, Thermometer, Percent, Pencil, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { router } from 'expo-router';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORY_MAP = {
  types: { label: "Tipo de vino", icon: <Wine color="#3E2723" size={20} /> },
  bodies: { label: "Cuerpo", icon: <Droplets color="#3E2723" size={20} /> },
  intensities: { label: "Intensidad", icon: <Thermometer color="#3E2723" size={20} /> },
  dryness: { label: "Seco", icon: <Droplets color="#3E2723" size={20} /> },
  abv: { label: "Alcohol %", icon: <Percent color="#3E2723" size={20} /> },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Black background like other screens
  },
  header: {
    backgroundColor: '#F8D7DA', // Rosé Blush header
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: '#3E2723', // Barrel Brown
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#6B1E3A', // Malbec Plum
    marginTop: 4,
    fontSize: 14,
  },
  profileCard: {
    backgroundColor: '#F5F0E6', // Cork Beige
    padding: 24,
    margin: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  preferenceCard: {
    backgroundColor: '#F5F0E6', // Cork Beige
    padding: 20,
    margin: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileName: {
    color: '#3E2723', // Barrel Brown
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  profileLevel: {
    color: '#6B1E3A', // Malbec Plum
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    color: '#3E2723', // Barrel Brown
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  preferenceLabel: {
    color: '#3E2723', // Barrel Brown
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  preferenceValue: {
    color: '#3E2723', // Barrel Brown
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.8,
  },
  editButton: {
    backgroundColor: '#6B1E3A', // Malbec Plum
    padding: 12,
    borderRadius: 50,
  },
  saveButton: {
    backgroundColor: '#6B1E3A', // Malbec Plum
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    alignSelf: 'center',
  },
  saveButtonText: {
    color: '#F5F0E6', // Cork Beige
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    backgroundColor: '#F5F0E6', // Cork Beige
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    color: '#3E2723', // Barrel Brown
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E7DFD6',
  },
  modalOptionText: {
    color: '#3E2723', // Barrel Brown
    fontSize: 16,
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6B1E3A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCancelText: {
    color: '#6B1E3A', // Malbec Plum
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function WineProfileScreen() {
  const { user } = useAuth();
  const { top } = useSafeAreaInsets();
  const userId = user?.id;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Opciones de preferencias
  const [options, setOptions] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null);
  const [currentOptions, setCurrentOptions] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Cargar preferencias del usuario
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    apiClient.get(`/preferences/users/${userId}`)
      .then(setProfile)
      .catch((err) => {
        setProfile(null);
        console.error('Error cargando perfil:', err);
      })
      .finally(() => setLoading(false));
    apiClient.get('/preferences/options')
      .then(setOptions)
      .catch((err) => {
        setOptions([]);
        console.error('Error cargando opciones:', err);
      });
  }, [userId]);

  // Abrir modal para editar preferencia
  const openPreferenceModal = (category: string) => {
    if (!isEditing) return;
    setCurrentCategory(category);
    // Buscar el category_id en las opciones
    const catOption = options.find(opt => opt.category.name.toLowerCase().includes(category));
    setCurrentCategoryId(catOption?.category.id || null);
    // Opciones de esa categoría
    setCurrentOptions(options.filter(opt => opt.category.name.toLowerCase().includes(category)));
    setModalVisible(true);
  };

  // Guardar preferencia editada
  const handleSelectPreference = async (option: any) => {
    if (!userId || !currentCategoryId) return;
    setLoading(true);
    try {
      await apiClient.put(
        `/preferences/users/${userId}/categories/${currentCategoryId}`,
        { option_ids: [option.id] }
      );
      // Refresca perfil
      const updated = await apiClient.get(`/preferences/users/${userId}`);
      setProfile(updated);
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  // Renderiza cada preferencia
  const renderPreferenceItem = (category: string, value: any, onPress: () => void) => {
    const { label, icon } = CATEGORY_MAP[category];
    let displayValue = '';
    if (options.length && value) {
      const optId = Object.keys(value)[0];
      const opt = options.find(o => o.id == optId);
      displayValue = opt ? opt.option : value[optId];
    }
    return (
      <TouchableOpacity
        style={[
          styles.preferenceCard,
          { marginVertical: 6, opacity: isEditing ? 1 : 0.8 }
        ]}
        onPress={onPress}
        disabled={!isEditing}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            {icon}
            <Text style={styles.preferenceLabel}>{label}</Text>
          </View>
          {isEditing && (
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6B1E3A' }} />
          )}
        </View>
        <Text style={styles.preferenceValue}>
          {displayValue || 'Sin preferencia'}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: top }]}>
          <View className="flex-row justify-between items-center">
            <View>
              <Text style={styles.headerTitle}>Mi Perfil</Text>
              <Text style={styles.headerSubtitle}>Cargando información...</Text>
            </View>
          </View>
        </View>
        
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6B1E3A" />
          <Text className="text-white mt-4">Cargando perfil...</Text>
        </View>
      </View>
    );
  }

  if (!loading && !profile) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: top }]}>
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <ArrowLeft color="#3E2723" size={24} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text style={styles.headerTitle}>Mi Perfil</Text>
              <Text style={styles.headerSubtitle}>Error al cargar información</Text>
            </View>
          </View>
        </View>
        
        <View className="flex-1 justify-center items-center px-8">
          <Text style={styles.sectionTitle}>No se pudo cargar el perfil</Text>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => router.back()}
          >
            <Text style={styles.saveButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: top }]}>
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft color="#3E2723" size={24} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <Text style={styles.headerSubtitle}>Preferencias y configuración</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Pencil color="#F5F0E6" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View className="items-center">
            <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: '#6B1E3A' }}>
              <Image
                source={{ 
                  uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Usuario')}&background=6B1E3A&color=F5F0E6&size=128`
                }}
                className="w-full h-full rounded-full"
              />
            </View>
            <Text style={styles.profileName}>{user?.name || 'Usuario'}</Text>
            <Text style={styles.profileLevel}>{profile?.level || 'Nivel principiante'}</Text>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={[styles.profileCard, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>Preferencias de Vino</Text>
          {renderPreferenceItem('types', profile?.preferences?.types, () => openPreferenceModal('types'))}
          {renderPreferenceItem('bodies', profile?.preferences?.bodies, () => openPreferenceModal('bodies'))}
          {renderPreferenceItem('intensities', profile?.preferences?.intensities, () => openPreferenceModal('intensities'))}
          {renderPreferenceItem('dryness', profile?.preferences?.dryness, () => openPreferenceModal('dryness'))}
          {renderPreferenceItem('abv', profile?.preferences?.abv, () => openPreferenceModal('abv'))}

          {/* Save Button */}
          {isEditing && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.saveButtonText}>Guardar preferencias</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Preference Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end">
          <View style={styles.modalContainer}>
            <View className="items-center mb-4">
              <View className="w-12 h-1 rounded-full mb-4" style={{ backgroundColor: '#6B1E3A' }}></View>
              <Text style={styles.modalTitle}>
                {CATEGORY_MAP[currentCategory]?.label || 'Selecciona preferencia'}
              </Text>
            </View>
            <ScrollView className="py-2">
              {currentOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.modalOption}
                  onPress={() => handleSelectPreference(option)}
                >
                  <Text style={styles.modalOptionText}>{option.option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}