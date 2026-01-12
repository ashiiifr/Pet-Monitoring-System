import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme';

export const TitanButton = ({ onPress, title, icon, variant = 'primary', style }) => {
    const isPrimary = variant === 'primary';

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[
                styles.button,
                isPrimary ? styles.primary : styles.secondary,
                style
            ]}
        >
            {React.isValidElement(icon) ? (
                // If it's an element (e.g. <Plus />), clone it to add spacing
                React.cloneElement(icon, {
                    style: [{ marginRight: 8 }, icon.props.style]
                })
            ) : (
                // If it's a component (e.g. Plus), render it
                icon && React.createElement(icon, {
                    size: 20,
                    color: isPrimary ? '#FFF' : COLORS.textTitle,
                    style: { marginRight: 8 }
                })
            )}
            <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textSecondary]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    primary: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    secondary: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    textPrimary: {
        color: '#FFFFFF',
    },
    textSecondary: {
        color: COLORS.textTitle, // Fixed from textPrimary
    }
});
