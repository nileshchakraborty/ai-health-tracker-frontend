/**
 * Settings View (MVVM Pattern)
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useSettingsViewModel } from '../viewmodels';

export const SettingsView: React.FC = () => {
    const [state, actions] = useSettingsViewModel();

    return (
        <ScrollView style={styles.container}>
            {/* Backend Connection */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚙️ Backend</Text>

                <TouchableOpacity style={styles.settingRow} onPress={actions.checkBackendStatus}>
                    <Text style={styles.settingLabel}>Status</Text>
                    <View style={styles.statusContainer}>
                        <View style={[
                            styles.statusDot,
                            state.backendStatus === 'online' ? styles.online : styles.offline
                        ]} />
                        <Text style={[
                            styles.settingValue,
                            state.backendStatus === 'online' ? styles.online : styles.offline
                        ]}>
                            {state.backendStatus}
                        </Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.settingHint}>API: {state.backendUrl}</Text>
            </View>

            {/* Data Sources */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Data Sources</Text>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Use Mock Data</Text>
                    <Switch
                        value={state.useMockData}
                        onValueChange={actions.toggleMockData}
                        trackColor={{ false: '#374151', true: '#22C55E' }}
                        thumbColor="#FFFFFF"
                    />
                </View>
                <Text style={styles.settingHint}>
                    {state.useMockData
                        ? 'Using simulated health data for testing'
                        : 'Fetching real data from Oura Cloud API'}
                </Text>
            </View>

            {/* Sync */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔄 Sync</Text>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Background Sync</Text>
                    <Switch
                        value={state.syncEnabled}
                        onValueChange={actions.toggleSync}
                        trackColor={{ false: '#374151', true: '#22C55E' }}
                        thumbColor="#FFFFFF"
                    />
                </View>
                <Text style={styles.settingHint}>
                    Automatically sync health data in the background
                </Text>
            </View>

            {/* Privacy */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔒 Privacy</Text>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Local Storage Only</Text>
                    <Switch
                        value={state.localStorageOnly}
                        onValueChange={actions.toggleLocalStorage}
                        trackColor={{ false: '#374151', true: '#22C55E' }}
                        thumbColor="#FFFFFF"
                    />
                </View>
                <Text style={styles.settingHint}>
                    All health data is stored locally on your device.
                    No data is sent to external cloud servers.
                </Text>
            </View>

            {/* About */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ℹ️ About</Text>

                <View style={styles.aboutRow}>
                    <Text style={styles.aboutLabel}>Version</Text>
                    <Text style={styles.aboutValue}>{state.appVersion}</Text>
                </View>

                <View style={styles.aboutRow}>
                    <Text style={styles.aboutLabel}>Architecture</Text>
                    <Text style={styles.aboutValue}>MVVM + React Hooks</Text>
                </View>

                <Text style={styles.tagline}>
                    💚 Privacy-First AI Health Tracker
                </Text>
                <Text style={styles.taglineSmall}>
                    Local AI • Offline-First • Your Data, Your Control
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#111827' },
    section: { backgroundColor: '#1F2937', borderRadius: 16, padding: 16, marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 16 },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#374151' },
    settingLabel: { color: '#FFFFFF', fontSize: 15 },
    settingValue: { fontWeight: '500' },
    settingHint: { color: '#6B7280', fontSize: 12, marginTop: 8 },
    statusContainer: { flexDirection: 'row', alignItems: 'center' },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    online: { backgroundColor: '#22C55E', color: '#22C55E' },
    offline: { backgroundColor: '#EF4444', color: '#EF4444' },
    aboutRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    aboutLabel: { color: '#9CA3AF' },
    aboutValue: { color: '#FFFFFF' },
    tagline: { color: '#22C55E', fontSize: 14, fontWeight: '600', marginTop: 16, textAlign: 'center' },
    taglineSmall: { color: '#6B7280', fontSize: 12, marginTop: 4, textAlign: 'center' },
});

export default SettingsView;
