/**
 * Tests for HealthKit Service
 */

import { healthKitService, HEALTHKIT_TYPES } from '../healthkit.service';

describe('HealthKitService', () => {
    describe('HEALTHKIT_TYPES', () => {
        it('should define all required health data types', () => {
            expect(HEALTHKIT_TYPES.STEPS).toBeDefined();
            expect(HEALTHKIT_TYPES.HEART_RATE).toBeDefined();
            expect(HEALTHKIT_TYPES.HRV).toBeDefined();
            expect(HEALTHKIT_TYPES.SLEEP_ANALYSIS).toBeDefined();
            expect(HEALTHKIT_TYPES.WEIGHT).toBeDefined();
        });

        it('should have valid HealthKit identifiers', () => {
            expect(HEALTHKIT_TYPES.STEPS).toBe('HKQuantityTypeIdentifierStepCount');
            expect(HEALTHKIT_TYPES.HEART_RATE).toBe('HKQuantityTypeIdentifierHeartRate');
            expect(HEALTHKIT_TYPES.HRV).toBe('HKQuantityTypeIdentifierHeartRateVariabilitySDNN');
        });
    });

    describe('getMockData', () => {
        it('should return valid mock health data', () => {
            const data = healthKitService.getMockData();

            expect(data.steps).toBeGreaterThan(0);
            expect(data.heartRate).toBeGreaterThan(0);
            expect(data.hrvAvg).toBeGreaterThan(0);
            expect(data.sleepHours).toBeGreaterThan(0);
            expect(data.activeCalories).toBeGreaterThan(0);
            expect(data.restingHeartRate).toBeGreaterThan(0);
        });

        it('should return realistic heart rate values', () => {
            const data = healthKitService.getMockData();

            expect(data.heartRate).toBeGreaterThanOrEqual(60);
            expect(data.heartRate).toBeLessThanOrEqual(100);
            expect(data.restingHeartRate).toBeGreaterThanOrEqual(55);
            expect(data.restingHeartRate).toBeLessThanOrEqual(75);
        });

        it('should return realistic sleep values', () => {
            const data = healthKitService.getMockData();

            expect(data.sleepHours).toBeGreaterThanOrEqual(6);
            expect(data.sleepHours).toBeLessThanOrEqual(10);
        });
    });

    describe('getSteps', () => {
        it('should return step samples for date range', async () => {
            const startDate = new Date('2024-12-10');
            const endDate = new Date('2024-12-17');

            const steps = await healthKitService.getSteps(startDate, endDate);

            expect(steps.length).toBe(7);
            steps.forEach(sample => {
                expect(sample.type).toBe('steps');
                expect(sample.unit).toBe('count');
                expect(sample.value).toBeGreaterThan(0);
            });
        });
    });

    describe('getHeartRate', () => {
        it('should return heart rate samples for date range', async () => {
            const startDate = new Date('2024-12-10');
            const endDate = new Date('2024-12-17');

            const hr = await healthKitService.getHeartRate(startDate, endDate);

            expect(hr.length).toBe(7);
            hr.forEach(sample => {
                expect(sample.type).toBe('heart_rate');
                expect(sample.unit).toBe('bpm');
                expect(sample.value).toBeGreaterThanOrEqual(40);
                expect(sample.value).toBeLessThanOrEqual(200);
            });
        });
    });

    describe('getAllData', () => {
        it('should return all health data types', async () => {
            const startDate = new Date('2024-12-10');
            const endDate = new Date('2024-12-17');

            const data = await healthKitService.getAllData(startDate, endDate);

            expect(data.steps).toBeDefined();
            expect(data.heartRate).toBeDefined();
            expect(data.hrv).toBeDefined();
            expect(data.sleep).toBeDefined();
        });
    });
});
