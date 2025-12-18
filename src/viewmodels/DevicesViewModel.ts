/**
 * Devices ViewModel (MVVM Pattern)
 * 
 * Manages state and business logic for the Devices view.
 */

import { useState, useCallback } from 'react';
import { appleWatchService, WatchStatus, healthKitService, HealthKitSample } from '../services';

export interface DevicesState {
    // Oura Ring
    ouraConnected: boolean;
    ouraBattery: number | null;

    // Apple Watch
    watchStatus: WatchStatus | null;

    // HealthKit
    healthKitAuthorized: boolean;
    healthKitSample: HealthKitSample | null;

    // Loading states
    isLoading: boolean;
    errorMessage: string | null;
}

export interface DevicesActions {
    checkWatchStatus: () => Promise<void>;
    syncWatch: () => Promise<void>;
    requestHealthKitPermission: () => Promise<void>;
    fetchHealthKitData: () => Promise<void>;
    clearError: () => void;
}

const initialState: DevicesState = {
    ouraConnected: false,
    ouraBattery: null,
    watchStatus: null,
    healthKitAuthorized: false,
    healthKitSample: null,
    isLoading: false,
    errorMessage: null,
};

/**
 * Devices ViewModel Hook
 */
export function useDevicesViewModel(): [DevicesState, DevicesActions] {
    const [state, setState] = useState<DevicesState>(initialState);

    const updateState = useCallback((updates: Partial<DevicesState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    // Check Apple Watch pairing status
    const checkWatchStatus = useCallback(async () => {
        updateState({ isLoading: true });

        try {
            const status = await appleWatchService.getStatus();
            updateState({ watchStatus: status, isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            updateState({ errorMessage: message, isLoading: false });
        }
    }, [updateState]);

    // Sync data from Apple Watch
    const syncWatch = useCallback(async () => {
        updateState({ isLoading: true });

        try {
            const data = await appleWatchService.syncData();
            updateState({
                healthKitSample: data,
                isLoading: false,
                watchStatus: await appleWatchService.getStatus(),
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            updateState({ errorMessage: message, isLoading: false });
        }
    }, [updateState]);

    // Request HealthKit permissions
    const requestHealthKitPermission = useCallback(async () => {
        updateState({ isLoading: true });

        try {
            const isAvailable = await healthKitService.checkAvailability();

            if (!isAvailable) {
                updateState({
                    errorMessage: 'HealthKit is not available on this device',
                    isLoading: false
                });
                return;
            }

            const authorized = await healthKitService.requestAuthorization();
            updateState({ healthKitAuthorized: authorized, isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            updateState({ errorMessage: message, isLoading: false });
        }
    }, [updateState]);

    // Fetch data from HealthKit
    const fetchHealthKitData = useCallback(async () => {
        updateState({ isLoading: true });

        try {
            const sample = await healthKitService.getTodaySummary();
            updateState({ healthKitSample: sample, isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            updateState({ errorMessage: message, isLoading: false });
        }
    }, [updateState]);

    // Clear error message
    const clearError = useCallback(() => {
        updateState({ errorMessage: null });
    }, [updateState]);

    const actions: DevicesActions = {
        checkWatchStatus,
        syncWatch,
        requestHealthKitPermission,
        fetchHealthKitData,
        clearError,
    };

    return [state, actions];
}

export default useDevicesViewModel;
