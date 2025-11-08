import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Camera, ArrowLeft, ImageIcon, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/hooks/useAuth';
import { MenuRecommendationResponse } from '@/types/menu';
import { apiClient } from '@/lib/api';

export default function ScanMenuScreen() {
  const { top } = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Helper function to upload image as base64 JSON - follows the same pattern as apiClient
  const uploadMenuImage = async (imageUri: string, userId: string): Promise<MenuRecommendationResponse> => {
    // Read the image file and convert to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Convert blob to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64String = base64data.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    // Send as JSON using apiClient (which handles auth automatically)
    return await apiClient.post('/menu/parse', {
      user_id: userId,
      image_base64: base64,
    });
  };

  const pickImageFromGallery = async () => {
    try {
      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios', 
          'Necesitamos acceso a tu galería para seleccionar fotos de menús.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configuración', onPress: () => {
              // On iOS, this would open settings, but we'll show a helpful message
              Alert.alert('Configuración', 'Ve a Configuración > TuVino > Fotos para permitir el acceso.');
            }}
          ]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Updated from deprecated MediaTypeOptions
        allowsEditing: false, // Don't force cropping - we want the full menu
        quality: 0.9, // Higher quality for better text recognition
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert(
        'Error', 
        'No se pudo acceder a la galería. Intentá nuevamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const takePhoto = async () => {
    // Placeholder for camera functionality  
    Alert.alert('Tomar foto', 'Función de cámara estará disponible próximamente', [
      { text: 'Simular foto', onPress: () => {
        // Simulate photo capture with a placeholder
        setSelectedImage('https://via.placeholder.com/400x300/6B1E3A/F5F0E6?text=Carta+Fotografiada');
      }},
      { text: 'Cancelar', style: 'cancel' }
    ]);
  };

  const analyzeMenu = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    
    try {
      console.log('=== STARTING MENU ANALYSIS ===');
      console.log('User ID:', user?.id || user?.sub);
      console.log('Image URI:', selectedImage);
      
      // Step 1: Create FormData object for multipart/form-data request
      const formData = new FormData();
      
      // Step 2: Extract filename from URI
      const fileUri = selectedImage;
      const filename = fileUri.split('/').pop() || 'menu.jpg';
      
      console.log('Filename:', filename);
      
      // Step 3: Append user_id as a text field
      const userId = user?.id || user?.sub || 'anonymous';
      formData.append('user_id', userId);
      console.log('Added user_id to FormData:', userId);
      
      // Step 4: Append image file with React Native's file structure
      // This is the correct format for React Native file uploads
      const fileObject = {
        uri: fileUri,
        type: 'image/jpeg',  // MIME type
        name: filename,       // Original filename
      };
      
      formData.append('image', fileObject as any);
      console.log('Added image to FormData:', fileObject);
      
      console.log('=== CALLING API ===');
      
      // Step 5: Use uploadMenuImage helper (it handles auth automatically via apiClient)
      const result: MenuRecommendationResponse = await uploadMenuImage(fileUri, userId);
      
      console.log('=== API RESPONSE SUCCESS ===');
      console.log('Result:', JSON.stringify(result, null, 2));
      
      setIsAnalyzing(false);
      
      // Step 6: Show success message with summary
      const wineCount = result.recommendations?.length || 0;
      const summaryText = result.summary || 
        (wineCount > 0 ? 
          `Encontramos ${wineCount} vinos del menú que podrían gustarte.` : 
          'Encontramos varios vinos que podrían gustarte.'
        );
      
      // Navigate to menu recommendations screen with data
      router.push({
        pathname: '/menu-recommendations',
        params: {
          summary: result.summary,
          recommendations: JSON.stringify(result.recommendations),
        }
      });
      
    } catch (error) {
      setIsAnalyzing(false);
      console.error('=== ANALYSIS ERROR ===');
      console.error('Error:', error);
      
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      Alert.alert(
        'Error de análisis',
        `No pudimos procesar el menú. ${error instanceof Error ? error.message : 'Error desconocido'}`,
        [
          { text: 'Reintentar', onPress: analyzeMenu },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View style={{ backgroundColor: '#F8D7DA', paddingTop: top, paddingBottom: 24, paddingHorizontal: 24 }}>
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft color="#3E2723" size={24} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text style={{ color: '#3E2723', fontSize: 24, fontWeight: 'bold' }}>Escanear Carta</Text>
            <Text style={{ color: '#6B1E3A', marginTop: 4, fontSize: 14 }}>
              Fotografiá el menú y encontrá tu vino ideal
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
        {/* Hero Section - Only show when no image selected */}
        {!selectedImage && (
          <View className="mb-8">
            <View className="items-center mb-6">
              <View 
                className="p-8 rounded-full mb-6"
                style={{ backgroundColor: '#6B1E3A' }}
              >
                <Camera color="#F5F0E6" size={48} />
              </View>
              
              <Text className="text-white text-2xl font-bold text-center mb-3">
                Subí una foto del menú
              </Text>
              <Text className="text-gray-400 text-lg text-center mb-8">
                Nuestro sistema analizará los vinos disponibles y te sugerirá los mejores para vos.
              </Text>
            </View>
          </View>
        )}

        {/* Image Preview - Full Size when uploaded */}
        {selectedImage ? (
          <View className="mb-8">
            {/* Full size image display */}
            <View 
              className="rounded-2xl overflow-hidden shadow-lg mb-6"
              style={{ backgroundColor: '#F5F0E6' }}
            >
              <Image 
                source={{ uri: selectedImage }} 
                style={{ width: '100%', height: 300 }}
                resizeMode="contain"
              />
            </View>
          </View>
        ) : (
          /* Action Cards - Only show when no image selected */
          <View className="flex-row flex-wrap gap-4 mb-8">
            {/* Camera Card */}
            <TouchableOpacity 
              className="flex-1 min-w-[45%] rounded-2xl shadow-lg"
              style={{ 
                backgroundColor: '#F5F0E6',
                padding: 20,
                minHeight: 140
              }}
              onPress={takePhoto}
            >
              <View className="p-3 rounded-full w-12 h-12 items-center justify-center mb-4" style={{ backgroundColor: '#3E2723' }}>
                <Camera color="#F5F0E6" size={24} />
              </View>
              <Text className="text-lg font-semibold mb-2" style={{ color: '#3E2723' }}>
                Tomar foto
              </Text>
              <Text className="text-sm" style={{ color: '#3E2723', opacity: 0.7 }}>
                Fotografiá directamente el menú del restaurante
              </Text>
            </TouchableOpacity>

            {/* Gallery Card */}
            <TouchableOpacity 
              className="flex-1 min-w-[45%] rounded-2xl shadow-lg"
              style={{ 
                backgroundColor: '#F5F0E6',
                padding: 20,
                minHeight: 140
              }}
              onPress={pickImageFromGallery}
            >
              <View className="p-3 rounded-full w-12 h-12 items-center justify-center mb-4" style={{ backgroundColor: '#3E2723' }}>
                <ImageIcon color="#F5F0E6" size={24} />
              </View>
              <Text className="text-lg font-semibold mb-2" style={{ color: '#3E2723' }}>
                Desde galería
              </Text>
              <Text className="text-sm" style={{ color: '#3E2723', opacity: 0.7 }}>
                Subí una foto que ya tengas guardada
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Analyze Hero Button */}
        {selectedImage && (
          <View className="mb-8">
            <TouchableOpacity 
              className="rounded-3xl shadow-2xl overflow-hidden"
              style={{ 
                backgroundColor: '#6B1E3A', 
                minHeight: 200,
                borderWidth: 2,
                borderColor: '#8B2E4A'
              }}
              onPress={analyzeMenu}
              disabled={isAnalyzing}
            >
              {/* Badge */}
              <View 
                className="absolute top-4 right-4 px-3 py-1 rounded-full z-10"
                style={{ backgroundColor: '#FFD54F' }}
              >
                <Text className="text-xs font-bold" style={{ color: '#3E2723' }}>
                  {isAnalyzing ? 'Procesando...' : 'Listo para analizar'}
                </Text>
              </View>

              <View className="px-8 py-10">
                <View className="items-center mb-8">
                  <View 
                    className="p-6 rounded-full mb-5"
                    style={{ backgroundColor: '#F5F0E6' }}
                  >
                    {isAnalyzing ? (
                      <ActivityIndicator size="large" color="#6B1E3A" />
                    ) : (
                      <Sparkles color="#6B1E3A" size={42} />
                    )}
                  </View>
                  
                  <Text className="text-2xl font-bold text-center mb-3" style={{ color: '#F5F0E6' }}>
                    {isAnalyzing ? 'Analizando menú...' : 'Analizar y obtener sugerencias'}
                  </Text>
                  <Text className="text-lg text-center mb-8" style={{ color: '#F8D7DA' }}>
                    {isAnalyzing ? 'Esto puede tomar unos segundos' : 'Descubrí qué vinos del menú son perfectos para vos'}
                  </Text>
                </View>

                {/* CTA Text - Enhanced visibility */}
                {!isAnalyzing && (
                  <View className="items-center">
                    <Text className="text-lg font-bold text-center" style={{ color: '#FFD54F' }}>
                      Tocar para comenzar análisis
                    </Text>
                  </View>
                )}
              </View>

              {/* Subtle decoration */}
              <View 
                className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full opacity-10"
                style={{ backgroundColor: '#F5F0E6' }}
              />
              <View 
                className="absolute -top-2 -left-2 w-12 h-12 rounded-full opacity-10"
                style={{ backgroundColor: '#F5F0E6' }}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Change Photo Button - Only show when image is selected */}
        {selectedImage && (
          <View className="mb-8">
            <View className="flex-row justify-center">
              <TouchableOpacity
                className="px-6 py-3 rounded-xl"
                style={{ backgroundColor: 'rgba(107, 30, 58, 0.1)', borderWidth: 1, borderColor: '#6B1E3A' }}
                onPress={() => setSelectedImage(null)}
              >
                <Text style={{ color: '#6B1E3A', fontSize: 16, fontWeight: '600' }}>
                  Cambiar foto
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tips Section - Only show when no image selected */}
        {!selectedImage && (
          <View 
            className="rounded-2xl p-6 mb-8"
            style={{ backgroundColor: '#F5F0E6' }}
          >
            <Text className="text-lg font-semibold mb-4" style={{ color: '#3E2723' }}>
              💡 Consejos para mejores resultados
            </Text>
            <View className="space-y-3">
              <Text className="text-sm" style={{ color: '#3E2723', opacity: 0.8 }}>
                • Asegurate de que el texto sea legible
              </Text>
              <Text className="text-sm" style={{ color: '#3E2723', opacity: 0.8 }}>
                • Incluí la sección de vinos completa
              </Text>
              <Text className="text-sm" style={{ color: '#3E2723', opacity: 0.8 }}>
                • Evitá sombras o reflejos en la foto
              </Text>
              <Text className="text-sm" style={{ color: '#3E2723', opacity: 0.8 }}>
                • Una buena iluminación mejora la precisión
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}