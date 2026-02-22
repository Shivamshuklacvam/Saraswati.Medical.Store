import React, { useEffect, useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getProductById, createSubscription } from '../firebase/db';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

type Props = {
    navigation: NativeStackNavigationProp<any>;
    route: { params: { productId: string } };
};

export default function ProductDetailScreen({ navigation, route }: Props) {
    const { productId } = route.params;
    const { userProfile, updateProfile } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [expanded, setExpanded] = useState<string | null>('description');
    const [subscribing, setSubscribing] = useState(false);

    const { addToCart, items, updateQuantity, totalItems } = useCart();
    const cartItem = items.find(i => i.productId === productId);

    useEffect(() => {
        if (cartItem) {
            setQuantity(cartItem.quantity);
        }
    }, [cartItem]);

    useEffect(() => {
        getProductById(productId).then(p => { setProduct(p); setLoading(false); });
    }, [productId]);

    const isFavorite = useMemo(() =>
        userProfile?.favoriteIds?.includes(productId) || false,
        [userProfile?.favoriteIds, productId]);

    const toggleFavorite = async () => {
        if (!userProfile) {
            Alert.alert("Login Required", "Please sign in to favorite products.");
            return;
        }
        const currentFavs = userProfile.favoriteIds || [];
        const newFavs = isFavorite
            ? currentFavs.filter(id => id !== productId)
            : [...currentFavs, productId];

        try {
            await updateProfile({ favoriteIds: newFavs });
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        if (cartItem) {
            navigation.navigate('Cart');
            return;
        }
        addToCart({
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity,
            packSize: product.packSize,
            requiresPrescription: product.requiresPrescription
        });
    };

    const handleSubscribe = async () => {
        if (!userProfile) {
            Alert.alert("Login Required", "Please sign in to subscribe to products.");
            navigation.navigate('Profile');
            return;
        }
        if (!product) return;

        Alert.alert(
            "Confirm Subscription",
            `Do you want to subscribe to ${product.name} for monthly refills? You'll get an extra 15% discount on every refill.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Subscribe & Save",
                    onPress: async () => {
                        setSubscribing(true);
                        try {
                            const nextDate = new Date();
                            nextDate.setMonth(nextDate.getMonth() + 1);

                            await createSubscription({
                                userId: userProfile.id,
                                productId: product.id,
                                productName: product.name,
                                price: product.price * 0.85, // 15% discount
                                packSize: product.packSize,
                                frequency: 'monthly',
                                status: 'active',
                                nextRefillDate: nextDate,
                            });

                            Alert.alert(
                                "Subscribed!",
                                "Your monthly refill has been set up. You can manage it in My Subscriptions.",
                                [{ text: "View Subscriptions", onPress: () => navigation.navigate('MySubscriptions') }, { text: "OK" }]
                            );
                        } catch (e) {
                            Alert.alert("Error", "Failed to create subscription.");
                        } finally {
                            setSubscribing(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!product) return null;

    const discountPct = product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

    const sections = [
        { key: 'description', title: 'Product Summary', content: product.description ?? 'No description available.' },
        { key: 'uses', title: 'Uses', content: product.uses ?? 'No information available.' },
        { key: 'sideEffects', title: 'Side Effects', content: product.sideEffects ?? 'Consult your pharmacist.' },
        { key: 'safetyAdvice', title: 'Safety Advice', content: product.safetyAdvice ?? 'Always follow dosage instructions.' },
        { key: 'storage', title: 'Storage', content: product.storage ?? 'Store in a cool dry place.' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Top bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}>
                    <Text style={styles.topBtnIcon}>←</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={toggleFavorite} style={styles.topBtn}>
                        <Text style={[styles.topBtnIcon, { color: isFavorite ? COLORS.error : COLORS.textPrimary }]}>
                            {isFavorite ? '❤️' : '🤍'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.topBtn}>
                        <Text style={styles.topBtnIcon}>🛒</Text>
                        {totalItems > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{totalItems}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imgArea}>
                    <View style={styles.imgBox}><Text style={styles.imgEmoji}>💊</Text></View>
                    <View style={styles.etaBadge}>
                        <Text style={styles.etaText}>⚡ 15 MINS DELIVERY</Text>
                    </View>
                </View>

                <View style={styles.body}>
                    <View style={styles.titleRow}>
                        <Text style={styles.productName}>{product.name}</Text>
                        {product.requiresPrescription && (
                            <View style={styles.rxBadge}><Text style={styles.rxText}>📋 Rx</Text></View>
                        )}
                    </View>
                    <Text style={styles.packSize}>{product.packSize || '10 Tablets'}</Text>
                    <Text style={styles.brand}>{product.brand}</Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{product.price}</Text>
                        {product.mrp > product.price && (
                            <Text style={styles.mrp}>₹{product.mrp}</Text>
                        )}
                        {discountPct > 0 && (
                            <View style={styles.discountPill}><Text style={styles.discountPillText}>{discountPct}% OFF</Text></View>
                        )}
                    </View>

                    {/* Subscription Banner */}
                    <TouchableOpacity style={styles.subBanner} onPress={handleSubscribe} disabled={subscribing}>
                        <View style={styles.subLeft}>
                            <Text style={styles.subTitle}>Subscribe & Save 15%</Text>
                            <Text style={styles.subText}>Get automatic refills every 30 days</Text>
                        </View>
                        {subscribing ? (
                            <ActivityIndicator color="#854d0e" />
                        ) : (
                            <View style={styles.subAction}><Text style={styles.subActionText}>START</Text></View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.infoRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.totalLabel}>
                                {cartItem ? `Unit Price: ₹${product.price}` : `Total: ₹${(product.price * quantity).toFixed(2)}`}
                            </Text>
                            <Text style={styles.brand}>{product.brand}</Text>
                        </View>
                        {cartItem && (
                            <View style={styles.inBasketBadge}>
                                <Text style={styles.inBasketText}>IN BASKET</Text>
                            </View>
                        )}
                    </View>

                    {/* Accordion sections */}
                    {sections.map(sec => (
                        <TouchableOpacity
                            key={sec.key}
                            style={styles.accordion}
                            onPress={() => setExpanded(expanded === sec.key ? null : sec.key)}
                        >
                            <View style={styles.accordionHeader}>
                                <Text style={styles.accordionTitle}>{sec.title}</Text>
                                <Text style={styles.accordionIcon}>{expanded === sec.key ? '−' : '+'}</Text>
                            </View>
                            {expanded === sec.key && <Text style={styles.accordionContent}>{sec.content}</Text>}
                        </TouchableOpacity>
                    ))}

                    <View style={styles.disclaimer}>
                        <Text style={styles.disclaimerText}>
                            High-quality medicines from Saraswati Medical Store. 100% genuine products stored in temperature-controlled environments.
                        </Text>
                    </View>

                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                {cartItem ? (
                    <View style={styles.inCartContainer}>
                        <View style={styles.qtyPill}>
                            <TouchableOpacity
                                style={styles.qtyPillBtn}
                                onPress={() => updateQuantity(productId, cartItem.quantity - 1)}
                            >
                                <Text style={styles.qtyPillBtnText}>−</Text>
                            </TouchableOpacity>
                            <View style={styles.qtyPillValueBox}>
                                <Text style={styles.qtyPillValue}>{cartItem.quantity}</Text>
                                <Text style={styles.qtyPillLabel}>Units in Basket</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.qtyPillBtn}
                                onPress={() => updateQuantity(productId, cartItem.quantity + 1)}
                            >
                                <Text style={styles.qtyPillBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.btnGoToCartPremium}
                            onPress={() => navigation.navigate('Cart')}
                        >
                            <Text style={styles.btnGoToCartTextPremium}>GO TO CART →</Text>
                            <View style={styles.btnGoToPrice}>
                                <Text style={styles.btnGoToPriceText}>₹{(product.price * cartItem.quantity).toFixed(2)}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.btnPrimary} onPress={handleAddToCart}>
                        <View style={styles.btnPriceBox}>
                            <Text style={styles.btnPriceText}>₹{(product.price * quantity).toFixed(2)}</Text>
                            <Text style={styles.btnPriceSub}>Total Price</Text>
                        </View>
                        <Text style={styles.btnPrimaryText}>Add to Cart →</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 15 },
    topBtn: { width: 44, height: 44, backgroundColor: COLORS.white, borderRadius: 22, alignItems: 'center', justifyContent: 'center', ...SHADOW.small, position: 'relative' },
    topBtnIcon: { fontSize: 20 },
    badge: { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.error, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    badgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },

    imgArea: { alignItems: 'center', paddingVertical: 20, backgroundColor: COLORS.primarySurface, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    imgBox: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
    imgEmoji: { fontSize: 100 },
    etaBadge: { backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.round, ...SHADOW.small, marginTop: -10 },
    etaText: { fontSize: 10, fontWeight: '900', color: COLORS.warning },

    body: { paddingHorizontal: 24, paddingTop: 24 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    productName: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary, flex: 1, marginRight: 10 },
    rxBadge: { backgroundColor: COLORS.white, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.error },
    rxText: { fontSize: 10, fontWeight: 'bold', color: COLORS.error },
    packSize: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
    brand: { fontSize: 15, color: COLORS.primary, fontWeight: 'bold', marginTop: 4 },

    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    inBasketBadge: { backgroundColor: COLORS.successLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.sm },
    inBasketText: { fontSize: 10, fontWeight: 'bold', color: COLORS.success },

    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    price: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary },
    mrp: { fontSize: 18, color: COLORS.textMuted, textDecorationLine: 'line-through' },
    discountPill: { backgroundColor: COLORS.success, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
    discountPillText: { fontSize: 12, fontWeight: 'bold', color: COLORS.white },

    subBanner: {
        backgroundColor: COLORS.tertiary,
        borderRadius: RADIUS.lg,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        borderWidth: 1.5,
        borderColor: COLORS.borderLight
    },
    subLeft: { flex: 1 },
    subTitle: { fontSize: 16, fontWeight: '900', color: COLORS.onTertiary },
    subText: { fontSize: 12, color: COLORS.onTertiary, opacity: 0.7, marginTop: 2 },
    subAction: { backgroundColor: COLORS.onTertiary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.sm },
    subActionText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },

    qtySelector: { flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: COLORS.white, padding: 8, borderRadius: RADIUS.md, ...SHADOW.small },
    qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
    qtyBtnText: { fontSize: 20, fontWeight: '300', color: COLORS.textPrimary },
    qtyValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
    totalLabel: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary },

    accordion: { borderTopWidth: 1, borderColor: '#f0f0f0', paddingVertical: 18 },
    accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    accordionTitle: { fontSize: 15, fontWeight: '800', color: '#333' },
    accordionIcon: { fontSize: 18, color: '#999' },
    accordionContent: { fontSize: 14, color: '#666', lineHeight: 22, marginTop: 12 },

    disclaimer: { backgroundColor: '#f9f9f9', padding: 16, borderRadius: 16, marginTop: 20 },
    disclaimerText: { fontSize: 12, color: '#888', fontStyle: 'italic', lineHeight: 18 },

    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: COLORS.white,
        padding: 16, paddingBottom: 34, borderTopWidth: 1.5, borderColor: COLORS.borderLight,
        ...SHADOW.strong
    },
    btnPrimary: {
        height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.primary,
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20
    },
    btnPrimaryText: { color: COLORS.white, fontSize: 16, fontWeight: '900', flex: 1, textAlign: 'right' },
    btnPriceBox: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.2)', paddingRight: 15 },
    btnPriceText: { fontSize: 18, fontWeight: '900', color: COLORS.white },
    btnPriceSub: { fontSize: 10, color: COLORS.white, opacity: 0.8 },

    inCartContainer: { gap: 12 },
    qtyPill: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: COLORS.primarySurface, borderRadius: RADIUS.md,
        padding: 4, borderWidth: 1, borderColor: COLORS.primary + '30'
    },
    qtyPillBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: COLORS.white, ...SHADOW.small },
    qtyPillBtnText: { fontSize: 24, color: COLORS.primary, fontWeight: '300' },
    qtyPillValueBox: { alignItems: 'center' },
    qtyPillValue: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
    qtyPillLabel: { fontSize: 9, color: COLORS.primary, opacity: 0.7, marginTop: -2 },

    btnGoToCartPremium: {
        height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.primary,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20,
        ...SHADOW.card
    },
    btnGoToCartTextPremium: { color: COLORS.white, fontSize: 16, fontWeight: '900', flex: 1 },
    btnGoToPrice: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    btnGoToPriceText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
});
