import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function PaymentSettingsScreen({ navigation }: Props) {
    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payments</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>SAVED METHODS</Text>

                    <View style={styles.emptyMethod}>
                        <Text style={styles.emptyIcon}>💳</Text>
                        <Text style={styles.emptyText}>No cards or UPI IDs saved</Text>
                        <Text style={styles.emptySub}>Save your payment methods for faster checkout next time.</Text>
                    </View>

                    <TouchableOpacity style={styles.addBtn}>
                        <Text style={styles.addIcon}>+</Text>
                        <Text style={styles.addText}>Add New Payment Method</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>PAYMENT OPTIONS</Text>
                    {[
                        { id: 'upi', label: 'UPI (GPay, PhonePe)', icon: '📱' },
                        { id: 'card', label: 'Debit / Credit Card', icon: '💳' },
                        { id: 'cod', label: 'Cash on Delivery', icon: '💵', active: true },
                    ].map(item => (
                        <View key={item.id} style={styles.methodRow}>
                            <View style={styles.iconCircle}><Text>{item.icon}</Text></View>
                            <Text style={styles.methodLabel}>{item.label}</Text>
                            {item.active && <View style={styles.activeBadge}><Text style={styles.activeText}>Always Enabled</Text></View>}
                        </View>
                    ))}
                </View>

                <View style={styles.securityBox}>
                    <Text style={styles.securityText}>🛡️ Saraswati Medical uses bank-grade security for your payments. We never store your CVV or PIN.</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
    backIcon: { fontSize: 20, color: COLORS.textPrimary },
    headerTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },

    content: { padding: 20 },
    section: { marginBottom: 32 },
    sectionLabel: { fontSize: 11, fontWeight: '900', color: COLORS.textMuted, letterSpacing: 1, marginBottom: 16 },

    emptyMethod: {
        backgroundColor: '#fff', borderRadius: 24, padding: 32,
        alignItems: 'center', justifyContent: 'center', ...SHADOW.card, marginBottom: 16
    },
    emptyIcon: { fontSize: 40, marginBottom: 12, opacity: 0.3 },
    emptyText: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
    emptySub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '600' },

    addBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        backgroundColor: COLORS.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: COLORS.border
    },
    addIcon: { fontSize: 20, color: COLORS.primary, fontWeight: '700' },
    addText: { fontSize: 14, fontWeight: '800', color: COLORS.primary },

    methodRow: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, ...SHADOW.card
    },
    iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    methodLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
    activeBadge: { backgroundColor: COLORS.successLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    activeText: { fontSize: 9, fontWeight: '900', color: COLORS.success },

    securityBox: { backgroundColor: '#F0F4F1', borderRadius: 20, padding: 16, marginTop: 12 },
    securityText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18, fontWeight: '600', textAlign: 'center' },
});
