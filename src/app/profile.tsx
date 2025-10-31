import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native';
import { Settings, Wine, Droplets, Thermometer, Percent, Pencil } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';

const CATEGORY_MAP = {
  types: { label: "Tipo de vino", icon: <Wine color="#7c2d12" size={20} /> },
  bodies: { label: "Cuerpo", icon: <Droplets color="#7c2d12" size={20} /> },
  intensities: { label: "Intensidad", icon: <Thermometer color="#7c2d12" size={20} /> },
  dryness: { label: "Seco", icon: <Droplets color="#7c2d12" size={20} /> },
  abv: { label: "Alcohol %", icon: <Percent color="#7c2d12" size={20} /> },
};

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
        className="py-4 border-b border-burgundy-900"
        onPress={onPress}
        disabled={!isEditing}
      >
        <View className="flex-row items-center mb-1">
          {icon}
          <Text className="text-white text-lg ml-3">{label}</Text>
        </View>
        <View className="items-center mt-2">
          <Text
            className={`text-base text-center ${isEditing ? 'text-burgundy-200' : 'text-white'}`}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {displayValue || 'Sin preferencia'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#7c2d12" />
        <Text className="text-white mt-4">Cargando perfil...</Text>
      </View>
    );
  }

  if (!loading && !profile) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white">No se pudo cargar el perfil.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#1a1410' }}>
      {/* Header */}
      <View className="bg-burgundy-900 pt-12 pb-6 px-6">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold">TuVino</Text>
            <Text className="text-burgundy-200 mt-1">Mi perfil y preferencias</Text>
          </View>
          <TouchableOpacity
            className="bg-burgundy-700 p-2 rounded-full"
            onPress={() => setIsEditing(!isEditing)}
          >
            <Pencil color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Profile Header */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-burgundy-800 items-center justify-center mb-4">
            <Image
              source={{ uri: 'https://ui-avatars.com/api/?name=Usuario&background=7c2d12&color=fff&size=128' }}
              className="w-full h-full rounded-full"
            />
          </View>
          <Text className="text-white text-2xl font-bold">{user?.name || 'Usuario'}</Text>
          <Text className="text-burgundy-200 mt-1">{profile?.level || 'Sin nivel'}</Text>
        </View>

        {/* Preferences Section */}
        <View className="bg-burgundy-800 rounded-2xl p-4 mb-8">
          <Text className="text-white text-xl font-bold mb-4">Preferencias de Vino</Text>
          {renderPreferenceItem('types', profile?.preferences?.types, () => openPreferenceModal('types'))}
          {renderPreferenceItem('bodies', profile?.preferences?.bodies, () => openPreferenceModal('bodies'))}
          {renderPreferenceItem('intensities', profile?.preferences?.intensities, () => openPreferenceModal('intensities'))}
          {renderPreferenceItem('dryness', profile?.preferences?.dryness, () => openPreferenceModal('dryness'))}
          {renderPreferenceItem('abv', profile?.preferences?.abv, () => openPreferenceModal('abv'))}

          {/* Save Button - centrado y dentro del card */}
          {isEditing && (
            <TouchableOpacity
              className="bg-burgundy-700 py-3 rounded-lg items-center mt-6 self-center w-2/3"
              onPress={() => setIsEditing(false)}
            >
              <Text className="text-white font-bold text-lg">Guardar preferencias</Text>
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
          <View className="bg-burgundy-900 rounded-t-3xl p-6 max-h-[70%]">
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-burgundy-700 rounded-full mb-4"></View>
              <Text className="text-white text-xl font-bold">
                {CATEGORY_MAP[currentCategory]?.label || 'Selecciona preferencia'}
              </Text>
            </View>
            <ScrollView className="py-2">
              {currentOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.id}
                  className="py-4 border-b border-burgundy-800"
                  onPress={() => handleSelectPreference(option)}
                >
                  <Text className="text-white text-lg">{option.option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              className="bg-burgundy-700 py-4 rounded-lg items-center mt-4"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white font-bold text-lg">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}