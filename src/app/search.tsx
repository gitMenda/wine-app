import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { apiClient } from '@/lib/api';  // Importa el cliente

interface Wine {
  wineId: number;  // Cambia a camelCase para coincidir con la API
  wineName: string;
  type: string;
  elaborate: string;
  grapes: string;
  harmonize: string;
  abv: number;
  body: string;
  acidity: string;
  country: string;
  region: string;
  winery: string;
  vintages: string;
  id?: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await apiClient.get(`/wines/search?wine_name=${encodeURIComponent(query)}`);
      setResults(data);  // Ahora debería mapear correctamente
    } catch (error) {
      console.error('Error fetching wines:', error);
      setResults([]);
    }
    setLoading(false);
  };

  const renderItem = ({ item }: { item: Wine }) => (
    <TouchableOpacity
      className="bg-gray-800 p-4 m-2 rounded-lg shadow-md border border-gray-600"  // Cambia a bg-gray-800
      onPress={() => router.push(`/wine/${item.wineId}`)}
    >
      <Text className="text-xl font-bold mb-2 text-white">{item.wineName}</Text>  // Agrega text-white
      <Text className="text-gray-300 mb-1">Tipo: {item.type}</Text>  // Ya es gris claro
      <Text className="text-gray-300 mb-1">País: {item.country}</Text>
      <Text className="text-gray-300 mb-1">Región: {item.region}</Text>
      <Text className="text-gray-300">Bodega: {item.winery}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 p-4 pt-8 dark:bg-gray-900">  // Agrega pt-8
      <Text className="text-2xl font-bold mb-4 text-white">Buscar Vinos</Text>  // Agrega text-white
      <TextInput
        className="border border-gray-600 p-2 mb-4 rounded bg-gray-800 text-white"  // Agrega bg-gray-800 y text-white
        placeholder="Ingresa el nombre del vino..."
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Buscar" onPress={handleSearch} variant="primary" />
      {loading && <Text className="mt-4 text-white">Cargando...</Text>}  // Agrega text-white
      <FlatList
        data={results}
        keyExtractor={(item) => item.wineId.toString()}
        renderItem={renderItem}
        className="mt-4"
      />
    </View>
  );
}