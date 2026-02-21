import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING, SHADOW } from '../../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function AdminProfileScreen({ navigation }: Props) {
    const { logOut } = useAuth();

    const handleLogout = () => {
        logOut();
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Admin Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>AD</Text>
                    </View>
                    <Text style={styles.name}>Anil Kumar</Text>
                    <Text style={styles.role}>Chief Pharmacist • Saraswati Medical</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statVal}>4.9/5</Text>
                            <Text style={styles.statLabel}>User Rating</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBox}>
                            <Text style={styles.statVal}>15+</Text>
                            <Text style={styles.statLabel}>Years Exp.</Text>
                        </View>
                    </View>
                </View>

                {/* Professional Details */}
                <Text style={styles.sectionTitle}>Professional Credentials</Text>

                <View style={styles.infoList}>
                    <View style={styles.infoItem}>
                        <View style={styles.infoIconBox}><Text>📜</Text></View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Pharmacy License No.</Text>
                            <Text style={styles.infoValue}>UP-PH-2023-89452</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.infoIconBox}><Text>🎓</Text></View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Education</Text>
                            <Text style={styles.infoValue}>B.Pharm, Delhi University (2008)</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.infoIconBox}><Text>📍</Text></View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Store Address</Text>
                            <Text style={styles.infoValue}>Shop No. 4, Main Market, Varanasi, UP - 221001</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Feedback */}
                <Text style={styles.sectionTitle}>Recent Feedback</Text>
                <View style={styles.feedbackCard}>
                    <View style={styles.fbHeader}>
                        <Text style={styles.fbUser}>Ravi T.</Text>
                        <Text style={styles.fbStars}>⭐⭐⭐⭐⭐</Text>
                    </View>
                    <Text style={styles.fbText}>"Very knowledgeable pharmacist. Suggested the right generic alternative which saved me money."</Text>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout from Admin Account</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15 },
    backBtn: { padding: 4 },
    backIcon: { fontSize: 24, color: COLORS.textPrimary },
    title: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary },
    scrollContent: { padding: 20, paddingBottom: 60 },

    profileCard: { alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 30, marginBottom: 30, ...SHADOW.card },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primarySurface, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
    avatarText: { fontSize: 32, fontWeight: '900', color: COLORS.primary },
    name: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
    role: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 },

    statsRow: { flexDirection: 'row', alignItems: 'center', width: '100%', borderTopWidth: 1, borderColor: COLORS.borderLight, paddingTop: 20 },
    statBox: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, height: 30, backgroundColor: COLORS.borderLight },
    statVal: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary },
    statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },

    sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 15, marginLeft: 5 },

    infoList: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 15, marginBottom: 30, ...SHADOW.card },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 12, borderBottomWidth: 1, borderColor: COLORS.borderLight },
    infoIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
    infoValue: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },

    feedbackCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 20, marginBottom: 40, ...SHADOW.card },
    fbHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    fbUser: { fontWeight: '800', fontSize: 14, color: COLORS.textPrimary },
    fbStars: { fontSize: 12 },
    fbText: { fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic', lineHeight: 20 },

    logoutBtn: { backgroundColor: COLORS.errorLight, paddingVertical: 18, borderRadius: RADIUS.round, alignItems: 'center', ...SHADOW.small },
    logoutText: { color: COLORS.error, fontWeight: '800', fontSize: 15 },
});
