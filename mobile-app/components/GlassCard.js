import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function GlassCard({ children, style, intensity = 20 }) {
    if (Platform.OS === 'web') {
        // Fallback for web since BlurView can be tricky
        return (
            <View style={[styles.webContainer, style]}>
                <LinearGradient
                    colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {children}
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <BlurView intensity={intensity} tint="dark" style={styles.blur}>
                <LinearGradient
                    colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {children}
                </LinearGradient>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    webContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)', // Strong blur for web
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    },
    blur: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        width: '100%',
        height: '100%',
        padding: 16,
    },
});
