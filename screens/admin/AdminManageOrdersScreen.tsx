import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView, Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAllOrders, updateOrderStatus, updateOrder } from '../../firebase/db';
import { Order, CartItem } from '../../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

const CANCEL_REASONS = [
    "Item out of stock",
    "Customer requested cancellation",
    "Invalid address or phone",
    "Payment not received",
    "Suspected fraudulent order",
    "Delivery unserviceable area",
    "Other"
];

export default function AdminManageOrdersScreen({ navigation }: Props) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    // Cancel Modal State
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
    const [cancelReason, setCancelReason] = useState<string>('');
    const [customReason, setCustomReason] = useState<string>('');
    const [isCancelling, setIsCancelling] = useState(false);

    // Track editing items locally
    const [editingItems, setEditingItems] = useState<{ [orderId: string]: CartItem[] }>({});

    const fetchOrders = async () => {
        const data = await getAllOrders();
        // Sort newest first
        setOrders(data.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
        setLoading(false);
    };

    useEffect(() => { fetchOrders(); }, []);

    const toggleExpand = (order: Order) => {
        if (expandedOrderId === order.id) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(order.id);
            if (!editingItems[order.id]) {
                setEditingItems(prev => ({ ...prev, [order.id]: [...order.items] }));
            }
        }
    };

    const updateStatus = async (id: string, currentStatus: string) => {
        const nextMap: any = { pending: 'confirmed', confirmed: 'ready', ready: 'out_for_delivery', out_for_delivery: 'delivered' };
        const next = nextMap[currentStatus];
        if (!next) return;

        // Ensure UI updates immediately
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next } : o));

        try {
            await updateOrderStatus(id, next);
        } catch (e) {
            Alert.alert('Error', 'Update failed');
            fetchOrders(); // Revert on failure
        }
    };

    const updateItemQuantity = (orderId: string, productId: string, delta: number, maxQuantity: number) => {
        setEditingItems(prev => {
            const currentItems = prev[orderId] || [];
            const newItems = currentItems.map(item => {
                if (item.productId === productId) {
                    const newQuant = item.quantity + delta;
                    return { ...item, quantity: Math.min(maxQuantity, Math.max(0, newQuant)) }; // Allow going to 0 to "remove", cap at maxQuantity
                }
                return item;
            }).filter(item => item.quantity > 0); // Directly exclude 0 quantity items
            return { ...prev, [orderId]: newItems };
        });
    };

    const saveOrderModifications = async (order: Order) => {
        const modifiedItems = editingItems[order.id];
        if (!modifiedItems) return;

        // Ensure there's at least one item, otherwise prompt for cancellation
        if (modifiedItems.length === 0) {
            Alert.alert('Empty Order', 'There are no items left. Do you want to cancel the entire order instead?', [
                {
                    text: 'No, Keep Items', style: 'cancel', onPress: () => {
                        setEditingItems(prev => ({ ...prev, [order.id]: [...order.items] }));
                    }
                },
                { text: 'Yes, Cancel Order', style: 'destructive', onPress: () => openCancelModal(order) }
            ]);
            return;
        }

        const subtotal = modifiedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const gst = subtotal * 0.18; // Flat 18% assumption based on standard model
        const totalAmount = subtotal + gst + order.deliveryFee;

        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, items: modifiedItems, gst, totalAmount } : o));

        try {
            await updateOrder(order.id, {
                items: modifiedItems,
                gst,
                totalAmount
            });
            Alert.alert('Success', 'Order successfully updated.');
            fetchOrders();
        } catch (error) {
            Alert.alert('Error', 'Failed to update order modifications.');
            fetchOrders();
        }
    };

    const handleContact = (phone: string, method: 'call' | 'sms' | 'whatsapp') => {
        const cleanPhone = phone.replace(/[^0-9+]/g, '');
        if (method === 'call') Linking.openURL(`tel:${cleanPhone}`);
        else if (method === 'sms') Linking.openURL(`sms:${cleanPhone}`);
        else if (method === 'whatsapp') Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
    };

    const confirmCancelOrder = async () => {
        if (!orderToCancel) return;

        const finalReason = cancelReason === 'Other' ? customReason.trim() : cancelReason;
        if (!finalReason) {
            Alert.alert('Required', 'Please select or enter a cancellation reason.');
            return;
        }

        setIsCancelling(true);
        try {
            // In a real app, you would also save the finalReason to the database
            await updateOrderStatus(orderToCancel.id, 'cancelled');

            // If payment was not COD, remind admin to process refund
            if (orderToCancel.paymentMethod !== 'cod') {
                Alert.alert('Order Cancelled', `Order #${orderToCancel.id.slice(-6).toUpperCase()} cancelled.\n\nRefund Required: This order was paid via ${orderToCancel.paymentMethod?.toUpperCase()}. Please process a refund of ₹${orderToCancel.totalAmount.toFixed(0)} through your payment gateway.`);
            } else {
                Alert.alert('Success', `Order #${orderToCancel.id.slice(-6).toUpperCase()} has been cancelled.`);
            }

            setCancelModalVisible(false);
            setOrderToCancel(null);
            setCancelReason('');
            setCustomReason('');
            fetchOrders();
        } catch (error) {
            Alert.alert('Error', 'Failed to cancel order.');
        } finally {
            setIsCancelling(false);
        }
    };

    const openCancelModal = (order: Order) => {
        setOrderToCancel(order);
        setCancelReason('');
        setCustomReason('');
        setCancelModalVisible(true);
    };

    const renderCancelReasonModal = () => (
        <Modal
            visible={cancelModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setCancelModalVisible(false)}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Cancel Order #{orderToCancel?.id?.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.modalSubtitle}>Please select a reason for cancellation:</Text>

                    <ScrollView style={styles.reasonsList} showsVerticalScrollIndicator={false}>
                        {CANCEL_REASONS.map((reason) => (
                            <TouchableOpacity
                                key={reason}
                                style={[
                                    styles.reasonOption,
                                    cancelReason === reason && styles.reasonOptionSelected
                                ]}
                                onPress={() => setCancelReason(reason)}
                            >
                                <View style={[
                                    styles.radioCircle,
                                    cancelReason === reason && styles.radioCircleSelected
                                ]}>
                                    {cancelReason === reason && <View style={styles.radioInner} />}
                                </View>
                                <Text style={[
                                    styles.reasonText,
                                    cancelReason === reason && styles.reasonTextSelected
                                ]}>{reason}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {cancelReason === 'Other' && (
                        <TextInput
                            style={styles.customReasonInput}
                            placeholder="Type custom reason here..."
                            value={customReason}
                            onChangeText={setCustomReason}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    )}

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.modalBtn, styles.modalCancelBtn]}
                            onPress={() => setCancelModalVisible(false)}
                            disabled={isCancelling}
                        >
                            <Text style={styles.modalCancelBtnText}>CLOSE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalBtn, styles.modalConfirmBtn]}
                            onPress={confirmCancelOrder}
                            disabled={isCancelling}
                        >
                            {isCancelling ? (
                                <ActivityIndicator color={COLORS.white} size="small" />
                            ) : (
                                <Text style={styles.modalConfirmBtnText}>CONFIRM CANCEL</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );

    const renderExpandedDetails = (item: Order) => {
        const isExpanded = expandedOrderId === item.id;
        if (!isExpanded) return null;

        const originalItems = item.items;
        const currentItems = editingItems[item.id] || [...item.items];

        const isModified = JSON.stringify(originalItems) !== JSON.stringify(currentItems);

        return (
            <View style={styles.expandedContent}>
                <View style={styles.contactRow}>
                    <Text style={styles.contactPhone}>{item.deliveryAddress.phone}</Text>
                    <View style={styles.contactActions}>
                        <TouchableOpacity style={[styles.contactIcon, { backgroundColor: '#E3F2FD' }]} onPress={() => handleContact(item.deliveryAddress.phone, 'call')}>
                            <Text style={{ fontSize: 16 }}>📞</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.contactIcon, { backgroundColor: '#FFF3E0' }]} onPress={() => handleContact(item.deliveryAddress.phone, 'sms')}>
                            <Text style={{ fontSize: 16 }}>💬</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.contactIcon, { backgroundColor: '#E8F5E9' }]} onPress={() => handleContact(item.deliveryAddress.phone, 'whatsapp')}>
                            <Text style={{ fontSize: 16, color: '#4CAF50' }}>WhatsApp</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.itemsList}>
                    {currentItems.map((cartItem) => {
                        const originalQuantity = originalItems.find(oi => oi.productId === cartItem.productId)?.quantity || cartItem.quantity;
                        const atMax = cartItem.quantity >= originalQuantity;

                        return (
                            <View key={cartItem.productId} style={styles.itemRow}>
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemName} numberOfLines={1}>{cartItem.productName}</Text>
                                    <Text style={styles.itemPrice}>₹{cartItem.price.toFixed(0)} {cartItem.packSize && `• ${cartItem.packSize}`}</Text>
                                </View>

                                <View style={styles.quantityControls}>
                                    <TouchableOpacity
                                        style={styles.qtBtn}
                                        onPress={() => updateItemQuantity(item.id, cartItem.productId, -1, originalQuantity)}
                                    >
                                        <Text style={styles.qtBtnText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.qtText}>{cartItem.quantity}</Text>
                                    <TouchableOpacity
                                        style={styles.qtBtn}
                                        onPress={() => {
                                            if (!atMax) updateItemQuantity(item.id, cartItem.productId, 1, originalQuantity);
                                        }}
                                        disabled={atMax}
                                    >
                                        <Text style={[styles.qtBtnText, atMax && { color: COLORS.textSecondary }]}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                    {currentItems.length === 0 && (
                        <Text style={{ color: COLORS.error, fontSize: 14, textAlign: 'center', marginVertical: 10 }}>Order has no items. This will cancel it entirely.</Text>
                    )}
                </View>

                {isModified && (
                    <TouchableOpacity style={styles.saveChangesBtn} onPress={() => saveOrderModifications(item)}>
                        <Text style={styles.saveChangesText}>SAVE ORDER CHANGES</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
                <Text style={styles.title}>Manage Orders</Text>
            </View>

            {loading ? <ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} size="large" /> : (
                <FlatList
                    data={orders}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.orderCard} onPress={() => toggleExpand(item)} activeOpacity={0.9}>
                            <View style={styles.orderTop}>
                                <Text style={styles.orderId}>Order #{item.id.slice(-6).toUpperCase()}</Text>
                                <View style={[styles.badge,
                                item.status === 'delivered' ? { backgroundColor: COLORS.successLight } :
                                    item.status === 'cancelled' ? { backgroundColor: COLORS.errorLight } :
                                        { backgroundColor: '#FFF3E0' }]}>
                                    <Text style={[styles.badgeText,
                                    item.status === 'delivered' ? { color: COLORS.success } :
                                        item.status === 'cancelled' ? { color: COLORS.error } :
                                            { color: '#F57C00' }]}>
                                        {item.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.userInfoRow}>
                                <Text style={styles.orderUser}>{item.userName || 'Customer'}</Text>
                                <View style={styles.payBadge}>
                                    <Text style={styles.payBadgeText}>{item.paymentMethod?.toUpperCase() || 'COD'}</Text>
                                </View>
                            </View>

                            <Text style={styles.orderItems}>{item.items.length} Medicine(s) • ₹{item.totalAmount.toFixed(0)}</Text>

                            {renderExpandedDetails(item)}

                            <View style={styles.actionsRow}>
                                {item.status !== 'delivered' && item.status !== 'cancelled' ? (
                                    <>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.cancelBtn]}
                                            onPress={() => openCancelModal(item)}
                                        >
                                            <Text style={styles.cancelBtnText}>CANCEL</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.primaryBtn]}
                                            onPress={() => updateStatus(item.id, item.status)}
                                        >
                                            <Text style={styles.primaryBtnText}>NEXT STATUS →</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <View style={{ flex: 1, paddingVertical: 12, alignItems: 'center' }}>
                                        <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' }}>
                                            {item.status === 'delivered' ? 'ORDER COMPLETE' : 'ORDER CANCELLED'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}

            {renderCancelReasonModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
    backIcon: { fontSize: 24, color: COLORS.textPrimary },
    title: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary },
    orderCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 20, marginBottom: 15, ...SHADOW.card },
    orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    orderId: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 10, fontWeight: '900' },
    userInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    orderUser: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
    payBadge: { backgroundColor: COLORS.surfaceAlt, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: COLORS.border },
    payBadgeText: { fontSize: 9, fontWeight: '800', color: COLORS.textSecondary },
    orderItems: { fontSize: 13, color: COLORS.textSecondary, marginTop: 6, marginBottom: 15 },

    // Expanded Layout Styles
    expandedContent: { marginTop: 10, paddingTop: 15, borderTopWidth: 1, borderColor: COLORS.borderLight, paddingBottom: 15 },
    contactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    contactPhone: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: 0.5 },
    contactActions: { flexDirection: 'row', gap: 10 },
    contactIcon: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.md },

    itemsList: { gap: 15 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemDetails: { flex: 1, paddingRight: 10 },
    itemName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
    itemPrice: { fontSize: 12, color: COLORS.textSecondary },

    quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
    qtBtn: { paddingHorizontal: 15, paddingVertical: 8, justifyContent: 'center', alignItems: 'center' },
    qtBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
    qtText: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, minWidth: 24, textAlign: 'center' },

    saveChangesBtn: { backgroundColor: COLORS.warning, paddingVertical: 12, borderRadius: RADIUS.md, alignItems: 'center', marginTop: 20 },
    saveChangesText: { color: COLORS.white, fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },

    actionsRow: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderColor: COLORS.borderLight, paddingTop: 15 },
    actionBtn: { flex: 1, paddingVertical: 12, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
    cancelBtn: { backgroundColor: COLORS.errorLight },
    cancelBtnText: { color: COLORS.error, fontWeight: '800', fontSize: 12 },
    primaryBtn: { backgroundColor: COLORS.primarySurface },
    primaryBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 12 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        padding: 24,
        maxHeight: '80%'
    },
    modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.error, marginBottom: 8 },
    modalSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 },
    reasonsList: { maxHeight: 250, marginBottom: 16 },
    reasonOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight
    },
    reasonOptionSelected: { backgroundColor: COLORS.errorLight + '20' }, // slight tinted background
    radioCircle: {
        width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.textSecondary,
        marginRight: 12, justifyContent: 'center', alignItems: 'center'
    },
    radioCircleSelected: { borderColor: COLORS.error },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.error },
    reasonText: { fontSize: 15, color: COLORS.textPrimary },
    reasonTextSelected: { fontWeight: '700', color: COLORS.error },
    customReasonInput: {
        borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
        padding: 12, fontSize: 14, color: COLORS.textPrimary,
        backgroundColor: COLORS.surfaceAlt, height: 80, marginBottom: 16
    },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
    modalBtn: { flex: 1, paddingVertical: 14, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
    modalCancelBtn: { backgroundColor: COLORS.surfaceAlt },
    modalCancelBtnText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 14 },
    modalConfirmBtn: { backgroundColor: COLORS.error },
    modalConfirmBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
});

