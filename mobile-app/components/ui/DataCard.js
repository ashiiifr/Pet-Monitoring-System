import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS, TYPOGRAPHY, METRICS } from '../../theme';

export const DataCard = ({ label, children, style, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
            speed: 20
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20
        }).start();
    };

    const Container = onPress ? TouchableOpacity : View;

    return (
        <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
            <Container
                activeOpacity={1}
                onPress={onPress}
                onPressIn={onPress ? handlePressIn : undefined}
                onPressOut={onPress ? handlePressOut : undefined}
                style={styles.card}
            >
                {label && <Text style={styles.label}>{label.toUpperCase()}</Text>}
                {children}
            </Container>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surfaceCard,
        borderRadius: METRICS.radius,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.divider,
    },
    label: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textMuted,
        fontSize: 10,
        marginBottom: 10,
    }
});
