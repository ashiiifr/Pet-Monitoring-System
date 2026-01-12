import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    FlatList,
    RefreshControl,
    Alert as RNAlert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AlertCircle, AlertTriangle, Info, Check, Trash2, BellOff, X } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, METRICS } from '../theme';
import { getAlerts, markAlertRead, deleteAlert } from '../services/api';

export default function AlertsScreen() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadAlerts();
        }, [])
    );

    const loadAlerts = async () => {
        try {
            const response = await getAlerts();
            setAlerts(response.data);
        } catch (err) {
            console.error('Failed to load alerts:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleMarkRead = async (alertId) => {
        try {
            // Optimistic update
            setAlerts(prev => prev.map(a =>
                a.id === alertId ? { ...a, is_read: 1 } : a
            ));
            await markAlertRead(alertId);
        } catch (err) {
            console.error('Failed to mark alert read:', err);
        }
    };

    const handleDismiss = async (alertId) => {
        try {
            // Optimistic delete
            setAlerts(prev => prev.filter(a => a.id !== alertId));
            await deleteAlert(alertId);
        } catch (err) {
            console.error('Failed to dismiss alert:', err);
            loadAlerts(); // Revert on failure
        }
    };

    const getAlertConfig = (severity) => {
        switch (severity) {
            case 'danger':
                return {
                    bg: 'rgba(239, 68, 68, 0.1)',
                    border: COLORS.danger,
                    icon: AlertCircle,
                    color: COLORS.danger
                };
            case 'warning':
                return {
                    bg: 'rgba(245, 158, 11, 0.1)',
                    border: COLORS.warning,
                    icon: AlertTriangle,
                    color: COLORS.warning
                };
            default:
                return {
                    bg: 'rgba(59, 130, 246, 0.1)',
                    border: COLORS.primary,
                    icon: Info,
                    color: COLORS.primary
                };
        }
    };

    const renderAlert = ({ item }) => {
        const config = getAlertConfig(item.severity);
        const Icon = config.icon;

        return (
            <View style={[
                styles.alertCard,
                { backgroundColor: config.bg, borderColor: config.border },
                item.is_read && styles.alertRead
            ]}>

                {/* Status Indicator Bar */}
                <View style={[styles.statusBar, { backgroundColor: config.border }]} />

                <View style={styles.cardContent}>
                    <View style={styles.headerRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Icon size={18} color={config.color} />
                            <Text style={[styles.petName, { color: config.color }]}>
                                {item.pet_name?.toUpperCase() || 'SYSTEM'}
                            </Text>
                        </View>
                        <Text style={styles.timeText}>
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>

                    <Text style={[styles.message, item.is_read && { opacity: 0.7 }]}>
                        {item.message}
                    </Text>

                    <View style={styles.actions}>
                        {!item.is_read && (
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => handleMarkRead(item.id)}
                            >
                                <Check size={14} color={COLORS.success} />
                                <Text style={[styles.actionText, { color: COLORS.success }]}>ACKNOWLEDGE</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.actionBtn, { marginLeft: 'auto' }]}
                            onPress={() => handleDismiss(item.id)}
                        >
                            <X size={14} color={COLORS.textMuted} />
                            <Text style={styles.actionText}>DISMISS</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <View>
                        <Text style={TYPOGRAPHY.header}>SYSTEM ALERTS</Text>
                        <Text style={TYPOGRAPHY.subhead}>
                            {alerts.filter(a => !a.is_read).length} ACTIVE NOTIFICATIONS
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.clearBtn}
                        onPress={() => setAlerts([])}
                        disabled={alerts.length === 0}
                    >
                        <Trash2 size={20} color={alerts.length === 0 ? COLORS.textMuted : COLORS.danger} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.centerBox}>
                        <Text style={styles.placeholderText}>SCANNING FOR ALERTS...</Text>
                    </View>
                ) : alerts.length === 0 ? (
                    <View style={styles.centerBox}>
                        <BellOff size={48} color={COLORS.textMuted} style={{ opacity: 0.5, marginBottom: 20 }} />
                        <Text style={styles.placeholderText}>ALL SYSTEMS NOMINAL</Text>
                        <Text style={styles.subScrollText}>NO ACTIVE THREATS DETECTED</Text>
                    </View>
                ) : (
                    <FlatList
                        data={alerts}
                        renderItem={renderAlert}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.list}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={() => { setRefreshing(true); loadAlerts(); }}
                                tintColor={COLORS.primary}
                                colors={[COLORS.primary]}
                            />
                        }
                    />
                )}
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
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    clearBtn: {
        padding: 10,
        backgroundColor: COLORS.surfaceCard,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.divider,
    },
    list: {
        padding: 20,
    },
    alertCard: {
        borderRadius: METRICS.radius,
        borderWidth: 1,
        marginBottom: 15,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    alertRead: {
        opacity: 0.6,
        backgroundColor: COLORS.surfaceCard, // Override color for read items
        borderColor: COLORS.divider,
    },
    statusBar: {
        width: 4,
        height: '100%',
    },
    cardContent: {
        flex: 1,
        padding: 15,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    petName: {
        ...TYPOGRAPHY.mono,
        fontSize: 12,
        fontWeight: 'bold',
    },
    timeText: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textMuted,
        fontSize: 10,
    },
    message: {
        color: COLORS.textTitle,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    actions: {
        flexDirection: 'row',
        gap: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 10,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionText: {
        ...TYPOGRAPHY.mono,
        fontSize: 10,
        color: COLORS.textMuted,
    },
    centerBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.7,
    },
    placeholderText: {
        ...TYPOGRAPHY.header,
        color: COLORS.textMuted,
        fontSize: 16,
        letterSpacing: 2,
    },
    subScrollText: {
        ...TYPOGRAPHY.mono,
        color: COLORS.primary,
        fontSize: 10,
        marginTop: 10,
    }
});
