import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Animated, StatusBar, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import {
    Activity, Moon, Zap, Heart, TrendingUp, Wind, Droplets,
    Thermometer, AlertTriangle, Fingerprint, Move
} from 'lucide-react-native';
import { COLORS, METRICS, TYPOGRAPHY } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

// --- REUSABLE COMPONENT: TITAN SENSOR MODULE (V2 - SAFE LAYOUT) ---
const SensorModule = ({ title, value, unit, icon: Icon, color, trend, graphData, size = 'half', style, onPress }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[
                styles.sensorCard,
                size === 'full' ? styles.cardFull : styles.cardHalf,
                style
            ]}>
            {/* TOP SECTION: CONTENT */}
            <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 12 }}>
                {/* Header */}
                <View style={styles.sensorHeader}>
                    <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
                        <Icon size={18} color={color} />
                    </View>
                    <Text style={styles.sensorTitle}>{title}</Text>
                </View>

                {/* Main Value */}
                <View style={styles.valueContainer}>
                    <Text style={styles.sensorValue}>{value}</Text>
                    <Text style={styles.sensorUnit}>{unit}</Text>
                </View>

                {/* Sub-Metric / Trend */}
                {trend && (
                    <View style={styles.trendRow}>
                        <TrendingUp size={12} color={COLORS.textMuted} />
                        <Text style={styles.trendText}>{trend}</Text>
                    </View>
                )}
            </View>

            {/* BOTTOM SECTION: GRAPH (CONTAINED) */}
            {graphData && (
                <View style={styles.graphContainer}>
                    <LineChart
                        data={{ datasets: [{ data: graphData }] }}
                        width={size === 'full' ? SCREEN_WIDTH - 30 : (SCREEN_WIDTH / 2) - 15}
                        height={60}
                        bezier // <--- ADDED CURVE
                        withDots={false}
                        withInnerLines={false}
                        withOuterLines={false}
                        withHorizontalLabels={false}
                        withVerticalLabels={false}
                        chartConfig={{
                            backgroundColor: COLORS.surfaceCard,
                            backgroundGradientFrom: COLORS.surfaceCard,
                            backgroundGradientTo: COLORS.surfaceCard,
                            fillShadowGradient: color,
                            fillShadowGradientOpacity: 0.2, // Visual depth
                            paddingRight: 0,
                            paddingTop: 0,
                            color: (opacity = 1) => color,
                            backgroundGradientFromOpacity: 0,
                            backgroundGradientToOpacity: 0,
                            strokeWidth: 2,
                            propsForBackgroundLines: { strokeWidth: 0 }
                        }}
                        style={{
                            paddingRight: 0,
                            paddingLeft: 0,
                        }}
                    />
                </View>
            )}
        </TouchableOpacity>
    );
};

