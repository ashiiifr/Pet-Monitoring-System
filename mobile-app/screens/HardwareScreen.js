import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cpu, Battery, Radio, Lightbulb, Bell, RefreshCw, ChevronRight, Activity } from 'lucide-react-native';
import { COLORS, METRICS, TYPOGRAPHY } from '../theme';
import Haptics from '../utils/haptics';

const SettingRow = ({ icon: Icon, label, value, onToggle, type = 'switch', iconColor, iconBgColor }) => (
    <View style={styles.row}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            <View style={[styles.iconBox, { backgroundColor: iconBgColor || COLORS.surfacefloat }]}>
                <Icon size={16} color={iconColor || COLORS.textTitle} />
            </View>
            <Text style={styles.rowLabel}>{label}</Text>
        </View>
        {type === 'switch' ? (
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: COLORS.gridBackground, true: COLORS.primary }}
                thumbColor={COLORS.textTitle}
            />
        ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ color: COLORS.textMuted }}>{value}</Text>
                <ChevronRight size={16} color={COLORS.textMuted} />
            </View>
        )}
    </View>
);

export default function HardwareScreen() {
    const [ledEnabled, setLedEnabled] = useState(true);
    const [buzzerEnabled, setBuzzerEnabled] = useState(false);
    const [batterySaver, setBatterySaver] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [batteryLevel, setBatteryLevel] = useState(92);
    const [status, setStatus] = useState('CONNECTED');

    // Simulate battery drain
    useEffect(() => {
        const interval = setInterval(() => {
            setBatteryLevel(prev => {
                if (prev <= 0) return 0;
                // Drain slower if saver is on
                return prev - (batterySaver ? 0.1 : 0.5);
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [batterySaver]);

    const toggleBatterySaver = (val) => {
        setBatterySaver(val);
        Haptics.trigger('selection');
        if (val) {
            setLedEnabled(false);
            Alert.alert("Power Optimized", "LED Ring disabled. GPS pooling reduced to 5m.");
        }
    };

    const handleUpdate = () => {
        setUpdating(true);
        Haptics.trigger('medium');
        setTimeout(() => {
            setUpdating(false);
            Alert.alert("System Update", "Firmware is already up to date (v3.0.1)");
        }, 2000);
    };

    const handleBuzzer = (val) => {
        setBuzzerEnabled(val);
        Haptics.trigger('heavy');
        if (val) {
            Alert.alert("Remote Audit", "Audible Beacon Activated on Device.");
        }
    };

    const handleDisconnect = () => {
        Haptics.trigger('warning');
        setStatus(prev => prev === 'CONNECTED' ? 'OFFLINE' : 'CONNECTED');
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: METRICS.padding, paddingBottom: 100 }}>
                    {/* Low Power Mode Banner */}
                    {batterySaver && (
                        <View style={styles.saverBanner}>
                            <Battery size={14} color="#000" />
                            <Text style={styles.saverText}>LOW POWER MODE ACTIVE</Text>
                        </View>
                    )}

                    <View style={[styles.header, batterySaver && { opacity: 0.5 }]}>
                        <Text style={TYPOGRAPHY.header}>HARDWARE DIAGNOSTICS</Text>
                        <Text style={TYPOGRAPHY.subhead}>SMARTCOLLAR X1 • {batterySaver ? 'ECO MODE' : 'PERFORMANCE'}</Text>
                    </View>

                    {/* Status Card */}
                    <View style={styles.card}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                    <Battery size={18} color={batterySaver ? COLORS.warning : COLORS.success} />
                                    <Text style={TYPOGRAPHY.subhead}>BATTERY</Text>
                                </View>
                                <Text style={TYPOGRAPHY.valueBig}>{Math.floor(batteryLevel)}%</Text>
                                <Text style={TYPOGRAPHY.body}>{batterySaver ? '~7 Days Remaining' : '~4 Days Remaining'}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                    <Radio size={18} color={batterySaver ? COLORS.textMuted : COLORS.accent} />
                                    <Text style={TYPOGRAPHY.subhead}>SIGNAL</Text>
                                </View>
                                <Text style={TYPOGRAPHY.valueBig}>{batterySaver ? '-85dB' : '-42dB'}</Text>
                                <Text style={TYPOGRAPHY.body}>{batterySaver ? 'Power Save' : 'Excellent'}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.updateBtn, (batterySaver || updating) && { backgroundColor: COLORS.textMuted }]}
                            onPress={handleUpdate}
                            disabled={batterySaver || updating}
                        >
                            {updating ? <ActivityIndicator color={COLORS.gridBackground} /> : <RefreshCw size={16} color={COLORS.gridBackground} />}
                            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                                {updating ? 'INSTALLING PATCH...' : 'CHECK FOR FIRMWARE UPDATES'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={[TYPOGRAPHY.subhead, { marginBottom: 10, marginTop: 10 }]}>HARDWARE CONTROLS</Text>

                    <View style={styles.section}>
                        <SettingRow
                            icon={Battery}
                            label="Battery Saver Mode"
                            value={batterySaver}
                            onToggle={toggleBatterySaver}
                            iconColor={COLORS.warning} // Orange
                            iconBgColor="rgba(245, 158, 11, 0.1)"
                        />
                        <View style={styles.divider} />
                        <SettingRow
                            icon={Lightbulb}
                            label="Safety LED Ring"
                            value={ledEnabled}
                            onToggle={(val) => { setLedEnabled(val); Haptics.trigger('light'); }}
                            iconColor={COLORS.primary} // Blue
                            iconBgColor="rgba(79, 70, 229, 0.1)"
                        />
                        <View style={styles.divider} />
                        <SettingRow
                            icon={Bell}
                            label="Remote Buzzer"
                            value={buzzerEnabled}
                            onToggle={handleBuzzer}
                            iconColor={COLORS.accent} // Cyan
                            iconBgColor="rgba(56, 189, 248, 0.1)"
                        />
                        <View style={styles.divider} />
                        <TouchableOpacity onPress={handleDisconnect} style={styles.row}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                                <View style={[styles.iconBox, { backgroundColor: status === 'CONNECTED' ? COLORS.surfacefloat : COLORS.danger }]}>
                                    <Radio size={20} color={status === 'CONNECTED' ? COLORS.textTitle : '#FFF'} />
                                </View>
                                <Text style={styles.rowLabel}>Connection Status</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Text style={{ color: status === 'CONNECTED' ? COLORS.success : COLORS.danger }}>{status}</Text>
                                <ChevronRight size={16} color={COLORS.textMuted} />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <SettingRow
                            icon={Radio}
                            label="GPS Refresh Rate"
                            value={batterySaver ? "Eco (20s)" : "High (5s)"}
                            type="arrow"
                            iconColor={COLORS.success} // Green
                            iconBgColor="rgba(16, 185, 129, 0.1)"
                        />
                    </View>

                    <Text style={[TYPOGRAPHY.subhead, { marginBottom: 10, marginTop: 20 }]}>DEVICE INFO</Text>

                    <View style={styles.section}>
                        <SettingRow
                            icon={Cpu}
                            label="Serial Number"
                            value="SCX-8821-99"
                            type="arrow"
                            iconColor="#A855F7" // Purple
                            iconBgColor="rgba(168, 85, 247, 0.1)"
                        />
                        <View style={styles.divider} />
                        <SettingRow
                            icon={Activity}
                            label="Sensor Calibration"
                            value="Good"
                            type="arrow"
                            iconColor={COLORS.info} // Blue
                            iconBgColor="rgba(59, 130, 246, 0.1)"
                        />
                    </View>

                </ScrollView>
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
        marginBottom: 20,
        marginTop: 10,
    },
    card: {
        backgroundColor: COLORS.surfaceCard,
        borderRadius: METRICS.radius,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.divider,
    },
    section: {
        backgroundColor: COLORS.surfaceCard,
        borderRadius: METRICS.radius,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.divider,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        height: 60, // Fixed height to standardize all rows
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.divider,
        marginLeft: 50,
    },
    iconBox: {
        width: 28, // Reduced from 32
        height: 28, // Reduced from 32
        borderRadius: 6,
        backgroundColor: COLORS.surfacefloat,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowLabel: {
        fontSize: 14, // Reduced from 15 to match Registry
        color: COLORS.textBody, // Fixed from textTitle to match Registry
        fontWeight: '500',
    },
    updateBtn: {
        backgroundColor: COLORS.primary, // Fixed from textTitle (White) to Primary (Blue)
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
        marginTop: 5,
    },
    saverBanner: {
        backgroundColor: COLORS.warning,
        padding: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 10,
    },
    saverText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 1,
    }
});
