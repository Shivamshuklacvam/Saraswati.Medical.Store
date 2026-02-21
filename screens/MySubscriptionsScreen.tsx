import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getUserSubscriptions, updateSubscriptionStatus } from '../firebase/db';
import { useAuth } from '../context/AuthContext';
import { Subscription } from '../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function MySubscriptionsScreen({ navigation }: Props) {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchSubscriptions();
        }
    }, [user]);

    const fetchSubscriptions = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const subs = await getUserSubscriptions(user.uid);
            setSubscriptions(subs);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: 'paused' | 'cancelled' | 'active') => {
        const title = newStatus === 'cancelled' ? 'Cancel Subscription' :
            newStatus === 'paused' ? 'Pause Subscription' : 'Resume Subscription';

        Alert.alert(
            title,
            `Are you sure you want to ${newStatus} this subscription?`,
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Proceed",
                    onPress: async () => {
                        try {
                            await updateSubscriptionStatus(id, newStatus);
                            setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
                            Alert.alert("Success", `Subscription ${newStatus}.`);
                        } catch (e) {
                            Alert.alert("Error", "Failed to update status.");
                        }
                    }
                }
            ]
        );
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
                <Text style={styles.headerTitle}>Active Refills</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2e7d32" />
                </View>
            ) : subscriptions.length === 0 ? (
                <ScrollView contentContainerStyle={styles.emptyContent}>
                    <View style={styles.promoCard}>
                        <View style={styles.promoInfo}>
                            <Text style={styles.promoTitle}>Never run out of meds</Text>
                            <Text style={styles.promoSub}>Subscribe to monthly refills and save 15% extra on every order.</Text>
                        </View>
                        <Text style={styles.promoEmoji}>⏰</Text>
                    </View>
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>💎</Text>
                        <Text style={styles.emptyTitle}>No Subscriptions Yet</Text>
                        <Text style={styles.emptySub}>Add medicines from your cart to subscription for hassle-free delivery.</Text>
                        <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('Search')}>
                            <Text style={styles.ctaBtnText}>Browse Medicines</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            ) : (
                <FlatList
                    data={subscriptions}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    renderItem={({ item }) => (
                        <View style={[styles.subCard, item.status !== 'active' && { opacity: 0.7 }]}>
                            <View style={styles.cardHeader}>
                                <View style={styles.prodRow}>
                                    <View style={styles.prodIcon}><Text style={{ fontSize: 24 }}>💊</Text></View>
                                    <View>
                                        <Text style={styles.prodName}>{item.productName}</Text>
                                        <Text style={styles.prodPack}>{item.packSize || '10 Tablets'}</Text>
                                    </View>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: item.status === 'active' ? '#e6f7ff' : '#fff1f0' }
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        { color: item.status === 'active' ? '#1890ff' : '#f5222d' }
                                    ]}>{item.status.toUpperCase()}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.cardRefillRow}>
                                <View>
                                    <Text style={styles.refillLabel}>NEXT REFILL</Text>
                                    <Text style={styles.refillDate}>{formatDate(item.nextRefillDate)}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.refillLabel}>REFILL PRICE</Text>
                                    <Text style={styles.refillPrice}>₹{item.price.toFixed(2)}</Text>
                                    <Text style={styles.discountTag}>15% Off Applied</Text>
                                </View>
                            </View>

                            <View style={styles.cardActions}>
                                {item.status === 'active' ? (
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => handleStatusChange(item.id, 'paused')}
                                    >
                                        <Text style={styles.actionBtnText}>Pause Refill</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: '#e6f7ff' }]}
                                        onPress={() => handleStatusChange(item.id, 'active')}
                                    >
                                        <Text style={[styles.actionBtnText, { color: '#1890ff' }]}>Resume Now</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: '#fff0f0' }]}
                                    onPress={() => handleStatusChange(item.id, 'cancelled')}
                                >
                                    <Text style={[styles.actionBtnText, { color: '#f5222d' }]}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 20 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f8f9fa', alignItems: 'center', justifyContent: 'center' },
    backIcon: { fontSize: 20 },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#000', marginLeft: 16 },

    emptyContent: { padding: 20 },
    promoCard: {
        backgroundColor: '#fffbe6',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#ffe58f'
    },
    promoInfo: { flex: 1 },
    promoTitle: { fontSize: 18, fontWeight: 'bold', color: '#854d0e' },
    promoSub: { fontSize: 13, color: '#854d0e', opacity: 0.8, marginTop: 4 },
    promoEmoji: { fontSize: 40, marginLeft: 15 },

    emptyState: { alignItems: 'center', marginTop: 40 },
    emptyIcon: { fontSize: 60, opacity: 0.2, marginBottom: 20 },
    emptyTitle: { fontSize: 20, fontWeight: '900', color: '#333' },
    emptySub: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, paddingHorizontal: 40, lineHeight: 20 },
    ctaBtn: { marginTop: 30, backgroundColor: '#2e7d32', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30 },
    ctaBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    listContainer: { padding: 20 },
    subCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#eee',
        ...SHADOW.small
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    prodRow: { flexDirection: 'row', gap: 15, flex: 1 },
    prodIcon: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#f8f9fa', alignItems: 'center', justifyContent: 'center' },
    prodName: { fontSize: 16, fontWeight: '900', color: '#000' },
    prodPack: { fontSize: 12, color: '#666', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: 'bold' },

    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 15 },

    cardRefillRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    refillLabel: { fontSize: 10, fontWeight: 'bold', color: '#999', letterSpacing: 0.5, marginBottom: 4 },
    refillDate: { fontSize: 15, fontWeight: '900', color: '#000' },
    refillPrice: { fontSize: 18, fontWeight: '900', color: '#2e7d32' },
    discountTag: { fontSize: 10, color: '#52c41a', fontWeight: 'bold' },

    cardActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
    actionBtn: { flex: 1, height: 44, borderRadius: 12, backgroundColor: '#f8f9fa', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#eee' },
    actionBtnText: { fontSize: 13, fontWeight: 'bold', color: '#666' },
});
