/**
 * Tests for Sync Service
 */

import SyncService from '../sync.service';

describe('SyncService', () => {
    let syncService: SyncService;

    beforeEach(() => {
        syncService = new SyncService();
    });

    afterEach(() => {
        syncService.stop();
    });

    describe('initialize', () => {
        it('should initialize without errors', () => {
            expect(() => syncService.initialize()).not.toThrow();
        });
    });

    describe('getStatus', () => {
        it('should return sync status', async () => {
            const status = await syncService.getStatus();

            expect(status).toBeDefined();
            expect(typeof status.pendingCount).toBe('number');
            expect(status.isSyncing).toBe(false);
        });
    });

    describe('queue_data', () => {
        it('should queue health data for sync', async () => {
            await syncService.queue_data({
                id: 'test-1',
                userId: 'user-1',
                source: 'OURA_RING',
                type: 'STEPS',
                value: 5000,
                unit: 'steps',
                timestampMs: Date.now(),
            });

            const status = await syncService.getStatus();
            expect(status.pendingCount).toBe(1);
        });

        it('should queue multiple items', async () => {
            await syncService.queue_data({
                id: 'test-1',
                userId: 'user-1',
                source: 'OURA_RING',
                type: 'STEPS',
                value: 5000,
                unit: 'steps',
                timestampMs: Date.now(),
            });

            await syncService.queue_data({
                id: 'test-2',
                userId: 'user-1',
                source: 'APPLE_HEALTH',
                type: 'HEART_RATE',
                value: 72,
                unit: 'bpm',
                timestampMs: Date.now(),
            });

            const status = await syncService.getStatus();
            expect(status.pendingCount).toBe(2);
        });
    });

    describe('clearQueue', () => {
        it('should clear all queued data', async () => {
            await syncService.queue_data({
                id: 'test-1',
                userId: 'user-1',
                source: 'OURA_RING',
                type: 'STEPS',
                value: 5000,
                unit: 'steps',
                timestampMs: Date.now(),
            });

            await syncService.clearQueue();

            const status = await syncService.getStatus();
            expect(status.pendingCount).toBe(0);
        });
    });
});
