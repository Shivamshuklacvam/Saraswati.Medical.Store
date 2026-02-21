import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { getAllOrders, updateOrderStatus, getProducts } from '../../firebase/db';
import { Order, Product } from '../../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../../constants/theme';

const { width } = Dimensions.get('window');

type Props = { navigation: NativeStackNavigationProp<any> };

export default function AdminDashboardScreen({ navigation }: Props) {
    const { logOut } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'week' | 'month' | 'year'>('week');

    const fetchData = async () => {
        try {
            const [ordersData, productsData] = await Promise.all([
                getAllOrders().catch(() => []),
                getProducts().catch(() => [])
            ]);
            setOrders(ordersData);
            setLowStockProducts(productsData.filter(p => p.stock !== undefined && p.stock < 15).slice(0, 3));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const todaySales = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0);

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
                    fetchData();
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <StatusBar style="dark" />

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Namaste, Admin</Text>
                        <Text style={styles.subGreeting}>Saraswati Medical Store Overview</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.avatar}
                        onPress={() => {
                            Alert.alert('Admin Options', 'Choose an action', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'View Profile', onPress: () => navigation.navigate('AdminProfile') },
                                { text: 'Logout', style: 'destructive', onPress: () => logOut() },
                            ]);
                        }}
                    >
                        <Text style={styles.avatarText}>AD</Text>
                    </TouchableOpacity>
                </View>

                {/* Inventory Scan Card */}
                <View style={styles.scanCard}>
                    <View style={styles.scanContent}>
                        <Text style={styles.scanTitle}>Update Inventory via Bill</Text>
                        <Text style={styles.scanSub}>Scan purchase bills to auto-add stock quantities</Text>
                        <TouchableOpacity
                            style={styles.scanBtn}
                            onPress={() => navigation.navigate('AdminScanBill')}
                        >
                            <Text style={styles.scanBtnIcon}>📸</Text>
                            <Text style={styles.scanBtnText}>Scan Purchase Bill</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.scanGraphic}>
                        <View style={styles.scanBox}>
                            <View style={styles.scanBoxLine} />
                            <View style={[styles.scanBoxLine, { width: '60%' }]} />
                            <View style={[styles.scanBoxLine, { width: '80%' }]} />
                        </View>
                    </View>
                </View>

                {/* Metrics Row */}
                <View style={styles.metricsRow}>
                    <TouchableOpacity
                        style={styles.metricCard}
                        onPress={() => navigation.navigate('AdminSalesDetails')}
                    >
                        <View style={styles.metricHeader}>
                            <View style={[styles.metricIconBox, { backgroundColor: '#E8F5E9' }]}>
                                <Text style={styles.metricIcon}>💵</Text>
                            </View>
                            <Text style={styles.trendText}>+12%</Text>
                        </View>
                        <Text style={styles.metricValue}>₹{todaySales.toLocaleString()}</Text>
                        <Text style={styles.metricLabel}>Today's Sales</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.metricCard}
                        onPress={() => navigation.navigate('AdminManageOrders')}
                    >
                        <View style={styles.metricHeader}>
                            <View style={[styles.metricIconBox, { backgroundColor: '#F3E5F5' }]}>
                                <Text style={styles.metricIcon}>🛍️</Text>
                            </View>
                            <Text style={[styles.trendText, { color: COLORS.error }]}>-5%</Text>
                        </View>
                        <Text style={styles.metricValue}>{orders.length}</Text>
                        <Text style={styles.metricLabel}>Orders</Text>
                    </TouchableOpacity>
                </View>

                {/* Revenue Trends Chart */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <View>
                            <Text style={styles.chartTitle}>Revenue Trends</Text>
                            <Text style={styles.chartSub}>{filter === 'week' ? 'Weekly' : filter === 'month' ? 'Monthly' : 'Yearly'} performance</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.chartDropdown}
                            onPress={() => {
                                const next: any = { week: 'month', month: 'year', year: 'week' };
                                setFilter(next[filter]);
                            }}
                        >
                            <Text style={styles.chartDropdownText}>{filter.toUpperCase()}</Text>
                            <Text style={styles.chartDropdownIcon}>▼</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.chartView}>
                        <View style={styles.chartLinesRow}>
                            {(filter === 'week' ? [40, 60, 50, 80, 70, 90, 80] : filter === 'month' ? [30, 90, 40, 100] : [20, 50, 80, 100]).map((h, i) => (
                                <View key={i} style={styles.chartCol}>
                                    <View style={[styles.chartBar, { height: h }, i === (filter === 'week' ? 6 : filter === 'month' ? 1 : 3) && styles.chartBarActive]} />
                                    <Text style={styles.chartDateLabel}>
                                        {filter === 'week' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i] : filter === 'month' ? `W${i + 1}` : `Q${i + 1}`}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Recent Orders */}
                <View style={styles.listSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Orders</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('AdminManageOrders')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    {orders.length === 0 ? (
                        <View style={styles.orderListItem}>
                            <Text style={styles.orderSub}>No recent orders</Text>
                        </View>
                    ) : (
                        orders.slice(0, 3).map((order) => (
                            <TouchableOpacity
                                key={order.id}
                                style={styles.orderListItem}
                                onPress={() => handleStatusUpdate(order)}
                            >
                                <View style={styles.orderIconBox}>
                                    <Text style={styles.orderIcon}>{order.serviceType === 'home_delivery' ? '🚛' : '🏪'}</Text>
                                </View>
                                <View style={styles.orderInfo}>
                                    <Text style={styles.orderName}>{order.userName || 'Customer'}</Text>
                                    <Text style={styles.orderSub}>{order.items.length} Items • Tracking #{order.id.slice(-4).toUpperCase()}</Text>
                                </View>
                                <View style={styles.orderValueBox}>
                                    <Text style={styles.orderAmount}>₹{order.totalAmount.toFixed(0)}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: (order.status === 'pending' ? '#FFF3E0' : '#E8F5E9') }]}>
                                        <Text style={[styles.statusText, { color: (order.status === 'pending' ? '#F57C00' : '#2E7D32') }]}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Inventory Alerts */}
                <View style={[styles.listSection, styles.inventoryAlerts]}>
                    <View style={styles.sectionHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={{ fontSize: 18 }}>📦</Text>
                            <Text style={styles.sectionTitle}>Inventory Alerts</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('AdminInventory', { lowStockOnly: true })}>
                            <Text style={styles.viewAllText}>Show Only Low</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.alertsPadding}>
                        {lowStockProducts.map((p, idx) => (
                            <View key={p.id} style={styles.alertRow}>
                                <View style={styles.alertDot} />
                                <View style={styles.alertInfo}>
                                    <Text style={styles.alertName}>{p.name}</Text>
                                    <Text style={styles.alertSub}>Only {p.stock || (15 - idx * 3)} units left in stock</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.restockBtn}
                                    onPress={() => navigation.navigate('AdminAddProduct', { product: p })}
                                >
                                    <Text style={styles.restockBtnText}>Update</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Actions Bottom Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.btnAddMedicine}
                        onPress={() => navigation.navigate('AdminAddProduct')}
                    >
                        <Text style={styles.btnAddIcon}>➕</Text>
                        <Text style={styles.btnAddText}>Add Medicine</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.btnReports}
                        onPress={() => navigation.navigate('AdminSalesDetails')}
                    >
                        <Text style={styles.btnReportsIcon}>📊</Text>
                        <Text style={styles.btnReportsText}>Reports</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Quick Stock FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AdminInventory')}
            >
                <Text style={styles.fabIcon}>🥘</Text>
                <Text style={styles.fabText}>Quick Stock</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
    greeting: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary },
    subGreeting: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', ...SHADOW.small },
    avatarText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },

    scanCard: {
        marginHorizontal: 20, backgroundColor: COLORS.primary, borderRadius: RADIUS.xl,
        padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        ...SHADOW.card, marginBottom: 20
    },
    scanContent: { flex: 1, paddingRight: 20 },
    scanTitle: { fontSize: 17, fontWeight: '800', color: COLORS.white },
    scanSub: { fontSize: 11, color: COLORS.white, opacity: 0.9, marginTop: 4, lineHeight: 16 },
    scanBtn: {
        backgroundColor: COLORS.white, borderRadius: RADIUS.full, paddingVertical: 10, paddingHorizontal: 20,
        alignSelf: 'flex-start', marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 8
    },
    scanBtnIcon: { fontSize: 14 },
    scanBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 12 },
    scanGraphic: { width: 70, height: 70, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    scanBox: { width: 40, height: 40, borderLeftWidth: 2, borderTopWidth: 2, borderRightWidth: 2, borderBottomWidth: 2, borderColor: 'rgba(255,255,255,0.4)', padding: 6, gap: 4 },
    scanBoxLine: { width: '100%', height: 2, backgroundColor: 'rgba(255,255,255,0.3)' },

    metricsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 15, marginBottom: 20 },
    metricCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 20, ...SHADOW.card },
    metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    metricIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    metricIcon: { fontSize: 18 },
    trendText: { fontSize: 11, fontWeight: '800', color: COLORS.success },
    metricValue: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary },
    metricLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

    chartCard: { marginHorizontal: 20, backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 24, ...SHADOW.card, marginBottom: 20 },
    chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    chartTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
    chartSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    chartDropdown: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.surfaceAlt, paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.full },
    chartDropdownText: { fontSize: 10, fontWeight: '800', color: COLORS.textSecondary },
    chartDropdownIcon: { fontSize: 8, color: COLORS.textSecondary },
    chartView: { height: 120, justifyContent: 'flex-end' },
    chartLinesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: '100%', gap: 8 },
    chartCol: { alignItems: 'center', gap: 10, flex: 1 },
    chartBar: { width: 10, backgroundColor: COLORS.primary + '30', borderRadius: 5, minHeight: 10 },
    chartBarActive: { backgroundColor: COLORS.primary },
    chartDateLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },

    listSection: { marginHorizontal: 20, marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
    viewAllText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },

    orderListItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
        padding: 16, borderRadius: RADIUS.xl, marginBottom: 10, ...SHADOW.small
    },
    orderIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    orderIcon: { fontSize: 20 },
    orderInfo: { flex: 1, paddingHorizontal: 12 },
    orderName: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
    orderSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
    orderValueBox: { alignItems: 'flex-end' },
    orderAmount: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm, marginTop: 4 },
    statusText: { fontSize: 10, fontWeight: '900' },

    inventoryAlerts: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 20, ...SHADOW.card },
    alertsPadding: { paddingTop: 8 },
    alertRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    alertDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.error, marginRight: 12 },
    alertInfo: { flex: 1 },
    alertName: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
    alertSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
    restockBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.sm },
    restockBtnText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '700' },

    actionRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 15, marginBottom: 20 },
    btnAddMedicine: {
        flex: 1, height: 56, backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...SHADOW.card
    },
    btnAddIcon: { fontSize: 16, color: COLORS.white },
    btnAddText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
    btnReports: {
        flex: 1, height: 56, backgroundColor: COLORS.white, borderRadius: RADIUS.full,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        borderWidth: 1, borderColor: COLORS.border, ...SHADOW.small
    },
    btnReportsIcon: { fontSize: 16 },
    btnReportsText: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 14 },

    fab: {
        position: 'absolute', bottom: 30, right: 20, backgroundColor: COLORS.secondary,
        paddingHorizontal: 18, paddingVertical: 12, borderRadius: RADIUS.full,
        flexDirection: 'row', alignItems: 'center', gap: 8, ...SHADOW.card
    },
    fabIcon: { fontSize: 16 },
    fabText: { color: COLORS.white, fontWeight: '800', fontSize: 13 },
});
