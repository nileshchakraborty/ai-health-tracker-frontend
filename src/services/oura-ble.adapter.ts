/**
 * Oura Ring BLE Adapter
 * 
 * Direct Bluetooth connection to Oura Ring for privacy-first data access.
 * No cloud data sharing - all data stays local.
 * 
 * IMPORTANT: Before scanning, you MUST:
 * 1. Unpair the ring from the official Oura app
 * 2. Disable Bluetooth on any device with Oura app installed
 * 3. The ring will then start advertising every 2 seconds
 * 
 * Known Oura BLE UUIDs (may change with firmware updates):
 * - Service: 98ED0001-A541-11E4-B6A0-0002A5D5C51B
 * - Characteristics: 98ED0002, 98ED0003, ...
 */

import { BleManager, Device, Characteristic, BleError } from 'react-native-ble-plx';

// Known Oura Ring BLE UUIDs (reverse engineered)
export const OURA_BLE_CONFIG = {
    // Main service UUID
    SERVICE_UUID: '98ED0001-A541-11E4-B6A0-0002A5D5C51B',

    // Characteristic UUIDs (functionality TBD through reverse engineering)
    CHARACTERISTICS: {
        CHAR_02: '98ED0002-A541-11E4-B6A0-0002A5D5C51B', // Possibly data read
        CHAR_03: '98ED0003-A541-11E4-B6A0-0002A5D5C51B', // Possibly control
        CHAR_04: '98ED0004-A541-11E4-B6A0-0002A5D5C51B', // Unknown
        CHAR_05: '98ED0005-A541-11E4-B6A0-0002A5D5C51B', // Unknown
    },

    // Standard BLE services that may be present
    STANDARD_SERVICES: {
        DEVICE_INFO: '180A',
        BATTERY: '180F',
        HEART_RATE: '180D', // Standard HR service (may not be used)
    },

    // Device name patterns to identify Oura Ring
    DEVICE_NAME_PATTERNS: ['Oura', 'OURA', 'Ring'],
};

export interface OuraDevice {
    id: string;
    name: string | null;
    rssi: number;
    isOuraRing: boolean;
}

export interface OuraReading {
    type: 'heart_rate' | 'temperature' | 'activity' | 'battery' | 'unknown';
    value: number;
    unit: string;
    timestamp: Date;
    rawData?: Uint8Array;
}

export class OuraBleAdapter {
    private manager: BleManager | null = null;
    private connectedDevice: Device | null = null;
    private isScanning: boolean = false;
    private discoveredDevices: Map<string, OuraDevice> = new Map();
    private onDataCallback: ((reading: OuraReading) => void) | null = null;

    constructor() {
        // BleManager is created lazily when needed
    }

    /**
     * Initialize BLE manager
     */
    async initialize(): Promise<void> {
        if (!this.manager) {
            this.manager = new BleManager();
        }

        // Wait for BLE to be ready
        return new Promise((resolve, reject) => {
            const subscription = this.manager!.onStateChange((state) => {
                if (state === 'PoweredOn') {
                    subscription.remove();
                    resolve();
                } else if (state === 'PoweredOff') {
                    subscription.remove();
                    reject(new Error('Bluetooth is turned off'));
                } else if (state === 'Unauthorized') {
                    subscription.remove();
                    reject(new Error('Bluetooth permission denied'));
                }
            }, true);
        });
    }

