import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, FlatList, ActivityIndicator, Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProducts } from '../firebase/db';
import { Product } from '../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

const { width } = Dimensions.get('window');

type Props = { navigation: NativeStackNavigationProp<any> };

const TOP_NAV = [
    { icon: '💊', label: 'Medicines', cat: 'Medicines' },
    { icon: '🛡️', label: 'Wellness', cat: 'Wellness' },
    { icon: '👶', label: 'Baby Care', cat: 'Baby Care' },
    { icon: '🧴', label: 'Skin Care', cat: 'Beauty' },
];

const SHOP_CATEGORIES = [
    { name: 'Cough & Cold', icon: '🌡️', cat: 'Medicines' },
    { name: 'Diabetes Care', icon: '💉', cat: 'Wellness' },
    { name: 'Multivitamins', icon: '💊', cat: 'Wellness' },
    { name: 'Pain Relief', icon: '🤕', cat: 'Medicines' },
    { name: 'Baby Care', icon: '👶', cat: 'Baby Care' },
    { name: 'Derma Care', icon: '🧴', cat: 'Beauty' },
    { name: 'Cardiac Care', icon: '❤️', cat: 'Medicines' },
    { name: 'Eye & Ear', icon: '👁️', cat: 'Medicines' },
];

export default function HomeScreen({ navigation }: Props) {
    const { userProfile } = useAuth();
    const { totalItems } = useCart();
    const [essential, setEssential] = useState<Product[]>([]);
    const [trending, setTrending] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProducts()
            .then(p => {
                setEssential(p.filter(item => !item.requiresPrescription).slice(0, 5));
                setTrending(p.slice(5, 12));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const initials = userProfile?.name
        ? userProfile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'SS';

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>

                {/* Combined Sticky Header */}
                <View style={styles.stickyHeader}>
                    {/* Top Location Bar */}
                    <View style={styles.topBar}>
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            onPress={() => navigation.navigate('ManageAddress')}
                        >
                            <View style={styles.locationRow}>
                                <Text style={styles.pinIcon}>📍</Text>
                                <Text style={styles.locationTitle}>
                                    {userProfile?.address ? 'Delivering to Home' : 'Set Address'}
                                </Text>
                                <Text style={styles.locationArrow}>▼</Text>
                            </View>
                            <Text style={styles.addressLine} numberOfLines={1}>
                                {userProfile?.address
                                    ? `${userProfile.address.line1}, ${userProfile.address.city}`
                                    : 'Please add a delivery address'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
                            <Text style={styles.profileInitials}>{initials}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sticky Search Area */}
                    <View style={styles.searchSection}>
                        <TouchableOpacity
                            style={styles.searchBar}
                            onPress={() => navigation.navigate('Search')}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.searchIcon}>🔍</Text>
                            <Text style={styles.searchPlaceholder}>Search "paracetamol 500"</Text>
                            <Text style={styles.micIcon}>🎙️</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Horizontal Top Nav */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topNavRow}>
                        {TOP_NAV.map(item => (
                            <TouchableOpacity
                                key={item.label}
                                style={styles.navItem}
                                onPress={() => navigation.navigate('Search', { category: item.cat })}
                            >
                                <View style={styles.navIconBox}><Text style={styles.navEmoji}>{item.icon}</Text></View>
                                <Text style={styles.navLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Hero Banner (Blinkit Style) */}
                <View style={styles.promoBanner}>
                    <View style={styles.promoLeft}>
                        <Text style={styles.promoTag}>GET 100% GENUINE</Text>
                        <Text style={styles.promoTitle}>Prescription <Text style={{ color: '#2e7d32' }}>medicines</Text></Text>
                        <View style={styles.promoBadge}>
                            <Text style={styles.promoBadgeText}>FREE Doctor consultation after ordering</Text>
                        </View>
                    </View>
                    <View style={styles.promoRight}>
                        <Text style={styles.promoEmoji}>💊</Text>
                    </View>
                </View>

                {/* Shop by Category Grid */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shop by category</Text>
                    <View style={styles.categoryGrid}>
                        {SHOP_CATEGORIES.map(item => (
                            <TouchableOpacity
                                key={item.name}
                                style={styles.catGridItem}
                                onPress={() => navigation.navigate('Search', { category: item.cat })}
                            >
                                <View style={styles.catImgBox}>
                                    <Text style={{ fontSize: 32 }}>{item.icon}</Text>
                                </View>
                                <Text style={styles.catName}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Essential Medicines */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Essential medicines</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                            <Text style={styles.seeAllText}>See all products</Text>
                        </TouchableOpacity>
                    </View>
                    {loading ? (
                        <ActivityIndicator color="#2e7d32" style={{ height: 200 }} />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
                            {essential.map(p => <ProductCardSquare key={p.id} product={p} navigation={navigation} />)}
                        </ScrollView>
                    )}
                </View>

                {/* Trending Skincare */}
                <View style={[styles.section, { backgroundColor: '#fdfcf0', paddingVertical: 20 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Hair & Skin care</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                            <Text style={styles.seeAllText}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
                        {trending.map(p => <ProductCardSquare key={p.id} product={p} navigation={navigation} />)}
                    </ScrollView>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Floating Cart */}
            {totalItems > 0 && (
                <TouchableOpacity style={styles.fabCart} onPress={() => navigation.navigate('Cart')}>
                    <View style={styles.fabLeft}>
                        <Text style={styles.fabTopText}>{totalItems} ITEMS</Text>
                        <Text style={styles.fabBottomText}>View Cart</Text>
                    </View>
                    <Text style={styles.fabIcon}>🛒</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

function ProductCardSquare({ product, navigation }: { product: Product; navigation: any }) {
    const { addToCart, items, updateQuantity } = useCart();
    const cartItem = items.find(i => i.productId === product.id);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
        >
            <View style={styles.cardTop}>
                <Text style={{ fontSize: 40 }}>💊</Text>
                {cartItem ? (
                    <View style={styles.qtySelector}>
                        <TouchableOpacity
                            style={styles.qtyBtnSmall}
                            onPress={() => updateQuantity(product.id, cartItem.quantity - 1)}
                        >
                            <Text style={styles.qtyBtnTextSmall}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyTextSmall}>{cartItem.quantity}</Text>
                        <TouchableOpacity
                            style={styles.qtyBtnSmall}
                            onPress={() => updateQuantity(product.id, cartItem.quantity + 1)}
                        >
                            <Text style={styles.qtyBtnTextSmall}>+</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.cardAddBtn}
                        onPress={() => addToCart({
                            productId: product.id, productName: product.name, price: product.price, quantity: 1, packSize: product.packSize,
                            requiresPrescription: product.requiresPrescription
                        })}
                    >
                        <Text style={styles.cardAddText}>ADD</Text>
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.cardInfo}>
                <Text style={styles.cardEta}>⚡ 15 MINS</Text>
                <Text style={styles.cardName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.cardPack}>{product.packSize || '1 Unit'}</Text>
                <Text style={styles.cardPrice}>₹{product.price}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Sticky Header Container
    stickyHeader: {
        backgroundColor: COLORS.background,
        zIndex: 10,
        ...SHADOW.small,
    },

    // Header
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingTop: 50,
        paddingBottom: SPACING.xs
    },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    pinIcon: { fontSize: 16 },
    locationTitle: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary },
    locationArrow: { fontSize: 10, color: COLORS.textSecondary },
    addressLine: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, width: width * 0.7 },
    profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', ...SHADOW.small },
    profileInitials: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },

    // Search
    searchSection: { backgroundColor: COLORS.background, paddingHorizontal: SPACING.md, paddingVertical: 10 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1.5,
        borderColor: COLORS.borderLight,
        ...SHADOW.small
    },
    searchIcon: { fontSize: 18, color: COLORS.textMuted, marginRight: 10 },
    searchPlaceholder: { flex: 1, fontSize: 14, color: COLORS.textMuted, fontWeight: '500' },
    micIcon: { fontSize: 18, color: COLORS.primary },

    // Top Nav
    topNavRow: { paddingHorizontal: 12, paddingVertical: 15, gap: 12 },
    navItem: { alignItems: 'center', width: 70 },
    navIconBox: {
        width: 50, height: 50, borderRadius: RADIUS.md,
        backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
        marginBottom: 6, borderWidth: 1, borderColor: COLORS.borderLight
    },
    navEmoji: { fontSize: 24 },
    navLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },

    // Promo
    promoBanner: {
        marginHorizontal: SPACING.md,
        backgroundColor: COLORS.primarySurface,
        borderRadius: RADIUS.lg,
        flexDirection: 'row',
        padding: 20,
        marginBottom: 30,
        borderWidth: 1.5,
        borderColor: COLORS.borderLight
    },
    promoLeft: { flex: 1 },
    promoTag: { fontSize: 10, fontWeight: 'bold', color: COLORS.primaryDark, marginBottom: 4 },
    promoTitle: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 10 },
    promoBadge: { backgroundColor: COLORS.tertiary, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
    promoBadgeText: { fontSize: 10, fontWeight: 'bold', color: COLORS.onTertiary },
    promoRight: { width: 80, alignItems: 'center', justifyContent: 'center' },
    promoEmoji: { fontSize: 60 },

    // Category Grid
    section: { paddingHorizontal: SPACING.md, marginBottom: 30 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary },
    seeAllText: { fontSize: 13, color: COLORS.primary, fontWeight: 'bold' },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    catGridItem: { width: (width - 48 - 36) / 4, alignItems: 'center', marginBottom: 15 },
    catImgBox: {
        width: '100%', height: 75, backgroundColor: COLORS.white,
        borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center',
        marginBottom: 8, borderWidth: 1, borderColor: COLORS.borderLight
    },
    catName: { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center' },

    // Horizontal Product List
    hList: { paddingRight: 32, gap: 16 },
    card: {
        width: 140,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        padding: 10,
        ...SHADOW.small
    },
    cardTop: {
        height: 100,
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 10
    },
    cardAddBtn: {
        position: 'absolute', bottom: -8, right: -4,
        backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.primary,
        borderRadius: RADIUS.xs, paddingHorizontal: 12, paddingVertical: 4,
        ...SHADOW.small
    },
    cardAddText: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary },
    // Qty Selector for Cards
    qtySelector: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md, paddingHorizontal: 4, paddingVertical: 4, ...SHADOW.small,
        minWidth: 70, justifyContent: 'space-between',
        position: 'absolute', bottom: -8, right: -4,
    },
    qtyBtnSmall: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
    qtyBtnTextSmall: { color: COLORS.onPrimary, fontSize: 16, fontWeight: 'bold' },
    qtyTextSmall: { color: COLORS.onPrimary, fontSize: 13, fontWeight: '900', marginHorizontal: 4 },
    cardInfo: {},
    cardEta: { fontSize: 9, fontWeight: 'bold', color: COLORS.warning, marginBottom: 4 },
    cardName: { fontSize: 12, fontWeight: 'bold', color: COLORS.textPrimary, height: 34 },
    cardPack: { fontSize: 10, color: COLORS.textSecondary, marginVertical: 4 },
    cardPrice: { fontSize: 14, fontWeight: '900', color: COLORS.textPrimary },

    // FAB
    fabCart: {
        position: 'absolute', bottom: 20, left: SPACING.md, right: SPACING.md,
        backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: 16,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        ...SHADOW.strong
    },
    fabLeft: {},
    fabTopText: { color: COLORS.onPrimary, fontSize: 11, fontWeight: 'bold', opacity: 0.8 },
    fabBottomText: { color: COLORS.onPrimary, fontSize: 16, fontWeight: '900' },
    fabIcon: { fontSize: 24, color: COLORS.onPrimary },
});
