import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
    TextInput, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../firebase/db';
import { Product } from '../../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

const EMPTY_PRODUCT: Omit<Product, 'id'> = {
    name: '', brand: '', category: 'Tablet', price: 0, mrp: 0,
    stock: 0, requiresPrescription: false,
};

const CATEGORIES = ['Tablet', 'Syrup', 'Capsule', 'Injection', 'Chewable', 'Gel', 'Device', 'Ayurvedic', 'Other'];

export default function AdminInventoryScreen({ navigation }: Props) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Partial<Product> & { id?: string }>(EMPTY_PRODUCT);
    const [saving, setSaving] = useState(false);

    const fetchProducts = async () => {
        const p = await getProducts().catch(() => []);
        setProducts(p);
    };

    useEffect(() => { fetchProducts().finally(() => setLoading(false)); }, []);

    const filtered = search.trim()
        ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))
        : products;

    const openAdd = () => { setEditProduct({ ...EMPTY_PRODUCT }); setShowModal(true); };
    const openEdit = (p: Product) => { setEditProduct({ ...p }); setShowModal(true); };

    const handleSave = async () => {
        if (!editProduct.name?.trim() || !editProduct.brand?.trim()) {
            Alert.alert('Validation', 'Name and Brand are required'); return;
        }
        if (!editProduct.price || editProduct.price <= 0) {
            Alert.alert('Validation', 'Price must be greater than 0'); return;
        }
        setSaving(true);
        try {
            const data = {
                name: editProduct.name!,
                brand: editProduct.brand!,
                category: editProduct.category ?? 'Tablet',
                price: Number(editProduct.price),
                mrp: Number(editProduct.mrp ?? editProduct.price),
                stock: Number(editProduct.stock ?? 0),
                requiresPrescription: editProduct.requiresPrescription ?? false,
                packSize: editProduct.packSize ?? '',
                salt: editProduct.salt ?? '',
                description: editProduct.description ?? '',
                uses: editProduct.uses ?? '',
                sideEffects: editProduct.sideEffects ?? '',
                storage: editProduct.storage ?? '',
                sku: editProduct.sku ?? '',
            };
            if (editProduct.id) {
                await updateProduct(editProduct.id, data);
                Alert.alert('Updated!', `${data.name} updated successfully`);
            } else {
                await addProduct(data);
                Alert.alert('Added!', `${data.name} added to inventory`);
            }
            setShowModal(false);
            fetchProducts();
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

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

    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 20).length;

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Inventory Control</Text>
                    <Text style={styles.pageSub}>Saraswati Medical Store Admin</Text>
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>📦</Text>
                    <Text style={styles.statValue}>{products.length}</Text>
                    <Text style={styles.statLabel}>Total Items</Text>
                </View>
                <View style={[styles.statCard, { borderColor: COLORS.error }]}>
                    <Text style={styles.statIcon}>⚠️</Text>
                    <Text style={[styles.statValue, { color: COLORS.error }]}>{lowStock}</Text>
                    <Text style={styles.statLabel}>Low Stock</Text>
                </View>
            </View>

            {/* Search */}
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

            {/* Products list */}
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
                            <Text style={styles.emptyTitle}>No products yet</Text>
                            <Text style={styles.emptyText}>Tap "+ Add Medicine" to add your first product</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={[styles.productCard, item.stock <= 20 && item.stock > 0 && styles.productCardLow]}>
                            <View style={styles.productLeft}>
                                <View style={styles.productImgBox}><Text style={{ fontSize: 24 }}>💊</Text></View>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                                    <Text style={styles.productSku}>{item.sku ? `SKU: ${item.sku}` : item.category}</Text>
                                    <View style={styles.productStockRow}>
                                        <Text style={[styles.productStock, item.stock <= 20 && { color: COLORS.error }]}>
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

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={openAdd}>
                <Text style={styles.fabText}>+ Add Medicine</Text>
            </TouchableOpacity>

            {/* Add/Edit Modal */}
            <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
                <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{editProduct.id ? 'Edit Product' : 'Add New Medicine'}</Text>
                        <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalClose}>
                            <Text style={{ fontSize: 20, color: COLORS.textMuted }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {[
                        { label: 'Medicine Name *', key: 'name', placeholder: 'e.g. Paracetamol 500mg' },
                        { label: 'Brand *', key: 'brand', placeholder: 'e.g. Cipla' },
                        { label: 'Salt / Composition', key: 'salt', placeholder: 'e.g. Paracetamol' },
                        { label: 'Pack Size', key: 'packSize', placeholder: 'e.g. Strip of 10 Tablets' },
                        { label: 'SKU', key: 'sku', placeholder: 'e.g. MED-001' },
                    ].map(f => (
                        <View style={styles.field} key={f.key}>
                            <Text style={styles.fieldLabel}>{f.label}</Text>
                            <TextInput
                                style={styles.fieldInput}
                                placeholder={f.placeholder}
                                placeholderTextColor={COLORS.textMuted}
                                value={String((editProduct as any)[f.key] ?? '')}
                                onChangeText={val => setEditProduct(prev => ({ ...prev, [f.key]: val }))}
                            />
                        </View>
                    ))}

                    {/* Category */}
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.catChip, editProduct.category === cat && styles.catChipActive]}
                                    onPress={() => setEditProduct(prev => ({ ...prev, category: cat }))}
                                >
                                    <Text style={[styles.catChipText, editProduct.category === cat && { color: '#fff' }]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Numeric fields */}
                    {[
                        { label: 'Price (₹) *', key: 'price', placeholder: '0.00' },
                        { label: 'MRP (₹)', key: 'mrp', placeholder: '0.00' },
                        { label: 'Stock (units) *', key: 'stock', placeholder: '0' },
                    ].map(f => (
                        <View style={styles.field} key={f.key}>
                            <Text style={styles.fieldLabel}>{f.label}</Text>
                            <TextInput
                                style={styles.fieldInput}
                                placeholder={f.placeholder}
                                placeholderTextColor={COLORS.textMuted}
                                value={String((editProduct as any)[f.key] ?? '')}
                                onChangeText={val => setEditProduct(prev => ({ ...prev, [f.key]: val === '' ? '' : Number(val) }))}
                                keyboardType="numeric"
                            />
                        </View>
                    ))}

                    {/* Description */}
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Product Description</Text>
                        <TextInput
                            style={[styles.fieldInput, styles.textArea]}
                            placeholder="Describe what this medicine is used for..."
                            placeholderTextColor={COLORS.textMuted}
                            value={editProduct.description ?? ''}
                            onChangeText={val => setEditProduct(prev => ({ ...prev, description: val }))}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    {/* Rx required */}
                    <TouchableOpacity
                        style={styles.rxToggle}
                        onPress={() => setEditProduct(prev => ({ ...prev, requiresPrescription: !prev.requiresPrescription }))}
                    >
                        <Text style={styles.rxToggleText}>Prescription Required?</Text>
                        <View style={[styles.rxToggleBox, editProduct.requiresPrescription && { backgroundColor: COLORS.primary }]}>
                            <Text style={{ fontSize: 16 }}>{editProduct.requiresPrescription ? '✓' : ''}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editProduct.id ? 'Update Product' : 'Add to Inventory'}</Text>}
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </Modal>
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

    modal: { flex: 1, backgroundColor: COLORS.background },
    modalContent: { padding: SPACING.lg },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
    modalClose: { padding: 8 },

    field: { marginBottom: SPACING.md },
    fieldLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
    fieldInput: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: SPACING.md, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary },
    textArea: { minHeight: 80, textAlignVertical: 'top' },

    catChip: { borderRadius: RADIUS.round, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: COLORS.surface },
    catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    catChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },

    rxToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
    rxToggleText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
    rxToggleBox: { width: 32, height: 32, borderRadius: RADIUS.sm, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },

    saveBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.round, paddingVertical: 17, alignItems: 'center', ...SHADOW.card },
    saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
