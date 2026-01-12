import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, StyleSheet, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Mail, Phone, Calendar, Shield, Server, LogOut, ChevronRight, Key, Trash2, Edit2, Save, Download, FileText } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, METRICS } from '../theme';
import { DataCard } from '../components/ui/DataCard';
import { getMe, getPets } from '../services/api';
import { Linking } from 'react-native';

export default function ProfileScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const stored = await AsyncStorage.getItem('user');
            if (stored) {
                const u = JSON.parse(stored);
                setUser(u);
                setEditName(u.name);
                setEditPhone(u.phone);
            }
            // Fetch fresh
            const response = await getMe();
            setUser(response.data);
            setEditName(response.data.name);
            setEditPhone(response.data.phone);
        } catch (err) {
            console.log('User load error (offline mode potentially active)');
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        // Simulate API call
        setTimeout(async () => {
            const updatedUser = { ...user, name: editName, phone: editPhone };
            setUser(updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setSaving(false);
            setIsEditing(false);
            Alert.alert('PROFILE UPDATED', 'Personnel file has been successfully modified.');
        }, 1500);
    };

    const handleExportData = () => {
        Alert.alert(
            'GENERATE DOSSIER?',
            'Compile full neurological and biometric history into encrypted PDF?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'DOWNLOAD',
                    onPress: async () => {
                        try {
                            const res = await getPets();
                            const pets = res.data;
                            if (pets.length > 0) {
                                // Direct user to browser/PDF viewer with the API URL
                                // This works better for downloading/viewing on mobile without saving to FS
                                Linking.openURL(`http://172.16.157.153:5000/api/pets/${pets[0].id}/dossier`);
                            } else {
                                Alert.alert("Error", "No registered subjects found to generate dossier.");
                            }
                        } catch (err) {
                            Alert.alert("Error", "Failed to retrieve subject data.");
                        }
                    }
                }
            ]
        );
    };

    const InfoRow = ({ label, value, icon: Icon, editable, onChangeText, isEditingField, iconColor, iconBgColor }) => (
        <View style={styles.infoRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.iconBox, { backgroundColor: iconBgColor || COLORS.surfacefloat }]}>
                    <Icon size={16} color={iconColor || COLORS.textTitle} />
                </View>
                <Text style={styles.infoLabel}>{label}</Text>
            </View>
            {isEditing && editable ? (
                <TextInput
                    style={styles.editInput}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={'Enter ' + label}
                    placeholderTextColor={COLORS.textMuted}
                />
            ) : (
                <Text style={styles.infoValue}>{value || 'N/A'}</Text>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.gridBackground} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={TYPOGRAPHY.header}>COMMAND REGISTRY</Text>
                        <Text style={TYPOGRAPHY.subhead}>PERSONNEL FILE #8821</Text>
                    </View>
                    <TouchableOpacity onPress={handleExportData} style={styles.headerBtn}>
                        <Download size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ padding: METRICS.padding, paddingBottom: 100 }}>

                    {/* User Identity Card */}
                    <View style={styles.identityCard}>
                        <View style={styles.avatar}>
                            <User size={40} color="#FFF" />
                            <View style={styles.editBadge}>
                                <Edit2 size={12} color="#FFF" />
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            {isEditing ? (
                                <TextInput
                                    style={styles.nameInput}
                                    value={editName}
                                    onChangeText={setEditName}
                                    placeholder="PERSONNEL NAME"
                                    placeholderTextColor={COLORS.textMuted}
                                />
                            ) : (
                                <Text style={styles.userName}>{user?.name?.toUpperCase() || 'COMMANDER'}</Text>
                            )}
                            <Text style={styles.userRole}>Level 5 Clearance</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color={COLORS.primary} size="small" />
                            ) : (
                                isEditing ? <Save size={20} color={COLORS.primary} /> : <Edit2 size={20} color={COLORS.textMuted} />
                            )}
                        </TouchableOpacity>
                    </View>

                    <Text style={[TYPOGRAPHY.subhead, { marginBottom: 15 }]}>PERSONAL DOSSIER</Text>

                    <View style={styles.section}>
                        <InfoRow
                            label="Secure Comm"
                            value={user?.email}
                            icon={Mail}
                            iconColor={COLORS.info} // Blue
                            iconBgColor="rgba(59, 130, 246, 0.1)"
                        />
                        <View style={styles.divider} />
                        <InfoRow
                            label="Direct Line"
                            value={isEditing ? editPhone : user?.phone}
                            icon={Phone}
                            editable
                            isEditingField={isEditing}
                            onChangeText={setEditPhone}
                            iconColor={COLORS.success} // Green
                            iconBgColor="rgba(16, 185, 129, 0.1)"
                        />
                        <View style={styles.divider} />
                        <InfoRow
                            label="Active Since"
                            value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : '2024-01-01'}
                            icon={Calendar}
                            iconColor={COLORS.accent} // Cyan
                            iconBgColor="rgba(56, 189, 248, 0.1)"
                        />
                    </View>

                    <Text style={[TYPOGRAPHY.subhead, { marginBottom: 15, marginTop: 25 }]}>SYSTEM DIAGNOSTICS</Text>

                    <View style={styles.section}>
                        <InfoRow
                            label="App Version"
                            value="v3.0.0 (Titan)"
                            icon={Shield}
                            iconColor="#A855F7" // Purple
                            iconBgColor="rgba(168, 85, 247, 0.1)"
                        />
                        <View style={styles.divider} />
                        <InfoRow
                            label="Server Node"
                            value="Localhost:5000"
                            icon={Server}
                            iconColor={COLORS.warning} // Orange
                            iconBgColor="rgba(245, 158, 11, 0.1)"
                        />
                    </View>

                    <Text style={[TYPOGRAPHY.subhead, { marginBottom: 15, marginTop: 25 }]}>SECURITY PROTOCOLS</Text>
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.actionRow}
                            onPress={() => {
                                Alert.alert('CHANGE ACCESS KEY', 'A secure reset link has been sent to your comm link.');
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={[styles.iconBox, { backgroundColor: COLORS.surfaceHighlight }]}>
                                    <Key size={16} color={COLORS.primary} />
                                </View>
                                <Text style={styles.infoLabel}>Rotate Access Key</Text>
                            </View>
                            <ChevronRight size={16} color={COLORS.textMuted} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.actionRow}
                            onPress={() => navigation.navigate('EmergencyContacts')}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                    <Shield size={16} color={COLORS.warning} />
                                </View>
                                <Text style={styles.infoLabel}>Emergency Protocols</Text>
                            </View>
                            <ChevronRight size={16} color={COLORS.textMuted} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.actionRow}
                            onPress={() => navigation.navigate('Sat-Nav')} // Navigate to Map
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                    <Shield size={16} color={COLORS.success} />
                                </View>
                                <Text style={styles.infoLabel}>Configure Safe Zone</Text>
                            </View>
                            <ChevronRight size={16} color={COLORS.textMuted} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.actionRow}
                            onPress={() => {
                                Alert.alert(
                                    'REVOKE CLEARANCE?',
                                    'This action will permanently purge your personnel file. This cannot be undone.',
                                    [
                                        { text: 'CANCEL', style: 'cancel' },
                                        {
                                            text: 'REVOKE',
                                            style: 'destructive',
                                            onPress: () => {
                                                Alert.alert('CLEARANCE REVOKED', 'Session terminated.');
                                                handleLogout();
                                            }
                                        }
                                    ]
                                );
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                    <Trash2 size={16} color={COLORS.danger} />
                                </View>
                                <Text style={[styles.infoLabel, { color: COLORS.danger }]}>Purge Personnel File</Text>
                            </View>
                            <ChevronRight size={16} color={COLORS.danger} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <LogOut size={20} color={COLORS.danger} />
                        <Text style={styles.logoutText}>TERMINATE SESSION</Text>
                    </TouchableOpacity>

                    <Text style={styles.footer}>
                        TITAN SURVEILLANCE SYSTEMS © 2026{'\n'}
                        SECURE CONNECTION ESTABLISHED
                    </Text>

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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: METRICS.padding,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
        marginBottom: 10,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surfaceCard,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.divider
    },
    identityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.surfaceCard,
        borderRadius: METRICS.radius,
        borderWidth: 1,
        borderColor: COLORS.divider,
        marginBottom: 30,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.accent,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#000'
    },
    userName: {
        ...TYPOGRAPHY.header,
        fontSize: 18,
    },
    nameInput: {
        ...TYPOGRAPHY.header,
        fontSize: 18,
        color: COLORS.textTitle,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary,
        paddingVertical: 0
    },
    userRole: {
        ...TYPOGRAPHY.mono,
        color: COLORS.accent,
        marginTop: 4,
    },
    editBtn: {
        padding: 10,
    },
    section: {
        backgroundColor: COLORS.surfaceCard,
        borderRadius: METRICS.radius,
        borderWidth: 1,
        borderColor: COLORS.divider,
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.surfaceCard, // Ensure clickability
    },
    infoLabel: {
        fontSize: 14,
        color: COLORS.textBody,
        fontWeight: '500',
    },
    infoValue: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textTitle,
        fontSize: 12,
    },
    editInput: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textTitle,
        fontSize: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary,
        width: 150,
        textAlign: 'right',
        paddingVertical: 0
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.divider,
        marginLeft: 44,
    },
    iconBox: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: COLORS.surfacefloat,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red tint
        borderWidth: 1,
        borderColor: COLORS.danger,
        borderRadius: METRICS.radius,
        padding: 16,
        marginTop: 40,
        gap: 10,
    },
    logoutText: {
        color: COLORS.danger,
        fontWeight: '700',
        letterSpacing: 1,
    },
    footer: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 30,
        fontSize: 10,
        opacity: 0.5,
    }
});
