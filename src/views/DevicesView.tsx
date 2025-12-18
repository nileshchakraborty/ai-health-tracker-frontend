/**
 * Devices View (MVVM Pattern)
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useDevicesViewModel } from '../viewmodels';

export const DevicesView: React.FC = () => {
    const [state, actions] = useDevicesViewModel();

    useEffect(() => {
        actions.checkWatchStatus();
    }, []);

    useEffect(() => {
        if (state.errorMessage) {
            Alert.alert('Error', state.errorMessage, [
                { text: 'OK', onPress: actions.clearError }
            ]);
        }
    }, [state.errorMessage]);

    return (
        <ScrollView style={styles.container}>
            {/* Connected Devices */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📡 Connected Devices</Text>

                {/* Oura Ring */}
                <View style={styles.deviceCard}>
                    <Text style={styles.deviceIcon}>💍</Text>
                    <View style={styles.deviceInfo}>
                        <Text style={styles.deviceName}>Oura Ring</Text>
                        <Text style={styles.deviceStatus}>
                            {state.ouraConnected ? 'Connected' : 'Using Cloud API / Mock'}
                        </Text>
                    </View>
                    <View style={[styles.statusDot, state.ouraConnected ? styles.statusConnected : styles.statusMock]} />
                </View>

                {/* Apple Watch */}
                <View style={styles.deviceCard}>
                    <Text style={styles.deviceIcon}>⌚</Text>
                    <View style={styles.deviceInfo}>
                        <Text style={styles.deviceName}>Apple Watch</Text>
                        <Text style={styles.deviceStatus}>
                            {state.watchStatus?.isPaired ? 'Paired' : 'Not Paired'}
                        </Text>
                    </View>
                    <View style={[
                        styles.statusDot,
                        state.watchStatus?.isPaired ? styles.statusConnected : styles.statusPending
                    ]} />
                </View>
            </View>

            {/* Apple Watch Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⌚ Apple Watch</Text>

                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>
                            {state.watchStatus?.batteryLevel ?? '--'}%
                        </Text>
                        <Text style={styles.statLabel}>Battery</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>
                            {state.watchStatus?.isReachable ? '✅' : '❌'}
                        </Text>
                        <Text style={styles.statLabel}>Reachable</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={actions.syncWatch}
                    disabled={state.isLoading}
                >
                    <Text style={styles.buttonText}>
                        {state.isLoading ? 'Syncing...' : 'Sync from Watch'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* HealthKit */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>❤️ Apple HealthKit</Text>

                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Authorization:</Text>
                    <Text style={styles.statusValue}>
                        {state.healthKitAuthorized ? '✅ Granted' : '❌ Not Granted'}
                    </Text>
                </View>

                {!state.healthKitAuthorized && (
                    <TouchableOpacity
                        style={styles.button}
                        onPress={actions.requestHealthKitPermission}
                        disabled={state.isLoading}
                    >
                        <Text style={styles.buttonText}>Request Permission</Text>
                    </TouchableOpacity>
                )}

                {state.healthKitAuthorized && (
                    <>
                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>{state.healthKitSample?.steps ?? '--'}</Text>
                                <Text style={styles.statLabel}>Steps</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>{state.healthKitSample?.heartRate ?? '--'}</Text>
                                <Text style={styles.statLabel}>Heart Rate</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>{state.healthKitSample?.hrvAvg ?? '--'}</Text>
                                <Text style={styles.statLabel}>HRV</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, styles.buttonSecondary]}
                            onPress={actions.fetchHealthKitData}
                            disabled={state.isLoading}
                        >
                            <Text style={styles.buttonText}>Refresh Data</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#111827' },
    section: { backgroundColor: '#1F2937', borderRadius: 16, padding: 16, marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
    deviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#374151', borderRadius: 12, padding: 14, marginBottom: 12 },
    deviceIcon: { fontSize: 28, marginRight: 12 },
    deviceInfo: { flex: 1 },
    deviceName: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
    deviceStatus: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    statusConnected: { backgroundColor: '#22C55E' },
    statusMock: { backgroundColor: '#F59E0B' },
    statusPending: { backgroundColor: '#6B7280' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 },
    stat: { alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
    statLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    statusLabel: { color: '#9CA3AF' },
    statusValue: { color: '#FFFFFF', fontWeight: '500' },
    button: { backgroundColor: '#22C55E', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    buttonSecondary: { backgroundColor: '#374151' },
    buttonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
});

export default DevicesView;
