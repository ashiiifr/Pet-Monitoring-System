import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    Dimensions,
    ImageBackground
} from 'react-native';
import { socket } from '../services/api';
import GlassCard from '../components/GlassCard';
import LiveVitalGraph from '../components/LiveVitalGraph';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PetDetailScreen({ route, navigation }) {
    const { pet } = route.params;
    const [dataBuffer, setDataBuffer] = useState(new Array(20).fill(80)); // 20 points history
    const [currentReading, setCurrentReading] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState('Connecting...');

    useEffect(() => {
        navigation.setOptions({
            title: pet.name,
            headerStyle: { backgroundColor: '#0f172a' },
            title: pet.name,
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#fff',
            headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('EditPet', { pet })}>
                    <Text style={{ color: '#6366f1', fontWeight: 'bold' }}>EDIT</Text>
                </TouchableOpacity>
            )
        });

        // Connect Socket
        if (!socket.connected) {
            socket.connect();
        }

        function onConnect() {
            setIsConnected(true);
            setStatus('Live');
            socket.emit('subscribe_pet', { pet_id: pet.id });
        }

        function onDisconnect() {
            setIsConnected(false);
            setStatus('Disconnected');
        }

        function onLiveReading(data) {
            // Update current reading
            setCurrentReading(data);

            // Update graph buffer
            setDataBuffer(prev => {
                const newBuffer = [...prev, data.heart_rate];
                if (newBuffer.length > 20) newBuffer.shift();
                return newBuffer;
            });

            // Haptic feedback or alert on anomaly could go here
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('live_reading', onLiveReading);

        // Initial subscription if already connected
        if (socket.connected) {
            onConnect();
        }

        return () => {
            socket.emit('unsubscribe_pet', { pet_id: pet.id });
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('live_reading', onLiveReading);
        };
    }, [pet.id]);

    const getStatusColor = (health_status) => {
        const s = health_status?.toLowerCase();
        if (s === 'healthy') return '#10b981'; // Emerald
        if (s?.includes('fever')) return '#ef4444'; // Red
        if (s?.includes('anxiety')) return '#f59e0b'; // Amber
        return '#6366f1'; // Indigo default
    };

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=2070&auto=format&fit=crop' }}
                style={styles.bgImage}
                blurRadius={60}
            >
                <ScrollView contentContainerStyle={styles.content}>

                    {/* Status Header */}
                    <View style={styles.statusHeader}>
                        <View style={[styles.indicator, { backgroundColor: isConnected ? '#10b981' : '#ef4444' }]} />
                        <Text style={styles.statusText}>{status}</Text>
                    </View>

                    {/* Main Health Status Card */}
                    <GlassCard style={styles.mainCard} intensity={40}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Current Status</Text>
                            <Text style={styles.confidence}>
                                {currentReading?.ml_confidence ? `${currentReading.ml_confidence}% Conf.` : ''}
                            </Text>
                        </View>

                        <View style={styles.statusRow}>
                            <Text style={[
                                styles.primaryStatus,
                                { color: getStatusColor(currentReading?.ml_status || 'healthy') }
                            ]}>
                                {currentReading?.ml_status?.toUpperCase() || 'ANALYZING...'}
                            </Text>
                            <Text style={styles.emoji}>
                                {currentReading?.ml_status === 'healthy' ? '💚' : '⚠️'}
                            </Text>
                        </View>

                        {currentReading?.ml_status !== 'healthy' && currentReading && (
                            <View style={styles.alertBox}>
                                <Text style={styles.alertText}>
                                    Abnormal vital signs detected. Please monitor closely.
                                </Text>
                            </View>
                        )}
                    </GlassCard>

                    {/* Live Heart Rate Graph */}
                    <GlassCard style={styles.graphCard}>
                        <View style={styles.graphHeader}>
                            <Text style={styles.graphTitle}>Heart Rate (Live)</Text>
                            <Text style={styles.liveValue}>
                                {currentReading?.heart_rate || '--'} <Text style={styles.unit}>BPM</Text>
                            </Text>
                        </View>
                        <LiveVitalGraph data={dataBuffer} color="239, 68, 68" />
                    </GlassCard>

                    {/* Vitals Grid */}
                    <View style={styles.grid}>
                        {/* Temperature */}
                        <GlassCard style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Temp</Text>
                            <Text style={styles.gridValue}>
                                {currentReading?.temperature || '--'}°
                            </Text>
                            <Text style={styles.gridUnit}>Celsius</Text>
                        </GlassCard>

                        {/* Stress */}
                        <GlassCard style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Stress</Text>
                            <Text style={[styles.gridValue, { color: currentReading?.stress_score > 50 ? '#f59e0b' : '#fff' }]}>
                                {currentReading?.stress_score || '--'}
                            </Text>
                            <Text style={styles.gridUnit}>/ 100</Text>
                        </GlassCard>

                        {/* Activity */}
                        <GlassCard style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Activity</Text>
                            <Text style={styles.gridValue}>
                                {currentReading?.activity_level || '--'}
                            </Text>
                            <Text style={styles.gridUnit}>Score</Text>
                        </GlassCard>

                        {/* Steps (Simulated accumulation) */}
                        <GlassCard style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Steps</Text>
                            <Text style={styles.gridValue}>1,240</Text>
                            <Text style={styles.gridUnit}>Today</Text>
                        </GlassCard>
                    </View>

                    {/* AI Insight */}
                    <GlassCard style={styles.insightCard}>
                        <Text style={styles.insightTitle}>✨ AI Health Insight</Text>
                        <Text style={styles.insightText}>
                            {currentReading?.ml_status === 'healthy'
                                ? "Vitals are stable. Heart rate variability is within normal range for this breed."
                                : currentReading?.ml_status === 'fever_onset'
                                    ? "Detected rising body temperature trend over the last 5 minutes. Potential fever onset."
                                    : "Irregular heart rate patterns detected suggesting potential anxiety or stress event."
                            }
                        </Text>
                    </GlassCard>

                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    bgImage: {
        flex: 1,
        width: '100%',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '600',
    },
    mainCard: {
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    confidence: {
        color: '#6366f1',
        fontSize: 12,
        fontWeight: '600',
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    primaryStatus: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.5,
    },
    emoji: {
        fontSize: 40,
    },
    alertBox: {
        marginTop: 16,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        padding: 12,
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#ef4444',
    },
    alertText: {
        color: '#fca5a5',
        fontSize: 13,
    },
    graphCard: {
        marginBottom: 20,
        paddingBottom: 0,
    },
    graphHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    graphTitle: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
    },
    liveValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
    },
    unit: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '400',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20,
    },
    gridItem: {
        width: (width - 56) / 2, // 2 columns with padding/gap
        alignItems: 'center',
        paddingVertical: 20,
    },
    gridLabel: {
        color: '#94a3b8',
        fontSize: 12,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    gridValue: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '700',
    },
    gridUnit: {
        color: '#64748b',
        fontSize: 12,
        marginTop: 4,
    },
    insightCard: {
        marginBottom: 20,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
    },
    insightTitle: {
        color: '#818cf8',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    insightText: {
        color: '#e2e8f0',
        fontSize: 14,
        lineHeight: 22,
    },
});
