import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, FlatList
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationRead } from '../firebase/db';
import { AppNotification } from '../types';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function NotificationsScreen({ navigation }: Props) {
    const { userProfile } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userProfile) {
            fetchNotifications();
        }
    }, [userProfile]);

    const fetchNotifications = async () => {
        if (!userProfile) return;
        setLoading(true);
        try {
            const data = await getNotifications(userProfile.id);
            setNotifications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRead = async (id: string) => {
        await markNotificationRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const formatDate = (date: any) => {
        if (!date) return '';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'order_update': return '📦';
            case 'prescription_update': return '📄';
            default: return '🔔';
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            {loading ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
            ) : notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🔔</Text>
                    <Text style={styles.emptyTitle}>No notifications yet</Text>
                    <Text style={styles.emptySub}>We'll notify you here for order updates and more.</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.notifCard, !item.read && styles.unreadCard]}
                            onPress={() => handleRead(item.id)}
                        >
                            <View style={styles.notifIconBox}>
                                <Text style={styles.notifIcon}>{getIcon(item.type)}</Text>
                            </View>
                            <View style={styles.notifContent}>
                                <View style={styles.notifTop}>
                                    <Text style={styles.notifTitle}>{item.title}</Text>
                                    {!item.read && <View style={styles.unreadDot} />}
                                </View>
                                <Text style={styles.notifMessage}>{item.message}</Text>
                                <Text style={styles.notifTime}>{formatDate(item.createdAt)}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
    backIcon: { fontSize: 20, color: COLORS.textPrimary },
    headerTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },

    list: { padding: 20 },
    notifCard: {
        flexDirection: 'row', gap: 16,
        backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16,
        marginBottom: 12, ...SHADOW.card,
        borderWidth: 1, borderColor: COLORS.borderLight
    },
    unreadCard: {
        backgroundColor: COLORS.primarySurface,
        borderColor: COLORS.primaryLight,
    },
    notifIconBox: { width: 50, height: 50, borderRadius: RADIUS.md, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
    notifIcon: { fontSize: 24 },
    notifContent: { flex: 1 },
    notifTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    notifTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
    notifMessage: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', lineHeight: 18, marginBottom: 8 },
    notifTime: { fontSize: 11, color: COLORS.textMuted, fontWeight: '700' },

    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyIcon: { fontSize: 64, opacity: 0.2, marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 8 },
    emptySub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '600' },
});
