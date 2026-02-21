import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image,
    Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, RADIUS, SHADOW } from '../../constants/theme';
import { updateProduct, getProducts } from '../../firebase/db';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function AdminScanBillScreen({ navigation }: Props) {
    const [image, setImage] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [results, setResults] = useState<{ id: string, name: string, qty: number }[] | null>(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera access is required to scan bills.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            handleScan();
        }
    };

    const handleScan = () => {
        setScanning(true);
        // Simulate OCR Delay
        setTimeout(async () => {
            const products = await getProducts();
            // Simulate extracted data from bill
            setResults([
                { id: products[0]?.id || '1', name: products[0]?.name || 'Dolo 650', qty: 50 },
                { id: products[1]?.id || '2', name: products[1]?.name || 'Azithromycin', qty: 20 },
                { id: products[2]?.id || '3', name: products[2]?.name || 'Limcee 500', qty: 100 },
            ]);
            setScanning(false);
        }, 3000);
    };

    const confirmUpdate = async () => {
        if (!results) return;
        try {
            await Promise.all(results.map(r => updateProduct(r.id, { stock: r.qty } as any)));
            Alert.alert('Inventory Updated', 'Stock quantities have been updated successfully.');
            navigation.goBack();
        } catch (e) {
            Alert.alert('Error', 'Failed to update inventory.');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
                <Text style={styles.title}>Scan Purchase Bill</Text>
            </View>

            <View style={styles.warningBanner}>
                <Text style={styles.warningText}>⚠️ OCR is currently in Beta/Simulation mode</Text>
            </View>

            {scanning ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.scanText}>Simulating OCR Extraction...</Text>
                    <Text style={styles.scanSub}>Reading product details and quantities</Text>
                </View>
            ) : results ? (
                <View style={{ flex: 1 }}>
                    <ScrollView style={styles.resultsList}>
                        <Text style={styles.sectionTitle}>Extracted Items</Text>
                        {results.map((item, idx) => (
                            <View key={idx} style={styles.resultItem}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemSub}>ID: {item.id.slice(-6).toUpperCase()}</Text>
                                </View>
                                <View style={styles.qtyBox}>
                                    <Text style={styles.qtyText}>+ {item.qty}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                    <View style={styles.bottomBar}>
                        <TouchableOpacity style={styles.confirmBtn} onPress={confirmUpdate}>
                            <Text style={styles.confirmText}>Bulk Update Inventory</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.center}>
                    <View style={styles.scanBox}>
                        <View style={styles.scanLine} />
                        <Text style={{ fontSize: 40 }}>📄</Text>
                    </View>
                    <Text style={styles.instruction}>Place the bill within the frame to scan details automatically</Text>
                    <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
                        <Text style={styles.pickBtnText}>Capture Bill Image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.manualBtn}
                        onPress={() => navigation.navigate('AdminInventory')}
                    >
                        <Text style={styles.manualBtnText}>Enter Stock Manually</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
    backIcon: { fontSize: 24, color: COLORS.textPrimary },
    title: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    scanBox: { width: 200, height: 260, borderWidth: 2, borderColor: COLORS.primary, borderRadius: 20, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
    scanLine: { position: 'absolute', width: '90%', height: 2, backgroundColor: COLORS.primary, opacity: 0.5, top: '50%' },
    instruction: { textAlign: 'center', color: COLORS.textSecondary, marginBottom: 30, fontSize: 14, lineHeight: 22 },
    pickBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 16, borderRadius: RADIUS.round, ...SHADOW.card },
    pickBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    scanText: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginTop: 20 },
    scanSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 8 },
    resultsList: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 20 },
    resultItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: RADIUS.md, marginBottom: 12, ...SHADOW.small },
    itemName: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
    itemSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    qtyBox: { backgroundColor: COLORS.successLight, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
    qtyText: { color: COLORS.success, fontWeight: '900', fontSize: 13 },
    bottomBar: { padding: 20, borderTopWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
    confirmBtn: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: RADIUS.round, alignItems: 'center' },
    confirmText: { color: '#fff', fontWeight: '900', fontSize: 16 },
    warningBanner: { backgroundColor: '#FFF9C4', padding: 10, alignItems: 'center' },
    warningText: { fontSize: 12, fontWeight: '700', color: '#F57F17' },
    manualBtn: { marginTop: 20 },
    manualBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 14, textDecorationLine: 'underline' },
});
