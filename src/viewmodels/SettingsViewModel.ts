/**
 * Settings ViewModel (MVVM Pattern)
 * 
 * Manages state and business logic for the Settings view.
 */

import { useState, useCallback, useEffect } from 'react';
import { grpcService } from '../services';
import { API_CONFIG } from '../config/api.config';

export interface SettingsState {
    // Backend
    backendUrl: string;
    backendStatus: 'checking' | 'online' | 'offline';

    // Data preferences
    useMockData: boolean;
    syncEnabled: boolean;

    // Privacy
    localStorageOnly: boolean;

    // App info
    appVersion: string;
}

export interface SettingsActions {
    checkBackendStatus: () => Promise<void>;
    toggleMockData: () => void;
    toggleSync: () => void;
    toggleLocalStorage: () => void;
}

const initialState: SettingsState = {
    backendUrl: API_CONFIG.BASE_URL,
    backendStatus: 'checking',
    useMockData: true,
    syncEnabled: true,
    localStorageOnly: true,
    appVersion: '0.0.1',
};

/**
 * Settings ViewModel Hook
 */
export function useSettingsViewModel(): [SettingsState, SettingsActions] {
    const [state, setState] = useState<SettingsState>(initialState);

    const updateState = useCallback((updates: Partial<SettingsState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    // Check backend status
    const checkBackendStatus = useCallback(async () => {
        updateState({ backendStatus: 'checking' });

        const isOnline = await grpcService.isAvailable();
        updateState({ backendStatus: isOnline ? 'online' : 'offline' });
    }, [updateState]);

    // Toggle mock data mode
    const toggleMockData = useCallback(() => {
        updateState({ useMockData: !state.useMockData });
    }, [state.useMockData, updateState]);

    // Toggle sync
    const toggleSync = useCallback(() => {
        updateState({ syncEnabled: !state.syncEnabled });
    }, [state.syncEnabled, updateState]);

    // Toggle local storage only mode
    const toggleLocalStorage = useCallback(() => {
        updateState({ localStorageOnly: !state.localStorageOnly });
    }, [state.localStorageOnly, updateState]);

    // Initialize
    useEffect(() => {
        checkBackendStatus();
    }, []);

    const actions: SettingsActions = {
        checkBackendStatus,
        toggleMockData,
        toggleSync,
        toggleLocalStorage,
    };

    return [state, actions];
}

export default useSettingsViewModel;
