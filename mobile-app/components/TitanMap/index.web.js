import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

// Simple fallback for Web
const MapView = ({ children, style, ...props }) => {
    return (
        <View style={[style, styles.container]}>
            <Image
                source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-73.968285,40.785091,14,0/600x600?access_token=mock' }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            />
            <View style={styles.overlay}>
                <Text style={styles.text}>TACTICAL MAP OFFLINE (WEB)</Text>
                <Text style={styles.subtext}>Native Module Required</Text>
            </View>
            {/* Render children so custom UI overlays still appear if they are children */}
            {children}
        </View>
    );
};

export const Marker = ({ children }) => <View>{children}</View>;
export const Circle = () => null;
export const Polyline = () => null;
export const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    overlay: {
        position: 'absolute',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        alignItems: 'center',
        zIndex: 0
    },
    text: {
        color: '#4ade80',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4
    },
    subtext: {
        color: '#9ca3af',
        fontSize: 12
    }
});

export default MapView;
