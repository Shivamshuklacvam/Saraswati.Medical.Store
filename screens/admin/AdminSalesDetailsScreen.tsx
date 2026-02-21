import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAllOrders } from '../../firebase/db';
import { Order } from '../../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function AdminSalesDetailsScreen({ navigation }: Props) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllOrders().then(data => {
            setOrders(data.filter(o => o.status !== 'cancelled'));
            setLoading(false);
        });
    }, []);

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
                <Text style={styles.title}>Sales Analytics</Text>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.sumLabel}>Total Revenue (Today)</Text>
                <Text style={styles.sumValue}>₹{totalRevenue.toLocaleString()}</Text>
                <View style={styles.sumFooter}>
                    <Text style={styles.sumFooterText}>{orders.length} Completed Orders</Text>
                </View>
            </View>

            <View style={{ flex: 1, paddingHorizontal: 20 }}>
                <Text style={styles.sectionTitle}>Transaction History</Text>
                {loading ? <ActivityIndicator color={COLORS.primary} size="large" /> : (
                    <FlatList
                        data={orders}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.txnItem}>
                                <View style={styles.txnIcon}><Text>💰</Text></View>
                                <View style={{ flex: 1 }}>
                                    <View style={styles.txnUserRow}>
                                        <Text style={styles.txnUser}>{item.userName || 'Customer'}</Text>
                                        <View style={styles.modeBadge}>
                                            <Text style={styles.modeBadgeText}>{item.paymentMethod?.toUpperCase() || 'COD'}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.txnTime}>Order #{item.id.slice(-6).toUpperCase()}</Text>
                                </View>
                                <Text style={styles.txnAmount}>+ ₹{item.totalAmount.toFixed(0)}</Text>
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
    backIcon: { fontSize: 24, color: COLORS.textPrimary },
    title: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary },
    summaryCard: { margin: 20, backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, padding: 30, ...SHADOW.card },
    sumLabel: { color: '#fff', fontSize: 14, opacity: 0.8 },
    sumValue: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 10 },
    sumFooter: { marginTop: 20, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingTop: 15 },
    sumFooterText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 20 },
    txnItem: { flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: COLORS.white, padding: 16, borderRadius: RADIUS.md, marginBottom: 12, ...SHADOW.small },
    txnIcon: { width: 40, height: 40, backgroundColor: COLORS.successLight, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    txnUserRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    txnUser: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
    modeBadge: { backgroundColor: COLORS.surfaceAlt, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: COLORS.border },
    modeBadgeText: { fontSize: 9, fontWeight: '800', color: COLORS.textSecondary },
    txnTime: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
    txnAmount: { fontSize: 14, fontWeight: '900', color: COLORS.success },
});
