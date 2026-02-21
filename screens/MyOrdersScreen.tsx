import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, FlatList
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../firebase/db';
import { Order } from '../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function MyOrdersScreen({ navigation }: Props) {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            getUserOrders(user.uid)
                .then(setOrders)
                .finally(() => setLoading(false));
        }
    }, [user]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return COLORS.success;
            case 'pending': return COLORS.warning;
            case 'cancelled': return COLORS.error;
            default: return COLORS.primary;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📦</Text>
                    <Text style={styles.emptyTitle}>No orders yet</Text>
                    <Text style={styles.emptySub}>Your medical orders will appear here.</Text>
                    <TouchableOpacity
                        style={styles.shopBtn}
                        onPress={() => navigation.navigate('Search')}
                    >
                        <Text style={styles.shopBtnText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.orderCard}
                            onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
                        >
                            <View style={styles.orderHeader}>
                                <Text style={styles.orderId}>ID: #{item.id.slice(-6).toUpperCase()}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                        {item.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.orderDate}>
                                {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}
                            </Text>

                            <View style={styles.divider} />

                            <View style={styles.orderFooter}>
                                <Text style={styles.itemCount}>{item.items.length} Items</Text>
                                <Text style={styles.totalPrice}>₹{item.totalAmount.toFixed(2)}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
    backIcon: { fontSize: 20, color: COLORS.textPrimary },
    headerTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyIcon: { fontSize: 64, marginBottom: 16, opacity: 0.5 },
    emptyTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 8 },
    emptySub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 32 },
    shopBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: RADIUS.round, ...SHADOW.card },
    shopBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

    listContent: { padding: 20, gap: 16 },
    orderCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, ...SHADOW.card },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    orderId: { fontSize: 13, fontWeight: '800', color: COLORS.textMuted },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    statusText: { fontSize: 10, fontWeight: '900' },
    orderDate: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 16 },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemCount: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
    totalPrice: { fontSize: 17, fontWeight: '900', color: COLORS.primary },
});
