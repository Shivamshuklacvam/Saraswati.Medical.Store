import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Order } from '../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

type Props = {
    navigation: NativeStackNavigationProp<any>;
    route: { params: { orderId: string } };
};

const STATUS_STEPS = [
    { key: 'pending', label: 'Order Received', icon: '📦' },
    { key: 'confirmed', label: 'Order Confirmed', icon: '✅' },
    { key: 'ready', label: 'Ready / Pharmacist Verified', icon: '💊' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚴' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

export default function OrderTrackingScreen({ navigation, route }: Props) {
    const { orderId } = route.params;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) { setLoading(false); return; }
        getDoc(doc(db, 'orders', orderId))
            .then(snap => {
                if (snap.exists()) setOrder({ id: snap.id, ...snap.data() } as Order);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [orderId]);

    const currentStepIdx = order ? STATUS_STEPS.findIndex(s => s.key === order.status) : 0;

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }

    if (!order) {
        return (
            <View style={styles.center}>
                <Text style={styles.notFound}>Order not found</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.homeBtn}>
                    <Text style={styles.homeBtnText}>Go Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Order #{order.id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.headerSub}>
                        {order.serviceType === 'home_delivery' ? '🚚 Home Delivery' : '🏪 Store Pickup'}
                    </Text>
                </View>
            </View>

            {/* Success banner */}
            <View style={styles.successBanner}>
                <Text style={styles.successIcon}>🎊</Text>
                <View>
                    <Text style={styles.successTitle}>Order Placed Successfully!</Text>
                    <Text style={styles.successSub}>Thank you for choosing Saraswati Medical</Text>
                </View>
            </View>

            {/* COD note */}
            <View style={styles.codNote}>
                <Text style={styles.codNoteIcon}>💵</Text>
                <View>
                    <Text style={styles.codNoteTitle}>Cash on Delivery</Text>
                    <Text style={styles.codNoteSub}>Please keep ₹{order.totalAmount.toFixed(2)} ready at delivery</Text>
                </View>
            </View>

            {/* Status timeline */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Status</Text>
                {STATUS_STEPS.map((step, idx) => {
                    const done = idx <= currentStepIdx;
                    const active = idx === currentStepIdx;
                    return (
                        <View key={step.key} style={styles.timelineRow}>
                            <View style={styles.timelineLeft}>
                                <View style={[styles.timelineDot,
                                done && styles.timelineDotDone,
                                active && styles.timelineDotActive,
                                ]}>
                                    <Text style={styles.timelineDotText}>{done ? '✓' : (idx + 1).toString()}</Text>
                                </View>
                                {idx < STATUS_STEPS.length - 1 && (
                                    <View style={[styles.timelineLine, done && styles.timelineLineDone]} />
                                )}
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={[styles.timelineLabel, active && { color: COLORS.primary, fontWeight: '800' }]}>
                                    {step.icon} {step.label}
                                </Text>
                                {active && <Text style={styles.timelineStatus}>Current status</Text>}
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Order items */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Items ({order.items.length})</Text>
                {order.items.map((item, idx) => (
                    <View key={idx} style={styles.orderItem}>
                        <View style={styles.orderItemImg}><Text style={{ fontSize: 22 }}>💊</Text></View>
                        <View style={styles.orderItemInfo}>
                            <Text style={styles.orderItemName}>{item.productName}</Text>
                            <Text style={styles.orderItemPack}>{item.quantity} × ₹{item.price.toFixed(2)}</Text>
                        </View>
                        <Text style={styles.orderItemTotal}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            {/* Bill summary */}
            <View style={styles.section}>
                <View style={styles.billRow}><Text style={styles.billLabel}>Subtotal</Text><Text style={styles.billValue}>₹{(order.totalAmount - order.gst - order.deliveryFee).toFixed(2)}</Text></View>
                <View style={styles.billRow}><Text style={styles.billLabel}>GST</Text><Text style={styles.billValue}>₹{order.gst.toFixed(2)}</Text></View>
                <View style={styles.billRow}><Text style={styles.billLabel}>Delivery</Text><Text style={[styles.billValue, order.deliveryFee === 0 && { color: COLORS.success }]}>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</Text></View>
                <View style={[styles.billRow, styles.billTotal]}>
                    <Text style={styles.billTotalLabel}>Total (COD)</Text>
                    <Text style={styles.billTotalValue}>₹{order.totalAmount.toFixed(2)}</Text>
                </View>
            </View>

            {/* Delivery address */}
            {order.serviceType === 'home_delivery' && order.deliveryAddress && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    <Text style={styles.addressText}>
                        {order.deliveryAddress.name}{'\n'}
                        {order.deliveryAddress.line1}{order.deliveryAddress.line2 ? ', ' + order.deliveryAddress.line2 : ''}{'\n'}
                        {order.deliveryAddress.city} — {order.deliveryAddress.pincode}
                    </Text>
                </View>
            )}

            {/* Action buttons */}
            <View style={styles.actionBtns}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MyOrders')}>
                    <Text style={styles.actionBtnText}>📋 My Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={() => navigation.navigate('Search')}>
                    <Text style={[styles.actionBtnText, { color: '#fff' }]}>📋 Track Refill</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
    notFound: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 12 },
    homeBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.round, paddingHorizontal: 24, paddingVertical: 12 },
    homeBtnText: { color: '#fff', fontWeight: '700' },

    header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingTop: 52, paddingBottom: SPACING.md },
    backBtn: { width: 36, height: 36, justifyContent: 'center' },
    backIcon: { fontSize: 22, color: COLORS.textPrimary },
    headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
    headerSub: { fontSize: 12, color: COLORS.textSecondary },

    successBanner: { marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl, backgroundColor: COLORS.successLight, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.card },
    successIcon: { fontSize: 36 },
    successTitle: { fontSize: 16, fontWeight: '800', color: COLORS.success },
    successSub: { fontSize: 12, color: COLORS.textSecondary },

    codNote: { marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl, backgroundColor: COLORS.warningLight, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, marginBottom: SPACING.md },
    codNoteIcon: { fontSize: 28 },
    codNoteTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
    codNoteSub: { fontSize: 12, color: COLORS.textSecondary },

    section: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg, marginHorizontal: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.card },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.md },

    timelineRow: { flexDirection: 'row', gap: 14, marginBottom: 0 },
    timelineLeft: { alignItems: 'center', width: 28 },
    timelineDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surfaceAlt, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
    timelineDotActive: { backgroundColor: COLORS.primarySurface, borderColor: COLORS.primary },
    timelineDotDone: { backgroundColor: COLORS.success, borderColor: COLORS.success },
    timelineDotText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
    timelineLine: { width: 2, flex: 1, minHeight: 20, backgroundColor: COLORS.borderLight, marginVertical: 4 },
    timelineLineDone: { backgroundColor: COLORS.success },
    timelineContent: { flex: 1, paddingBottom: 16 },
    timelineLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
    timelineStatus: { fontSize: 11, color: COLORS.primary, fontWeight: '700', marginTop: 2 },

    orderItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    orderItemImg: { width: 46, height: 46, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
    orderItemInfo: { flex: 1 },
    orderItemName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
    orderItemPack: { fontSize: 12, color: COLORS.textSecondary },
    orderItemTotal: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },

    billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    billLabel: { fontSize: 13, color: COLORS.textSecondary },
    billValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
    billTotal: { borderTopWidth: 1, borderColor: COLORS.borderLight, paddingTop: 10, marginTop: 4 },
    billTotalLabel: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
    billTotalValue: { fontSize: 15, fontWeight: '800', color: COLORS.success },

    addressText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },

    actionBtns: { flexDirection: 'row', gap: 12, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
    actionBtn: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.round, paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.surface },
    actionBtnPrimary: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    actionBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
});
