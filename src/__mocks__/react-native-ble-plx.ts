// Mock for react-native-ble-plx
export class BleManager {
    constructor() { }

    onStateChange(callback: (state: string) => void, emitCurrentState: boolean) {
        if (emitCurrentState) {
            callback('PoweredOn');
        }
        return { remove: () => { } };
    }

    startDeviceScan(
        _uuids: string[] | null,
        _options: any,
        _callback: (error: any, device: any) => void
    ) { }

    stopDeviceScan() { }

    connectToDevice(_deviceId: string, _options?: any) {
        return Promise.resolve({
            id: 'mock-device',
            name: 'Mock Device',
            discoverAllServicesAndCharacteristics: () => Promise.resolve(),
            services: () => Promise.resolve([]),
            cancelConnection: () => Promise.resolve(),
        });
    }

    onDeviceDisconnected(_deviceId: string, _callback: any) { }

    destroy() { }
}

export const Device = {};
export const Characteristic = {};
export const BleError = class extends Error { };
