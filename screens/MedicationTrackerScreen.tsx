import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<any> };

const { width } = Dimensions.get('window');

// Mock Data
const DATES = [
    { day: 'Wed', date: '21', active: false },
    { day: 'Thu', date: '22', active: false },
    { day: 'Fri', date: '23', active: true }, // Active Date
    { day: 'Sat', date: '24', active: false },
    { day: 'Sun', date: '25', active: false },
];

type BasicMed = { id: string; name: string; dosage: string; instruction: string; taken: boolean; };
const MEDS: Record<'morning' | 'afternoon' | 'evening', BasicMed[]> = {
    morning: [
        { id: '1', name: 'Gilenya', dosage: '0.5mg', instruction: '1 pill', taken: true },
        { id: '2', name: 'Alendronate', dosage: '10mg', instruction: '1 pill', taken: false },
    ],
    afternoon: [
        { id: '3', name: 'Aspirin', dosage: '81mg', instruction: '1 pill', taken: false },
    ],
    evening: []
};

export default function MedicationTrackerScreen({ navigation }: Props) {
    const [meds, setMeds] = useState(MEDS);

    const toggleMed = (timeOfDay: keyof typeof MEDS, id: string) => {
        setMeds(prev => {
            const newMeds = { ...prev };
            newMeds[timeOfDay] = newMeds[timeOfDay].map(m =>
                m.id === id ? { ...m, taken: !m.taken } : m
            );
            return newMeds;
        });
    };

    const totalMeds = Object.values(meds).flat().length;
    const takenMeds = Object.values(meds).flat().filter(m => m.taken).length;
    const progress = totalMeds === 0 ? 0 : (takenMeds / totalMeds) * 100;

    const renderMedCard = (timeOfDay: keyof typeof MEDS, med: any) => (
        <TouchableOpacity
            key={med.id}
            style={styles.medCard}
            onPress={() => toggleMed(timeOfDay, med.id)}
            activeOpacity={0.8}
        >
            <View style={styles.medIconWrapper}>
                <Text style={{ fontSize: 24 }}>💊</Text>
            </View>
            <View style={styles.medInfo}>
                <Text style={styles.medName}>{med.name} <Text style={styles.medDosage}>{med.dosage}</Text></Text>
                <Text style={styles.medInstruction}>{med.instruction}</Text>
            </View>
            <View style={[styles.medCheckbox, med.taken && styles.medCheckboxActive]}>
                {med.taken && <Feather name="check" size={16} color={COLORS.white} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <View style={styles.headerTabs}>
                    <Text style={[styles.headerTab, styles.headerTabActive]}>Activity</Text>
                    <Text style={styles.headerTab}>Details</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Date Selector */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dateScroll}
                >
                    {DATES.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.dateBubble, item.active && styles.dateBubbleActive]}
                        >
                            <Text style={[styles.dateDay, item.active && styles.dateDayActive]}>{item.day}</Text>
                            <Text style={[styles.dateNum, item.active && styles.dateNumActive]}>{item.date}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <View>
                        <Text style={styles.summaryTitle}>{takenMeds} of {totalMeds} completed</Text>
                        <Text style={styles.summarySub}>Your daily medication</Text>
                    </View>
                    {/* Faux Circular Progress */}
                    <View style={styles.progressCircle}>
                        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                    </View>
                </View>

                {/* Timeline - Morning */}
                <View style={styles.timelineSection}>
                    <View style={styles.timelineHeaderRow}>
                        <Text style={styles.timelineTitle}>Morning</Text>
                        <Text style={styles.timelineTime}>8:00 AM</Text>
                    </View>
                    {meds.morning.map(med => renderMedCard('morning', med))}
                </View>

                {/* Timeline - Afternoon */}
                {meds.afternoon.length > 0 && (
                    <View style={styles.timelineSection}>
                        <View style={styles.timelineHeaderRow}>
                            <Text style={styles.timelineTitle}>Afternoon</Text>
                            <Text style={styles.timelineTime}>2:00 PM</Text>
                        </View>
                        {meds.afternoon.map(med => renderMedCard('afternoon', med))}
                    </View>
                )}

                {/* Timeline - Evening */}
                {meds.evening.length > 0 && (
                    <View style={styles.timelineSection}>
                        <View style={styles.timelineHeaderRow}>
                            <Text style={styles.timelineTitle}>Evening</Text>
                            <Text style={styles.timelineTime}>8:00 PM</Text>
                        </View>
                        {meds.evening.map(med => renderMedCard('evening', med))}
                    </View>
                )}
            </ScrollView>

            {/* Floating Add Button */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('AddMedication')}
            >
                <Feather name="plus" size={30} color={COLORS.white} />
            </TouchableOpacity>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    backBtn: { padding: 8, marginRight: 15, marginLeft: -8 },
    headerTabs: { flexDirection: 'row', gap: 24 },
    headerTab: { fontSize: 24, fontWeight: '700', color: COLORS.textMuted },
    headerTabActive: { color: COLORS.black },

    // Date Scroller
    dateScroll: { paddingHorizontal: 20, paddingVertical: 20, gap: 12 },
    dateBubble: {
        alignItems: 'center', justifyContent: 'center',
        width: 55, height: 75, borderRadius: 30,
        backgroundColor: COLORS.surfaceAlt,
        borderWidth: 1, borderColor: '#F2EBE3'
    },
    dateBubbleActive: { backgroundColor: COLORS.black, borderColor: COLORS.black },
    dateDay: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4, fontWeight: '500' },
    dateDayActive: { color: '#A0A0A0' },
    dateNum: { fontSize: 18, fontWeight: '700', color: COLORS.black },
    dateNumActive: { color: COLORS.white },

    // Summary Card
    summaryCard: {
        marginHorizontal: 20, backgroundColor: COLORS.surfaceAlt,
        borderRadius: RADIUS.lg, padding: 20, marginBottom: 30,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderColor: '#F2EBE3',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1
    },
    summaryTitle: { fontSize: 18, fontWeight: '800', color: COLORS.black, marginBottom: 4 },
    summarySub: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
    progressCircle: {
        width: 60, height: 60, borderRadius: 30,
        borderWidth: 4, borderColor: COLORS.primary,
        borderTopColor: '#EBE5DF', alignItems: 'center', justifyContent: 'center'
    },
    progressText: { fontSize: 14, fontWeight: '800', color: COLORS.black },

    // Timeline Sections
    timelineSection: { paddingHorizontal: 20, marginBottom: 30 },
    timelineHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 },
    timelineTitle: { fontSize: 20, fontWeight: '700', color: COLORS.black },
    timelineTime: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600', paddingBottom: 2 },

    // Medication Cards
    medCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
        padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2
    },
    medIconWrapper: {
        width: 50, height: 50, borderRadius: 16,
        backgroundColor: '#F5E6E6', alignItems: 'center', justifyContent: 'center',
        marginRight: 16
    },
    medInfo: { flex: 1 },
    medName: { fontSize: 16, fontWeight: '700', color: COLORS.black, marginBottom: 4 },
    medDosage: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
    medInstruction: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },

    medCheckbox: {
        width: 28, height: 28, borderRadius: 14,
        borderWidth: 2, borderColor: '#EBE5DF',
        alignItems: 'center', justifyContent: 'center'
    },
    medCheckboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

    // FAB
    fab: {
        position: 'absolute', bottom: 30, right: 20,
        backgroundColor: COLORS.black,
        width: 60, height: 60, borderRadius: 30,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5
    }
});
