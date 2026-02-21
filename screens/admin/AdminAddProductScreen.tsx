import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addProduct, updateProduct } from '../../firebase/db';
import { Product } from '../../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../../constants/theme';

type Props = {
    navigation: NativeStackNavigationProp<any>,
    route: { params?: { product?: Product } }
};

const CATEGORIES = ['Tablet', 'Syrup', 'Capsule', 'Injection', 'Chewable', 'Gel', 'Device', 'Ayurvedic', 'Other'];

export default function AdminAddProductScreen({ navigation, route }: Props) {
    const existingProduct = route.params?.product;
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<Partial<Product>>(existingProduct || {
        name: '', brand: '', category: 'Tablet', price: 0, mrp: 0,
        stock: 0, requiresPrescription: false, sku: `MED-${Math.floor(Math.random() * 9000) + 1000}`
    });

    const handleSave = async () => {
        if (!form.name?.trim() || !form.brand?.trim() || !form.price) {
            Alert.alert('Missing Fields', 'Please fill name, brand and price.');
            return;
        }
        setSaving(true);
        try {
            const data = {
                ...form,
                price: Number(form.price),
                mrp: Number(form.mrp || form.price),
                stock: Number(form.stock || 0),
            } as any;

            if (existingProduct) {
                await updateProduct(existingProduct.id, data);
                Alert.alert('Success', 'Product updated successfully');
            } else {
                await addProduct(data);
                Alert.alert('Success', 'New product added to inventory');
            }
            navigation.goBack();
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{existingProduct ? 'Edit Product' : 'Add New Medicine'}</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.field}>
                    <Text style={styles.label}>Product Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={form.name}
                        onChangeText={t => setForm(p => ({ ...p, name: t }))}
                        placeholder="e.g. Dolo 650"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Brand *</Text>
                    <TextInput
                        style={styles.input}
                        value={form.brand}
                        onChangeText={t => setForm(p => ({ ...p, brand: t }))}
                        placeholder="e.g. Micro Labs"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>SKU (Auto-generated)</Text>
                    <TextInput
                        style={[styles.input, { color: COLORS.textMuted }]}
                        value={form.sku}
                        onChangeText={t => setForm(p => ({ ...p, sku: t }))}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.field, { flex: 1 }]}>
                        <Text style={styles.label}>Price (₹) *</Text>
                        <TextInput
                            style={styles.input}
                            value={String(form.price || '')}
                            onChangeText={t => setForm(p => ({ ...p, price: Number(t) }))}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.field, { flex: 1 }]}>
                        <Text style={styles.label}>MRP (₹)</Text>
                        <TextInput
                            style={styles.input}
                            value={String(form.mrp || '')}
                            onChangeText={t => setForm(p => ({ ...p, mrp: Number(t) }))}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Stock Quantity</Text>
                    <TextInput
                        style={styles.input}
                        value={String(form.stock || '')}
                        onChangeText={t => setForm(p => ({ ...p, stock: Number(t) }))}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.catRow}>
                        {CATEGORIES.slice(0, 5).map(c => (
                            <TouchableOpacity
                                key={c}
                                style={[styles.catChip, form.category === c && styles.catChipActive]}
                                onPress={() => setForm(p => ({ ...p, category: c }))}
                            >
                                <Text style={[styles.catChipText, form.category === c && { color: '#fff' }]}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.rxRow}
                    onPress={() => setForm(p => ({ ...p, requiresPrescription: !p.requiresPrescription }))}
                >
                    <Text style={styles.rxLabel}>Prescription Required?</Text>
                    <View style={[styles.rxBox, form.requiresPrescription && { backgroundColor: COLORS.primary }]}>
                        {form.requiresPrescription && <Text style={{ color: '#fff' }}>✓</Text>}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{existingProduct ? 'Save Changes' : 'Add Medicine'}</Text>}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
    backBtn: { padding: 4 },
    backIcon: { fontSize: 24, color: COLORS.textPrimary },
    title: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary },
    form: { padding: 20 },
    field: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8 },
    input: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: 14, borderWidth: 1, borderColor: COLORS.border, fontSize: 15 },
    row: { flexDirection: 'row', gap: 15 },
    catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
    catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    catChipText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
    rxRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: RADIUS.md, marginBottom: 30, borderWidth: 1, borderColor: COLORS.border },
    rxLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
    rxBox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    saveBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.round, paddingVertical: 16, alignItems: 'center', ...SHADOW.card },
    saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
