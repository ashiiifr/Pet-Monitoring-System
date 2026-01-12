import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
    Image,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    StatusBar,
    Platform
} from 'react-native';
import { createPet } from '../services/api';
import { COLORS, TYPOGRAPHY, METRICS } from '../theme';
import { Dog, Cat, Syringe, Weight, Calendar, Plus, FileText, Camera } from 'lucide-react-native';

export default function AddPetScreen({ navigation }) {
    // Navigation Options for Dark Header
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: '#FFF',
            headerTitleStyle: { fontWeight: 'bold' }
        });
    }, [navigation]);

    const [name, setName] = useState('');
    const [petType, setPetType] = useState('dog');
    const [breed, setBreed] = useState('');
    const [ageYears, setAgeYears] = useState('');
    const [weightKg, setWeightKg] = useState('');
    const [gender, setGender] = useState('male');
    const [loading, setLoading] = useState(false);

    // New Fields
    const [image, setImage] = useState(null);
    const [vaccinated, setVaccinated] = useState(false);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Protocol Error', 'Subject Designation (Name) Required.');
            return;
        }

        setLoading(true);
        try {
            await createPet({
                name,
                pet_type: petType,
                breed: breed || null,
                age_years: ageYears ? parseFloat(ageYears) : null,
                weight_kg: weightKg ? parseFloat(weightKg) : null,
                gender,
                image_uri: image,
                vaccinated
            });
            Alert.alert('Protocol Success', 'New Subject registered in Titan Database.', [
                { text: 'ACKNOWLEDGE', onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            Alert.alert('System Error', err.response?.data?.error || 'Registration Failed');
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
                    <Text style={styles.headerTitle}>REGISTER SUBJECT</Text>
                    <Text style={styles.headerSubtitle}>NEW BIOLOGICAL ENTITY</Text>
                </View>

                {/* 0. Photo Upload */}
                <View style={styles.photoSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.photoUpload}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.photo} />
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <Camera size={32} color={COLORS.primary} />
                                <Text style={styles.photoText}>UPLOAD_IMG</Text>
                            </View>
                        )}
                        <View style={styles.uploadBadge}>
                            <Plus size={12} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* 1. Pet Identity */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>SUBJECT DESIGNATION</Text>
                    <View style={styles.inputWrapper}>
                        <FileText size={18} color={COLORS.primary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="ENTER DESIGNATION (NAME)..."
                            placeholderTextColor={COLORS.textMuted + '80'}
                        />
                    </View>
                </View>

                {/* 2. Species Classification */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>SPECIES CLASSIFICATION</Text>
                    <View style={styles.grid2}>
                        <TouchableOpacity
                            style={[styles.selectorCard, petType === 'dog' && styles.selectorCardActive]}
                            onPress={() => setPetType('dog')}
                        >
                            <Dog size={24} color={petType === 'dog' ? COLORS.primary : COLORS.textMuted} />
                            <Text style={[styles.selectorText, petType === 'dog' && styles.selectorTextActive]}>CANINE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.selectorCard, petType === 'cat' && styles.selectorCardActive]}
                            onPress={() => setPetType('cat')}
                        >
                            <Cat size={24} color={petType === 'cat' ? COLORS.primary : COLORS.textMuted} />
                            <Text style={[styles.selectorText, petType === 'cat' && styles.selectorTextActive]}>FELINE</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 3. Biological Data */}
                <View style={[styles.section, { flexDirection: 'row', gap: 15 }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionLabel}>BREED_ID</Text>
                        <TextInput
                            style={styles.inputSmall}
                            value={breed}
                            onChangeText={setBreed}
                            placeholder="UNKNOWN"
                            placeholderTextColor={COLORS.textMuted + '80'}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionLabel}>BIOLOGICAL_SEX</Text>
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[styles.toggleBtn, gender === 'male' && styles.toggleBtnActive]}
                                onPress={() => setGender('male')}
                            >
                                <Text style={[styles.toggleText, gender === 'male' && styles.toggleTextActive]}>M</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleBtn, gender === 'female' && styles.toggleBtnActive]}
                                onPress={() => setGender('female')}
                            >
                                <Text style={[styles.toggleText, gender === 'female' && styles.toggleTextActive]}>F</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* 3.5. Medical Status */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>MEDICAL_STATUS</Text>
                    <TouchableOpacity
                        style={[styles.checkboxRow, vaccinated && styles.checkboxRowActive]}
                        onPress={() => setVaccinated(!vaccinated)}
                    >
                        <View style={[styles.checkbox, vaccinated && styles.checkboxActive]}>
                            {vaccinated && <Plus size={14} color="#000" strokeWidth={4} />}
                        </View>
                        <View>
                            <Text style={styles.checkboxTitle}>VACCINATION PROTOCOLS COMPLETE</Text>
                            <Text style={styles.checkboxSubtitle}>Subject has received core immunizations</Text>
                        </View>
                        <Syringe size={20} color={vaccinated ? COLORS.primary : COLORS.textMuted} style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>
                </View>

                {/* 4. Physical Metrics */}
                <View style={[styles.section, { flexDirection: 'row', gap: 15 }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionLabel}>AGE (YRS)</Text>
                        <View style={styles.inputWrapperSmall}>
                            <Calendar size={16} color={COLORS.textMuted} />
                            <TextInput
                                style={styles.input}
                                value={ageYears}
                                onChangeText={setAgeYears}
                                placeholder="00"
                                placeholderTextColor={COLORS.textMuted + '80'}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionLabel}>WEIGHT (KG)</Text>
                        <View style={styles.inputWrapperSmall}>
                            <Weight size={16} color={COLORS.textMuted} />
                            <TextInput
                                style={styles.input}
                                value={weightKg}
                                onChangeText={setWeightKg}
                                placeholder="00.0"
                                placeholderTextColor={COLORS.textMuted + '80'}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>

                {/* Submit Action */}
                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Plus size={20} color={COLORS.background} />
                    <Text style={styles.submitBtnText}>
                        {loading ? 'PROCESSING...' : 'INITIALIZE SUBJECT'}
                    </Text>
                </TouchableOpacity>

                {/* Cancel Action */}
                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelText}>CANCEL OPERATION</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: 20,
        paddingTop: 40,
    },
    headerTitle: {
        ...TYPOGRAPHY.header,
        fontSize: 20,
        color: COLORS.primary, // Reverted to Primary (Indigo) for Titan vibe
        letterSpacing: 2,
    },
    headerSubtitle: {
        ...TYPOGRAPHY.mono,
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 4,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    photoUpload: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.surfaceCard,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    photoPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    photoText: {
        ...TYPOGRAPHY.mono,
        fontSize: 10,
        color: COLORS.primary,
    },
    uploadBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.background,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceCard,
        borderWidth: 1,
        borderColor: COLORS.divider,
        borderRadius: 8,
        padding: 15,
        gap: 15,
    },
    checkboxRowActive: {
        borderColor: COLORS.primary,
        backgroundColor: `${COLORS.primary}10`,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: COLORS.textMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    checkboxTitle: {
        ...TYPOGRAPHY.header,
        fontSize: 12,
        color: COLORS.textTitle,
    },
    checkboxSubtitle: {
        fontSize: 10,
        color: COLORS.textMuted,
    },
    section: {
        marginBottom: 25,
    },
    sectionLabel: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textMuted,
        fontSize: 11,
        marginBottom: 10,
        letterSpacing: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceCard,
        borderWidth: 1,
        borderColor: COLORS.divider,
        borderRadius: 8, // More rounded
        paddingHorizontal: 16, // Increased padding (was 12)
        height: 55,
    },
    inputWrapperSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceCard,
        borderWidth: 1,
        borderColor: COLORS.divider,
        borderRadius: 8,
        paddingHorizontal: 12, // Increased padding (was 8)
        height: 55,
    },
    inputIcon: {
        marginRight: 14, // Increased gap
        opacity: 0.8,
    },
    input: {
        flex: 1,
        color: COLORS.textTitle,
        ...TYPOGRAPHY.body,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 14,
    },
    inputSmall: {
        backgroundColor: COLORS.surfaceCard,
        borderWidth: 1,
        borderColor: COLORS.divider,
        borderRadius: 6,
        paddingHorizontal: 12,
        height: 55,
        color: COLORS.textTitle,
        ...TYPOGRAPHY.body,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    grid2: {
        flexDirection: 'row',
        gap: 15,
    },
    selectorCard: {
        flex: 1,
        backgroundColor: COLORS.surfaceCard,
        borderWidth: 1,
        borderColor: COLORS.divider,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20, // Taller cards
        gap: 10,
    },
    selectorCardActive: {
        backgroundColor: `${COLORS.primary}15`, // Subtle tint instead of full solid
        borderColor: COLORS.primary,
        borderWidth: 1,
    },
    selectorText: {
        ...TYPOGRAPHY.mono,
        fontSize: 12,
        color: COLORS.textMuted,
    },
    selectorTextActive: {
        color: COLORS.primary, // Text becomes primary color
        fontWeight: 'bold',
    },
    toggleContainer: {
        flexDirection: 'row',
        height: 55,
        backgroundColor: COLORS.surfaceCard,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.divider,
        padding: 2, // Inner padding for pill effect
    },
    toggleBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
    },
    toggleBtnActive: {
        backgroundColor: COLORS.surfacefloat, // Lighter float for active state
    },
    toggleText: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textMuted,
        fontWeight: 'bold',
    },
    toggleTextActive: {
        color: COLORS.textTitle,
    },
    submitBtn: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 30,
        ...Platform.select({
            web: { boxShadow: `0 4px 14px ${COLORS.primary}40` },
            default: { elevation: 4 }
        })
    },
    submitBtnDisabled: {
        opacity: 0.5,
    },
    submitBtnText: {
        ...TYPOGRAPHY.header,
        fontSize: 16,
        color: '#FFF', // Keep button text white for contrast on primary
        letterSpacing: 1,
    },
    cancelBtn: {
        alignItems: 'center',
        marginTop: 20,
        padding: 10,
    },
    cancelText: {
        ...TYPOGRAPHY.mono,
        fontSize: 12,
        color: COLORS.textMuted,
        textDecorationLine: 'none', // Removed underline for cleaner look
        opacity: 0.6,
    }
});
