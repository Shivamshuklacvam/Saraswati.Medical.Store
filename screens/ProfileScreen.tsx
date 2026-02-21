import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { getUserOrders, getUserSubscriptions } from '../firebase/db';
import { COLORS, SHADOW, RADIUS } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function ProfileScreen({ navigation }: Props) {
    const { userProfile, logOut, updateProfile } = useAuth();
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editName, setEditName] = useState(userProfile?.name || '');
    const [editPhone, setEditPhone] = useState(userProfile?.phoneNumber || '');
    const [saving, setSaving] = useState(false);

    const [stats, setStats] = useState({
        ordersDone: 0,
        activeOrders: 0,
        favorites: 0,
    });

    useFocusEffect(
        useCallback(() => {
            if (userProfile) {
                fetchStats();
            }
        }, [userProfile])
    );

    const fetchStats = async () => {
        if (!userProfile) return;
        try {
            const orders = await getUserOrders(userProfile.id);
            const subs = await getUserSubscriptions(userProfile.id);

            setStats({
                ordersDone: orders.filter(o => o.status === 'delivered').length,
                activeOrders: orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length,
                favorites: userProfile.favoriteIds?.length || 0,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const handleLogout = () => {
        logOut();
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) {
            Alert.alert("Error", "Name cannot be empty.");
            return;
        }
        setSaving(true);
        try {
            await updateProfile({
                name: editName.trim(),
                phoneNumber: editPhone.trim(),
            });
            setEditModalVisible(false);
            Alert.alert("Success", "Profile updated successfully.");
        } catch (error) {
            Alert.alert("Error", "Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
            </View>

            {/* Top User Card */}
            <View style={styles.profileCard}>
                <View style={styles.avatarBox}>
                    <Text style={styles.avatarEmoji}>👤</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{userProfile?.name ?? 'User'}</Text>
                    <Text style={styles.userPhone}>{userProfile?.phoneNumber ?? 'No phone added'}</Text>
                    <Text style={styles.userJoined}>Member since Oct 2023</Text>
                </View>
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => {
                        setEditName(userProfile?.name || '');
                        setEditPhone(userProfile?.phoneNumber || '');
                        setEditModalVisible(true);
                    }}
                >
                    <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Summary */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.ordersDone}</Text>
                    <Text style={styles.statLabel}>Orders Done</Text>
                </View>
                <View style={styles.statSep} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.activeOrders}</Text>
                    <Text style={styles.statLabel}>Active Orders</Text>
                </View>
                <View style={styles.statSep} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.favorites}</Text>
                    <Text style={styles.statLabel}>Favorites</Text>
                </View>
            </View>

            {/* Menu Sections */}
            <View style={styles.menuCard}>
                <Text style={styles.menuCardTitle}>Account Activity</Text>
                {[
                    { id: 'orders', label: 'Orders & Reorder', icon: '📦', color: COLORS.primarySurface, screen: 'MyOrders' },
                    { id: 'addr', label: 'Manage Addresses', icon: '📍', color: COLORS.borderLight, screen: 'ManageAddress' },
                    { id: 'subs', label: 'My Subscriptions', icon: '💎', color: COLORS.tertiary, screen: 'MySubscriptions' },
                    { id: 'presc', label: 'Saved Prescriptions', icon: '📄', color: COLORS.primaryLight, screen: 'SavedPrescriptions' },
                ].map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.menuRow}
                        onPress={() => item.screen && navigation.navigate(item.screen)}
                    >
                        <View style={[styles.menuIconBox, { backgroundColor: item.color }]}>
                            <Text style={styles.menuIcon}>{item.icon}</Text>
                        </View>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.menuCard}>
                <Text style={styles.menuCardTitle}>Settings & Help</Text>
                {[
                    { id: 'pay', label: 'Payment Settings', icon: '💳', color: COLORS.borderLight, screen: 'PaymentSettings' },
                    { id: 'notif', label: 'Notifications', icon: '🔔', color: COLORS.primarySurface, screen: 'Notifications' },
                    { id: 'help', label: 'Help & Support', icon: '❓', color: COLORS.tertiary, screen: 'HelpSupport' },
                ].map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.menuRow}
                        onPress={() => item.screen && navigation.navigate(item.screen)}
                    >
                        <View style={[styles.menuIconBox, { backgroundColor: item.color }]}>
                            <Text style={styles.menuIcon}>{item.icon}</Text>
                        </View>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>🚪 Sign Out</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>App Version 1.0.6 (Live Stats)</Text>

            {/* Edit Profile Modal */}
            <Modal
                visible={isEditModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Text style={styles.closeBtn}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Enter your name"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editPhone}
                                onChangeText={setEditPhone}
                                placeholder="+91 XXXXX XXXXX"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleSaveProfile}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveBtnText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
    backIcon: { fontSize: 20, color: COLORS.textPrimary },
    headerTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },

    profileCard: {
        flexDirection: 'row', alignItems: 'center', padding: 24,
        marginHorizontal: 20, backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
        ...SHADOW.strong, marginBottom: 20,
    },
    avatarBox: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.primarySurface, alignItems: 'center', justifyContent: 'center' },
    avatarEmoji: { fontSize: 32 },
    userInfo: { flex: 1, marginLeft: 20 },
    userName: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary },
    userPhone: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' },
    userJoined: { fontSize: 11, color: COLORS.textMuted, marginTop: 4, fontWeight: '600' },
    editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
    editIcon: { fontSize: 14 },

    statsContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, marginBottom: 24,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNumber: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary },
    statLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '700', marginTop: 4 },
    statSep: { width: 1.5, height: 24, backgroundColor: COLORS.border },

    menuCard: {
        backgroundColor: COLORS.white, borderRadius: RADIUS.xl, marginHorizontal: 20,
        padding: 24, marginBottom: 20, ...SHADOW.card,
    },
    menuCardTitle: { fontSize: 14, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 20, opacity: 0.6, letterSpacing: 0.5 },
    menuRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    menuIconBox: { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
    menuIcon: { fontSize: 20 },
    menuLabel: { flex: 1, fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginLeft: 16 },
    menuArrow: { fontSize: 16, color: COLORS.textMuted, fontWeight: '800' },

    logoutBtn: {
        marginHorizontal: 20, height: 60, borderRadius: 30,
        borderWidth: 2, borderColor: COLORS.error,
        alignItems: 'center', justifyContent: 'center',
        marginTop: 10,
    },
    logoutText: { fontSize: 16, fontWeight: '900', color: COLORS.error },
    versionText: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, marginTop: 20, fontWeight: '600' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 32, padding: 24, ...SHADOW.strong },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary },
    closeBtn: { fontSize: 20, color: COLORS.textMuted },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    textInput: {
        backgroundColor: '#F8F9FA', borderRadius: 16, padding: 16,
        fontSize: 16, fontWeight: '600', color: COLORS.textPrimary,
        borderWidth: 1, borderColor: '#EEE'
    },
    saveBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: 10, ...SHADOW.card },
    saveBtnText: { color: COLORS.onPrimary, fontSize: 16, fontWeight: '800' },
});
