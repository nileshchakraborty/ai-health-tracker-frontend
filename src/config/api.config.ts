/**
 * API Configuration for Mobile
 * 
 * Uses environment variables or auto-detects from Expo host.
 */

import Constants from 'expo-constants';

// Get the local IP from Expo's debuggerHost
function getLocalIP(): string {
    const debuggerHost = Constants.expoConfig?.hostUri;
    if (debuggerHost) {
        return debuggerHost.split(':')[0];
    }
    return 'localhost';
}

// Environment variables with fallbacks
const env = {
    API_URL: process.env.EXPO_PUBLIC_API_URL,
    GRPC_HOST: process.env.EXPO_PUBLIC_GRPC_HOST,
    GRPC_PORT: process.env.EXPO_PUBLIC_GRPC_PORT || '50051',
};

export const API_CONFIG = {
    // Base URL - use env var or auto-detect from Expo host
    get BASE_URL(): string {
        if (env.API_URL) {
            return env.API_URL;
        }
        const ip = getLocalIP();
        return `http://${ip}:3000`;
    },

    get GRAPHQL_URL(): string {
        return `${this.BASE_URL}/api/graphql`;
    },

    get CHAT_URL(): string {
        return `${this.BASE_URL}/api/chat`;
    },

    get HEALTH_URL(): string {
        return `${this.BASE_URL}/api/health`;
    },

    // gRPC configuration
    get GRPC_HOST(): string {
        if (env.GRPC_HOST) {
            return env.GRPC_HOST;
        }
        return getLocalIP();
    },

    GRPC_PORT: parseInt(env.GRPC_PORT, 10),

    get GRPC_URL(): string {
        return `${this.GRPC_HOST}:${this.GRPC_PORT}`;
    },
};

export default API_CONFIG;
