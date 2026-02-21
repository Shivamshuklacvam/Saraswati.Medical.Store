import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Modal, Alert, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { Address } from '../types';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function ManageAddressScreen({ navigation }: Props) {
    const { userProfile, updateProfile } = useAuth();
    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);

    // New Address Form State
    const [newName, setNewName] = useState(userProfile?.name || '');
    const [newPhone, setNewPhone] = useState(userProfile?.phoneNumber || '');
    const [newLine1, setNewLine1] = useState('');
    const [newCity, setNewCity] = useState('Varanasi');
    const [newPincode, setNewPincode] = useState('');

    const savedAddresses = userProfile?.savedAddresses || [];
    const defaultAddress = userProfile?.address;

    const handleAddAddress = async () => {
        if (!newLine1.trim() || !newPincode.trim()) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        const newAddr: Address = {
            name: newName,
            phone: newPhone,
            line1: newLine1.trim(),
            city: newCity,
            pincode: newPincode.trim(),
        };

        setSaving(true);
        try {
            const updatedAddresses = [...savedAddresses, newAddr];
            const updates: any = { savedAddresses: updatedAddresses };

            // If it's the first address, make it default
            if (!defaultAddress) {
                updates.address = newAddr;
            }

            await updateProfile(updates);
            setAddModalVisible(false);
            resetForm();
            Alert.alert("Success", "Address added successfully.");
        } catch (error) {
            Alert.alert("Error", "Failed to add address.");
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setNewLine1('');
        setNewPincode('');
    };

    const handleSetDefault = async (addr: Address) => {
        try {
            await updateProfile({ address: addr });
            Alert.alert("Success", "Default address updated.");
        } catch (error) {
            Alert.alert("Error", "Failed to update default address.");
        }
    };

    const handleDeleteAddress = async (index: number) => {
        Alert.alert(
            "Delete Address",
            "Are you sure you want to delete this address?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const updatedList = savedAddresses.filter((_, i) => i !== index);
                        await updateProfile({ savedAddresses: updatedList });
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Address Book</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Default Address Section */}
                {defaultAddress && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionLabel}>DEFAULT ADDRESS</Text>
                            <View style={styles.activeBadge}><Text style={styles.activeText}>Primary</Text></View>
                        </View>
                        <View style={[styles.addressCard, styles.defaultCard]}>
                            <View style={styles.addressInfo}>
                                <Text style={styles.userName}>{defaultAddress.name}</Text>
                                <Text style={styles.addressText}>{defaultAddress.line1}</Text>
                                <Text style={styles.addressText}>{defaultAddress.city}, {defaultAddress.pincode}</Text>
                                <Text style={styles.phoneText}>📞 {defaultAddress.phone}</Text>
                            </View>
                            <View style={styles.cardActions}>
                                <Text style={{ fontSize: 20 }}>⭐</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* All Saved Addresses */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>SAVED ADDRESSES</Text>
                    {savedAddresses.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No addresses saved yet.</Text>
                        </View>
                    ) : (
                        savedAddresses.map((addr, idx) => (
                            <View key={idx} style={styles.addressCard}>
                                <View style={styles.addressInfo}>
                                    <Text style={styles.userName}>{addr.name}</Text>
                                    <Text style={styles.addressText}>{addr.line1}</Text>
                                    <Text style={styles.addressText}>{addr.city}, {addr.pincode}</Text>
                                </View>
                                <View style={styles.cardActions}>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => handleSetDefault(addr)}
                                    >
                                        <Text style={styles.actionBtnText}>Set Default</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: '#FFF0F0' }]}
                                        onPress={() => handleDeleteAddress(idx)}
                                    >
                                        <Text style={[styles.actionBtnText, { color: '#FF5A5F' }]}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Add New Button */}
                <TouchableOpacity
                    style={styles.addBtnLarge}
                    onPress={() => setAddModalVisible(true)}
                >
                    <Text style={styles.addBtnIcon}>+</Text>
                    <Text style={styles.addBtnText}>Add New Address</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Add Address Modal */}
            <Modal
                visible={isAddModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAddModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Address</Text>
                            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                                <Text style={styles.closeBtn}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Receiver Name</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={newName}
                                    onChangeText={setNewName}
                                    placeholder="e.g. Rahul Sharma"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Phone Number</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={newPhone}
                                    onChangeText={setNewPhone}
                                    placeholder="+91 XXXXX XXXXX"
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Address Line 1</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={newLine1}
                                    onChangeText={setNewLine1}
                                    placeholder="House No, Street Name"
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>City</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={newCity}
                                        onChangeText={setNewCity}
                                    />
                                </View>
                                <View style={{ width: 16 }} />
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Pincode</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={newPincode}
                                        onChangeText={setNewPincode}
                                        placeholder="221001"
                                        keyboardType="number-pad"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.saveBtn}
                                onPress={handleAddAddress}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Save Address</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
    backIcon: { fontSize: 20, color: COLORS.textPrimary },
    headerTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },

    content: { padding: 20 },
    section: { marginBottom: 32 },
    sectionLabel: { fontSize: 11, fontWeight: '900', color: COLORS.textMuted, letterSpacing: 1.2, marginBottom: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },

    activeBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    activeText: { fontSize: 10, fontWeight: '900', color: '#2E7D32' },

    addressCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        ...SHADOW.card
    },
    defaultCard: {
        borderWidth: 2,
        borderColor: '#2E7D32',
    },
    addressInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
    addressText: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 2, fontWeight: '600' },
    phoneText: { fontSize: 13, color: COLORS.textMuted, marginTop: 8, fontWeight: '700' },

    cardActions: { marginTop: 16, flexDirection: 'row', gap: 12 },
    actionBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#EEE'
    },
    actionBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary },

    addBtnLarge: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
        backgroundColor: '#fff', borderRadius: 24, padding: 24,
        borderWidth: 2, borderColor: '#2E7D32', borderStyle: 'dashed',
        marginBottom: 40
    },
    addBtnIcon: { fontSize: 24, fontWeight: '700', color: '#2E7D32' },
    addBtnText: { fontSize: 16, fontWeight: '800', color: '#2E7D32' },

    emptyCard: { backgroundColor: '#F8F9FA', borderRadius: 24, padding: 32, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '80%'
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary },
    closeBtn: { fontSize: 20, color: COLORS.textMuted },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textSecondary, marginBottom: 8, textTransform: 'uppercase' },
    textInput: {
        backgroundColor: '#F8F9FA', borderRadius: 12, padding: 14,
        fontSize: 15, fontWeight: '600', color: COLORS.textPrimary,
        borderWidth: 1, borderColor: '#EEE'
    },
    row: { flexDirection: 'row' },
    saveBtn: { backgroundColor: '#2E7D32', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginTop: 10, ...SHADOW.card },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
