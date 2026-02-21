import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { getAllOrders, updateOrderStatus } from '../../firebase/db';
import { Order } from '../../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function AdminDashboardScreen({ navigation }: Props) {
    const { userProfile, logOut } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        const data = await getAllOrders().catch(() => []);
        setOrders(data);
    };

    useEffect(() => {
        fetchOrders().finally(() => setLoading(false));
    }, []);

    const todaySales = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingCount = orders.filter(o => o.status === 'pending').length;

    const handleStatusUpdate = (order: Order) => {
        const nextMap: Record<string, string> = {
            pending: 'confirmed',
            confirmed: 'ready',
            ready: 'out_for_delivery',
            out_for_delivery: 'delivered',
        };
        const nextStatus = nextMap[order.status];
        if (!nextStatus) return;

        Alert.alert('Update Order', `Mark as "${nextStatus.replace('_', ' ')}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Update',
                onPress: async () => {
                    await updateOrderStatus(order.id, nextStatus).catch(() => { });
                    fetchOrders();
                },
            },
        ]);
    };

    const statusColor = (s: string) => {
        if (s === 'delivered') return COLORS.success;
        if (s === 'cancelled') return COLORS.error;
        if (s === 'pending') return COLORS.warning;
        return COLORS.primary;
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Namaste, Admin 👋</Text>
                    <Text style={styles.subGreeting}>Saraswati Medical Store Overview</Text>
                </View>
                <TouchableOpacity style={styles.avatar} onPress={() => logOut()}>
                    <Text style={styles.avatarText}>AD</Text>
                </TouchableOpacity>
            </View>

            {/* Quick actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('AdminInventory')}>
                    <Text style={styles.quickActionIcon}>📦</Text>
                    <Text style={styles.quickActionLabel}>Inventory</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('AdminAddProduct')}>
                    <Text style={styles.quickActionIcon}>➕</Text>
                    <Text style={styles.quickActionLabel}>Add Medicine</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction} onPress={fetchOrders}>
                    <Text style={styles.quickActionIcon}>🔄</Text>
                    <Text style={styles.quickActionLabel}>Refresh</Text>
                </TouchableOpacity>
            </View>

            {/* KPI Cards */}
            <View style={styles.kpiRow}>
                <View style={[styles.kpiCard, { backgroundColor: COLORS.primary }]}>
                    <Text style={styles.kpiIcon}>💰</Text>
                    <Text style={styles.kpiValue}>₹{todaySales.toFixed(0)}</Text>
                    <Text style={styles.kpiLabel}>Total Sales</Text>
                </View>
                <View style={[styles.kpiCard, { backgroundColor: COLORS.primaryDark }]}>
                    <Text style={styles.kpiIcon}>📋</Text>
                    <Text style={styles.kpiValue}>{orders.length}</Text>
                    <Text style={styles.kpiLabel}>Total Orders</Text>
                </View>
                <View style={[styles.kpiCard, { backgroundColor: COLORS.warning }]}>
                    <Text style={styles.kpiIcon}>⏳</Text>
                    <Text style={styles.kpiValue}>{pendingCount}</Text>
                    <Text style={styles.kpiLabel}>Pending</Text>
                </View>
            </View>

            {/* All Orders */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Orders</Text>
                {loading ? (
                    <ActivityIndicator color={COLORS.primary} />
                ) : orders.length === 0 ? (
                    <Text style={styles.emptyText}>No orders yet. Orders will appear here when customers place them.</Text>
                ) : (
                    orders.slice(0, 20).map(order => (
                        <View key={order.id} style={styles.orderCard}>
                            <View style={styles.orderTop}>
                                <View>
                                    <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
                                    <Text style={styles.orderUser}>👤 {order.userName ?? 'Customer'}</Text>
                                    <Text style={styles.orderItems}>{order.items.length} item(s)</Text>
                                </View>
                                <View>
                                    <Text style={styles.orderAmount}>₹{order.totalAmount.toFixed(2)}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: statusColor(order.status) + '22' }]}>
                                        <Text style={[styles.statusText, { color: statusColor(order.status) }]}>
                                            {order.status.replace('_', ' ').toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {order.serviceType === 'home_delivery' && order.deliveryAddress && (
                                <Text style={styles.orderAddress}>
                                    📍 {order.deliveryAddress.line1}, {order.deliveryAddress.city}
                                </Text>
                            )}

                            {/* Items */}
                            {order.items.map((item, idx) => (
                                <Text key={idx} style={styles.orderItemText}>
                                    · {item.productName} × {item.quantity}
                                </Text>
                            ))}

                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                <TouchableOpacity
                                    style={styles.updateBtn}
                                    onPress={() => handleStatusUpdate(order)}
                                >
                                    <Text style={styles.updateBtnText}>
                                        Mark as → {({ pending: 'Confirmed', confirmed: 'Ready', ready: 'Out for Delivery', out_for_delivery: 'Delivered' } as any)[order.status] ?? ''}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}
            </View>

            <View style={{ height: 60 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: 52, paddingBottom: SPACING.md },
    greeting: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
    subGreeting: { fontSize: 12, color: COLORS.textSecondary },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },

    quickActions: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
    quickAction: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.md, alignItems: 'center', gap: 6, ...SHADOW.card },
    quickActionIcon: { fontSize: 24 },
    quickActionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },

    kpiRow: { flexDirection: 'row', gap: 10, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
    kpiCard: { flex: 1, borderRadius: RADIUS.xl, padding: SPACING.md, alignItems: 'center', gap: 4 },
    kpiIcon: { fontSize: 22 },
    kpiValue: { fontSize: 18, fontWeight: '800', color: '#fff' },
    kpiLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

    section: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg, marginHorizontal: SPACING.lg, ...SHADOW.card },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.md },
    emptyText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: SPACING.md },

    orderCard: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
    orderTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    orderId: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },
    orderUser: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    orderItems: { fontSize: 11, color: COLORS.textMuted },
    orderAmount: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right' },
    statusBadge: { borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-end', marginTop: 4 },
    statusText: { fontSize: 10, fontWeight: '800' },
    orderAddress: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
    orderItemText: { fontSize: 12, color: COLORS.textSecondary },
    updateBtn: { marginTop: 8, backgroundColor: COLORS.primarySurface, borderRadius: RADIUS.round, paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start' },
    updateBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
});
