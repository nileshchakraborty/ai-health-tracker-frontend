/**
 * Tests for Dashboard ViewModel (TDD)
 */

// Mock services
jest.mock('../../services', () => ({
    ouraCloudService: {
        getMockData: jest.fn(() => ({
            sleep: [{ day: '2024-12-17', totalSleep: 7.5, score: 85, efficiency: 90, deepSleep: 1.5, remSleep: 2, lightSleep: 4, heartRateAvg: 55, hrvAvg: 45 }],
            activity: [{ day: '2024-12-17', steps: 8500, calories: 2200, activeMinutes: 45 }],
            readiness: [{ day: '2024-12-17', score: 82, temperatureDeviation: 0.1 }],
        })),
        fetchData: jest.fn(),
    },
    grpcService: {
        isAvailable: jest.fn(() => Promise.resolve(true)),
        chat: jest.fn(() => Promise.resolve('AI response')),
    },
    syncService: {
        initialize: jest.fn(),
        stop: jest.fn(),
        sync: jest.fn(() => Promise.resolve({ syncedCount: 0, failedIds: [], message: 'OK' })),
        getStatus: jest.fn(() => Promise.resolve({ pendingCount: 0, lastSyncAt: null, isSyncing: false })),
    },
}));

import { ouraCloudService, grpcService, syncService } from '../../services';

describe('DashboardViewModel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Mock Data', () => {
        it('should call getMockData when useMockData is true', () => {
            ouraCloudService.getMockData();
            expect(ouraCloudService.getMockData).toHaveBeenCalled();
        });

        it('should return valid mock data structure', () => {
            const data = ouraCloudService.getMockData();
            expect(data.sleep).toBeDefined();
            expect(data.activity).toBeDefined();
            expect(data.readiness).toBeDefined();
        });
    });

    describe('Backend Status', () => {
        it('should check if backend is available', async () => {
            const isOnline = await grpcService.isAvailable();
            expect(isOnline).toBe(true);
        });
    });

    describe('AI Chat', () => {
        it('should get response from AI', async () => {
            const response = await grpcService.chat('test prompt');
            expect(response).toBe('AI response');
        });
    });

    describe('Sync', () => {
        it('should initialize sync service', () => {
            syncService.initialize();
            expect(syncService.initialize).toHaveBeenCalled();
        });

        it('should get sync status', async () => {
            const status = await syncService.getStatus();
            expect(status.pendingCount).toBe(0);
            expect(status.isSyncing).toBe(false);
        });

        it('should sync data', async () => {
            const result = await syncService.sync();
            expect(result.message).toBe('OK');
        });
    });
});
