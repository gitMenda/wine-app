import React, { useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Platform,
} from 'react-native';

// La interfaz de las props ahora acepta 'vintagesString' como un string.
interface HorizontalScrollProps {
    vintagesString: string; // Ej: "2021, 2020, 2019, 2001"
    onVintageSelect?: (vintage: string) => void;
    selectedVintage?: string | null;
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({
                                                         vintagesString,
                                                         onVintageSelect,
                                                         selectedVintage = null,
                                                     }) => {
    // 1. Hook useMemo para parsear el string solo cuando cambie.
    // Esto previene la re-ejecución del split/trim en cada renderizado.
    const vintages = useMemo(() => {
        if (!vintagesString) return [];

        // Divide el string por comas (",")
        return vintagesString
            .split(',')
            // Limpia (trim) los espacios en blanco de cada elemento
            .map(s => s.trim())
            // Filtra elementos vacíos que puedan resultar de comas extra
            .filter(s => s.length > 0);
    }, [vintagesString]);

    // Si no hay añadas válidas, se puede retornar un mensaje o null
    if (vintages.length === 0) {
        return (
            <View style={[styles.container, styles.emptyContainer]}>
                <Text style={styles.emptyText}>Sin datos disponibles.</Text>
            </View>
        );
    }

    // Función para renderizar cada "chip" (añada)
    const renderVintageChip = (vintage: string) => {
        const isSelected = vintage === selectedVintage;

        return (
            <TouchableOpacity
                key={vintage}
                onPress={() => onVintageSelect && onVintageSelect(vintage)}
                style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                    !isSelected && styles.chipUnselectedBorder,
                ]}
                activeOpacity={0.7}
            >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {vintage}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                {/* Mapea el array de strings de añadas */}
                {vintages.map(renderVintageChip)}
            </ScrollView>
        </View>
    );
};

// --- Estilos (sin cambios significativos) ---
const styles = StyleSheet.create({
    container: {
        paddingVertical: 15,
        borderRadius: 8,
        marginVertical: 10,
    },
    emptyContainer: {
        paddingBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
        paddingHorizontal: 15,
    },
    emptyText: {
        fontSize: 14,
        color: '#D4C7C7',
        paddingHorizontal: 15,
    },
    scrollViewContent: {
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    chipUnselectedBorder: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#73415A',
    },
    chipSelected: {
        backgroundColor: '#9A2D54',
        borderWidth: 1,
        borderColor: '#9A2D54',
    },
    chipText: {
        fontSize: 14,
        color: '#D4C7C7',
        fontWeight: '600',
    },
    chipTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default HorizontalScroll;