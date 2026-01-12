import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Animated, TouchableOpacity, StatusBar, Dimensions, StyleSheet, Platform, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, Thermometer, Zap, Wifi, Battery, ChevronRight, Plus, Terminal, Info, Map as MapIcon, ShieldAlert } from 'lucide-react-native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, METRICS } from '../theme';
import { DataCard } from '../components/ui/DataCard';
import { TitanButton } from '../components/ui/TitanButton';
import { GlassCard } from '../components/ui/GlassCard';
import api from '../services/api';

const { width, height } = Dimensions.get('window');
const API_URL = 'http://localhost:5000';

const TypewriterText = ({ text, style, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, 30); // Speed of typing
        return () => clearInterval(timer);
    }, [text]);

    return <Text style={style}>{displayedText}<Text style={{ color: COLORS.accent }}>_</Text></Text>;
};

export default function HomeScreen({ navigation }) {
    const [pets, setPets] = useState([]);
    const [activePetIndex, setActivePetIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [realtimeData, setRealtimeData] = useState({});

    // Onboarding State
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardingStep, setOnboardingStep] = useState(0);

    // Simulation of a "Scanner" line
    const scanLine = useRef(new Animated.Value(0)).current;

    // Pulse Animation for Avatar
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Start Pulse Loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
            ])
        ).start();

        loadData();
        checkOnboarding();
    }, []);

    const checkOnboarding = async () => {
        try {
            const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
            if (!hasSeen) {
                setShowOnboarding(true);
            }
        } catch (e) { console.log('Storage error', e); }
    };

    const finishOnboarding = async () => {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        setShowOnboarding(false);
    };

    const loadData = async () => {
        try {
            const res = await api.get('/pets');
            let data = res.data;

            // TITAN DEMO MODE: Disabled for Empty State Check
            // if (!data || data.length === 0) { ... }

            setPets(data);

            // Init buffer
            const buffer = {};
            data.forEach(p => buffer[p.id] = { hr: 72, temp: 38.5, activity: 12 }); // Non-zero start
            setRealtimeData(buffer);
        } catch (e) {
            console.error(e);
            // Fallback for network error
            setPets([]); // Empty to show empty state if offline/failed
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, []);

    useEffect(() => {
        const socket = io(API_URL);
        socket.on('vital_update', (data) => {
            setRealtimeData(prev => ({
                ...prev,
                [data.pet_id]: {
                    hr: data.heart_rate,
                    temp: data.body_temperature,
                    activity: data.activity_level
                }
            }));
        });

        // Scan Animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLine, { toValue: 1, duration: 2000, useNativeDriver: true }),
                Animated.timing(scanLine, { toValue: 0, duration: 0, useNativeDriver: true })
            ])
        ).start();

        return () => socket.close();
    }, []);

    const activePet = pets[activePetIndex];
    const liveStats = activePet ? (realtimeData[activePet.id] || { hr: '--', temp: '--', activity: '--' }) : {};

    // Onboarding Steps Configuration
    const steps = [
        {
            icon: ShieldAlert,
            title: 'PANIC PROTOCOL',
            desc: 'Tap the header status or shake device to trigger emergency alerts immediately.',
            target: 'header'
        },
        {
            icon: MapIcon,
            title: 'TACTICAL MAP',
            desc: 'Track subjects in real-time with geofencing support in the Location tab.',
            target: 'nav'
        },
        {
            icon: Activity,
            title: 'LIVE VITALS',
            desc: 'Monitor heart rate, thermal signature, and activity index directly from the dashboard.',
            target: 'scanner'
        }
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.gridBackground} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* 1. Header: System Status */}
                <View style={styles.header}>
                    <View>
                        <Text style={TYPOGRAPHY.header}>COMMAND CENTER</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Animated.View style={[styles.statusDot, { transform: [{ scale: pulseAnim }] }]} />
                            <Text style={styles.statusText}>SYSTEM ONLINE</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                        <Wifi size={16} color={COLORS.textSecondary} />
                        <Battery size={16} color={COLORS.textSecondary} />
                    </View>
                </View>

                {/* 2. Pet Selector (Floating Tabs) */}
                {pets.length > 0 && (
                    <ScrollView horizontal style={styles.petSelector} contentContainerStyle={{ gap: 15, paddingHorizontal: 20 }}>
                        {pets.map((p, i) => (
                            <TouchableOpacity key={p.id} onPress={() => setActivePetIndex(i)} style={[styles.petTabPill, activePetIndex === i && styles.petTabPillActive]}>
                                <Text style={[styles.petTab, activePetIndex === i ? styles.petTabActive : null]}>
                                    {p.name.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity onPress={() => navigation.navigate('AddPet')} style={styles.addPetBtn}>
                            <Plus size={20} color={COLORS.textTitle} />
                        </TouchableOpacity>
                    </ScrollView>
                )}

                {activePet ? (
                    <ScrollView
                        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />
                        }
                    >

                        {/* 3. Main Scanner Visual */}
                        <View style={styles.scannerContainer}>
                            {/* Avatar Glow */}
                            <Animated.View style={[styles.avatarGlow, { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({ inputRange: [1, 1.2], outputRange: [0.5, 0] }) }]} />

                            {/* Abstract Circle */}
                            <View style={styles.scannerCircle}>
                                <Text style={styles.bpmLabel}>HEART RATE</Text>
                                <Text style={styles.bpmValue}>{liveStats.hr || '--'}</Text>
                                <Text style={styles.bpmUnit}>BPM</Text>
                            </View>

                            {/* Moving Scan Line */}
                            <Animated.View style={[
                                styles.scanLine,
                                {
                                    transform: [{
                                        translateY: scanLine.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-100, 100] // Scan range
                                        })
                                    }]
                                }
                            ]} />
                        </View>

                        {/* 4. Data Grid */}
                        <View style={styles.grid}>
                            <DataCard label="Temperature" style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
                                    <Text style={styles.dataValue}>{liveStats.temp || '--'}</Text>
                                    <Text style={styles.dataUnit}>°C</Text>
                                </View>
                            </DataCard>

                            <DataCard label="Activity" style={{ flex: 1, marginLeft: 15 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
                                    <Text style={styles.dataValue}>{liveStats.activity || '--'}</Text>
                                    <Text style={styles.dataUnit}>IDX</Text>
                                </View>
                            </DataCard>
                        </View>

                        <DataCard label="Diagnostics" onPress={() => navigation.navigate('DevicePairing')}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View>
                                    <Text style={{ color: COLORS.signalSuccess, ...TYPOGRAPHY.mono, marginBottom: 5 }}>NO ANOMALIES DETECTED</Text>
                                    <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>Last scan: Just now</Text>
                                </View>
                                <ChevronRight size={20} color={COLORS.textSecondary} />
                            </View>
                        </DataCard>

                    </ScrollView>
                ) : (
                    /* EMPTY STATE */
                    <View style={styles.emptyStateContainer}>
                        <GlassCard style={styles.emptyCard}>
                            <Activity size={48} color={COLORS.primary} style={{ marginBottom: 20 }} />
                            <Text style={styles.emptyTitle}>NO BIOLOGICAL SUBJECTS</Text>
                            <Text style={styles.emptySubtitle}>
                                REGISTER A NEW ENTITY TO BEGIN MONITORING
                            </Text>

                            <TitanButton
                                title="INITIALIZE SUBJECT"
                                icon={<Plus size={20} color="#FFF" />}
                                onPress={() => navigation.navigate('AddPet')}
                                style={{ width: '100%', marginTop: 20 }}
                            />
                        </GlassCard>
                    </View>
                )}
            </SafeAreaView>

            {/* Onboarding Modal Overlay */}
            <Modal visible={showOnboarding} transparent animationType="fade">
                <View style={styles.onboardingOverlay}>
                    <View style={styles.onboardingCard}>
                        {steps[onboardingStep] && (
                            <>
                                <View style={styles.onboardingIcon}>
                                    {React.createElement(steps[onboardingStep].icon, { size: 32, color: COLORS.primary })}
                                </View>
                                <Text style={styles.onboardingTitle}>{steps[onboardingStep].title}</Text>
                                <Text style={styles.onboardingDesc}>{steps[onboardingStep].desc}</Text>

                                <View style={styles.onboardingActions}>
                                    <TouchableOpacity
                                        onPress={finishOnboarding}
                                        style={{ padding: 10 }}
                                    >
                                        <Text style={styles.skipText}>SKIP</Text>
                                    </TouchableOpacity>

                                    <TitanButton
                                        title={onboardingStep === steps.length - 1 ? "ACKNOWLEDGE" : "NEXT"}
                                        onPress={() => {
                                            if (onboardingStep < steps.length - 1) {
                                                setOnboardingStep(prev => prev + 1);
                                            } else {
                                                finishOnboarding();
                                            }
                                        }}
                                        style={{ minWidth: 120 }}
                                    />
                                </View>

                                <View style={styles.dots}>
                                    {steps.map((_, i) => (
                                        <View key={i} style={[styles.dot, i === onboardingStep && styles.activeDot]} />
                                    ))}
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gridBackground,
    },
    bootContainer: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    terminalWindow: {
        width: '80%',
        gap: 20,
    },
    terminalText: {
        ...TYPOGRAPHY.mono,
        color: COLORS.success,
        fontSize: 14,
        lineHeight: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    statusDot: {
        width: 8,
        height: 8,
        backgroundColor: COLORS.signalSuccess,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        ...TYPOGRAPHY.mono,
        color: COLORS.signalSuccess,
        fontSize: 10,
    },
    petSelector: {
        maxHeight: 70,
        paddingVertical: 15,
    },
    petTabPill: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.divider,
        backgroundColor: COLORS.surfaceCard,
    },
    petTabPillActive: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
    },
    petTab: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '700',
        letterSpacing: 1,
    },
    petTabActive: {
        color: COLORS.primary,
    },
    addPetBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.surfaceCard,
        borderWidth: 1,
        borderColor: COLORS.divider,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scannerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 250,
        marginBottom: 30,
        marginTop: 10,
        borderWidth: 1,
        borderColor: COLORS.divider,
        borderRadius: METRICS.radius,
        backgroundColor: 'rgba(0,0,0,0.2)',
        overflow: 'hidden',
    },
    avatarGlow: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 2,
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        zIndex: 0,
    },
    scannerCircle: {
        alignItems: 'center',
        zIndex: 1,
    },
    bpmLabel: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textMuted,
        marginBottom: 10,
        letterSpacing: 2,
    },
    bpmValue: {
        fontSize: 72,
        fontWeight: '200',
        color: '#FFF',
        letterSpacing: -2,
        includeFontPadding: false,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    bpmUnit: {
        ...TYPOGRAPHY.mono,
        color: COLORS.danger, // Red for heart
        marginTop: 5,
        fontSize: 14,
    },
    scanLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: COLORS.accent,
        opacity: 0.5,
        elevation: 10,
        ...Platform.select({
            web: {
                boxShadow: `0 0 10px ${COLORS.accent}`
            },
            default: {
                shadowColor: COLORS.accent,
                shadowOpacity: 1,
                shadowRadius: 10,
            }
        })
    },
    grid: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    dataValue: {
        fontSize: 32,
        fontWeight: '300',
        color: '#FFF',
    },
    dataUnit: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textMuted,
        fontSize: 12,
        marginBottom: 6,
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    emptyCard: {
        width: '100%',
        alignItems: 'center',
        padding: 40,
        gap: 15
    },
    emptyTitle: {
        ...TYPOGRAPHY.header,
        color: '#FFF',
        fontSize: 16,
        letterSpacing: 2,
        textAlign: 'center'
    },
    emptySubtitle: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textMuted,
        fontSize: 10,
        textAlign: 'center',
        lineHeight: 16,
        marginBottom: 10
    },
    onboardingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30
    },
    onboardingCard: {
        width: '100%',
        backgroundColor: COLORS.surfaceCard,
        borderRadius: 20,
        padding: 30,
        borderWidth: 1,
        borderColor: COLORS.primaryGlow,
        alignItems: 'center',
        gap: 15
    },
    onboardingIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.surfaceHighlight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
    },
    onboardingTitle: {
        ...TYPOGRAPHY.header,
        color: COLORS.primary,
        fontSize: 18,
        letterSpacing: 2
    },
    onboardingDesc: {
        color: COLORS.textBody,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 22
    },
    onboardingActions: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 20
    },
    skipText: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textMuted,
        fontSize: 12
    },
    dots: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 20
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.divider
    },
    activeDot: {
        backgroundColor: COLORS.primary,
        width: 24
    }
});
