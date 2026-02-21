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

export default function RegisterScreen({ navigation }: Props) {
    const { signUp } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await signUp(email.trim(), password, name.trim(), 'customer');
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message || 'Please try again');
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

                <Text style={styles.heading}>Create Account</Text>
                <Text style={styles.subheading}>Join 10,000+ customers</Text>

                <View style={styles.form}>
                    {[
                        { label: 'Full Name *', value: name, setter: setName, placeholder: 'Enter your name', keyboard: 'default' as const },
                        { label: 'Email Address *', value: email, setter: setEmail, placeholder: 'you@example.com', keyboard: 'email-address' as const },
                        { label: 'Phone Number', value: phone, setter: setPhone, placeholder: '+91 XXXXX XXXXX', keyboard: 'phone-pad' as const },
                    ].map(field => (
                        <View style={styles.fieldGroup} key={field.label}>
                            <Text style={styles.label}>{field.label}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={field.placeholder}
                                placeholderTextColor={COLORS.textMuted}
                                value={field.value}
                                onChangeText={field.setter}
                                keyboardType={field.keyboard}
                                autoCapitalize={field.keyboard === 'email-address' ? 'none' : 'words'}
                            />
                        </View>
                    ))}

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Password *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Minimum 6 characters"
                            placeholderTextColor={COLORS.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
                        {loading ? (
                            <ActivityIndicator color={COLORS.textOnPrimary} />
                        ) : (
                            <Text style={styles.btnPrimaryText}>Create Account  →</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                        <Text style={styles.footerLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.md, paddingTop: 56, paddingBottom: 40 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg, ...SHADOW.small },
    backIcon: { fontSize: 20, color: COLORS.textPrimary },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SPACING.lg },
    logoIcon: { fontSize: 32 },
    logoText: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
    heading: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 8, letterSpacing: -1 },
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