export default function MetricsScreen() {
    const [timeRange, setTimeRange] = useState('24H');
    const [isExporting, setIsExporting] = useState(false);

    const [selectedMetric, setSelectedMetric] = useState(null);

    // Mock Live Data State
    const [vitals, setVitals] = useState({
        hr: 72,
        spo2: 98,
        resp: 14,
        temp: 38.2,
        hydration: 65,
        stress: 12,
        ambientTemp: 22,
        humidity: 45
    });

    useEffect(() => {
        // Simulation of live fluctuations
        const interval = setInterval(() => {
            setVitals(prev => ({
                ...prev,
                hr: 70 + Math.floor(Math.random() * 10),
                resp: 12 + Math.floor(Math.random() * 4),
                spo2: 97 + Math.floor(Math.random() * 3),
                ambientTemp: 22 + Math.random(),
                humidity: 45 + Math.floor(Math.random() * 5)
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Filter mock data based on range
    const getGraphData = (baseData) => {
        if (timeRange === '7D') return baseData; // Full
        if (timeRange === '24H') return baseData.slice(-5); // Recent
        return baseData.slice(-3); // very recent
    };

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            alert('REPORT DOWNLOADED: \n/Internal/Docs/Vitals_Report_2024.pdf');
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.gridBackground} />
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 100 }}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={TYPOGRAPHY.header}>METRICS</Text>
                        <Text style={TYPOGRAPHY.subhead}>LIVE TELEMETRY</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 5 }}>
                        {['1H', '24H', '7D'].map((r) => (
                            <TouchableOpacity
                                key={r}
                                style={[styles.rangeBtn, timeRange === r && styles.rangeBtnActive]}
                                onPress={() => setTimeRange(r)}
                            >
                                <Text style={[styles.rangeText, timeRange === r && { color: COLORS.primary }]}>{r}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={[styles.exportBtn, isExporting && styles.exportBtnActive]}
                        onPress={handleExport}
                    >
                        <Text style={[styles.exportText, isExporting && { color: '#FFF' }]}>
                            {isExporting ? 'SAVING...' : 'EXPORT LOGS'}
                        </Text>
                    </TouchableOpacity>

                    {/* 1. PRIMARY VITALS (Full Width Charts) */}
                    <Text style={styles.sectionLabel}>CARDIOVASCULAR</Text>
                    <View style={styles.row}>
                        <SensorModule
                            size="half"
                            title="HEART RATE"
                            value={vitals.hr}
                            unit="BPM"
                            icon={Heart}
                            color={COLORS.danger}
                            graphData={getGraphData([65, 75, 70, 78, 72, 74, 72, 76, 70])}
                            trend="Normal Sinus Rhythm"
                            onPress={() => setSelectedMetric({ title: 'Heart Rate', value: vitals.hr, unit: 'BPM', desc: 'Heart rate is within normal range for a resting canine.' })}
                        />
                        <SensorModule
                            size="half"
                            title="BLOOD OXYGEN"
                            value={vitals.spo2}
                            unit="%"
                            icon={Activity}
                            color={COLORS.accent}
                            graphData={getGraphData([98, 97, 98, 98, 99, 98, 97, 98, 99])}
                            trend="Saturation Optimal"
                            onPress={() => setSelectedMetric({ title: 'SpO2', value: vitals.spo2, unit: '%', desc: 'Blood oxygen saturation is optimal.' })}
                        />
                    </View>

                    {/* 2. RESPIRATORY & THERMAL */}
                    <Text style={styles.sectionLabel}>RESPIRATORY & THERMAL</Text>
                    <View style={styles.row}>
                        <SensorModule
                            size="half"
                            title="RESP. RATE"
                            value={vitals.resp}
                            unit="RPM"
                            icon={Wind}
                            color={COLORS.success}
                            trend="Breathing Steady"
                        />
                        <SensorModule
                            size="half"
                            title="BODY TEMP"
                            value={vitals.temp}
                            unit="°C"
                            icon={Thermometer}
                            color={COLORS.warning}
                            trend="Core Normal"
                        />
                    </View>

                    {/* 3. ADVANCED METRICS (3-Column or Dense) */}
                    <Text style={styles.sectionLabel}>ADVANCED ANALYTICS</Text>
                    <View style={styles.grid3}>
                        <SensorModule
                            style={{ flex: 1 }}
                            title="HYDRATION"
                            value={vitals.hydration}
                            unit="%"
                            icon={Droplets}
                            color="#3B82F6"
                        />
                        <SensorModule
                            style={{ flex: 1 }}
                            title="STRESS"
                            value={vitals.stress}
                            unit="IDX"
                            icon={Zap}
                            color="#A855F7"
                        />
                        <SensorModule
                            style={{ flex: 1 }}
                            title="ACTIVITY"
                            value="LOW"
                            unit=""
                            icon={Move}
                            color="#EC4899"
                        />
                    </View>

                    {/* 4. ENVIRONMENTAL */}
                    <Text style={styles.sectionLabel}>ENVIRONMENT SENSORS</Text>
                    <View style={styles.envCard}>
                        <View style={styles.envItem}>
                            <Text style={styles.envLabel}>AMBIENT TEMP</Text>
                            <Text style={styles.envValue}>{Number(vitals.ambientTemp).toFixed(1)}°C</Text>
                        </View>
                        <View style={styles.verticalDivider} />
                        <View style={styles.envItem}>
                            <Text style={styles.envLabel}>HUMIDITY</Text>
                            <Text style={styles.envValue}>{vitals.humidity}%</Text>
                        </View>
                        <View style={styles.verticalDivider} />
                        <View style={styles.envItem}>
                            <Text style={styles.envLabel}>AIR QUALITY</Text>
                            <Text style={[styles.envValue, { color: COLORS.success }]}>GOOD</Text>
                        </View>
                    </View>

                    {/* 5. SYSTEM STATUS */}
                    <View style={[styles.alertBox, { borderColor: COLORS.divider }]}>
                        <Fingerprint size={16} color={COLORS.textMuted} />
                        <Text style={styles.alertText}>SENSOR ARRAY ONLINE • CALIBRATED 2M AGO</Text>
                    </View>

                    {/* Drill Down Modal */}
                    <Modal
                        transparent={true}
                        visible={!!selectedMetric}
                        animationType="fade"
                        onRequestClose={() => setSelectedMetric(null)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>{selectedMetric?.title} ANALYSIS</Text>
                                    <TouchableOpacity onPress={() => setSelectedMetric(null)}>
                                        <Text style={{ color: COLORS.textMuted }}>CLOSE</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.modalValue}>{selectedMetric?.value} <Text style={{ fontSize: 20 }}>{selectedMetric?.unit}</Text></Text>
                                <View style={styles.modalBody}>
                                    <Text style={{ color: COLORS.textSecondary, marginBottom: 20 }}>{selectedMetric?.desc}</Text>
                                    <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>* Detailed historical logs available in web portal.</Text>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </ScrollView >
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gridBackground,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    exportBtn: {
        marginTop: 15, // <--- ADDED SPACING
        borderWidth: 1,
        borderColor: COLORS.textMuted,
        paddingHorizontal: 12,
        paddingVertical: 10, // Increased padding
        borderRadius: 20,
        alignSelf: 'flex-start', // Ensure it doesn't stretch weirdly
    },
    exportBtnActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    exportText: {
        fontSize: 10,
        color: COLORS.textMuted,
        fontWeight: '700',
    },
    sectionLabel: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textMuted,
        marginBottom: 10,
        marginTop: 10,
        fontSize: 10,
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    grid3: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    sensorCard: {
        backgroundColor: COLORS.surfaceCard,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.divider,
        overflow: 'hidden', // Ensure graph stays inside
        ...Platform.select({
            web: {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
            default: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
                elevation: 3,
            }
        })
    },
    graphContainer: {
        marginTop: 'auto', // Push to bottom
        overflow: 'hidden',
    },
    cardHalf: {
        flex: 1,
        height: 160,
    },
    cardFull: {
        width: '100%',
    },
    sensorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    iconBox: {
        width: 28,
        height: 28,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sensorTitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '600',
        flex: 1,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
    },
    sensorValue: {
        fontSize: 32,
        fontWeight: '600',
        color: COLORS.textTitle,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    sensorUnit: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 5,
    },
    trendText: {
        fontSize: 10,
        color: COLORS.textMuted,
    },
    envCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surfaceCard,
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: COLORS.divider,
        marginBottom: 20,
    },
    envItem: {
        flex: 1,
        alignItems: 'center',
        gap: 5,
    },
    envLabel: {
        fontSize: 10,
        color: COLORS.textMuted,
        fontWeight: '700',
    },
    envValue: {
        fontSize: 16,
        color: COLORS.textTitle,
        fontWeight: '600',
    },
    verticalDivider: {
        width: 1,
        height: '100%',
        backgroundColor: COLORS.divider,
    },
    alertBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 10,
        borderWidth: 1,
        borderRadius: 8,
        borderStyle: 'dashed',
        opacity: 0.6,
    },
    alertText: {
        ...TYPOGRAPHY.mono,
        fontSize: 10,
        color: COLORS.textMuted,
    },
    rangeBtn: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: COLORS.surfaceCard,
        borderWidth: 1,
        borderColor: COLORS.divider
    },
    rangeBtnActive: {
        borderColor: COLORS.primary,
        backgroundColor: `${COLORS.primary}20`
    },
    rangeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.textMuted
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: COLORS.surfaceCard,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.primary
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    modalTitle: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 2
    },
    modalValue: {
        fontSize: 56,
        color: '#FFF',
        fontWeight: 'bold',
        marginBottom: 10
    }
});
