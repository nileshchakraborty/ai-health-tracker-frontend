/**
 * Tests for Oura Cloud Service
 */

import { ouraCloudService } from '../oura-cloud.service';

describe('OuraCloudService', () => {
    describe('getMockData', () => {
        it('should return 7 days of sleep data', () => {
            const data = ouraCloudService.getMockData();

            expect(data.sleep).toHaveLength(7);
            expect(data.activity).toHaveLength(7);
            expect(data.readiness).toHaveLength(7);
        });

        it('should return valid sleep metrics', () => {
            const data = ouraCloudService.getMockData();

            data.sleep.forEach(sleep => {
                expect(sleep.day).toBeDefined();
                expect(sleep.score).toBeGreaterThanOrEqual(0);
                expect(sleep.score).toBeLessThanOrEqual(100);
                expect(sleep.totalSleep).toBeGreaterThan(0);
                expect(sleep.efficiency).toBeGreaterThanOrEqual(0);
                expect(sleep.efficiency).toBeLessThanOrEqual(100);
            });
        });

        it('should return valid activity metrics', () => {
            const data = ouraCloudService.getMockData();

            data.activity.forEach(activity => {
                expect(activity.day).toBeDefined();
                expect(activity.steps).toBeGreaterThanOrEqual(0);
                expect(activity.calories).toBeGreaterThan(0);
                expect(activity.activeMinutes).toBeGreaterThanOrEqual(0);
            });
        });

        it('should return valid readiness metrics', () => {
            const data = ouraCloudService.getMockData();

            data.readiness.forEach(readiness => {
                expect(readiness.day).toBeDefined();
                expect(readiness.score).toBeGreaterThanOrEqual(0);
                expect(readiness.score).toBeLessThanOrEqual(100);
            });
        });
    });
});
