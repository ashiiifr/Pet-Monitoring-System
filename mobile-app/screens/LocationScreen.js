import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Animated, Easing, TouchableOpacity, PanResponder, Alert } from 'react-native';
import { MapPin, Navigation, Shield, Layers, Radar, Edit3, Check, MousePointer2, AlertTriangle } from 'lucide-react-native';
import MapView, { Marker, Circle as MapCircle, Polyline, PROVIDER_DEFAULT } from '../components/TitanMap';
import * as Location from 'expo-location'; // For future real GPS
import { COLORS, METRICS, TYPOGRAPHY } from '../theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

// Titan Tactical Dark Map Style
const TITAN_MAP_STYLE = [
    { "elementType": "geometry", "stylers": [{ "color": "#171717" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
    { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
    { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
    { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
    { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1b1b1b" }] },
    { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
    { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#373737" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
    { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#4e4e4e" }] },
    { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
    { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] }
];

const INITIAL_REGION = {
    latitude: 40.785091,
    longitude: -73.968285,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
};

export default function LocationScreen() {
    const [isEditing, setIsEditing] = useState(false);
    const [radius, setRadius] = useState(300); // meters
    const [region, setRegion] = useState(INITIAL_REGION);
    const [petLocation, setPetLocation] = useState({ latitude: 40.785091, longitude: -73.968285 });
    const [pathHistory, setPathHistory] = useState([
        { latitude: 40.7850, longitude: -73.9682 },
        { latitude: 40.7848, longitude: -73.9680 },
    ]);
    const [speed, setSpeed] = useState(5.2);
    const [distance, setDistance] = useState(0.4);

    const mapRef = useRef(null);

    // Simulation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isEditing) {
                // Skitter movement simulation
                const latDelta = (Math.random() - 0.5) * 0.0002;
                const lngDelta = (Math.random() - 0.5) * 0.0002;

                setPetLocation(prev => {
                    const newLoc = {
                        latitude: prev.latitude + latDelta,
                        longitude: prev.longitude + lngDelta
                    };
                    setPathHistory(history => [...history.slice(-49), newLoc]);
                    return newLoc;
                });

                setSpeed((Math.random() * 5 + 2).toFixed(1));
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [isEditing]);

    const handlePanic = () => {
        Alert.alert(
            "CRITICAL ALERT",
            "INITIATE EMERGENCY PROTOCOL?",
            [
                { text: "CANCEL", style: "cancel" },
                {
                    text: "SEND S.O.S",
                    style: "destructive",
                    onPress: () => Alert.alert("S.O.S SENT", "Emergency contacts notified with current coordinates.")
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                provider={PROVIDER_DEFAULT}
                customMapStyle={TITAN_MAP_STYLE}
                initialRegion={INITIAL_REGION}
                region={region} // Controlled region for follow mode
            >
                {/* 1. Path History Polyline */}
                <Polyline
                    coordinates={pathHistory}
                    strokeColor={COLORS.primary}
                    strokeWidth={2}
                    lineDashPattern={[5, 5]}
                />

                {/* 2. Geofence Zone */}
                <MapCircle
                    center={INITIAL_REGION} // Fixed base station
                    radius={radius}
                    strokeColor={isEditing ? COLORS.warning : "rgba(16, 185, 129, 0.5)"}
                    fillColor={isEditing ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)"}
                    strokeWidth={1}
                />

                {/* 3. Pet Marker */}
                <Marker
                    coordinate={petLocation}
                    anchor={{ x: 0.5, y: 0.5 }}
                    calloutAnchor={{ x: 0.5, y: 0 }}
                >
                    <View style={styles.markerWrapper}>
                        <View style={styles.markerRing}>
                            <Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/616/616408.png' }}
                                style={{ width: 18, height: 18, tintColor: '#000' }}
                            />
                        </View>
                        <View style={styles.markerTag}>
                            <Text style={styles.tagText}>MAX</Text>
                        </View>
                    </View>
                </Marker>

            </MapView>

            {/* Top HUD Bar - Absolutely positioned at top */}
            <View style={styles.hudContainer}>
                {/* Left: Header */}
                <View>
                    <Text style={[TYPOGRAPHY.header, { fontSize: 18, color: '#FFF' }]}>SAT-NAV</Text>
                    <Text style={[TYPOGRAPHY.subhead, { fontSize: 10, color: COLORS.textMuted }]}>LIVE TRACKING</Text>
                </View>

                {/* Right: Controls Row */}
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    {/* Safe Zone Toggle */}
                    <TouchableOpacity
                        style={[styles.hudButton, isEditing && styles.hudButtonActive]}
                        onPress={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? <Edit3 size={14} color={COLORS.warning} /> : <Shield size={14} color={COLORS.success} />}
                        <Text style={[styles.hudButtonText, isEditing && { color: COLORS.warning }]}>
                            {isEditing ? `${radius}m` : `ZONE`}
                        </Text>
                    </TouchableOpacity>

                    {/* Panic Button */}
                    <TouchableOpacity style={styles.hudPanicBtn} onPress={handlePanic}>
                        <AlertTriangle size={16} color="#FFF" />
                        <Text style={styles.hudPanicText}>SOS</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Floating Resize Controls (Only when editing) */}
            {isEditing && (
                <View style={{ position: 'absolute', top: 140, right: 20, gap: 10, zIndex: 50 }}>
                    <TouchableOpacity style={styles.resizeBtn} onPress={() => setRadius(r => Math.max(100, r - 50))}>
                        <Text style={styles.resizeText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.resizeBtn} onPress={() => setRadius(r => Math.min(2000, r + 50))}>
                        <Text style={styles.resizeText}>+</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Bottom Card - Absolutely positioned at bottom */}
            {!isEditing && (
                <View style={styles.bottomCard}>
                    <View style={styles.handle} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View>
                            <Text style={TYPOGRAPHY.header}>Central Park, Sector 4</Text>
                            <Text style={styles.address}>
                                {`LAT: ${petLocation.latitude.toFixed(6)} • LNG: ${petLocation.longitude.toFixed(6)}`}
                            </Text>
                        </View>
                        <View style={styles.satIcon}>
                            <Radar size={20} color={COLORS.accent} />
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={TYPOGRAPHY.subhead}>DISTANCE</Text>
                            <Text style={TYPOGRAPHY.valueBig}>{distance}<Text style={{ fontSize: 16 }}>km</Text></Text>
                        </View>
                        <View style={styles.statVerticalDivider} />
                        <View style={styles.stat}>
                            <Text style={TYPOGRAPHY.subhead}>SPEED</Text>
                            <Text style={TYPOGRAPHY.valueBig}>{speed}<Text style={{ fontSize: 16 }}>km/h</Text></Text>
                        </View>
                        <View style={styles.statVerticalDivider} />
                        <View style={styles.stat}>
                            <Text style={TYPOGRAPHY.subhead}>ELEVATION</Text>
                            <Text style={TYPOGRAPHY.valueBig}>12<Text style={{ fontSize: 16 }}>m</Text></Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gridBackground,
    },
    markerWrapper: {
        alignItems: 'center',
    },
    markerRing: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    markerTag: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginTop: 4,
    },
    tagText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        paddingTop: 60,
    },
    hudContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 55,  // Account for status bar height
        paddingBottom: 10,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 100,
    },
    hudButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    hudButtonActive: {
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderWidth: 1,
        borderColor: COLORS.warning,
    },
    hudButtonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    hudPanicBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.danger,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    hudPanicText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '900',
    },
    resizeControls: {
        flexDirection: 'row',
        gap: 10,
    },
    resizeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.surfaceCard,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.divider,
    },
    resizeText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    panicButton: {
        // Legacy support if cached (unused now)
    },
    miniPanicBtn: {
        backgroundColor: COLORS.danger,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        shadowColor: COLORS.danger,
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    panicInner: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.danger,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.danger,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    bottomCard: {
        position: 'absolute',
        bottom: -10, // Push slightly past edge to eliminate gap
        left: 0,
        right: 0,
        backgroundColor: COLORS.surfaceCard,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 30, // Normal padding + extra for overscan
        borderTopWidth: 1,
        borderTopColor: COLORS.divider,
        zIndex: 50,
    },
    handle: {
        width: 50,
        height: 5,
        backgroundColor: '#333',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    address: {
        color: COLORS.textMuted,
        marginBottom: 25,
        ...TYPOGRAPHY.body,
        fontSize: 13,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stat: {
        alignItems: 'center',
        flex: 1,
    },
    statVerticalDivider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.divider,
    },
    satIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surfacefloat,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
