import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, X } from 'lucide-react-native';
import { COLORS } from '../theme';
import { TitanButton } from '../components/ui/TitanButton';
import { GlassCard } from '../components/ui/GlassCard';
import bleManager from '../utils/ble';

export default function DevicePairingScreen({ navigation, route }) {
    const [step, setStep] = useState('scanning'); // scanning | found | connecting | success
    const [scanningDevice, setScanningDevice] = useState(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // BLE Scanning Logic
    useEffect(() => {
        let mounted = true;

        if (step === 'scanning') {
            startPulse();
            bleManager.startDeviceScan(null, null, (error, device) => {
                if (error) {
                    Alert.alert('Scan Error', error.message);
                    return;
                }
                if (device && (device.name === 'SmartCollar X1' || device.name === 'Titan Tracker')) {
                    bleManager.stopDeviceScan();
                    if (mounted) {
                        setScanningDevice(device);
                        setStep('found');
                    }
                }
            });
        }

        return () => {
            mounted = false;
            bleManager.stopDeviceScan();
        };
    }, [step]);

    const startPulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
            ])
        ).start();
        Animated.loop(
            Animated.timing(rotateAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
        ).start();
    };

    const handleConnect = async () => {
        if (!scanningDevice) return;
        setStep('connecting');

        try {
            const connectedDevice = await bleManager.connectToDevice(scanningDevice.id);
            await connectedDevice.discoverAllServicesAndCharacteristics();
            setStep('success');
        } catch (error) {
            Alert.alert('Connection Failed', 'Could not bond with device.');
            setStep('found'); // Retry
        }
    };

    const handleFinish = () => {
        // Here we would actually save the device mapping to the backend
        navigation.goBack();
        Alert.alert("Device Active", "The SmartCollar is now streaming live biometrics.");
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.background, '#111']} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <X size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Add New Device</Text>
            </View>

            <View style={styles.content}>
                {step === 'scanning' && (
                    <View style={styles.centerStage}>
                        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
                        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }], opacity: 0.1, width: 300, height: 300 }]} />
                        <View style={styles.scannerIcon}>
                            <Animated.Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3067/3067373.png' }} // Generic radar/chip icon
                                style={{ width: 64, height: 64, tintColor: COLORS.primary, opacity: 0.8 }}
                            />
                        </View>
                        <Text style={styles.statusText}>Scanning for nearby devices...</Text>
                        <Text style={styles.hintText}>Hold your SmartCollar close to your phone</Text>
                    </View>
                )}

                {step === 'found' && (
                    <View style={styles.centerStage}>
                        <GlassCard style={styles.deviceCard} variant="active">
                            <View style={styles.deviceIcon}>
                                <Image
                                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3067/3067373.png' }}
                                    style={{ width: 40, height: 40, tintColor: '#FFF' }}
                                />
                            </View>
                            <Text style={styles.deviceName}>{scanningDevice?.name || "Unknown Device"}</Text>
                            <Text style={styles.deviceId}>ID: {scanningDevice?.id} • RSSI: {scanningDevice?.rssi || -60}dBm</Text>
                        </GlassCard>
                        <TitanButton
                            title="Connect Device"
                            onPress={handleConnect}
                            style={{ width: '100%', marginTop: 30 }}
                        />
                    </View>
                )}

                {step === 'connecting' && (
                    <View style={styles.centerStage}>
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                            <View style={[styles.scannerIcon, { backgroundColor: COLORS.surfaceHighlight }]}>
                                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primary }} />
                            </View>
                        </Animated.View>
                        <Text style={styles.statusText}>Securing Connection...</Text>
                        <Text style={styles.hintText}>Exchanging security keys</Text>
                    </View>
                )}

                {step === 'success' && (
                    <View style={styles.centerStage}>
                        <View style={[styles.scannerIcon, { backgroundColor: COLORS.success }]}>
                            <CheckCircle2 size={40} color="#FFF" />
                        </View>
                        <Text style={styles.statusText}>Device Ready</Text>
                        <Text style={styles.hintText}>SmartCollar X1 has been calibrated.</Text>

                        <View style={styles.statsGrid}>
                            <GlassCard style={styles.statItem}>
                                <Text style={styles.statLabel}>Battery</Text>
                                <Text style={styles.statValue}>100%</Text>
                            </GlassCard>
                            <GlassCard style={styles.statItem}>
                                <Text style={styles.statLabel}>Firmware</Text>
                                <Text style={styles.statValue}>v2.0.4</Text>
                            </GlassCard>
                        </View>

                        <TitanButton
                            title="Finish Setup"
                            icon={CheckCircle2}
                            onPress={handleFinish}
                            style={{ width: '100%', marginTop: 30 }}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        marginRight: 15,
    },
    title: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 40,
    },
    centerStage: {
        alignItems: 'center',
        width: '100%',
    },
    pulseRing: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: COLORS.primaryGlow,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        zIndex: -1,
    },
    scannerIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 40,
    },
    statusText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    hintText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: 'center',
    },
    deviceCard: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 40,
    },
    deviceIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    deviceName: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    deviceId: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: 'monospace',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
        marginTop: 30,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        color: COLORS.textTertiary,
        fontSize: 12,
        textTransform: 'uppercase',
    },
    statValue: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5,
    }
});
