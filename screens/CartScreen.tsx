import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../firebase/db';
import { Address } from '../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

const GST_RATE = 0.18;

export default function CartScreen({ navigation }: Props) {
    const { items, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
    const { user, userProfile } = useAuth();

    const [serviceType, setServiceType] = useState<'home_delivery' | 'store_takeaway'>('home_delivery');
    const [address, setAddress] = useState<Address>({
        name: userProfile?.name ?? '',
        phone: userProfile?.phoneNumber ?? '',
        line1: userProfile?.address?.line1 ?? '',
        city: userProfile?.address?.city ?? 'Varanasi',
        pincode: userProfile?.address?.pincode ?? '',
    });
    const [step, setStep] = useState<1 | 2>(1); // 1 = cart, 2 = delivery address
    const [placing, setPlacing] = useState(false);
    const [prescriptionMode, setPrescriptionMode] = useState<'upload' | 'consult' | null>(null);

    const hasPrescriptionItems = items.some(item => item.requiresPrescription);

    const gst = totalAmount * GST_RATE;
    const deliveryFee = serviceType === 'home_delivery' && totalAmount < 500 ? 40 : 0;
    const grandTotal = totalAmount + gst + deliveryFee;

    const handlePlaceOrder = async () => {
        if (!user) { Alert.alert('Sign In Required', 'Please sign in to place an order'); return; }
        if (serviceType === 'home_delivery' && !address.line1.trim()) {
            Alert.alert('Address Required', 'Please enter your delivery address'); return;
        }
        if (hasPrescriptionItems && !prescriptionMode) {
            Alert.alert('Prescription Required', 'Please choose how you will provide a prescription'); return;
        }
        setPlacing(true);
        try {
            const order = await placeOrder({
                userId: user.uid,
                userName: userProfile?.name || 'Customer',
                items,
                totalAmount: grandTotal,
                gst,
                deliveryFee,
                paymentMethod: 'cod',
                deliveryAddress: address,
                serviceType,
                status: 'pending',
                needsConsultation: prescriptionMode === 'consult',
            });
            clearCart();
            navigation.navigate('OrderTracking', { orderId: order.id });
        } catch (e: any) {
            Alert.alert('Order Failed', e.message || 'Please try again');
        } finally {
            setPlacing(false);
        }
    };

    if (items.length === 0) {
        return (
            <View style={styles.emptyState}>
                <StatusBar style="dark" />
                <Text style={styles.emptyIcon}>🛒</Text>
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptySub}>Add medicines and healthcare products</Text>
                <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Search')}>
                    <Text style={styles.shopBtnText}>Browse Medicines →</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Saraswati Medical</Text>
                <TouchableOpacity onPress={() => { clearCart(); }} style={styles.trashBtn}>
                    <Text style={styles.trashIcon}>🗑️</Text>
                </TouchableOpacity>
            </View>

            {/* Progress */}
            <View style={styles.progress}>
                {['Cart', 'Delivery', 'Payment'].map((label, i) => (
                    <View key={label} style={styles.progressItem}>
                        <View style={[styles.progressDot, i === 0 && styles.progressDotActive]}>
                            <Text style={[styles.progressDotText, i === 0 && { color: '#fff' }]}>{i + 1}</Text>
                        </View>
                        <Text style={[styles.progressLabel, i === 0 && { color: COLORS.primary }]}>{label}</Text>
                    </View>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Cart Items */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Items ({items.length})</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Search')}><Text style={styles.editText}>Edit Basket</Text></TouchableOpacity>
                    </View>
                    {items.map(item => (
                        <View key={item.productId} style={styles.cartItem}>
                            <View style={styles.cartItemImg}><Text style={{ fontSize: 28 }}>💊</Text></View>
                            <View style={styles.cartItemInfo}>
                                <Text style={styles.cartItemName} numberOfLines={2}>{item.productName}</Text>
                                {item.packSize && <Text style={styles.cartItemPack}>{item.packSize}</Text>}
                                <Text style={styles.cartItemPrice}>₹{item.price.toFixed(2)}</Text>
                            </View>
                            <View style={styles.qtyControl}>
                                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.productId, item.quantity - 1)}>
                                    <Text style={styles.qtyBtnText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.qtyValue}>{item.quantity}</Text>
                                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.productId, item.quantity + 1)}>
                                    <Text style={styles.qtyBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Prescription Requirement */}
                {hasPrescriptionItems && (
                    <View style={styles.prescriptionRequiredBox}>
                        <View style={styles.prescHeader}>
                            <Text style={styles.prescIcon}>📜</Text>
                            <View>
                                <Text style={styles.prescTitle}>Prescription Required</Text>
                                <Text style={styles.prescSub}>Select how you'll provide it</Text>
                            </View>
                        </View>
                        <View style={styles.prescOptions}>
                            <TouchableOpacity
                                style={[styles.prescOption, prescriptionMode === 'upload' && styles.prescOptionActive]}
                                onPress={() => setPrescriptionMode('upload')}
                            >
                                <Text style={styles.prescOptionIcon}>📸</Text>
                                <Text style={styles.prescOptionLabel}>I will upload prescription</Text>
                                {prescriptionMode === 'upload' && <Text style={styles.checkIcon}>✓</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.prescOption, prescriptionMode === 'consult' && styles.prescOptionActive]}
                                onPress={() => setPrescriptionMode('consult')}
                            >
                                <Text style={styles.prescOptionIcon}>👨‍⚕️</Text>
                                <Text style={styles.prescOptionLabel}>Free Doctor Consultation</Text>
                                {prescriptionMode === 'consult' && <Text style={styles.checkIcon}>✓</Text>}
                            </TouchableOpacity>
                        </View>
                        {prescriptionMode === 'upload' && (
                            <TouchableOpacity style={styles.uploadBtnSmall}>
                                <Text style={styles.uploadBtnSmallText}>CLICK TO UPLOAD IMAGE →</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Service Type */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Service Type</Text>
                    <View style={styles.serviceRow}>
                        {(['home_delivery', 'store_takeaway'] as const).map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.serviceCard, serviceType === type && styles.serviceCardActive]}
                                onPress={() => setServiceType(type)}
                            >
                                <Text style={styles.serviceIcon}>{type === 'home_delivery' ? '🚚' : '🏪'}</Text>
                                <Text style={[styles.serviceLabel, serviceType === type && { color: COLORS.primary, fontWeight: '800' }]}>
                                    {type === 'home_delivery' ? 'Home Delivery' : 'Store Takeaway'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Delivery Address */}
                {serviceType === 'home_delivery' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                        {[
                            { label: 'Name', key: 'name', placeholder: 'Your name' },
                            { label: 'Phone', key: 'phone', placeholder: '+91 XXXXX XXXXX' },
                            { label: 'Address Line', key: 'line1', placeholder: 'House no, Street, Area' },
                            { label: 'City', key: 'city', placeholder: 'City' },
                            { label: 'Pincode', key: 'pincode', placeholder: '000000' },
                        ].map(f => (
                            <View key={f.key} style={{ marginBottom: 10 }}>
                                <Text style={styles.fieldLabel}>{f.label}</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    placeholder={f.placeholder}
                                    placeholderTextColor={COLORS.textMuted}
                                    value={(address as any)[f.key]}
                                    onChangeText={val => setAddress(prev => ({ ...prev, [f.key]: val }))}
                                />
                            </View>
                        ))}
                    </View>
                )}

                {/* Bill summary */}
                <View style={styles.section}>
                    <View style={styles.billRow}><Text style={styles.billLabel}>Subtotal</Text><Text style={styles.billValue}>₹{totalAmount.toFixed(2)}</Text></View>
                    <View style={styles.billRow}><Text style={styles.billLabel}>Delivery Fee</Text><Text style={[styles.billValue, deliveryFee === 0 && { color: COLORS.success }]}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</Text></View>
                    <View style={styles.billRow}><Text style={styles.billLabel}>GST (18%)</Text><Text style={styles.billValue}>₹{gst.toFixed(2)}</Text></View>
                    <View style={[styles.billRow, styles.billTotal]}>
                        <Text style={styles.billTotalLabel}>Total Amount</Text>
                        <Text style={styles.billTotalValue}>₹{grandTotal.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Payment method */}
                <View style={styles.section}>
                    <View style={styles.codCard}>
                        <Text style={styles.codIcon}>💵</Text>
                        <View>
                            <Text style={styles.codTitle}>Cash on Delivery</Text>
                            <Text style={styles.codSub}>Pay when your order arrives</Text>
                        </View>
                        <View style={styles.codCheck}><Text style={{ fontSize: 16 }}>✓</Text></View>
                    </View>
                    <View style={styles.invoiceNote}>
                        <Text style={styles.invoiceIcon}>📄</Text>
                        <Text style={styles.invoiceText}>Invoice will be available after delivery</Text>
                    </View>
                </View>

                {/* Secure checkout */}
                <View style={styles.secureRow}>
                    <Text style={styles.secureText}>🔒 Secure Order via Saraswati Medical</Text>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Place Order button */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.placeOrderBtn, placing && { opacity: 0.7 }]}
                    onPress={handlePlaceOrder}
                    disabled={placing}
                >
                    <Text style={styles.placeOrderText}>{placing ? 'Placing Order...' : 'Proceed to Checkout  →'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    emptyState: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
    emptyIcon: { fontSize: 64, marginBottom: SPACING.md },
    emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
    emptySub: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.xl, textAlign: 'center' },
    shopBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.round, paddingHorizontal: 28, paddingVertical: 14 },
    shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: 52, paddingBottom: SPACING.md },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    backIcon: { fontSize: 22, color: COLORS.textPrimary },
    headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
    trashBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
    trashIcon: { fontSize: 22 },

    progress: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginBottom: SPACING.lg, paddingHorizontal: SPACING.xl },
    progressItem: { alignItems: 'center', gap: 4 },
    progressDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    progressDotActive: { backgroundColor: COLORS.primary },
    progressDotText: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
    progressLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },

    section: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg, marginHorizontal: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.card },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.md },
    editText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },

    cartItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: SPACING.sm, borderTopWidth: 1, borderColor: COLORS.borderLight },
    cartItemImg: { width: 64, height: 64, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
    cartItemInfo: { flex: 1 },
    cartItemName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
    cartItemPack: { fontSize: 11, color: COLORS.textSecondary, marginVertical: 2 },
    cartItemPrice: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
    qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    qtyBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
    qtyBtnText: { fontSize: 20, color: COLORS.textPrimary, fontWeight: '300' },
    qtyValue: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, minWidth: 20, textAlign: 'center' },

    serviceRow: { flexDirection: 'row', gap: 12 },
    serviceCard: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', gap: 6, backgroundColor: COLORS.surface },
    serviceCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySurface },
    serviceIcon: { fontSize: 24 },
    serviceLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },

    fieldLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 4 },
    fieldInput: { backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.textPrimary },

    billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    billLabel: { fontSize: 13, color: COLORS.textSecondary },
    billValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
    billTotal: { borderTopWidth: 1, borderColor: COLORS.borderLight, paddingTop: 10, marginTop: 4 },
    billTotalLabel: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
    billTotalValue: { fontSize: 15, fontWeight: '800', color: COLORS.primary },

    codCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.successLight, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: 10 },
    codIcon: { fontSize: 24 },
    codTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
    codSub: { fontSize: 11, color: COLORS.textSecondary },
    codCheck: { marginLeft: 'auto', width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center' },
    invoiceNote: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    invoiceIcon: { fontSize: 16 },
    invoiceText: { fontSize: 12, color: COLORS.textSecondary },

    secureRow: { alignItems: 'center', marginBottom: SPACING.md },
    secureText: { fontSize: 12, color: COLORS.textMuted },

    prescriptionRequiredBox: {
        backgroundColor: '#FFF9F0', borderRadius: RADIUS.xl, padding: SPACING.lg, marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
        borderWidth: 1.5, borderColor: '#FFE4BC', ...SHADOW.small
    },
    prescHeader: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    prescIcon: { fontSize: 24 },
    prescTitle: { fontSize: 15, fontWeight: '800', color: '#855D1D' },
    prescSub: { fontSize: 11, color: '#A67B38', fontWeight: '600', marginTop: 2 },

    prescOptions: { gap: 10 },
    prescOption: {
        flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white,
        borderRadius: RADIUS.md, padding: 12, borderWidth: 1, borderColor: COLORS.borderLight
    },
    prescOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySurface },
    prescOptionIcon: { fontSize: 20 },
    prescOptionLabel: { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
    checkIcon: { fontSize: 16, color: COLORS.primary },

    uploadBtnSmall: { marginTop: 12, paddingVertical: 8, alignItems: 'center' },
    uploadBtnSmallText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.lg, borderTopWidth: 1, borderColor: COLORS.borderLight, backgroundColor: COLORS.surface },
    placeOrderBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.round, paddingVertical: 17, alignItems: 'center', ...SHADOW.card },
    placeOrderText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
