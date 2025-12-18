/**
 * Oura Cloud Service for Mobile
 * 
 * Fetches data from Oura Cloud API using Personal Access Token.
 * Configure OURA_ACCESS_TOKEN in settings.
 */

import { API_CONFIG } from '../config/api.config';

export interface OuraSleepData {
    day: string;
    score: number;
    totalSleep: number; // hours
    efficiency: number; // percent
    deepSleep: number;
    remSleep: number;
    lightSleep: number;
    heartRateAvg: number;
    hrvAvg: number;
}

export interface OuraActivityData {
    day: string;
    steps: number;
    calories: number;
    activeMinutes: number;
}

export interface OuraReadinessData {
    day: string;
    score: number;
    temperatureDeviation: number;
}

export interface OuraData {
    sleep: OuraSleepData[];
    activity: OuraActivityData[];
    readiness: OuraReadinessData[];
}

class OuraCloudService {
    /**
     * Fetch Oura data from backend API
     */
    async fetchData(startDate?: string, endDate?: string): Promise<OuraData | null> {
        try {
            let url = `${API_CONFIG.BASE_URL}/api/oura`;
            const params = new URLSearchParams();
            if (startDate) params.set('start', startDate);
            if (endDate) params.set('end', endDate);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch Oura data');
            }

            const result = await response.json();

            // Transform API response to our format
            return {
                sleep: (result.data?.sleep_duration || []).map((item: any, i: number) => ({
                    day: item.timestamp?.split('T')[0] || `day-${i}`,
                    score: result.data?.sleep_quality?.[i]?.value || 0,
                    totalSleep: item.value || 0,
                    efficiency: result.data?.sleep_quality?.[i]?.value || 0,
                    deepSleep: 0,
                    remSleep: 0,
                    lightSleep: 0,
                    heartRateAvg: result.data?.heart_rate?.[i]?.value || 0,
                    hrvAvg: result.data?.hrv?.[i]?.value || 0,
                })),
                activity: (result.data?.steps || []).map((item: any, i: number) => ({
                    day: item.timestamp?.split('T')[0] || `day-${i}`,
                    steps: item.value || 0,
                    calories: result.data?.calories?.[i]?.value || 0,
                    activeMinutes: result.data?.activity_score?.[i]?.value || 0,
                })),
                readiness: (result.data?.readiness_score || []).map((item: any) => ({
                    day: item.timestamp?.split('T')[0] || 'unknown',
                    score: item.value || 0,
                    temperatureDeviation: 0,
                })),
            };
        } catch (error) {
            console.error('Oura fetch error:', error);
            return null;
        }
    }

    /**
     * Check if Oura API is configured on backend
     */
    async isConfigured(): Promise<boolean> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/oura`);
            const data = await response.json();
            // If we get an error about token, it means API route exists but not configured
            return !data.error?.includes('token');
        } catch {
            return false;
        }
    }

    /**
     * Get mock data for testing
     */
    getMockData(): OuraData {
        const today = new Date();
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return {
            sleep: days.map(day => ({
                day,
                score: Math.floor(70 + Math.random() * 25),
                totalSleep: 6 + Math.random() * 2,
                efficiency: 75 + Math.random() * 20,
                deepSleep: 1 + Math.random() * 1,
                remSleep: 1.5 + Math.random() * 1,
                lightSleep: 3 + Math.random() * 1,
                heartRateAvg: 55 + Math.floor(Math.random() * 10),
                hrvAvg: 30 + Math.floor(Math.random() * 20),
            })),
            activity: days.map(day => ({
                day,
                steps: 5000 + Math.floor(Math.random() * 8000),
                calories: 1800 + Math.floor(Math.random() * 800),
                activeMinutes: 30 + Math.floor(Math.random() * 60),
            })),
            readiness: days.map(day => ({
                day,
                score: Math.floor(65 + Math.random() * 30),
                temperatureDeviation: -0.5 + Math.random(),
            })),
        };
    }
}

export const ouraCloudService = new OuraCloudService();
export default OuraCloudService;
