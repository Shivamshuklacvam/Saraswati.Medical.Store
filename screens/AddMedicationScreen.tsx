import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
    SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { addMedication } from '../firebase/db';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function AddMedicationScreen({ navigation }: Props) {
    const { user } = useAuth();

    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [instruction, setInstruction] = useState('1 pill');
    const [totalPills, setTotalPills] = useState('30');

    // Schedule Toggles
    const [morning, setMorning] = useState(false);
    const [afternoon, setAfternoon] = useState(false);
    const [evening, setEvening] = useState(false);

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim() || !dosage.trim() || !totalPills.trim()) {
            Alert.alert('Details Missing', 'Please provide the medication name, dosage, and total inventory.');
            return;
        }
        if (!morning && !afternoon && !evening) {
            Alert.alert('Schedule Missing', 'Please select at least one time of day to take this medication.');
            return;
        }
        if (!user) {
            Alert.alert('Error', 'You must be logged in to save medications.');
            return;
        }

        setSaving(true);
        try {
            await addMedication({
                userId: user.uid,
                name: name.trim(),
                dosage: dosage.trim(),
                instruction: instruction.trim(),
                totalPills: parseInt(totalPills) || 0,
                frequency: 'daily',
                schedule: { morning, afternoon, evening },
            });
            Alert.alert('Success', 'Medication added to your tracker!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to add medication.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={24} color={COLORS.black} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Medication</Text>
                    <View style={{ width: 24 }} /> {/* Balance */}
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Medication Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Vitamin C, Gilenya"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>Dosage</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 500mg"
                                value={dosage}
                                onChangeText={setDosage}
                            />
                        </View>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Instruction</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 2 pills"
                                value={instruction}
                                onChangeText={setInstruction}
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Total Pills / Inventory</Text>
                        <Text style={styles.subLabel}>We'll alert you when you run out</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="e.g., 30"
                            value={totalPills}
                            onChangeText={setTotalPills}
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Daily Schedule</Text>
                        <Text style={styles.subLabel}>When do you need to take this?</Text>

                        <View style={styles.scheduleRow}>
                            <TouchableOpacity
                                style={[styles.timeBtn, morning && styles.timeBtnActive]}
                                onPress={() => setMorning(!morning)}
                            >
                                <Feather name="sunrise" size={20} color={morning ? COLORS.white : COLORS.black} />
                                <Text style={[styles.timeBtnText, morning && styles.timeBtnTextActive]}>Morning</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.timeBtn, afternoon && styles.timeBtnActive]}
                                onPress={() => setAfternoon(!afternoon)}
                            >
                                <Feather name="sun" size={20} color={afternoon ? COLORS.white : COLORS.black} />
                                <Text style={[styles.timeBtnText, afternoon && styles.timeBtnTextActive]}>Afternoon</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.timeBtn, evening && styles.timeBtnActive]}
                                onPress={() => setEvening(!evening)}
                            >
                                <Feather name="moon" size={20} color={evening ? COLORS.white : COLORS.black} />
                                <Text style={[styles.timeBtnText, evening && styles.timeBtnTextActive]}>Evening</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>

                {/* Footer Fixed Action */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Feather name="check" size={20} color={COLORS.white} />
                                <Text style={styles.saveBtnText}>Save Medication</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black },

    scrollContent: { padding: 20, paddingBottom: 60 },
    row: { flexDirection: 'row' },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 15, fontWeight: '700', color: COLORS.black, marginBottom: 8 },
    subLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 12, marginTop: -4 },
    input: {
        backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#E5DED5',
        paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.black
    },

    divider: { height: 1, backgroundColor: '#E5DED5', marginVertical: 10, marginBottom: 25 },

    scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    timeBtn: {
        flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
        paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#E5DED5', gap: 8
    },
    timeBtnActive: { backgroundColor: COLORS.black, borderColor: COLORS.black },
    timeBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.black },
    timeBtnTextActive: { color: COLORS.white },

    footer: { padding: 20, backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: '#E5DED5' },
    saveBtn: {
        backgroundColor: COLORS.primary, borderRadius: RADIUS.full, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10
    },
    saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' }
});
