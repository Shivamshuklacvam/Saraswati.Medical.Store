import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function HelpSupportScreen({ navigation }: Props) {
    const faqs = [
        { q: "How long does delivery take?", a: "Standard delivery takes 1-2 hours within Varanasi city limits." },
        { q: "Is prescription mandatory?", a: "Only for medicines categorized as Schedule H or H1. Our pharmacist will verify upon upload." },
        { q: "How to return an item?", a: "Sealed items can be returned within 2 days of delivery with the original invoice." },
    ];

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.contactSection}>
                    <Text style={styles.label}>GET IN TOUCH</Text>
                    <View style={styles.contactRow}>
                        <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('tel:+910000000000')}>
                            <Text style={styles.contactIcon}>📞</Text>
                            <Text style={styles.contactLabel}>Call Support</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('mailto:support@saraswati.com')}>
                            <Text style={styles.contactIcon}>📧</Text>
                            <Text style={styles.contactLabel}>Email Us</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.whatsappBtn}>
                        <Text style={styles.whatsAppIcon}>💬</Text>
                        <Text style={styles.whatsAppText}>Chat on WhatsApp</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.faqSection}>
                    <Text style={styles.label}>FREQUENTLY ASKED</Text>
                    {faqs.map((item, idx) => (
                        <View key={idx} style={styles.faqCard}>
                            <Text style={styles.faqQ}>{item.q}</Text>
                            <Text style={styles.faqA}>{item.a}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Saraswati Medical Store</Text>
                    <Text style={styles.footerSub}>Serving Health Since 1998</Text>
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
    contactSection: { marginBottom: 32 },
    label: { fontSize: 11, fontWeight: '900', color: COLORS.textMuted, letterSpacing: 1.5, marginBottom: 16 },
    contactRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
    contactCard: { flex: 1, backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', ...SHADOW.card },
    contactIcon: { fontSize: 24, marginBottom: 8 },
    contactLabel: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },

    whatsappBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
        backgroundColor: '#25D366', borderRadius: RADIUS.round, padding: 18, ...SHADOW.card
    },
    whatsAppIcon: { fontSize: 20, color: '#fff' },
    whatsAppText: { color: '#fff', fontWeight: '900', fontSize: 15 },

    faqSection: { marginBottom: 32 },
    faqCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 12, ...SHADOW.card },
    faqQ: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
    faqA: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, fontWeight: '600' },

    footer: { alignItems: 'center', paddingVertical: 20, opacity: 0.5 },
    footerText: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
    footerSub: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, marginTop: 4 },
});
