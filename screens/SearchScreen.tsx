import React, { useEffect, useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, FlatList, ActivityIndicator, Dimensions,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getProducts } from '../firebase/db';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width * 0.75 - SPACING.lg * 2 - 12) / 2;

type Props = {
    navigation: NativeStackNavigationProp<any>;
    route?: { params?: { category?: string } };
};

const CATEGORIES = [
    { name: 'All', icon: '🏪' },
    { name: 'Medicines', icon: '💊' },
    { name: 'Baby Care', icon: '👶' },
    { name: 'Skin Care', icon: '🧴' },
    { name: 'Wellness', icon: '🌿' },
    { name: 'Devices', icon: '🌡️' },
];

const DOSAGE_FILERS = ['All', 'Tablet', 'Syrup', 'Capsule', 'Drops', 'Spray', 'Ointment'];

export default function SearchScreen({ navigation, route }: Props) {
    const defaultCategory = route?.params?.category || 'All';
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
    const [selectedDosage, setSelectedDosage] = useState('All');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();
    const { totalItems } = useCart();

    useEffect(() => {
        getProducts()
            .then(p => setProducts(p))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.brand.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

            // Basic dosage filtering logic (checks name or packSize for keywords)
            const matchesDosage = selectedDosage === 'All' ||
                p.name.toLowerCase().includes(selectedDosage.toLowerCase()) ||
                (p.packSize && p.packSize.toLowerCase().includes(selectedDosage.toLowerCase()));

            return matchesQuery && matchesCategory && matchesDosage;
        });
    }, [products, searchQuery, selectedCategory, selectedDosage]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Compact Header */}
            <View style={styles.headerArea}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.searchBarContainer}>
                    <View style={styles.searchBar}>
                        <Text style={styles.searchPlusIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for medicines..."
                            placeholderTextColor={COLORS.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>
                {totalItems > 0 && (
                    <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
                        <Text style={styles.cartIcon}>🛒</Text>
                        <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totalItems}</Text></View>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.mainLayout}>
                {/* Vertical Sidebar */}
                <View style={styles.sidebar}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat.name}
                                style={[
                                    styles.sidebarItem,
                                    selectedCategory === cat.name && styles.sidebarItemActive
                                ]}
                                onPress={() => {
                                    setSelectedCategory(cat.name);
                                    setSelectedDosage('All');
                                }}
                            >
                                <View style={[
                                    styles.sidebarIconBox,
                                    selectedCategory === cat.name && styles.sidebarIconBoxActive
                                ]}>
                                    <Text style={styles.sidebarEmoji}>{cat.icon}</Text>
                                </View>
                                <Text style={[
                                    styles.sidebarText,
                                    selectedCategory === cat.name && styles.sidebarTextActive
                                ]} numberOfLines={1}>{cat.name}</Text>
                                {selectedCategory === cat.name && <View style={styles.activeIndicator} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Content Area */}
                <View style={styles.content}>
                    {/* Horizontal Sub-filters */}
                    <View style={styles.filterRowContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                            {DOSAGE_FILERS.map(filter => (
                                <TouchableOpacity
                                    key={filter}
                                    style={[
                                        styles.filterChip,
                                        selectedDosage === filter && styles.filterChipActive
                                    ]}
                                    onPress={() => setSelectedDosage(filter)}
                                >
                                    <Text style={[
                                        styles.filterText,
                                        selectedDosage === filter && styles.filterTextActive
                                    ]}>{filter}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {loading ? (
                        <View style={styles.center}>
                            <ActivityIndicator color="#8BA68E" size="large" />
                        </View>
                    ) : filteredProducts.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🔍</Text>
                            <Text style={styles.emptyTitle}>Nothing found</Text>
                            <Text style={styles.emptySub}>Try another filter</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredProducts}
                            numColumns={2}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => <ProductGridItem item={item} navigation={navigation} />}
                            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
                            showsVerticalScrollIndicator={false}
                            columnWrapperStyle={styles.columnWrapper}
                        />
                    )}
                </View>
            </View>

            {/* FAB (Prescription) */}
            <TouchableOpacity
                style={[styles.miniFab, { bottom: Math.max(insets.bottom, 24) }]}
                onPress={() => navigation.navigate('PrescriptionUpload')}
                activeOpacity={0.9}
            >
                <Text style={styles.miniFabIcon}>📎</Text>
            </TouchableOpacity>
        </View>
    );
}

