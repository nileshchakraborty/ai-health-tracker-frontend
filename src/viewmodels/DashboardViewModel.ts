/**
 * Dashboard ViewModel (MVVM Pattern)
 * 
 * Manages state and business logic for the Dashboard view.
 * Keeps the view layer thin and testable.
 */

import { useState, useEffect, useCallback } from 'react';
import { ouraCloudService, OuraData, grpcService, syncService, SyncStatus } from '../services';

export interface DashboardState {
    // Data
    ouraData: OuraData | null;
    syncStatus: SyncStatus | null;
    aiResponse: string;

    // Loading states
    isLoadingData: boolean;
    isLoadingAI: boolean;
    isSyncing: boolean;

    // Settings
    useMockData: boolean;
    backendStatus: 'checking' | 'online' | 'offline';
}

export interface DashboardActions {
    loadData: () => Promise<void>;
    refreshBackendStatus: () => Promise<void>;
    syncData: () => Promise<void>;
    askAI: (prompt: string) => Promise<void>;
    toggleMockData: () => void;
}

const initialState: DashboardState = {
    ouraData: null,
    syncStatus: null,
    aiResponse: '',
    isLoadingData: false,
    isLoadingAI: false,
    isSyncing: false,
    useMockData: true,
    backendStatus: 'checking',
};

/**
 * Dashboard ViewModel Hook
 * 
 * Returns state and actions for the Dashboard view.
 */
export function useDashboardViewModel(): [DashboardState, DashboardActions] {
    const [state, setState] = useState<DashboardState>(initialState);

    // Update partial state
    const updateState = useCallback((updates: Partial<DashboardState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    // Load Oura data
    const loadData = useCallback(async () => {
        updateState({ isLoadingData: true });

        try {
            let data: OuraData | null;

            if (state.useMockData) {
                data = ouraCloudService.getMockData();
            } else {
                data = await ouraCloudService.fetchData();
                if (!data) {
                    data = ouraCloudService.getMockData();
                }
            }

            updateState({ ouraData: data, isLoadingData: false });
        } catch (error) {
            console.error('Load data error:', error);
            updateState({ ouraData: ouraCloudService.getMockData(), isLoadingData: false });
        }
    }, [state.useMockData, updateState]);

    // Check backend status
    const refreshBackendStatus = useCallback(async () => {
        updateState({ backendStatus: 'checking' });

        const isOnline = await grpcService.isAvailable();
        updateState({ backendStatus: isOnline ? 'online' : 'offline' });
    }, [updateState]);

    // Sync data to backend
    const syncData = useCallback(async () => {
        updateState({ isSyncing: true });

        try {
            await syncService.sync();
            const status = await syncService.getStatus();
            updateState({ syncStatus: status, isSyncing: false });
        } catch (error) {
            console.error('Sync error:', error);
            updateState({ isSyncing: false });
        }
    }, [updateState]);

    // Ask AI for insights
    const askAI = useCallback(async (prompt: string) => {
        if (state.backendStatus !== 'online') {
            updateState({ aiResponse: 'Backend is offline' });
            return;
        }

        updateState({ isLoadingAI: true, aiResponse: '' });

        try {
            const response = await grpcService.chat(prompt);
            updateState({ aiResponse: response || 'No response', isLoadingAI: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            updateState({ aiResponse: `Error: ${message}`, isLoadingAI: false });
        }
    }, [state.backendStatus, updateState]);

    // Toggle mock data mode
    const toggleMockData = useCallback(() => {
        updateState({ useMockData: !state.useMockData });
    }, [state.useMockData, updateState]);

    // Initialize on mount
    useEffect(() => {
        refreshBackendStatus();
        syncService.initialize();
        loadData();

        syncService.getStatus().then(status => {
            updateState({ syncStatus: status });
        });

        return () => {
            syncService.stop();
        };
    }, []);

    // Reload data when mock mode changes
    useEffect(() => {
        loadData();
    }, [state.useMockData]);

    const actions: DashboardActions = {
        loadData,
        refreshBackendStatus,
        syncData,
        askAI,
        toggleMockData,
    };

    return [state, actions];
}

export default useDashboardViewModel;
