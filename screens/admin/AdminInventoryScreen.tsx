import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getProducts, deleteProduct } from '../../firebase/db';
import { Product } from '../../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../../constants/theme';

type Props = {
    navigation: NativeStackNavigationProp<any>,
    route: { params?: { lowStockOnly?: boolean } }
};

export default function AdminInventoryScreen({ navigation, route }: Props) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [lowStockOnly, setLowStockOnly] = useState(route.params?.lowStockOnly || false);

    const fetchProducts = async () => {
        const p = await getProducts().catch(() => []);
        setProducts(p);
    };

    useEffect(() => {
        fetchProducts().finally(() => setLoading(false));
    }, []);

    const filtered = products.filter(p => {
        const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
        const matchesStock = !lowStockOnly || (p.stock !== undefined && p.stock <= 20);
        return matchesSearch && matchesStock;
    });

    const openAdd = () => { navigation.navigate('AdminAddProduct'); };
    const openEdit = (p: Product) => { navigation.navigate('AdminAddProduct', { product: p }); };

    const handleDelete = (product: Product) => {
        Alert.alert('Delete Product', `Delete "${product.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    await deleteProduct(product.id).catch(() => { });
                    fetchProducts();
                },
            },
        ]);
    };

    const lowStockCount = products.filter(p => p.stock !== undefined && p.stock <= 20).length;

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>{lowStockOnly ? 'Low Stock Alerts' : 'Inventory Control'}</Text>
                    <Text style={styles.pageSub}>Saraswati Medical Store Admin</Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <TouchableOpacity
                    style={[styles.statCard, !lowStockOnly && styles.statCardActive]}
                    onPress={() => setLowStockOnly(false)}
                >
                    <Text style={styles.statIcon}>📦</Text>
                    <Text style={styles.statValue}>{products.length}</Text>
                    <Text style={styles.statLabel}>Total Items</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.statCard, lowStockOnly && styles.statCardActive, { borderColor: COLORS.error }]}
                    onPress={() => setLowStockOnly(true)}
                >
                    <Text style={styles.statIcon}>⚠️</Text>
                    <Text style={[styles.statValue, { color: COLORS.error }]}>{lowStockCount}</Text>
                    <Text style={styles.statLabel}>Low Stock</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search medicine, SKU..."
                    placeholderTextColor={COLORS.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {loading ? (
                <ActivityIndicator color={COLORS.primary} style={{ margin: SPACING.xl }} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.sm, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📦</Text>
                            <Text style={styles.emptyTitle}>{lowStockOnly ? 'No Low Stock items' : 'No products yet'}</Text>
                            <Text style={styles.emptyText}>Tap "+ Add Medicine" to add your first product</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={[styles.productCard, item.stock !== undefined && item.stock <= 20 && styles.productCardLow]}>
                            <View style={styles.productLeft}>
                                <View style={styles.productImgBox}><Text style={{ fontSize: 24 }}>💊</Text></View>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                                    <Text style={styles.productSku}>{item.sku ? `SKU: ${item.sku}` : item.category}</Text>
                                    <View style={styles.productStockRow}>
                                        <Text style={[styles.productStock, item.stock !== undefined && item.stock <= 20 && { color: COLORS.error }]}>
                                            {item.stock} Units
                                        </Text>
                                        <Text style={styles.productPrice}> · ₹{item.price.toFixed(2)}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.productActions}>
                                <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}>
                                    <Text style={{ fontSize: 16 }}>✏️</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={openAdd}>
                <Text style={styles.fabText}>+ Add Medicine</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingTop: 52, paddingBottom: SPACING.md },
    backBtn: { width: 36, height: 36, justifyContent: 'center' },
    backIcon: { fontSize: 22, color: COLORS.textPrimary },
    pageTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
    pageSub: { fontSize: 12, color: COLORS.textSecondary },
    statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
    statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, ...SHADOW.card },
    statCardActive: { borderColor: COLORS.primary, borderWidth: 2 },
    statIcon: { fontSize: 24, marginBottom: 4 },
    statValue: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
    statLabel: { fontSize: 11, color: COLORS.textMuted },
    searchBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: SPACING.md, paddingVertical: 12, ...SHADOW.card },
    searchIcon: { fontSize: 18 },
    searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
    productCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.md, ...SHADOW.card },
    productCardLow: { borderWidth: 1.5, borderColor: COLORS.error + '44' },
    productLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    productImgBox: { width: 50, height: 50, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
    productInfo: { flex: 1 },
    productName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
    productSku: { fontSize: 11, color: COLORS.textMuted },
    productStockRow: { flexDirection: 'row', alignItems: 'center' },
    productStock: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
    productPrice: { fontSize: 13, color: COLORS.textSecondary },
    productActions: { gap: 6 },
    editBtn: { padding: 8, backgroundColor: COLORS.primarySurface, borderRadius: RADIUS.sm },
    deleteBtn: { padding: 8, backgroundColor: COLORS.errorLight, borderRadius: RADIUS.sm },
    emptyState: { alignItems: 'center', paddingTop: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
    emptyText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
    fab: { position: 'absolute', bottom: 24, alignSelf: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.round, paddingHorizontal: 28, paddingVertical: 14, ...SHADOW.strong },
    fabText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
