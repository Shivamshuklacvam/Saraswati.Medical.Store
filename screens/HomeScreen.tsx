import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, FlatList, ActivityIndicator, Dimensions, Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProducts } from '../firebase/db';
import { Product } from '../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type Props = { navigation: NativeStackNavigationProp<any> };

const CATEGORIES = [
    { name: 'Baby Care', icon: '👶', cat: 'Baby Care' },
    { name: 'Beauty', icon: '💆‍♀️', cat: 'Beauty' },
    { name: 'Wellness', icon: '🌿', cat: 'Wellness' },
];

export default function HomeScreen({ navigation }: Props) {
    const { userProfile } = useAuth();
    const { totalItems } = useCart();
    const [trending, setTrending] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProducts()
            .then(p => {
                setTrending(p.slice(0, 5)); // Just take a few for the trending row
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const initials = userProfile?.name
        ? userProfile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'SM';

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Header Sequence */}
                <View style={styles.headerArea}>
                    <View style={styles.topRow}>
                        <View>
                            <Text style={styles.brandTitle}>Saraswati Medical</Text>
                            <View style={styles.locationRow}>
                                <Feather name="map-pin" size={12} color={COLORS.secondary} />
                                <Text style={styles.locationText}>Main Market, Varanasi</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('Profile')}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.searchBar}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('Search')}
                    >
                        <View style={{ marginRight: 10 }}>
                            <Feather name="search" size={18} color={COLORS.textPrimary} />
                        </View>
                        <Text style={styles.searchPlaceholder}>Search medicines, baby care, beauty...</Text>
                    </TouchableOpacity>
                </View>

                {/* Hero Banner Area (Mocked with gradient to simulate photo) */}
                <View style={styles.heroContainer}>
                    <LinearGradient
                        colors={['#C1CCC0', '#E5E2D9']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.heroBanner}
                    >
                        <View style={styles.heroTag}>
                            <Text style={styles.heroTagText}>NEW ARRIVAL</Text>
                        </View>
                        <Text style={styles.heroTitle}>Gentle Baby Care</Text>
                        <Text style={styles.heroSubTitle}>Pure & safe for your little ones</Text>
                        <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('Search', { category: 'Baby Care' })}>
                            <Text style={styles.heroBtnText}>Explore Now</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                {/* Quick Actions (Circular Grid) */}
                <View style={styles.quickActionsRow}>
                    <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('MyOrders')}>
                        <View style={[styles.actionCircle, { backgroundColor: COLORS.tertiary }]}>
                            <Feather name="book-open" size={22} color={COLORS.black} />
                        </View>
                        <Text style={styles.actionLabel}>Prescription</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem} onPress={() => { }}>
                        <View style={[styles.actionCircle, { backgroundColor: COLORS.secondary }]}>
                            <Feather name="user-plus" size={22} color={COLORS.black} />
                        </View>
                        <Text style={styles.actionLabel}>Consult</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('MyOrders')}>
                        <View style={[styles.actionCircle, { backgroundColor: COLORS.primary }]}>
                            <Feather name="clock" size={22} color={COLORS.black} />
                        </View>
                        <Text style={styles.actionLabel}>Orders</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem} onPress={() => { }}>
                        <View style={[styles.actionCircle, { backgroundColor: COLORS.surface }]}>
                            <Ionicons name="wallet-outline" size={22} color={COLORS.black} />
                        </View>
                        <Text style={styles.actionLabel}>Wallet</Text>
                    </TouchableOpacity>
                </View>

                {/* Categories (Pills) */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Shop by Category</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity key={cat.name} style={styles.categoryPill} onPress={() => navigation.navigate('Search', { category: cat.cat })}>
                                <Text style={styles.pillEmoji}>{cat.icon}</Text>
                                <Text style={styles.pillText}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Trending Now */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Trending Now</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                            <Text style={styles.seeAllText}>View More</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
                            {trending.map(product => <TrendingProductCard key={product.id} product={product} navigation={navigation} />)}

                            {/* Dummy Card for visual padding if backend lacks items */}
                            {trending.length === 0 && (
                                <View style={styles.productCard}>
                                    <View style={styles.productImagePreview}><Text style={{ fontSize: 30 }}>🧴</Text></View>
                                    <Text style={styles.productName}>Baby Lotion</Text>
                                    <Text style={styles.productBrand}>Johnson's</Text>
                                    <View style={styles.productBottomRow}>
                                        <Text style={styles.productPrice}>$8.50</Text>
                                        <TouchableOpacity style={styles.productAddBtn}>
                                            <Feather name="plus" size={16} color={COLORS.white} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>

                {/* Health Insights Card */}
                <View style={[styles.section, { marginTop: 10 }]}>
                    <View style={styles.insightsCard}>
                        <View style={styles.insightsHeader}>
                            <View>
                                <Text style={styles.insightsTitle}>Your Health Insights</Text>
                                <Text style={styles.insightsSub}>Refill reminders & wellness score</Text>
                            </View>
                            <Feather name="percent" size={20} color={COLORS.primary} />
                        </View>

                        {/* Faux graph area */}
                        <View style={styles.graphContainer}>
                            {/* Faux curve using view styling */}
                            <View style={styles.graphCurve} />
                            <View style={styles.graphLabels}>
                                {['M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                    <Text key={i} style={styles.graphDay}>{d}</Text>
                                ))}
                            </View>
                        </View>

                        <View style={styles.insightsFooter}>
                            <Text style={styles.insightsFooterText}>Refill due in 3 days</Text>
                            <Text style={styles.insightsScore}>95%</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom Sticky Action Banner */}
            <View style={styles.bottomBannerContainer}>
                <View style={styles.bottomBanner}>
                    <View style={styles.bannerIconCircle}>
                        <Feather name="clock" size={20} color={COLORS.black} />
                    </View>
                    <View style={styles.bannerTextCol}>
                        <Text style={styles.bannerTitle}>Express Delivery</Text>
                        <Text style={styles.bannerSub}>Store pickup or Home delivery</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.quickOrderBtn}
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <Feather name="check-circle" size={14} color={COLORS.white} />
                        <Text style={styles.quickOrderText}>
                            {totalItems > 0 ? `${totalItems} Item${totalItems > 1 ? 's' : ''}` : 'Quick Order'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    );
}

