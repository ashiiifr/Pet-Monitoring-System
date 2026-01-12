import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
    Modal
} from 'react-native';
import { Scan, Mic, ShieldCheck, Lock, ChevronRight, Fingerprint, Eye, EyeOff } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, METRICS } from '../theme';
import { login, requestOtp, verifyOtp } from '../services/api';
import Haptics from '../utils/haptics';
import * as LocalAuthentication from 'expo-local-authentication';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation, onLogin }) {
    const [email, setEmail] = useState('demo@petowner.com');
    const [password, setPassword] = useState('demo123');
    const [loading, setLoading] = useState(false);
    const [isBiometricScanning, setIsBiometricScanning] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);

    // Animation values
    const scanLine = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        // Biometric Scan Loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLine, { toValue: 1, duration: 2000, useNativeDriver: true }),
                Animated.timing(scanLine, { toValue: 0, duration: 0, useNativeDriver: true })
            ])
        ).start();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('ACCESS DENIED', 'CREDENTIALS REQUIRED');
            return;
        }

        setLoading(true);
        // Simulate "Processing" delay for tactical feel
        setTimeout(async () => {
            try {
                const response = await login(email, password);
                const { token, user, refresh_token } = response.data;
                Haptics.trigger('success');
                onLogin(token, user, refresh_token);
            } catch (err) {
                Haptics.trigger('error');
                const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown Error';
                Alert.alert('ACCESS DENIED', errorMessage.toUpperCase());
                setLoading(false);
            }
        }, 800);
    };

    const triggerBiometricSim = async () => {
        setIsBiometricScanning(true);
        Haptics.trigger('medium');

        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            if (!compatible) {
                Alert.alert('HARDWARE ERROR', 'BIOMETRIC SENSORS NOT DETECTED');
                setIsBiometricScanning(false);
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'VERIFY OPERATOR CHECKPOINT',
                fallbackLabel: 'ENTER PASSCODE',
                disableDeviceFallback: false,
                cancelLabel: 'ABORT'
            });

            if (result.success) {
                Haptics.trigger('success');
                // In production, we would retrieve credentials from SecureStore here.
                // For this "100-Point" demo, we proceed to auth flow.
                handleLogin();
            } else {
                Haptics.trigger('error');
                Alert.alert('ACCESS DENIED', 'BIOMETRIC MISMATCH');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('SYSTEM ERROR', 'BIOMETRIC MODULE FAILURE');
        } finally {
            setIsBiometricScanning(false);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.content}
                >
                    <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                        <View style={styles.logoCircle}>
                            <ShieldCheck size={40} color={COLORS.primary} />
                        </View>
                        <Text style={styles.title}>TITAN SECURE ACCESS</Text>
                        <Text style={styles.subtitle}>IDENTITY VERIFICATION REQUIRED</Text>
                    </Animated.View>

                    {/* Biometric Scanner Visual */}
                    <View style={styles.scannerWindow}>
                        <View style={styles.scannerFrame}>
                            <Scan size={180} color={COLORS.textMuted} strokeWidth={1} />
                            {isBiometricScanning && (
                                <Animated.View style={[
                                    styles.scanLine,
                                    {
                                        transform: [{
                                            translateY: scanLine.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [-90, 90]
                                            })
                                        }]
                                    }
                                ]} />
                            )}
                        </View>
                        <Text style={styles.scanStatus}>
                            {isBiometricScanning ? "ANALYZING BIOMETRICS..." : "WAITING FOR INPUT..."}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>OPERATOR ID</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="ENTER ID"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>PASSCODE</Text>
                            <View style={{ position: 'relative' }}>
                                <TextInput
                                    style={[styles.input, { paddingRight: 50 }]}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="ENTER CODE"
                                    placeholderTextColor={COLORS.textMuted}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: 15, top: 15 }}
                                >
                                    {showPassword ? <EyeOff size={20} color={COLORS.textMuted} /> : <Eye size={20} color={COLORS.textMuted} />}
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={{ alignSelf: 'flex-end', marginTop: 4 }}
                                onPress={async () => {
                                    if (!email) {
                                        Alert.alert('RESET FAILED', 'ENTER OPERATOR ID (EMAIL) FIRST');
                                        return;
                                    }
                                    setLoading(true);
                                    try {
                                        await requestOtp(email);
                                        Haptics.trigger('success');
                                        setShowOtpModal(true);
                                    } catch (err) {
                                        Haptics.trigger('error');
                                        Alert.alert('REQUEST FAILED', 'COULD NOT SEND RECOVERY KEY');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            >
                                <Text style={{ ...TYPOGRAPHY.mono, color: COLORS.accent, fontSize: 10 }}>FORGOT PASSCODE?</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.loginBtn}
                            onPress={handleLogin}
                            disabled={loading || isBiometricScanning}
                        >
                            <Lock size={18} color="#FFF" style={{ marginRight: 10 }} />
                            <Text style={styles.loginText}>
                                {loading ? 'AUTHENTICATING...' : 'INITIATE SESSION'}
                            </Text>
                            {!loading && <ChevronRight size={18} color="#FFF" style={{ marginLeft: 6 }} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.biometricBtn}
                            onPress={triggerBiometricSim}
                            disabled={loading}
                        >
                            <Fingerprint size={24} color={COLORS.accent} />
                            <Text style={styles.biometricText}>BIOMETRIC HANDSHAKE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => navigation.navigate('Register')}
                        >
                            <Text style={styles.linkText}>REQUEST NEW CLEARANCE</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.footer}>
                        SESSION TERMINAL v3.0.1{'\n'}
                        SECURE CONNECTION :: LOCALHOST:5000
                    </Text>

                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* OTP Modal */}
            <Modal visible={showOtpModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>SECURE RECOVERY</Text>
                        <Text style={styles.modalText}>ENTER THE 6-DIGIT KEY TRANSMITTED TO {email}</Text>

                        <TextInput
                            style={styles.otpInput}
                            value={otpCode}
                            onChangeText={setOtpCode}
                            placeholder="000000"
                            placeholderTextColor={COLORS.textMuted}
                            keyboardType="number-pad"
                            maxLength={6}
                        />

                        <TouchableOpacity
                            style={styles.loginBtn}
                            onPress={async () => {
                                if (otpCode.length !== 6) return;
                                setOtpLoading(true);
                                try {
                                    const res = await verifyOtp(email, otpCode);
                                    const { token, user, refresh_token } = res.data;
                                    Haptics.trigger('success');
                                    setShowOtpModal(false);
                                    onLogin(token, user, refresh_token);
                                } catch (err) {
                                    Haptics.trigger('error');
                                    Alert.alert('ACCESS DENIED', 'INVALID RECOVERY KEY');
                                } finally {
                                    setOtpLoading(false);
                                }
                            }}
                            disabled={otpLoading}
                        >
                            <Text style={styles.loginText}>{otpLoading ? 'VERIFYING...' : 'CONFIRM IDENTITY'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.linkButton, { marginTop: 15 }]}
                            onPress={() => setShowOtpModal(false)}
                        >
                            <Text style={styles.linkText}>CANCEL SEQUENCE</Text>
                        </TouchableOpacity>
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
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 2,
        marginBottom: 5,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    subtitle: {
        fontSize: 10,
        color: COLORS.accent,
        letterSpacing: 1,
        fontWeight: '700',
    },
    scannerWindow: {
        alignItems: 'center',
        marginBottom: 30,
        height: 180,
    },
    scannerFrame: {
        width: 180,
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.divider,
        borderRadius: 20,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    scanLine: {
        position: 'absolute',
        width: '100%',
        height: 2,
        backgroundColor: COLORS.success,
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5,
    },
    scanStatus: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textMuted,
        fontSize: 10,
        marginTop: 10,
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textSecondary,
        fontSize: 10,
        marginLeft: 4,
    },
    input: {
        backgroundColor: COLORS.surfaceCard,
        borderRadius: 8,
        padding: 16,
        color: '#FFF',
        borderWidth: 1,
        borderColor: COLORS.divider,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 14,
    },
    loginBtn: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    loginText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
    },
    biometricBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: COLORS.divider,
        borderRadius: 8,
        backgroundColor: 'rgba(56, 189, 248, 0.05)',
        gap: 10,
    },
    biometricText: {
        color: COLORS.accent,
        fontWeight: '600',
        fontSize: 12,
        letterSpacing: 1,
    },
    linkButton: {
        alignItems: 'center',
        marginTop: 10,
    },
    linkText: {
        color: COLORS.textMuted,
        fontSize: 12,
        textDecorationLine: 'underline',
    },
    footer: {
        textAlign: 'center',
        color: '#333',
        fontSize: 10,
        marginTop: 40,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: COLORS.surfaceCard,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.primary,
        alignItems: 'center',
    },
    modalTitle: {
        color: COLORS.primary,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        letterSpacing: 2,
    },
    modalText: {
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 12,
        ...TYPOGRAPHY.mono,
    },
    otpInput: {
        backgroundColor: COLORS.gridBackground,
        width: '100%',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.divider,
        color: '#FFF',
        fontSize: 24,
        textAlign: 'center',
        letterSpacing: 10,
        fontWeight: 'bold',
        marginBottom: 20,
    }
});
