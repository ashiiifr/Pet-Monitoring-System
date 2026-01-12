import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ScrollView,
    StatusBar,
    Platform,
    Modal
} from 'react-native';
import { register } from '../services/api';
import { COLORS, TYPOGRAPHY } from '../theme';
import { UserPlus, Mail, Lock, Phone, User, ChevronRight } from 'lucide-react-native';

export default function RegisterScreen({ navigation, onLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [strength, setStrength] = useState(0);

    const checkStrength = (pass) => {
        let score = 0;
        if (pass.length > 7) score++;
        if (pass.match(/[A-Z]/)) score++;
        if (pass.match(/[0-9]/)) score++;
        if (pass.match(/[^a-zA-Z0-9]/)) score++;
        setStrength(score);
        setPassword(pass);
    };

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('System Alert', 'All access credentials required.');
            return;
        }
        if (!termsAccepted) {
            Alert.alert('Protocol Breach', 'You must agree to the Titan Protocols (TOS) to proceed.');
            return;
        }

        setLoading(true);
        try {
            // Simulated delay for "Access Handshake"
            await new Promise(resolve => setTimeout(resolve, 1500));
            const response = await register({ name, email, password, phone, role: 'owner' });
            const { token, user, refresh_token } = response.data;
            onLogin(token, user, refresh_token);
        } catch (err) {
            Alert.alert('Access Denied', err.response?.data?.error || 'Authorization failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <ScrollView contentContainerStyle={styles.content}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <UserPlus size={40} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>NEW OPERATOR</Text>
                    <Text style={styles.subtitle}>ESTABLISHING SECURE PROFILE</Text>
                </View>

                {/* Form Fields */}
                <View style={styles.form}>

                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>FULL DESIGNATION</Text>
                        <View style={styles.inputWrapper}>
                            <User size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="ex. JOHN DOE"
                                placeholderTextColor={COLORS.textMuted + '80'}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>COMM LINK (EMAIL)</Text>
                        <View style={styles.inputWrapper}>
                            <Mail size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="name@domain.com"
                                placeholderTextColor={COLORS.textMuted + '80'}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ACCESS KEY</Text>
                        <View style={styles.inputWrapper}>
                            <Lock size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={checkStrength}
                                placeholder="••••••••"
                                placeholderTextColor={COLORS.textMuted + '80'}
                                secureTextEntry
                            />
                        </View>
                        {/* Strength Meter */}
                        <View style={{ flexDirection: 'row', gap: 5, marginTop: 8 }}>
                            {[1, 2, 3, 4].map((level) => (
                                <View
                                    key={level}
                                    style={{
                                        flex: 1,
                                        height: 4,
                                        borderRadius: 2,
                                        backgroundColor: strength >= level
                                            ? (strength < 2 ? COLORS.danger : strength < 4 ? COLORS.warning : COLORS.success)
                                            : COLORS.divider
                                    }}
                                />
                            ))}
                        </View>
                        <Text style={{ ...TYPOGRAPHY.mono, fontSize: 10, color: COLORS.textMuted, textAlign: 'right', marginTop: 4 }}>
                            STRENGTH: {strength === 0 ? 'NULL' : strength < 3 ? 'WEAK' : strength === 3 ? 'MODEREATE' : 'SECURE'}
                        </Text>
                    </View>

                    {/* Phone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>SECURE LINE (OPTIONAL)</Text>
                        <View style={styles.inputWrapper}>
                            <Phone size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="+1 (000) 000-0000"
                                placeholderTextColor={COLORS.textMuted + '80'}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>


                    {/* Terms Agreement */}
                    <View style={styles.termsRow}>
                        <TouchableOpacity style={styles.checkbox} onPress={() => setTermsAccepted(!termsAccepted)}>
                            {termsAccepted && <View style={styles.checkboxInner} />}
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.termsText}>
                                I AUTHORIZE CLEARANCE AND AGREE TO THE{' '}
                                <Text style={styles.termsLink} onPress={() => setShowTerms(true)}>TITAN PROTOCOLS (TOS)</Text>
                            </Text>
                        </View>
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[styles.button, (loading || !termsAccepted) && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading || !termsAccepted}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'INITIALIZING PROFILE...' : 'AUTHORIZE ACCESS'}
                        </Text>
                        {!loading && <ChevronRight size={20} color="#000" />}
                    </TouchableOpacity>

                    {/* Back to Login */}
                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.linkText}>// EXISTING OPERATOR? LOGIN</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer Decor */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>TITAN SYSTEM V3.0 // SECURE PROTOCOL</Text>
                </View>

                {/* TOS Modal */}
                <Modal visible={showTerms} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>TITAN PROTOCOLS (TOS)</Text>
                            <ScrollView style={styles.modalScroll}>
                                <Text style={styles.modalText}>
                                    1. OPERATOR LIABILITY{'\n'}
                                    By accessing the TITAN network, you agree to monitor biological entities (Pets) within parameters.{'\n\n'}
                                    2. DATA ENCRYPTION{'\n'}
                                    All biological metrics are encrypted. We do not sell your data to adversarial networks.{'\n\n'}
                                    3. SYSTEM INTEGRITY{'\n'}
                                    Do not attempt to reverse engineer the collar hardware.
                                </Text>
                            </ScrollView>
                            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowTerms(false)}>
                                <Text style={styles.modalCloseText}>ACKNOWLEDGE PROTOCOLS</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background, // Titan Gunmetal
    },
    content: {
        padding: 24,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${COLORS.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    title: {
        ...TYPOGRAPHY.header,
        fontSize: 24,
        color: '#FFF',
        letterSpacing: 2,
        marginBottom: 5,
    },
    subtitle: {
        ...TYPOGRAPHY.mono,
        color: COLORS.primary,
        fontSize: 12,
        letterSpacing: 2,
        opacity: 0.8,
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textMuted,
        marginBottom: 8,
        fontSize: 10,
        letterSpacing: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.divider,
        borderRadius: 8,
        height: 50,
    },
    inputIcon: {
        marginLeft: 15,
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: COLORS.textTitle,
        ...TYPOGRAPHY.body,
        height: '100%',
    },
    button: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        height: 55,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        gap: 10,
        ...Platform.select({
            web: {
                boxShadow: `0 0 20px ${COLORS.primary}40`,
            },
            default: {
                elevation: 5,
                shadowColor: COLORS.primary,
            }
        })
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    linkButton: {
        marginTop: 25,
        alignItems: 'center',
    },
    linkText: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textMuted,
        fontSize: 12,
    },
    footer: {
        marginTop: 60,
        alignItems: 'center',
        opacity: 0.3,
    },
    footerText: {
        ...TYPOGRAPHY.mono,
        fontSize: 10,
        color: COLORS.textMuted,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
        gap: 12,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
    },
    checkboxInner: {
        width: 12,
        height: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    termsText: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textMuted,
        fontSize: 10,
        lineHeight: 16,
    },
    termsLink: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: COLORS.surfaceCard,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.divider,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        ...TYPOGRAPHY.header,
        fontSize: 18,
        color: COLORS.primary,
        marginBottom: 15,
        textAlign: 'center',
        letterSpacing: 1,
    },
    modalScroll: {
        marginBottom: 20,
    },
    modalText: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textBody,
        fontSize: 12,
        lineHeight: 20,
    },
    modalCloseBtn: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCloseText: {
        ...TYPOGRAPHY.mono,
        color: '#000',
        fontWeight: 'bold',
    }
});
