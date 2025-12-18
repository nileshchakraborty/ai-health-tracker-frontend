/**
 * Tests for Apple Watch Service
 */

import { appleWatchService } from '../apple-watch.service';

describe('AppleWatchService', () => {
    describe('getStatus', () => {
        it('should return watch status object', async () => {
            const status = await appleWatchService.getStatus();

            expect(status).toBeDefined();
            expect(typeof status.isPaired).toBe('boolean');
            expect(typeof status.isReachable).toBe('boolean');
            expect(typeof status.batteryLevel).toBe('number');
            expect(status.batteryLevel).toBeGreaterThanOrEqual(0);
            expect(status.batteryLevel).toBeLessThanOrEqual(100);
        });
    });

    describe('getMockWorkouts', () => {
        it('should return mock workout data', () => {
            const workouts = appleWatchService.getMockWorkouts();

            expect(workouts.length).toBeGreaterThan(0);
        });

        it('should have valid workout structure', () => {
            const workouts = appleWatchService.getMockWorkouts();

            workouts.forEach(workout => {
                expect(workout.id).toBeDefined();
                expect(workout.type).toBeDefined();
                expect(workout.startDate).toBeInstanceOf(Date);
                expect(workout.endDate).toBeInstanceOf(Date);
                expect(workout.duration).toBeGreaterThan(0);
                expect(workout.calories).toBeGreaterThan(0);
            });
        });

        it('should have realistic heart rate values', () => {
            const workouts = appleWatchService.getMockWorkouts();

            workouts.forEach(workout => {
                if (workout.avgHeartRate) {
                    expect(workout.avgHeartRate).toBeGreaterThanOrEqual(60);
                    expect(workout.avgHeartRate).toBeLessThanOrEqual(200);
                }
                if (workout.maxHeartRate) {
                    expect(workout.maxHeartRate).toBeGreaterThanOrEqual(workout.avgHeartRate || 60);
                    expect(workout.maxHeartRate).toBeLessThanOrEqual(220);
                }
            });
        });
    });

    describe('getWorkouts', () => {
        it('should return workouts for date range', async () => {
            const startDate = new Date('2024-12-10');
            const endDate = new Date('2024-12-17');

            const workouts = await appleWatchService.getWorkouts(startDate, endDate);

            expect(Array.isArray(workouts)).toBe(true);
            workouts.forEach(workout => {
                expect(workout.startDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
                expect(workout.startDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
            });
        });
    });
});
