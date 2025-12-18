/**
 * gRPC Client Service for Mobile
 * 
 * Connects to AIDOC backend using environment-configured URLs.
 */

import { API_CONFIG } from '../config/api.config';

export interface GrpcConfig {
    host: string;
    port: number;
}

export interface HealthData {
    id?: string;
    userId: string;
    source: 'OURA_RING' | 'APPLE_HEALTH' | 'APPLE_WATCH' | 'MANUAL';
    type: 'STEPS' | 'HEART_RATE' | 'SLEEP_DURATION' | 'SLEEP_QUALITY' | 'HRV' | 'CALORIES';
    value: number;
    unit: string;
    timestampMs: number;
    metadata?: Record<string, string>;
}

export interface User {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    createdAtMs: number;
    updatedAtMs: number;
}

export interface HealthGoal {
    id: string;
    userId: string;
    type: string;
    target: number;
    unit: string;
    createdAtMs: number;
}

export interface SyncResult {
    syncedCount: number;
    failedIds: string[];
    message: string;
}

class GrpcService {
    /**
     * Get the current API base URL
     */
    getBaseUrl(): string {
        return API_CONFIG.BASE_URL;
    }

    /**
     * Check if backend is reachable
     */
    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(API_CONFIG.HEALTH_URL, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    async batchUploadHealthData(data: HealthData[]): Promise<SyncResult> {
        const response = await fetch(API_CONFIG.GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
          mutation BatchSave($inputs: [SaveHealthDataInput!]!) {
            saveHealthDataBatch(inputs: $inputs) { id }
          }
        `,
                variables: { inputs: data },
            }),
        });

        const result = await response.json();
        return {
            syncedCount: result.data?.saveHealthDataBatch?.length || 0,
            failedIds: [],
            message: 'Synced via GraphQL',
        };
    }

    async getUser(userId: string): Promise<User | null> {
        const response = await fetch(API_CONFIG.GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `query GetUser($id: ID!) { user(id: $id) { id email fullName avatarUrl createdAt updatedAt } }`,
                variables: { id: userId },
            }),
        });

        const result = await response.json();
        const user = result.data?.user;

        if (!user) return null;

        return {
            ...user,
            createdAtMs: new Date(user.createdAt).getTime(),
            updatedAtMs: new Date(user.updatedAt).getTime(),
        };
    }

    async getHealthGoals(userId: string): Promise<HealthGoal[]> {
        const response = await fetch(API_CONFIG.GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `query GetGoals($userId: String!) { healthGoals(userId: $userId) { id userId type target unit createdAt } }`,
                variables: { userId },
            }),
        });

        const result = await response.json();
        return (result.data?.healthGoals || []).map((g: any) => ({
            ...g,
            createdAtMs: new Date(g.createdAt).getTime(),
        }));
    }

    async chat(message: string): Promise<string> {
        try {
            const response = await fetch(API_CONFIG.CHAT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: message }],
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Request failed');
            }

            // Parse SSE response
            const text = await response.text();
            const chunks = text
                .split('\n')
                .filter(line => line.startsWith('data:') && !line.includes('[DONE]'))
                .map(line => {
                    try {
                        const json = JSON.parse(line.slice(5).trim());
                        return json.content || '';
                    } catch {
                        return '';
                    }
                });

            return chunks.join('');
        } catch (error) {
            throw error;
        }
    }
}

export const grpcService = new GrpcService();
export default GrpcService;
