import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function SignInScreen({ navigation }: Props) {
    const { signIn, userProfile } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleSignIn = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await signIn(email.trim(), password);
            // Navigation handled by App.tsx based on userProfile.role
        } catch (error: any) {
            Alert.alert('Sign In Failed', error.message || 'Check your credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <StatusBar style="dark" />

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>

                <View style={styles.logoRow}>
                    <Text style={styles.logoIcon}>💊</Text>
                    <Text style={styles.logoText}>Saraswati Medical</Text>
                </View>

                <Text style={styles.heading}>Welcome back!</Text>
                <Text style={styles.subheading}>Sign in to continue shopping</Text>

                <View style={styles.form}>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="you@example.com"
                            placeholderTextColor={COLORS.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordRow}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Enter password"
                                placeholderTextColor={COLORS.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPass}
                            />
                            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                                <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.btnPrimary} onPress={handleSignIn} disabled={loading} activeOpacity={0.85}>
                        {loading ? (
                            <ActivityIndicator color={COLORS.textOnPrimary} />
                        ) : (
                            <Text style={styles.btnPrimaryText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.footerLink}>Create Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.md, paddingTop: 56 },

    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg, ...SHADOW.small },
    backIcon: { fontSize: 20, color: COLORS.textPrimary },

    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SPACING.lg },
    logoIcon: { fontSize: 32 },
    logoText: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },

    heading: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 8, letterSpacing: -0.5 },
    subheading: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.lg, fontWeight: '500' },

    form: { gap: SPACING.md },
    fieldGroup: { gap: 8 },
    label: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: {
        backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5,
        borderColor: COLORS.borderLight, paddingHorizontal: 16, paddingVertical: 14,
        fontSize: 15, color: COLORS.textPrimary, fontWeight: '600',
        ...SHADOW.small
    },
    passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    eyeBtn: { padding: 8 },
    eyeIcon: { fontSize: 20 },

    btnPrimary: {
        backgroundColor: COLORS.primary, borderRadius: RADIUS.round,
        paddingVertical: 18, alignItems: 'center', marginTop: SPACING.sm,
        ...SHADOW.strong,
    },
    btnPrimaryText: { color: COLORS.onPrimary, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
    footerText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
    footerLink: { fontSize: 14, color: COLORS.primary, fontWeight: '800' },
});
