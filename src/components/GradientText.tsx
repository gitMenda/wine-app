// GradientText.tsx

import React from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';
import interpolate from 'color-interpolate';

const RED = '#ef4444';
const YELLOW = '#facc15';
const GREEN = '#22c55e';

const colorInterpolator = interpolate([RED, YELLOW, GREEN]);

interface GradientTextProps {
    value: number;
    style?: StyleProp<TextStyle>;
    children: React.ReactNode;
}

const GradientText: React.FC<GradientTextProps> = ({
                                                       value,
                                                       children,
                                                       style,
                                                   }) => {
    const clampedValue = Math.max(0, Math.min(1, value));

    const interpolatedColor = colorInterpolator(clampedValue);
    return (
        <Text style={[{ color: interpolatedColor }, style]}>
            {children}
        </Text>
    );
};

export default GradientText;