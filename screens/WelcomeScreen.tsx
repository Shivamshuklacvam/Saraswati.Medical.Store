import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

const { width } = Dimensions.get('window');

type Props = {
    navigation: NativeStackNavigationProp<any>;
};

export default function WelcomeScreen({ navigation }: Props) {
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <StatusBar style="dark" />

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoBox}>
                        <View style={styles.pillIconSmall}>
                            <View style={[styles.pillHalf, { backgroundColor: '#F4BA44' }]} />
                            <View style={[styles.pillHalf, { backgroundColor: '#F25C54' }]} />
                        </View>
                    </View>
                    <View>
                        <Text style={styles.brandName}>Saraswati</Text>
                        <Text style={styles.brandYear}>ESTD 1998</Text>
                    </View>
                </View>

                {/* Hero Image Area */}
                <View style={styles.heroArea}>
                    <View style={styles.heroCircle} />

                    {/* Building Representation */}
                    <View style={styles.buildingContainer}>
                        <View style={styles.buildingRoof}>
                            <Text style={styles.building24}>24</Text>
                        </View>
                        <View style={styles.buildingBody}>
                            <View style={styles.blueWindow} />
                            <View style={styles.blueWindow} />
                        </View>
                    </View>

                    <View style={[styles.badge, styles.badgeTopLeft]}>
                        <Text style={styles.badgeIcon}>✅</Text>
                        <Text style={styles.badgeText}>100% Authentic</Text>
                    </View>
                    <View style={[styles.badge, styles.badgeRight]}>
                        <Text style={styles.badgeIcon}>🚚</Text>
                        <Text style={styles.badgeText}>Quick Delivery</Text>
                    </View>
                    <View style={[styles.badge, styles.badgeBottomLeft]}>
                        <Text style={styles.badgeIcon}>🎧</Text>
                        <Text style={styles.badgeText}>24/7 Support</Text>
                    </View>
                </View>

                {/* Tagline */}
                <View style={styles.taglineBlock}>
                    <Text style={styles.tagline}>Your Trusted Wellness{'\n'}Partner</Text>
                    <Text style={styles.taglineSub}>
                        Bridging the gap between traditional care and modern convenience. Get your healthcare essentials delivered to your doorstep.
                    </Text>
                </View>

                {/* CTA buttons */}
                <View style={styles.buttons}>
                    <TouchableOpacity
                        style={styles.btnPrimary}
                        onPress={() => navigation.navigate('Register')}
                        activeOpacity={0.88}
                    >
                        <Text style={styles.btnPrimaryText}>Start Shopping Now  →</Text>
                    </TouchableOpacity>

                    <View style={styles.rowBtns}>
                        <TouchableOpacity
                            style={styles.btnSecondary}
                            onPress={() => navigation.navigate('SignIn')}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.btnSecondaryText}>Sign In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.btnSecondary}
                            onPress={() => navigation.navigate('Register')}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.btnSecondaryText}>Create Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>10k+</Text>
                        <Text style={styles.statLabel}>Customers</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>500+</Text>
                        <Text style={styles.statLabel}>Brands</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>24h</Text>
                        <Text style={styles.statLabel}>Avg. Delivery</Text>
                    </View>
                </View>

                {/* Admin link */}
                <TouchableOpacity onPress={() => navigation.navigate('AdminSignIn')} style={styles.adminLink}>
                    <Text style={styles.adminLinkText}>Are you a staff member? </Text>
                    <Text style={[styles.adminLinkText, { color: COLORS.primary, fontWeight: '700' }]}>Admin Login</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { alignItems: 'center', paddingBottom: 60 },

    header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 60, marginBottom: 32 },
    logoBox: {
        width: 52, height: 52, borderRadius: RADIUS.md,
        backgroundColor: '#F3F6F4', alignItems: 'center', justifyContent: 'center',
        ...SHADOW.card,
    },
    pillIconSmall: { width: 32, height: 32, transform: [{ rotate: '45deg' }], borderRadius: 16, overflow: 'hidden' },
    pillHalf: { flex: 1 },
    brandName: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
    brandYear: { fontSize: 11, color: COLORS.textSecondary, letterSpacing: 2, fontWeight: '700', marginTop: -2 },

    heroArea: { width: width, height: 320, position: 'relative', marginBottom: 20, alignItems: 'center', justifyContent: 'center' },
    heroCircle: {
        width: 250, height: 250, borderRadius: 125,
        backgroundColor: COLORS.primaryLight,
    },
    buildingContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
    buildingRoof: { backgroundColor: COLORS.secondary, width: 50, height: 40, borderTopLeftRadius: 4, borderTopRightRadius: 4, alignItems: 'center', justifyContent: 'center' },
    building24: { color: '#fff', fontSize: 18, fontWeight: '900' },
    buildingBody: { backgroundColor: '#E0E0E0', width: 90, height: 50, flexDirection: 'row', padding: 8, gap: 4, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, borderTopWidth: 6, borderColor: COLORS.primary },
    blueWindow: { flex: 1, backgroundColor: '#00B4D8' },

    badge: {
        position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
        paddingHorizontal: 16, paddingVertical: 10,
        ...SHADOW.card,
    },
    badgeTopLeft: { top: 30, left: 40 },
    badgeRight: { right: 30, top: '40%' },
    badgeBottomLeft: { bottom: 30, left: 40 },
    badgeIcon: { fontSize: 14 },
    badgeText: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },

    taglineBlock: { paddingHorizontal: SPACING.xl, marginBottom: 32, width: '100%' },
    tagline: { fontSize: 32, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -1, marginBottom: 12, lineHeight: 38 },
    taglineSub: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 24, fontWeight: '500' },

    buttons: { width: '100%', paddingHorizontal: SPACING.md, gap: 16, marginBottom: 40 },
    btnPrimary: {
        backgroundColor: COLORS.primary, borderRadius: RADIUS.round,
        paddingVertical: 18, alignItems: 'center',
        ...SHADOW.strong,
    },
    btnPrimaryText: { color: COLORS.onPrimary, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
    rowBtns: { flexDirection: 'row', gap: 14 },
    btnSecondary: {
        flex: 1, borderRadius: RADIUS.round, borderWidth: 1.5,
        borderColor: COLORS.border, paddingVertical: 18, alignItems: 'center',
        backgroundColor: COLORS.surface,
    },
    btnSecondaryText: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },

    statsCard: {
        flexDirection: 'row', backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl, paddingVertical: 24, paddingHorizontal: SPACING.lg,
        marginHorizontal: SPACING.lg, marginBottom: 40,
        ...SHADOW.card,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 22, fontWeight: '900', color: COLORS.textMuted },
    statLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 4, fontWeight: '600' },
    statDivider: { width: 1, height: '60%', backgroundColor: '#E8E2DD', alignSelf: 'center' },

    adminLink: { flexDirection: 'row', alignItems: 'center' },
    adminLinkText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500' },
});