function ProductGridItem({ item, navigation }: { item: Product; navigation: any }) {
    const { addToCart, items, updateQuantity } = useCart();
    const cartItem = items.find(i => i.productId === item.id);
    // Simulate discrete delivery ETAs like Blinkit
    const eta = useMemo(() => Math.floor(Math.random() * 20) + 10, []);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                <Text style={styles.gridEmoji}>💊</Text>
                {item.stock < 10 && item.stock > 0 && (
                    <View style={styles.stockBadge}><Text style={styles.stockBadgeText}>Low Stock</Text></View>
                )}
            </View>

            <View style={styles.cardInfo}>
                <View style={styles.etaRow}>
                    <Text style={styles.etaIcon}>⚡</Text>
                    <Text style={styles.etaText}>{eta} MINS</Text>
                </View>

                <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.cardPack}>{item.packSize || '1 Unit'}</Text>

                <View style={styles.cardBottom}>
                    <View>
                        <Text style={styles.cardPrice}>₹{item.price}</Text>
                        {item.mrp > item.price && (
                            <Text style={styles.cardMrp}>₹{item.mrp}</Text>
                        )}
                    </View>

                    {cartItem ? (
                        <View style={styles.gridQtySelector}>
                            <TouchableOpacity
                                style={styles.gridQtyBtn}
                                onPress={() => updateQuantity(item.id, cartItem.quantity - 1)}
                            >
                                <Text style={styles.gridQtyText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.gridQtyValue}>{cartItem.quantity}</Text>
                            <TouchableOpacity
                                style={styles.gridQtyBtn}
                                onPress={() => updateQuantity(item.id, cartItem.quantity + 1)}
                            >
                                <Text style={styles.gridQtyText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.gridAddBtn, item.stock === 0 && { backgroundColor: COLORS.border }]}
                            onPress={() => item.stock > 0 && addToCart({
                                productId: item.id, productName: item.name, price: item.price, quantity: 1, packSize: item.packSize,
                                requiresPrescription: item.requiresPrescription
                            })}
                        >
                            <Text style={styles.gridAddBtnText}>{item.stock === 0 ? 'Out' : 'ADD'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

    headerArea: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingBottom: 12,
        borderBottomWidth: 1.5,
        borderBottomColor: COLORS.borderLight,
        backgroundColor: COLORS.background
    },
    backBtn: { padding: 8 },
    backIcon: { fontSize: 22, color: COLORS.textPrimary },
    searchBarContainer: { flex: 1, marginHorizontal: 8 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        ...SHADOW.small
    },
    searchPlusIcon: { fontSize: 16, opacity: 0.4, marginRight: 8, color: COLORS.textMuted },
    searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
    cartBtn: { padding: 8, position: 'relative' },
    cartIcon: { fontSize: 22 },
    cartBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: COLORS.error, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
    cartBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: 'bold' },

    mainLayout: { flex: 1, flexDirection: 'row' },

    // Sidebar Styles
    sidebar: { width: width * 0.22, backgroundColor: COLORS.borderLight, borderRightWidth: 1, borderRightColor: COLORS.border },
    sidebarItem: {
        alignItems: 'center',
        paddingVertical: 16,
        position: 'relative'
    },
    sidebarItemActive: { backgroundColor: COLORS.background },
    sidebarIconBox: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
        ...SHADOW.small, marginBottom: 6
    },
    sidebarIconBoxActive: { backgroundColor: COLORS.primarySurface },
    sidebarEmoji: { fontSize: 20 },
    sidebarText: { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 4 },
    sidebarTextActive: { color: COLORS.primary },
    activeIndicator: {
        position: 'absolute', right: 0, top: '25%', bottom: '25%',
        width: 3, backgroundColor: COLORS.primary, borderTopLeftRadius: 4, borderBottomLeftRadius: 4
    },

    // Content Styles
    content: { flex: 1 },
    filterRowContainer: { paddingVertical: 12, borderBottomWidth: 1.5, borderBottomColor: COLORS.borderLight, backgroundColor: COLORS.background },
    filterRow: { paddingHorizontal: 12, gap: 8 },
    filterChip: {
        paddingHorizontal: 16, paddingVertical: 6, borderRadius: RADIUS.round,
        borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white
    },
    filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
    filterTextActive: { color: COLORS.white },

    listContent: { padding: 12 },
    columnWrapper: { justifyContent: 'space-between', marginBottom: 12 },

    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
    emptyIcon: { fontSize: 40, marginBottom: 16, opacity: 0.3, color: COLORS.textMuted },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
    emptySub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },

    // Card Styles (Grid)
    card: {
        width: COLUMN_WIDTH,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        ...SHADOW.small
    },
    imageContainer: {
        height: 100,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    },
    gridEmoji: { fontSize: 48 },
    stockBadge: {
        position: 'absolute', top: 8, left: 8,
        backgroundColor: COLORS.white, paddingHorizontal: 6, paddingVertical: 2,
        borderRadius: 4, borderWidth: 1, borderColor: COLORS.warning
    },
    stockBadgeText: { fontSize: 8, fontWeight: 'bold', color: COLORS.warning },

    cardInfo: { padding: 8 },
    etaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    etaIcon: { fontSize: 10, color: COLORS.warning, marginRight: 2 },
    etaText: { fontSize: 9, fontWeight: 'bold', color: COLORS.textSecondary },
    cardName: { fontSize: 13, fontWeight: 'bold', color: COLORS.textPrimary, height: 36, lineHeight: 18 },
    cardPack: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, marginBottom: 8 },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardPrice: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary },
    cardMrp: { fontSize: 11, color: COLORS.textMuted, textDecorationLine: 'line-through' },
    gridAddBtn: {
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        borderRadius: RADIUS.xs,
        paddingHorizontal: 12,
        paddingVertical: 4
    },
    gridAddBtnText: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary },
    gridQtySelector: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
        borderRadius: RADIUS.xs,
        height: 32, minWidth: 70, justifyContent: 'space-between', paddingHorizontal: 4,
        borderWidth: 1.5, borderColor: COLORS.primary
    },
    gridQtyBtn: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
    gridQtyText: { color: COLORS.onPrimary, fontSize: 16, fontWeight: 'bold' },
    gridQtyValue: { color: COLORS.onPrimary, fontSize: 13, fontWeight: '900' },

    miniFab: {
        position: 'absolute', bottom: 30, right: 20,
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
        ...SHADOW.strong
    },
    miniFabIcon: { fontSize: 24, color: COLORS.white },
});
