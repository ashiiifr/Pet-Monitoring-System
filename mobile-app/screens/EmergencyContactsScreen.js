import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, Trash2, Phone, User, HeartPulse } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '../theme';
import { GlassCard } from '../components/ui/GlassCard';
import { TitanButton } from '../components/ui/TitanButton';

import { getEmergencyContacts, addEmergencyContact, deleteEmergencyContact } from '../services/api';

export default function EmergencyContactsScreen({ navigation }) {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', relation: '', phone: '' });

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            const res = await getEmergencyContacts();
            setContacts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newContact.name || !newContact.phone) return;
        try {
            const res = await addEmergencyContact(newContact);
            setContacts([...contacts, { ...newContact, id: res.data.id }]);
            setNewContact({ name: '', relation: '', phone: '' });
            setModalVisible(false);
        } catch (err) {
            Alert.alert("Error", "Failed to add contact");
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Confirm Deletion",
            "Remove this tactical asset from emergency protocols?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Purge",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setContacts(contacts.filter(c => c.id !== id)); // Optimistic
                            await deleteEmergencyContact(id);
                        } catch (err) {
                            console.error(err);
                            loadContacts(); // Revert
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>EMERGENCY PROTOCOLS</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <Plus size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionLabel}>ACTIVE RESPONDERS ({contacts.length})</Text>

                {contacts.map((contact) => (
                    <GlassCard key={contact.id} style={styles.card}>
                        <View style={styles.cardIcon}>
                            <User size={24} color="#FFF" />
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.contactName}>{contact.name}</Text>
                            <Text style={styles.contactRelation}>{contact.relation}</Text>
                            <Text style={styles.contactPhone}>{contact.phone}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(contact.id)} style={styles.deleteBtn}>
                            <Trash2 size={20} color={COLORS.danger} />
                        </TouchableOpacity>
                    </GlassCard>
                ))}

                {contacts.length === 0 && (
                    <View style={styles.emptyState}>
                        <HeartPulse size={48} color={COLORS.textMuted} />
                        <Text style={styles.emptyText}>NO ASSETS ASSIGNED</Text>
                    </View>
                )}
            </ScrollView>

            {/* Add Contact Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>NEW ASSET</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="FULL DESIGNATION"
                            placeholderTextColor={COLORS.textMuted}
                            value={newContact.name}
                            onChangeText={t => setNewContact({ ...newContact, name: t })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="RELATION (e.g. VET)"
                            placeholderTextColor={COLORS.textMuted}
                            value={newContact.relation}
                            onChangeText={t => setNewContact({ ...newContact, relation: t })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="COMM FREQUENCY (PHONE)"
                            placeholderTextColor={COLORS.textMuted}
                            keyboardType="phone-pad"
                            value={newContact.phone}
                            onChangeText={t => setNewContact({ ...newContact, phone: t })}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>ABORT</Text>
                            </TouchableOpacity>
                            <TitanButton title="AUTHORIZE" onPress={handleAdd} style={{ flex: 1 }} />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    headerTitle: {
        ...TYPOGRAPHY.header,
        fontSize: 16,
        color: '#FFF',
        letterSpacing: 2,
    },
    backButton: {
        padding: 5,
    },
    addButton: {
        padding: 5,
    },
    content: {
        padding: 20,
    },
    sectionLabel: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textMuted,
        marginBottom: 15,
        fontSize: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.surfaceHighlight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    cardInfo: {
        flex: 1,
    },
    contactName: {
        ...TYPOGRAPHY.header,
        fontSize: 14,
        color: '#FFF',
    },
    contactRelation: {
        ...TYPOGRAPHY.body,
        fontSize: 12,
        color: COLORS.primary,
        marginBottom: 2,
    },
    contactPhone: {
        ...TYPOGRAPHY.mono,
        fontSize: 12,
        color: COLORS.textMuted,
    },
    deleteBtn: {
        padding: 10,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
        opacity: 0.5,
    },
    emptyText: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textMuted,
        marginTop: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.surfaceCard,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: COLORS.primaryGlow,
    },
    modalTitle: {
        ...TYPOGRAPHY.header,
        color: COLORS.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.divider,
        borderRadius: 8,
        padding: 15,
        color: '#FFF',
        marginBottom: 15,
        ...TYPOGRAPHY.body,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 10,
        alignItems: 'center',
    },
    cancelBtn: {
        padding: 15,
    },
    cancelText: {
        color: COLORS.textMuted,
        fontWeight: 'bold',
    }
});