// Sub-component for product cards
function TrendingProductCard({ product, navigation }: { product: Product, navigation: any }) {
    const { addToCart, items, updateQuantity } = useCart();

    const cartItem = items.find(i => i.productId === product.id);

    // Format price to match UI mockup style (dollars for visual accuracy to mockup, though codebase uses rupees. For realism matching mockup, prefixing with $ or just removing symbol entirely. We'll use ₹ for consistency with backend but format cleanly)
    return (
        <TouchableOpacity
            style={styles.productCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
        >
            <View style={styles.productImagePreview}>
                <Text style={{ fontSize: 40 }}>💊</Text>
            </View>
            <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.productBrand} numberOfLines={1}>{product.brand || 'Generic'}</Text>
            <View style={styles.productBottomRow}>
                <Text style={styles.productPrice}>₹{product.price.toFixed(2)}</Text>
                {cartItem ? (
                    <View style={styles.qtySelectorSmall}>
                        <TouchableOpacity
                            style={styles.qtyBtnXs}
                            onPress={() => updateQuantity(product.id, cartItem.quantity - 1)}
                        >
                            <Feather name="minus" size={14} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.qtyTextXs}>{cartItem.quantity}</Text>
                        <TouchableOpacity
                            style={styles.qtyBtnXs}
                            onPress={() => updateQuantity(product.id, cartItem.quantity + 1)}
                        >
                            <Feather name="plus" size={14} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.productAddBtn}
                        onPress={() => addToCart({
                            productId: product.id, productName: product.name, price: product.price, quantity: 1, packSize: product.packSize,
                            requiresPrescription: product.requiresPrescription
                        })}
                    >
                        <Feather name="plus" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Header
    headerArea: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    brandTitle: { fontSize: 24, fontWeight: '700', color: COLORS.black, letterSpacing: -0.5, marginBottom: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    locationText: { fontSize: 13, color: '#A59D96', fontWeight: '500' },
    avatarBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },

    // Search Bar
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceAlt,
        borderRadius: RADIUS.full, paddingHorizontal: 20, paddingVertical: 14,
        borderWidth: 1, borderColor: COLORS.borderLight,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1
    },
    searchPlaceholder: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },

    // Hero Banner
    heroContainer: { paddingHorizontal: 20, marginBottom: 30 },
    heroBanner: {
        borderRadius: 28, padding: 24, minHeight: 180, justifyContent: 'center',
        overflow: 'hidden', position: 'relative'
    },
    heroTag: { backgroundColor: COLORS.white, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, marginBottom: 12 },
    heroTagText: { fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.5 },
    heroTitle: { fontSize: 22, fontWeight: '700', color: '#3A4B3A', marginBottom: 6 },
    heroSubTitle: { fontSize: 13, color: '#5A6F5A', marginBottom: 16, maxWidth: '60%' },
    heroBtn: { backgroundColor: COLORS.black, alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.full },
    heroBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },

    // Quick Actions
    quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30, marginBottom: 40 },
    actionItem: { alignItems: 'center', gap: 10 },
    actionCircle: { width: 65, height: 65, borderRadius: 32.5, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    actionLabel: { fontSize: 12, fontWeight: '500', color: COLORS.textSecondary },

    // Sections
    section: { marginBottom: 35 },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black },
    seeAllText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

    // Categories
    categoryScroll: { paddingHorizontal: 20, gap: 12 },
    categoryPill: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: RADIUS.full, borderWidth: 1, borderColor: '#E5DED5',
        backgroundColor: COLORS.surfaceAlt
    },
    pillEmoji: { fontSize: 16 },
    pillText: { fontSize: 14, fontWeight: '600', color: COLORS.black },

    // Trending Products
    trendingScroll: { paddingHorizontal: 20, gap: 16 },
    productCard: {
        width: 150, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.xl,
        padding: 14, borderWidth: 1, borderColor: '#F2EBE3',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
    },
    productImagePreview: {
        width: '100%', height: 100, backgroundColor: '#EBE5DF',
        borderRadius: RADIUS.md, marginBottom: 15, alignItems: 'center', justifyContent: 'center'
    },
    productName: { fontSize: 15, fontWeight: '700', color: COLORS.black, marginBottom: 4 },
    productBrand: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 15 },
    productBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    productPrice: { fontSize: 16, fontWeight: '700', color: '#97A592' },
    productAddBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#A3B19B', alignItems: 'center', justifyContent: 'center' },

    qtySelectorSmall: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#A3B19B',
        borderRadius: RADIUS.full, paddingHorizontal: 4, height: 28,
        minWidth: 70, justifyContent: 'space-between',
    },
    qtyBtnXs: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
    qtyTextXs: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginHorizontal: 2 },

    // Insights Card
    insightsCard: {
        marginHorizontal: 20, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.xl,
        padding: 24, borderWidth: 1, borderColor: '#F2EBE3'
    },
    insightsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
    insightsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.black, marginBottom: 4 },
    insightsSub: { fontSize: 12, color: COLORS.textSecondary },

    graphContainer: { height: 100, marginBottom: 20, position: 'relative', overflow: 'hidden' },
    graphCurve: {
        position: 'absolute', bottom: 20, left: -20, right: -20, height: 70,
        backgroundColor: '#E8ECDF', borderTopLeftRadius: 100, borderTopRightRadius: 50,
        opacity: 0.8
    },
    graphLabels: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between' },
    graphDay: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },

    insightsFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    insightsFooterText: { fontSize: 13, color: '#D6AEAC', fontWeight: '600' },
    insightsScore: { fontSize: 18, fontWeight: '800', color: COLORS.black },

    // Bottom Banner
    bottomBannerContainer: {
        position: 'absolute', bottom: 20, left: 20, right: 20,
        backgroundColor: COLORS.secondary, borderRadius: RADIUS.full,
        padding: 8, paddingRight: 10,
        shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
    },
    bottomBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    bannerIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
    bannerTextCol: { flex: 1, paddingHorizontal: 12 },
    bannerTitle: { fontSize: 14, fontWeight: '700', color: COLORS.black, marginBottom: 2 },
    bannerSub: { fontSize: 10, color: '#5A4645', fontWeight: '500' },
    quickOrderBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.black, paddingHorizontal: 16, paddingVertical: 12, borderRadius: RADIUS.full },
    quickOrderText: { color: COLORS.white, fontSize: 12, fontWeight: '600' }
});
