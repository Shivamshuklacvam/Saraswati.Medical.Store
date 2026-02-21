import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Image, Alert, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { uploadPrescription } from '../firebase/db';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function PrescriptionUploadScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { userProfile } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const openGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need gallery permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) {
            Alert.alert("No Image", "Please select or take a photo of your prescription first.");
            return;
        }
        if (!userProfile) {
            Alert.alert("Error", "Please log in to upload prescriptions.");
            return;
        }

        setUploading(true);
        try {
            await uploadPrescription({
                userId: userProfile.id,
                imageUrl: selectedImage,
                status: 'pending',
                doctorName: 'Self Uploaded',
                itemsCount: 0
            });

            Alert.alert(
                "Success",
                "Your prescription has been uploaded. Our pharmacist will review it soon.",
                [{ text: "View All", onPress: () => navigation.navigate('SavedPrescriptions') }]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to upload prescription. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upload Prescription</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoEmoji}>📄</Text>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>Why upload prescription?</Text>
                        <Text style={styles.infoDesc}>
                            Our experts will read your prescription and find the exact medicines for you.
                        </Text>
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.uploadBox}>
                    {selectedImage ? (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                            <TouchableOpacity
                                style={styles.removeBtn}
                                onPress={() => setSelectedImage(null)}
                            >
                                <Text style={styles.removeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Text style={styles.placeholderIcon}>📸</Text>
                            <Text style={styles.placeholderTitle}>Take a photo of your prescription</Text>
                            <Text style={styles.placeholderSub}>Make sure the handwriting is clear</Text>

                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={openCamera}
                                >
                                    <Text style={styles.actionBtnIcon}>📷</Text>
                                    <Text style={styles.actionBtnText}>Camera</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={openGallery}
                                >
                                    <Text style={styles.actionBtnIcon}>🖼️</Text>
                                    <Text style={styles.actionBtnText}>Gallery</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* Guidelines */}
                <View style={styles.guidelines}>
                    <Text style={styles.guideTitle}>Guidelines for a clear photo:</Text>
                    <Text style={styles.guideItem}>• Place prescription on a flat surface</Text>
                    <Text style={styles.guideItem}>• Ensure there is enough light</Text>
                    <Text style={styles.guideItem}>• Keep the camera steady</Text>
                    <Text style={styles.guideItem}>• Ensure patient name and doctor's seal are visible</Text>
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity
                    style={[styles.submitBtn, !selectedImage && styles.submitBtnDisabled]}
                    onPress={handleUpload}
                    disabled={uploading || !selectedImage}
                >
                    {uploading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>Upload & Proceed</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingVertical: 20 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
    backIcon: { fontSize: 20, color: COLORS.textPrimary },
    headerTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },

    scrollContent: { padding: 24 },
    infoCard: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        backgroundColor: COLORS.primarySurface, borderRadius: RADIUS.lg, padding: 20,
        marginBottom: 24,
    },
    infoEmoji: { fontSize: 32 },
    infoTextContainer: { flex: 1 },
    infoTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primaryDark, marginBottom: 2 },
    infoDesc: { fontSize: 13, color: COLORS.primaryDark, opacity: 0.8, lineHeight: 18 },

    uploadBox: {
        width: '100%', aspectRatio: 3 / 4,
        backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
        ...SHADOW.card, overflow: 'hidden',
        borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed',
        marginBottom: 24,
    },
    placeholderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    placeholderIcon: { fontSize: 64, marginBottom: 20, opacity: 0.5 },
    placeholderTitle: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 8 },
    placeholderSub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 32 },

    actionRow: { flexDirection: 'row', gap: 16 },
    actionBtn: {
        flex: 1, height: 60, borderRadius: RADIUS.md,
        backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center',
        flexDirection: 'row', gap: 8, paddingHorizontal: 16,
        borderWidth: 1, borderColor: COLORS.borderLight,
        ...SHADOW.small
    },
    actionBtnIcon: { fontSize: 20 },
    actionBtnText: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },

    previewContainer: { flex: 1 },
    previewImage: { width: '100%', height: '100%' },
    removeBtn: {
        position: 'absolute', top: 20, right: 20,
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center'
    },
    removeBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },

    guidelines: { marginBottom: 40 },
    guideTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
    guideItem: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '600' },

    footer: { paddingHorizontal: 24, backgroundColor: COLORS.background },
    submitBtn: {
        backgroundColor: COLORS.primary, height: 64, borderRadius: RADIUS.round,
        alignItems: 'center', justifyContent: 'center',
        ...SHADOW.strong,
    },
    submitBtnDisabled: { backgroundColor: COLORS.border, opacity: 0.5 },
    submitBtnText: { color: COLORS.onPrimary, fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
});
