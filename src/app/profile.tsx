import React, {useCallback, useEffect, useState} from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { Settings, Wine, Droplets, Thermometer, Percent, Pencil, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { router } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import {User} from "@/types/user";

cssInterop(LinearGradient, {
  className: "style",
});

const CATEGORY_MAP = {
  types: { label: "Tipo de vino", icon: <Wine color="#3E2723" size={20} /> },
  bodies: { label: "Cuerpo", icon: <Droplets color="#3E2723" size={20} /> },
  intensities: { label: "Intensidad", icon: <Thermometer color="#3E2723" size={20} /> },
  dryness: { label: "Sequedad / Suavidad", icon: <Droplets color="#3E2723" size={20} /> },
  abv: { label: "Alcohol %", icon: <Percent color="#3E2723" size={20} /> },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'transparent',
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: '#CECCCD',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#CECCCD',
    marginTop: 4,
    fontSize: 14,
    opacity: 0.8,
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
    backgroundColor: 'black',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTitle: {
    color: '#CECCCD',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#20040E',
  },
  modalOptionText: {
    color: '#CECCCD',
    fontSize: 16,
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#45081E',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCancelText: {
    color: '#CECCCD',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function WineProfileScreen() {
  const { user } = useAuth();
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

    const [userInfo, setUserInfo] = useState<User>();

    const fetchUser = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await apiClient.get(`/users/${encodeURIComponent(userId)}`);
            const data = response.data || response;

            const normalized = {
                uid: data?.uid,
                username: data?.username,
                email: data?.email,
                onBoardingCompleted: data?.onBoardingCompleted
            };
            setUserInfo(normalized as User);
        } catch (e: any) {
            console.error('Error fetching user:', e);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchUser();
        }
    }, [fetchUser, userId]);


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
    const { label } = CATEGORY_MAP[category];
    let displayValue = '';
    if (options.length && value) {
      const optId = Object.keys(value)[0];
      const opt = options.find(o => o.id == optId);
      displayValue = opt ? opt.option : value[optId];
    }
    return (
      <View>
        <TouchableOpacity
          className="flex-row items-center justify-between py-4"
          style={{ opacity: isEditing ? 1 : 0.8 }}
          onPress={onPress}
          disabled={!isEditing}
        >
          <Text className="text-text text-base font-semibold">{label}</Text>
          <Text className="text-text text-base opacity-70">
            {displayValue || 'Sin preferencia'}
          </Text>
        </TouchableOpacity>
        <View className="h-px bg-burgundy-800 opacity-30" />
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1" style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View className="flex-row justify-between items-center">
            <View>
              <Text style={styles.headerTitle}>Mi Perfil</Text>
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
      <View className="flex-1" style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <ArrowLeft color="#CECCCD" size={24} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text style={styles.headerTitle}>Mi Perfil</Text>
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
      <View className="flex-1" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft color="#3E2723" size={24} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text style={styles.headerTitle}>Mi Perfil</Text>
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
        {/* Profile Section */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: '#6B1E3A' }}>
            <Image
              source={{ 
                uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo?.username || 'Usuario')}&background=6B1E3A&color=F5F0E6&size=128`
              }}
              className="w-full h-full rounded-full"
            />
          </View>
          <Text className="text-text text-2xl font-bold text-center">{userInfo?.username || 'Usuario'}</Text>
          <Text className="text-burgundy-600 text-base text-center mt-1">{profile?.level || 'Nivel principiante'}</Text>
        </View>

        {/* Preferences Section */}
        <View className="mb-6">
          <Text className="text-text text-xl font-bold mb-4">Preferencias de vino</Text>
          {renderPreferenceItem('types', profile?.preferences?.types, () => openPreferenceModal('types'))}
          {renderPreferenceItem('bodies', profile?.preferences?.bodies, () => openPreferenceModal('bodies'))}
          {renderPreferenceItem('intensities', profile?.preferences?.intensities, () => openPreferenceModal('intensities'))}
          {renderPreferenceItem('dryness', profile?.preferences?.dryness, () => openPreferenceModal('dryness'))}
          {renderPreferenceItem('abv', profile?.preferences?.abv, () => openPreferenceModal('abv'))}

          {/* Save Button */}
          {isEditing && (
            <TouchableOpacity
              className="rounded-3xl overflow-hidden border border-primary mt-4"
              onPress={() => setIsEditing(false)}
            >
              <LinearGradient
                colors={['#300615', '#45081E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-6 py-3 items-center"
                style={{ borderRadius: 16 }}
              >
                <Text className="text-white text-base font-bold">Guardar preferencias</Text>
              </LinearGradient>
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
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
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