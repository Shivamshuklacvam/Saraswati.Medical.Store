import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Dimensions, NativeSyntheticEvent, NativeScrollEvent
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

const CAROUSEL_DATA = [
    {
        id: '1',
        tag: 'NEW ARRIVAL',
        title: 'Gentle Baby Care',
        subtitle: 'Pure & safe for your little ones',
        colors: ['#C1CCC0', '#E5E2D9'] as const,
        btnText: 'Explore Now',
        category: 'Baby Care',
        tagColor: COLORS.primary
    },
    {
        id: '2',
        tag: 'SPECIAL OFFER',
        title: 'Flat 20% Off',
        subtitle: 'On premium wellness products',
        colors: ['#D6AEAC', '#F2E4E4'] as const,
        btnText: 'Shop Sale',
        category: 'Wellness',
        tagColor: '#8B5A58'
    },
    {
        id: '3',
        tag: 'ANNOUNCEMENT',
        title: 'Free Delivery',
        subtitle: 'On all orders above ₹500 today',
        colors: ['#E5D5C5', '#F5EEE6'] as const,
        btnText: 'Order Now',
        category: null,
        tagColor: '#8B6A4C'
    }
];

export default function HomeScreen({ navigation }: Props) {
    const { userProfile } = useAuth();
    const { totalItems } = useCart();
    const [trending, setTrending] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeBanner, setActiveBanner] = useState(0);
    const [intakeLogged, setIntakeLogged] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    const onBannerScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        setActiveBanner(Math.round(index));
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const nextIndex = (activeBanner + 1) % CAROUSEL_DATA.length;
                scrollRef.current.scrollTo({ x: nextIndex * (width - 40), animated: true });
                setActiveBanner(nextIndex);
            }
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [activeBanner]);

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

                {/* Hero Banner Area (Carousel) */}
                <View style={styles.heroContainer}>
                    <ScrollView
                        ref={scrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={onBannerScroll}
                        scrollEventThrottle={16}
                    >
                        {CAROUSEL_DATA.map((item) => (
                            <View key={item.id} style={{ width: width - 40 }}>
                                <LinearGradient
                                    colors={item.colors}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={styles.heroBanner}
                                >
                                    <View style={styles.heroTag}>
                                        <Text style={[styles.heroTagText, { color: item.tagColor }]}>{item.tag}</Text>
                                    </View>
                                    <Text style={styles.heroTitle}>{item.title}</Text>
                                    <Text style={styles.heroSubTitle}>{item.subtitle}</Text>
                                    <TouchableOpacity
                                        style={styles.heroBtn}
                                        onPress={() => item.category ? navigation.navigate('Search', { category: item.category }) : navigation.navigate('Cart')}
                                    >
                                        <Text style={styles.heroBtnText}>{item.btnText}</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Pagination Dots */}
                    <View style={styles.paginationContainer}>
                        {CAROUSEL_DATA.map((_, i) => (
                            <View key={i} style={[styles.dot, activeBanner === i ? styles.activeDot : {}]} />
                        ))}
                    </View>
                </View>

                {/* Quick Actions (Circular Grid) */}
                <View style={styles.quickActionsRow}>
                    <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('MedicationTracker')}>
                        <View style={[styles.actionCircle, { backgroundColor: COLORS.tertiary }]}>
                            <Feather name="activity" size={22} color={COLORS.black} />
                        </View>
                        <Text style={styles.actionLabel}>Tracker</Text>
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
                            {trending.map(product => <TrendingProductCard key={`trending-${product.id}`} product={product} navigation={navigation} />)}

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

                {/* Top Rated Wellness */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Top Rated Wellness</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                            <Text style={styles.seeAllText}>View More</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
                            {[...trending].reverse().map(product => <TrendingProductCard key={`wellness-${product.id}`} product={product} navigation={navigation} />)}

                            {/* Dummy Card for visual padding if backend lacks items */}
                            {trending.length === 0 && (
                                <View style={styles.productCard}>
                                    <View style={styles.productImagePreview}><Text style={{ fontSize: 30 }}>💊</Text></View>
                                    <Text style={styles.productName}>Multivitamin</Text>
                                    <Text style={styles.productBrand}>Nutrilite</Text>
                                    <View style={styles.productBottomRow}>
                                        <Text style={styles.productPrice}>$18.00</Text>
                                        <TouchableOpacity style={styles.productAddBtn}>
                                            <Feather name="plus" size={16} color={COLORS.white} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>

                {/* Interactive Medication Tracker */}
                <View style={[styles.section, { marginTop: 10 }]}>
                    <View style={styles.trackerCard}>
                        <View style={styles.trackerHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.trackerTitle}>Medication Tracker</Text>
                                <Text style={styles.trackerSub} numberOfLines={1}>Vitamin C - 500mg</Text>
                            </View>
                            <View style={styles.trackerBadge}>
                                <Text style={styles.trackerBadgeText}>12 Doses Left</Text>
                            </View>
                        </View>

                        <View style={styles.trackerDaysRow}>
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
                                const isToday = index === 3; // Mock Thursday as today
                                const isPast = index < 3;

                                return (
                                    <View key={index} style={styles.trackerDayCol}>
                                        <Text style={[styles.trackerDayText, isToday && styles.trackerDayTextActive]}>{day}</Text>
                                        <View style={[
                                            styles.trackerCircle,
                                            isPast || (isToday && intakeLogged) ? styles.trackerCircleDone :
                                                isToday ? styles.trackerCircleToday : styles.trackerCircleFuture
                                        ]}>
                                            {(isPast || (isToday && intakeLogged)) && <Feather name="check" size={12} color={COLORS.white} />}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        {!intakeLogged ? (
                            <TouchableOpacity
                                style={styles.trackerLogBtn}
                                onPress={() => setIntakeLogged(true)}
                            >
                                <Feather name="check-circle" size={16} color={COLORS.white} />
                                <Text style={styles.trackerLogBtnText}>Log Today's Intake</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.trackerLoggedState}>
                                <Feather name="check-circle" size={16} color={COLORS.success} />
                                <Text style={styles.trackerLoggedText}>Intake logged for today. Great job!</Text>
                            </View>
                        )}
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
    paginationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E0DCD3' },
    activeDot: { width: 14, height: 6, backgroundColor: COLORS.primary },

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

    // Tracker Card
    trackerCard: {
        marginHorizontal: 20, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.xl,
        padding: 20, borderWidth: 1, borderColor: '#F2EBE3',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1
    },
    trackerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    trackerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.black, marginBottom: 4 },
    trackerSub: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
    trackerBadge: { backgroundColor: '#F0F4EE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.sm },
    trackerBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },

    trackerDaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 4 },
    trackerDayCol: { alignItems: 'center', gap: 8 },
    trackerDayText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
    trackerDayTextActive: { color: COLORS.black, fontWeight: '800' },
    trackerCircle: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    trackerCircleDone: { backgroundColor: COLORS.primary },
    trackerCircleToday: { backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.primary },
    trackerCircleFuture: { backgroundColor: '#F0EFEA', borderWidth: 1, borderColor: '#E5DED5' },

    trackerLogBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.black, paddingVertical: 14, borderRadius: RADIUS.full },
    trackerLogBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
    trackerLoggedState: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#EDF3EC', paddingVertical: 14, borderRadius: RADIUS.full, borderWidth: 1, borderColor: '#DCE5DB' },
    trackerLoggedText: { color: '#4A5B46', fontSize: 12, fontWeight: '600' },

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
