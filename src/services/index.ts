export { grpcService, default as GrpcService } from './grpc.service';
export type { HealthData, User, HealthGoal, SyncResult, GrpcConfig } from './grpc.service';

export { bleService, default as BLEService } from './ble.service';
export type { BLEDevice, BLECharacteristic, ConnectionState } from './ble.service';

export { syncService, default as SyncService } from './sync.service';
export type { SyncQueueItem, SyncStatus } from './sync.service';

export { ouraBleAdapter, default as OuraBleAdapter, OURA_BLE_CONFIG } from './oura-ble.adapter';
export type { OuraDevice, OuraReading } from './oura-ble.adapter';

export { ouraCloudService, default as OuraCloudService } from './oura-cloud.service';
export type { OuraData, OuraSleepData, OuraActivityData, OuraReadinessData } from './oura-cloud.service';

export { healthKitService, default as HealthKitService, HEALTHKIT_TYPES } from './healthkit.service';
export type { HealthKitData, HealthKitSample } from './healthkit.service';

export { appleWatchService, default as AppleWatchService } from './apple-watch.service';
export type { WatchWorkout, WatchStatus } from './apple-watch.service';
