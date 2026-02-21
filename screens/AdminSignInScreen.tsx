import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

// Admin credentials are verified via Firebase Auth + user role in Firestore
// To create an admin, register normally then manually set role:"admin" in Firebase Console
export default function AdminSignInScreen({ navigation }: Props) {
    const { signIn, userProfile } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdminSignIn = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await signIn(email.trim(), password);
            // Navigation is handled by App.tsx based on userProfile.role
        } catch (error: any) {
            Alert.alert('Sign In Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <StatusBar style="dark" />

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>

                <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeIcon}>🛡️</Text>
                    <Text style={styles.adminBadgeText}>Staff / Admin Portal</Text>
                </View>

                <Text style={styles.heading}>Admin Sign In</Text>
                <Text style={styles.subheading}>Restricted to Saraswati Medical staff only</Text>

                <View style={styles.form}>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Admin Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="admin@saraswati.com"
                            placeholderTextColor={COLORS.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter admin password"
                            placeholderTextColor={COLORS.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.btnPrimary} onPress={handleAdminSignIn} disabled={loading} activeOpacity={0.85}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.btnPrimaryText}>Sign In as Admin</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoIcon}>ℹ️</Text>
                    <Text style={styles.infoText}>
                        To create an admin account: register normally, then go to Firebase Console → Firestore → users → [your UID] → set role to "admin"
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.lg, paddingTop: 56 },
    backBtn: { width: 40, height: 40, justifyContent: 'center', marginBottom: SPACING.xl },
    backIcon: { fontSize: 24, color: COLORS.textPrimary },

    adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.round, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start', marginBottom: SPACING.lg },
    adminBadgeIcon: { fontSize: 18 },
    adminBadgeText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },

    heading: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
    subheading: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.xl },

    form: { gap: SPACING.md },
    fieldGroup: { gap: 6 },
    label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
    input: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: SPACING.md, paddingVertical: 14, fontSize: 15, color: COLORS.textPrimary },
    btnPrimary: { backgroundColor: COLORS.primaryDark, borderRadius: RADIUS.round, paddingVertical: 18, alignItems: 'center', marginTop: SPACING.sm, ...SHADOW.card },
    btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    infoBox: { flexDirection: 'row', gap: 10, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.lg, padding: SPACING.md, marginTop: SPACING.xl },
    infoIcon: { fontSize: 18 },
    infoText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 19 },
});
