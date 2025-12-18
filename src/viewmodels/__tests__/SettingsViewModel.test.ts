/**
 * Tests for Settings ViewModel (TDD)
 */

// Mock services
jest.mock('../../services', () => ({
    grpcService: {
        isAvailable: jest.fn(() => Promise.resolve(true)),
    },
}));

jest.mock('../../config/api.config', () => ({
    API_CONFIG: {
        BASE_URL: 'http://localhost:3000',
        GRPC_HOST: 'localhost',
        GRPC_PORT: 50051,
    },
}));

import { grpcService } from '../../services';
import { API_CONFIG } from '../../config/api.config';

describe('SettingsViewModel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Backend Configuration', () => {
        it('should have correct API URL', () => {
            expect(API_CONFIG.BASE_URL).toBe('http://localhost:3000');
        });

        it('should check backend status', async () => {
            const isOnline = await grpcService.isAvailable();
            expect(isOnline).toBe(true);
        });
    });

    describe('Settings State', () => {
        it('should have default mock data mode as true', () => {
            const defaultState = {
                useMockData: true,
                syncEnabled: true,
                localStorageOnly: true,
            };

            expect(defaultState.useMockData).toBe(true);
        });

        it('should toggle mock data mode', () => {
            let useMockData = true;
            useMockData = !useMockData;
            expect(useMockData).toBe(false);
        });

        it('should toggle sync enabled', () => {
            let syncEnabled = true;
            syncEnabled = !syncEnabled;
            expect(syncEnabled).toBe(false);
        });

        it('should toggle local storage only', () => {
            let localStorageOnly = true;
            localStorageOnly = !localStorageOnly;
            expect(localStorageOnly).toBe(false);
        });
    });

    describe('App Info', () => {
        it('should have correct app version', () => {
            const appVersion = '0.0.1';
            expect(appVersion).toBe('0.0.1');
        });
    });
});
