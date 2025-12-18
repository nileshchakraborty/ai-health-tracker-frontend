/**
 * Sync Service
 * 
 * Manages offline-first data synchronization.
 * Uses simple in-memory queue for now.
 */

import { grpcService, HealthData, SyncResult } from './grpc.service';

export interface SyncQueueItem {
    id: string;
    data: HealthData;
    createdAt: number;
    attempts: number;
}

export interface SyncStatus {
    pendingCount: number;
    lastSyncAt: number | null;
    isSyncing: boolean;
}

class SyncService {
    private isSyncing = false;
    private syncInterval: ReturnType<typeof setInterval> | null = null;
    private queue: SyncQueueItem[] = [];
    private lastSyncAt: number | null = null;

    /**
     * Initialize sync service and start background sync
     */
    async initialize(): Promise<void> {
        // Start periodic sync every 5 minutes
        this.syncInterval = setInterval(() => {
            this.sync();
        }, 5 * 60 * 1000);

        // Sync on init
        await this.sync();
    }

    /**
     * Stop background sync
     */
    stop(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    /**
     * Add data to sync queue (for offline storage)
     */
    async queue_data(data: HealthData): Promise<void> {
        const item: SyncQueueItem = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            data,
            createdAt: Date.now(),
            attempts: 0,
        };

        this.queue.push(item);
    }

    /**
     * Sync all queued data to backend
     */
    async sync(): Promise<SyncResult> {
        if (this.isSyncing) {
            return { syncedCount: 0, failedIds: [], message: 'Sync already in progress' };
        }

        this.isSyncing = true;

        try {
            if (this.queue.length === 0) {
                return { syncedCount: 0, failedIds: [], message: 'Nothing to sync' };
            }

            // Extract health data from queue items
            const healthData = this.queue.map(item => item.data);

            // Send to backend
            const result = await grpcService.batchUploadHealthData(healthData);

            // Clear successfully synced items
            const failedSet = new Set(result.failedIds);
            this.queue = this.queue.filter(item => failedSet.has(item.id));

            // Increment attempts for failed items
            for (const item of this.queue) {
                item.attempts++;
            }

            // Remove items that failed too many times (max 5 attempts)
            this.queue = this.queue.filter(item => item.attempts < 5);

            this.lastSyncAt = Date.now();

            return result;
        } catch (error) {
            console.error('Sync failed:', error);
            return {
                syncedCount: 0,
                failedIds: [],
                message: error instanceof Error ? error.message : 'Sync failed'
            };
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Get current sync status
     */
    async getStatus(): Promise<SyncStatus> {
        return {
            pendingCount: this.queue.length,
            lastSyncAt: this.lastSyncAt,
            isSyncing: this.isSyncing,
        };
    }

    /**
     * Clear all pending sync items
     */
    async clearQueue(): Promise<void> {
        this.queue = [];
    }
}

export const syncService = new SyncService();
export default SyncService;
