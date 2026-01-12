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
import { updatePet } from '../services/api';
import { COLORS, TYPOGRAPHY, METRICS } from '../theme';
import { Dog, Cat, Syringe, Weight, Calendar, Save, FileText, Camera } from 'lucide-react-native';

export default function EditPetScreen({ navigation, route }) {
    const { pet } = route.params || {};

    // Navigation Options for Dark Header
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: '#FFF',
            headerTitleStyle: { fontWeight: 'bold' },
            title: 'EDIT PROTOCOLS'
        });
    }, [navigation]);

    const [name, setName] = useState(pet?.name || '');
    const [petType, setPetType] = useState(pet?.pet_type || 'dog');
    const [breed, setBreed] = useState(pet?.breed || '');
    const [ageYears, setAgeYears] = useState(pet?.age_years?.toString() || '');
    const [weightKg, setWeightKg] = useState(pet?.weight_kg?.toString() || '');
    const [gender, setGender] = useState(pet?.gender || 'male');
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(pet?.image_url || null);
    const [vaccinated, setVaccinated] = useState(false); // Not in pet object usually, defaulting false

    const pickImage = async () => {
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

    const handleUpdate = async () => {
        if (!name.trim()) {
            Alert.alert('Protocol Error', 'Subject Designation (Name) Required.');
            return;
        }

        setLoading(true);
        try {
            await updatePet(pet.id, {
                name,
                pet_type: petType,
                breed: breed || null,
                age_years: ageYears ? parseFloat(ageYears) : null,
                weight_kg: weightKg ? parseFloat(weightKg) : null,
                gender,
                image_url: image, // Assume API handles this mapping
                vaccinated
            });
            Alert.alert('Protocol Updated', 'Subject data successfully patched.', [
                { text: 'ACKNOWLEDGE', onPress: () => navigation.navigate('Main') }
            ]);
        } catch (err) {
            Alert.alert('System Error', err.response?.data?.error || 'Update Failed');
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
                    <Text style={styles.headerTitle}>MODIFY SUBJECT</Text>
                    <Text style={styles.headerSubtitle}>ID: {pet?.id || 'UNKNOWN'}</Text>
                </View>

                {/* 0. Photo Upload */}
                <View style={styles.photoSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.photoUpload}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.photo} />
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <Camera size={32} color={COLORS.primary} />
                                <Text style={styles.photoText}>UPDATE_IMG</Text>
                            </View>
                        )}
                        <View style={styles.uploadBadge}>
                            <Save size={12} color="#FFF" />
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
                            placeholder="ENTER DESIGNATION..."
                            placeholderTextColor={COLORS.textMuted + '80'}
                        />
                    </View>
                </View>

                {/* 2. Species */}
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
                        <Text style={styles.sectionLabel}>SEX</Text>
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
                                placeholder="0"
                                keyboardType="numeric"
                                placeholderTextColor={COLORS.textMuted + '80'}
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
                                placeholder="0.0"
                                keyboardType="numeric"
                                placeholderTextColor={COLORS.textMuted + '80'}
                            />
                        </View>
                    </View>
                </View>

                {/* Submit Action */}
                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                    onPress={handleUpdate}
                    disabled={loading}
                >
                    <Save size={20} color={COLORS.background} />
                    <Text style={styles.submitBtnText}>
                        {loading ? 'PATCHING...' : 'SAVE_CHANGES'}
                    </Text>
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
        color: COLORS.primary,
        letterSpacing: 2,
    },
    headerSubtitle: {
        ...TYPOGRAPHY.mono,
        fontSize: 12,
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
        borderRadius: 8,
        paddingHorizontal: 16,
        height: 55,
    },
    inputWrapperSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceCard,
        borderWidth: 1,
        borderColor: COLORS.divider,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 55,
    },
    inputIcon: {
        marginRight: 14,
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
        paddingVertical: 20,
        gap: 10,
    },
    selectorCardActive: {
        backgroundColor: `${COLORS.primary}15`,
        borderColor: COLORS.primary,
        borderWidth: 1,
    },
    selectorText: {
        ...TYPOGRAPHY.mono,
        fontSize: 12,
        color: COLORS.textMuted,
    },
    selectorTextActive: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    toggleContainer: {
        flexDirection: 'row',
        height: 55,
        backgroundColor: COLORS.surfaceCard,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.divider,
        padding: 2,
    },
    toggleBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
    },
    toggleBtnActive: {
        backgroundColor: COLORS.surfacefloat,
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
        color: '#FFF',
        letterSpacing: 1,
    }
});
