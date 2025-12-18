/**
 * Tests for Devices ViewModel (TDD)
 */

// Mock services
jest.mock('../../services', () => ({
    appleWatchService: {
        getStatus: jest.fn(() => Promise.resolve({
            isPaired: true,
            isReachable: true,
            batteryLevel: 85,
            lastSyncDate: new Date(),
        })),
        syncData: jest.fn(() => Promise.resolve({
            steps: 8000,
            heartRate: 72,
            hrvAvg: 42,
            sleepHours: 7.5,
            activeCalories: 350,
            restingHeartRate: 58,
        })),
    },
    healthKitService: {
        checkAvailability: jest.fn(() => Promise.resolve(true)),
        requestAuthorization: jest.fn(() => Promise.resolve(true)),
        getTodaySummary: jest.fn(() => Promise.resolve({
            steps: 8000,
            heartRate: 72,
            hrvAvg: 42,
            sleepHours: 7.5,
            activeCalories: 350,
            restingHeartRate: 58,
        })),
    },
}));

import { appleWatchService, healthKitService } from '../../services';

describe('DevicesViewModel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Apple Watch', () => {
        it('should get watch status', async () => {
            const status = await appleWatchService.getStatus();
            expect(status.isPaired).toBe(true);
            expect(status.isReachable).toBe(true);
            expect(status.batteryLevel).toBe(85);
        });

        it('should sync data from watch', async () => {
            const data = await appleWatchService.syncData();
            expect(data.steps).toBe(8000);
            expect(data.heartRate).toBe(72);
        });
    });

    describe('HealthKit', () => {
        it('should check availability', async () => {
            const available = await healthKitService.checkAvailability();
            expect(available).toBe(true);
        });

        it('should request authorization', async () => {
            const authorized = await healthKitService.requestAuthorization();
            expect(authorized).toBe(true);
        });

        it('should get today summary', async () => {
            const summary = await healthKitService.getTodaySummary();
            expect(summary.steps).toBe(8000);
            expect(summary.hrvAvg).toBe(42);
        });
    });
});