    /**
     * Scan for Oura Ring devices
     */
    async scan(onDeviceFound: (device: OuraDevice) => void, timeoutMs: number = 10000): Promise<OuraDevice[]> {
        if (!this.manager) {
            throw new Error('BLE not initialized. Call initialize() first.');
        }

        if (this.isScanning) {
            console.warn('Already scanning');
            return Array.from(this.discoveredDevices.values());
        }

        this.isScanning = true;
        this.discoveredDevices.clear();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.stopScan();
                resolve(Array.from(this.discoveredDevices.values()));
            }, timeoutMs);

            this.manager!.startDeviceScan(
                [OURA_BLE_CONFIG.SERVICE_UUID], // Filter by Oura service
                { allowDuplicates: false },
                (error, device) => {
                    if (error) {
                        clearTimeout(timeout);
                        this.isScanning = false;
                        reject(error);
                        return;
                    }

                    if (device) {
                        const ouraDevice = this.deviceToOuraDevice(device);
                        this.discoveredDevices.set(device.id, ouraDevice);
                        onDeviceFound(ouraDevice);
                    }
                }
            );
        });
    }

    /**
     * Scan for ALL BLE devices (for debugging/discovery)
     */
    async scanAll(onDeviceFound: (device: OuraDevice) => void, timeoutMs: number = 10000): Promise<OuraDevice[]> {
        if (!this.manager) {
            throw new Error('BLE not initialized');
        }

        this.isScanning = true;
        this.discoveredDevices.clear();

        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                this.stopScan();
                resolve(Array.from(this.discoveredDevices.values()));
            }, timeoutMs);

            this.manager!.startDeviceScan(
                null, // No filter - scan all devices
                { allowDuplicates: false },
                (error, device) => {
                    if (error || !device) return;

                    const ouraDevice = this.deviceToOuraDevice(device);

                    // Only report devices with names (filter out random BLE spam)
                    if (ouraDevice.name) {
                        this.discoveredDevices.set(device.id, ouraDevice);
                        onDeviceFound(ouraDevice);
                    }
                }
            );
        });
    }

    /**
     * Stop scanning
     */
    stopScan(): void {
        if (this.manager && this.isScanning) {
            this.manager.stopDeviceScan();
            this.isScanning = false;
        }
    }

    /**
     * Connect to an Oura Ring by device ID
     */
    async connect(deviceId: string): Promise<boolean> {
        if (!this.manager) {
            throw new Error('BLE not initialized');
        }

        try {
            // Connect to device
            const device = await this.manager.connectToDevice(deviceId, {
                timeout: 10000,
            });

            // Discover services and characteristics
            await device.discoverAllServicesAndCharacteristics();

            this.connectedDevice = device;

            // Set up disconnect listener
            this.manager.onDeviceDisconnected(deviceId, (error, _device) => {
                console.log('Device disconnected:', error?.message || 'User initiated');
                this.connectedDevice = null;
            });

            return true;
        } catch (error) {
            console.error('Connection failed:', error);
            return false;
        }
    }

    /**
     * Disconnect from current device
     */
    async disconnect(): Promise<void> {
        if (this.connectedDevice) {
            try {
                await this.connectedDevice.cancelConnection();
            } catch (error) {
                console.warn('Disconnect error:', error);
            }
            this.connectedDevice = null;
        }
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.connectedDevice !== null;
    }

    /**
     * Get all services and characteristics (for debugging/reverse engineering)
     */
    async discoverServices(): Promise<{
        services: Array<{
            uuid: string;
            characteristics: Array<{
                uuid: string;
                isReadable: boolean;
                isWritable: boolean;
                isNotifiable: boolean;
            }>;
        }>;
    }> {
        if (!this.connectedDevice) {
            throw new Error('Not connected');
        }

        const services = await this.connectedDevice.services();
        const result = [];

        for (const service of services) {
            const characteristics = await service.characteristics();

            result.push({
                uuid: service.uuid,
                characteristics: characteristics.map((char) => ({
                    uuid: char.uuid,
                    isReadable: char.isReadable,
                    isWritable: char.isWritableWithResponse || char.isWritableWithoutResponse,
                    isNotifiable: char.isNotifiable || char.isIndicatable,
                })),
            });
        }

        return { services: result };
    }

    /**
     * Read a characteristic value (for debugging)
     */
    async readCharacteristic(serviceUuid: string, charUuid: string): Promise<Uint8Array | null> {
        if (!this.connectedDevice) {
            throw new Error('Not connected');
        }

        try {
            const characteristic = await this.connectedDevice.readCharacteristicForService(
                serviceUuid,
                charUuid
            );

            if (characteristic.value) {
                // Decode base64 value
                const binary = atob(characteristic.value);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                return bytes;
            }
        } catch (error) {
            console.error(`Error reading ${charUuid}:`, error);
        }

        return null;
    }

    /**
     * Subscribe to characteristic notifications
     */
    async subscribeToCharacteristic(
        serviceUuid: string,
        charUuid: string,
        onData: (data: Uint8Array) => void
    ): Promise<void> {
        if (!this.connectedDevice) {
            throw new Error('Not connected');
        }

        this.connectedDevice.monitorCharacteristicForService(
            serviceUuid,
            charUuid,
            (error, characteristic) => {
                if (error) {
                    console.error('Monitor error:', error);
                    return;
                }

                if (characteristic?.value) {
                    const binary = atob(characteristic.value);
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) {
                        bytes[i] = binary.charCodeAt(i);
                    }
                    onData(bytes);
                }
            }
        );
    }

    /**
     * Read battery level (standard BLE battery service)
     */
    async readBatteryLevel(): Promise<number | null> {
        if (!this.connectedDevice) return null;

        try {
            const characteristic = await this.connectedDevice.readCharacteristicForService(
                OURA_BLE_CONFIG.STANDARD_SERVICES.BATTERY,
                '2A19' // Battery Level characteristic
            );

            if (characteristic.value) {
                const binary = atob(characteristic.value);
                return binary.charCodeAt(0);
            }
        } catch (error) {
            console.warn('Battery read failed (may not be supported):', error);
        }

        return null;
    }

    /**
     * Write to a characteristic (for control commands)
     */
    async writeCharacteristic(
        serviceUuid: string,
        charUuid: string,
        data: Uint8Array
    ): Promise<boolean> {
        if (!this.connectedDevice) {
            throw new Error('Not connected');
        }

        try {
            // Convert to base64
            let binary = '';
            for (let i = 0; i < data.length; i++) {
                binary += String.fromCharCode(data[i]);
            }
            const base64 = btoa(binary);

            await this.connectedDevice.writeCharacteristicWithResponseForService(
                serviceUuid,
                charUuid,
                base64
            );

            return true;
        } catch (error) {
            console.error('Write failed:', error);
            return false;
        }
    }

    /**
     * Destroy manager and clean up
     */
    destroy(): void {
        this.stopScan();
        this.disconnect();
        if (this.manager) {
            this.manager.destroy();
            this.manager = null;
        }
    }

    // Private helpers

    private deviceToOuraDevice(device: Device): OuraDevice {
        const isOura = OURA_BLE_CONFIG.DEVICE_NAME_PATTERNS.some(
            (pattern) => device.name?.toLowerCase().includes(pattern.toLowerCase())
        );

        return {
            id: device.id,
            name: device.name,
            rssi: device.rssi || -100,
            isOuraRing: isOura,
        };
    }
}

export const ouraBleAdapter = new OuraBleAdapter();
export default OuraBleAdapter;
