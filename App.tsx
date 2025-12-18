/**
 * AIDOC - AI Health Tracker
 * 
 * Mobile App Entry Point (MVVM Architecture)
 * 
 * Architecture:
 * - Model: Services (ouraCloudService, healthKitService, etc.)
 * - ViewModel: Hooks in /viewmodels (useDashboardViewModel, etc.)
 * - View: Components in /views (DashboardView, etc.)
 */

import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DashboardView, DevicesView, SettingsView } from './src/views';
import { useDashboardViewModel } from './src/viewmodels';

type TabType = 'dashboard' | 'devices' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Get backend status from dashboard viewmodel for header display
  const [dashboardState] = useDashboardViewModel();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.logo}>💚 AIDOC</Text>
          <View style={[
            styles.statusIndicator,
            dashboardState.backendStatus === 'online' ? styles.online : styles.offline
          ]} />
        </View>
        <Text style={styles.subtitle}>
          {dashboardState.useMockData ? '📊 Mock Data Mode' : '☁️ Cloud Connected'}
        </Text>
      </View>

      {/* Views (MVVM) */}
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'devices' && <DevicesView />}
      {activeTab === 'settings' && <SettingsView />}

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.tabActive]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={styles.tabIcon}>📊</Text>
          <Text style={styles.tabText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'devices' && styles.tabActive]}
          onPress={() => setActiveTab('devices')}
        >
          <Text style={styles.tabIcon}>📡</Text>
          <Text style={styles.tabText}>Devices</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={styles.tabIcon}>⚙️</Text>
          <Text style={styles.tabText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: '#1F2937' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#22C55E' },
  subtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  statusIndicator: { width: 12, height: 12, borderRadius: 6 },
  online: { backgroundColor: '#22C55E' },
  offline: { backgroundColor: '#EF4444' },
  tabBar: { flexDirection: 'row', backgroundColor: '#1F2937', paddingBottom: 30, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabActive: { borderTopWidth: 2, borderTopColor: '#22C55E' },
  tabIcon: { fontSize: 20, marginBottom: 2 },
  tabText: { color: '#9CA3AF', fontSize: 11 },
});
