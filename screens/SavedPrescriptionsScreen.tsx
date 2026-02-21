import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    FlatList, Image, ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { getUserPrescriptions } from '../firebase/db';
import { Prescription } from '../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function SavedPrescriptionsScreen({ navigation }: Props) {
    const { userProfile } = useAuth();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userProfile) {
            fetchPrescriptions();
        }
    }, [userProfile]);

    const fetchPrescriptions = async () => {
        if (!userProfile) return;
        setLoading(true);
        try {
            const data = await getUserPrescriptions(userProfile.id);
            setPrescriptions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Prescriptions</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity
                    style={styles.uploadCta}
                    onPress={() => navigation.navigate('PrescriptionUpload')}
                >
                    <View style={styles.uploadIconBox}>
                        <Text style={styles.uploadIcon}>📄</Text>
                        <View style={styles.plusBadge}><Text style={styles.plusText}>+</Text></View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.uploadTitle}>Upload New Prescription</Text>
                        <Text style={styles.uploadSub}>Our pharmacist will help you add medicines</Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>

                <Text style={styles.sectionLabel}>RECENTLY UPLOADED</Text>

                {loading ? (
                    <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
                ) : prescriptions.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>📂</Text>
                        <Text style={styles.emptyText}>No prescriptions found.</Text>
                    </View>
                ) : (
                    prescriptions.map(item => (
                        <TouchableOpacity key={item.id} style={styles.prescCard}>
                            <View style={styles.prescImgBox}>
                                {item.imageUrl ? (
                                    <Image source={{ uri: item.imageUrl }} style={styles.prescImg} />
                                ) : (
                                    <Text style={{ fontSize: 24 }}>📄</Text>
                                )}
                            </View>
                            <View style={styles.prescInfo}>
                                <Text style={styles.prescDoctor}>{item.doctorName || 'Self Uploaded'}</Text>
                                <Text style={styles.prescDate}>{formatDate(item.createdAt)} • {item.itemsCount || 0} Meds</Text>
                                <View style={[
                                    styles.statusLine,
                                    { backgroundColor: item.status === 'verified' ? '#E8F5E9' : item.status === 'pending' ? '#FFF8E1' : '#FFEBEE' }
                                ]}>
                                    <Text style={[
                                        styles.statusLabel,
                                        { color: item.status === 'verified' ? '#2E7D32' : item.status === 'pending' ? '#FF8F00' : '#C62828' }
                                    ]}>{item.status.toUpperCase()}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.viewBtn}>
                                <Text style={styles.viewBtnText}>View</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))
                )}

                <View style={styles.infoBox}>
                    <Text style={styles.infoIcon}>💡</Text>
                    <Text style={styles.infoText}>Uploading a valid prescription is mandatory for scheduled medicines as per government regulations.</Text>
                </View>
            </ScrollView>
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
    uploadCta: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 20,
        marginBottom: 32, ...SHADOW.card, borderWidth: 1, borderColor: COLORS.borderLight
    },
    uploadIconBox: { width: 56, height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.primarySurface, alignItems: 'center', justifyContent: 'center' },
    uploadIcon: { fontSize: 28 },
    plusBadge: { position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.white },
    plusText: { color: COLORS.white, fontSize: 12, fontWeight: '900' },
    uploadTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
    uploadSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' },
    arrow: { fontSize: 20, color: COLORS.primary, fontWeight: '700' },

    sectionLabel: { fontSize: 11, fontWeight: '900', color: COLORS.textMuted, letterSpacing: 1, marginBottom: 16, marginLeft: 4 },
    prescCard: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 14,
        marginBottom: 12, ...SHADOW.card, borderWidth: 1, borderColor: COLORS.borderLight
    },
    prescImgBox: { width: 60, height: 60, borderRadius: RADIUS.md, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    prescImg: { width: '100%', height: '100%' },
    prescInfo: { flex: 1 },
    prescDoctor: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
    prescDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' },
    statusLine: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6 },
    statusLabel: { fontSize: 8, fontWeight: '900' },
    viewBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.sm, backgroundColor: COLORS.primarySurface },
    viewBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },

    emptyCard: { alignItems: 'center', padding: 40, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, ...SHADOW.card, marginBottom: 20 },
    emptyIcon: { fontSize: 40, marginBottom: 10, opacity: 0.3 },
    emptyText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },

    infoBox: { flexDirection: 'row', gap: 12, marginTop: 24, padding: 16, backgroundColor: COLORS.primarySurface, borderRadius: RADIUS.md },
    infoIcon: { fontSize: 20 },
    infoText: { flex: 1, fontSize: 12, color: COLORS.primaryDark, lineHeight: 18, fontWeight: '600' },
});
