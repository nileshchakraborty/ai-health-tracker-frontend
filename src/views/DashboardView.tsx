/**
 * Dashboard View (MVVM Pattern)
 * 
 * View layer - pure UI rendering.
 * All state and logic is in DashboardViewModel.
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useDashboardViewModel, DashboardState, DashboardActions } from '../viewmodels';

interface MetricCardProps {
    title: string;
    value: string | number;
    unit: string;
    icon: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, icon }) => (
    <View style={styles.metricCard}>
        <Text style={styles.metricIcon}>{icon}</Text>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
    </View>
);

interface TrendBarProps {
    value: number;
    maxValue: number;
    label: string;
    color?: string;
}

const TrendBar: React.FC<TrendBarProps> = ({ value, maxValue, label, color = '#22C55E' }) => (
    <View style={styles.trendBar}>
        <View style={[styles.trendBarFill, { height: `${Math.min((value / maxValue) * 100, 100)}%`, backgroundColor: color }]} />
        <Text style={styles.trendLabel}>{label}</Text>
    </View>
);

export const DashboardView: React.FC = () => {
    const [state, actions] = useDashboardViewModel();

    const latestSleep = state.ouraData?.sleep?.[state.ouraData.sleep.length - 1];
    const latestActivity = state.ouraData?.activity?.[state.ouraData.activity.length - 1];
    const latestReadiness = state.ouraData?.readiness?.[state.ouraData.readiness.length - 1];

    return (
        <ScrollView style={styles.container}>
            {/* Today's Summary */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>📊 Today's Health</Text>
                    <TouchableOpacity onPress={actions.loadData} disabled={state.isLoadingData}>
                        <Text style={styles.refreshBtn}>{state.isLoadingData ? '⏳' : '🔄'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.metricsGrid}>
                    <MetricCard
                        title="Sleep"
                        value={latestSleep?.totalSleep.toFixed(1) || '--'}
                        unit="hours"
                        icon="😴"
                    />
                    <MetricCard
                        title="Steps"
                        value={latestActivity?.steps.toLocaleString() || '--'}
                        unit="steps"
                        icon="👟"
                    />
                    <MetricCard
                        title="Readiness"
                        value={latestReadiness?.score || '--'}
                        unit="score"
                        icon="💪"
                    />
                    <MetricCard
                        title="HRV"
                        value={latestSleep?.hrvAvg || '--'}
                        unit="ms"
                        icon="❤️"
                    />
                </View>
            </View>

            {/* Sleep Trend */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>😴 Sleep This Week</Text>
                <View style={styles.trendContainer}>
                    {state.ouraData?.sleep.slice(-7).map((sleep, i) => (
                        <TrendBar
                            key={i}
                            value={sleep.totalSleep}
                            maxValue={10}
                            label={sleep.day.slice(-2)}
                        />
                    ))}
                </View>
            </View>

            {/* Activity Trend */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>👟 Steps This Week</Text>
                <View style={styles.trendContainer}>
                    {state.ouraData?.activity.slice(-7).map((act, i) => (
                        <TrendBar
                            key={i}
                            value={act.steps}
                            maxValue={15000}
                            label={act.day.slice(-2)}
                            color="#3B82F6"
                        />
                    ))}
                </View>
            </View>

            {/* AI Insights */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🤖 AI Insights</Text>
                <TouchableOpacity
                    style={[styles.button, state.backendStatus !== 'online' && styles.buttonDisabled]}
                    onPress={() => actions.askAI('Based on my health data, give me personalized recommendations.')}
                    disabled={state.isLoadingAI || state.backendStatus !== 'online'}
                >
                    <Text style={styles.buttonText}>
                        {state.isLoadingAI ? 'Analyzing...' : 'Get Recommendations'}
                    </Text>
                </TouchableOpacity>
                {state.aiResponse !== '' && (
                    <View style={styles.aiResponse}>
                        <Text style={styles.aiResponseText}>{state.aiResponse}</Text>
                    </View>
                )}
            </View>

            {/* Sync Status */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔄 Sync</Text>
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Pending:</Text>
                    <Text style={styles.statusValue}>{state.syncStatus?.pendingCount || 0} items</Text>
                </View>
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Last sync:</Text>
                    <Text style={styles.statusValue}>
                        {state.syncStatus?.lastSyncAt ? new Date(state.syncStatus.lastSyncAt).toLocaleTimeString() : 'Never'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={actions.syncData}
                    disabled={state.isSyncing}
                >
                    <Text style={styles.buttonText}>{state.isSyncing ? 'Syncing...' : 'Sync Now'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#111827' },
    section: { backgroundColor: '#1F2937', borderRadius: 16, padding: 16, marginBottom: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
    refreshBtn: { fontSize: 18 },
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    metricCard: { width: '47%', backgroundColor: '#374151', borderRadius: 12, padding: 12, alignItems: 'center' },
    metricIcon: { fontSize: 24, marginBottom: 4 },
    metricValue: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
    metricUnit: { fontSize: 12, color: '#9CA3AF' },
    metricTitle: { fontSize: 12, color: '#6B7280', marginTop: 4 },
    trendContainer: { flexDirection: 'row', justifyContent: 'space-between', height: 80, marginTop: 8 },
    trendBar: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', marginHorizontal: 2 },
    trendBarFill: { width: '80%', borderRadius: 4, minHeight: 4 },
    trendLabel: { fontSize: 10, color: '#6B7280', marginTop: 4 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    statusLabel: { color: '#9CA3AF' },
    statusValue: { color: '#FFFFFF', fontWeight: '500' },
    button: { backgroundColor: '#22C55E', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    buttonSecondary: { backgroundColor: '#374151' },
    buttonDisabled: { backgroundColor: '#374151', opacity: 0.5 },
    buttonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
    aiResponse: { marginTop: 12, padding: 12, backgroundColor: '#374151', borderRadius: 12 },
    aiResponseText: { color: '#D1D5DB', lineHeight: 20, fontSize: 14 },
});

export default DashboardView;
