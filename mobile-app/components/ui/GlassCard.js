import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme';

export const GlassCard = ({ children, style, variant = 'subtle' }) => {
    // Variants control the gradient intensity
    const colors = variant === 'active'
        ? [COLORS.surfacefloat, '#1e1b4b'] // Indigo tint
        : [COLORS.surfaceCard, COLORS.surfacefloat];

    return (
        <View style={[styles.container, style]}>
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {children}
            </LinearGradient>
            <View style={styles.border} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: COLORS.surfaceCard, // Fallback
    },
    gradient: {
        padding: 20,
        height: '100%',
        width: '100%',
    },
    border: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        zIndex: 2,
        pointerEvents: 'none'
    }
});
