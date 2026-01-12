/**
 * Mock BLE Manager
 * Emulates `react-native-ble-plx` for development/simulator environments.
 * In production, replace this import with actual `BleManager`.
 */
export class BleManager {
    constructor() {
        this.isScanning = false;
        this.connectedDevice = null;
    }

    startDeviceScan(uuids, options, listener) {
        if (this.isScanning) return;
        this.isScanning = true;

        console.log('[BLE] Starting Scan...');

        // Simulate finding device after delay
        setTimeout(() => {
            if (!this.isScanning) return;
            const mockDevice = {
                id: 'SC-8821',
                name: 'SmartCollar X1',
                rssi: -45,
                mtu: 23,
                manufacturerData: 'Tk9RFZA====',
                serviceUUIDs: ['0000180d-0000-1000-8000-00805f9b34fb'],
                connect: async () => this.connectToDevice('SC-8821')
            };
            listener(null, mockDevice);
        }, 2500);
    }

    stopDeviceScan() {
        console.log('[BLE] Stopping Scan');
        this.isScanning = false;
    }

    async connectToDevice(deviceId) {
        console.log(`[BLE] Connecting to ${deviceId}...`);
        await new Promise(r => setTimeout(r, 1500)); // Sim connection time

        this.connectedDevice = {
            id: deviceId,
            name: 'SmartCollar X1',
            isConnected: async () => true,
            discoverAllServicesAndCharacteristics: async () => {
                console.log('[BLE] Discovering Services...');
                await new Promise(r => setTimeout(r, 1000));
                return this.connectedDevice;
            },
            onDisconnected: (cb) => {
                // Sim random disconnect?
            }
        };
        return this.connectedDevice;
    }

    destroy() {
        this.stopDeviceScan();
    }
}

export default new BleManager();
