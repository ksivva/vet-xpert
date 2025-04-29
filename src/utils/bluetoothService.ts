
// Bluetooth service for connecting to Allflex RS420 Stick Reader

export interface BluetoothDevice {
  id: string;
  name: string;
}

export interface BluetoothServiceState {
  isAvailable: boolean;
  isConnected: boolean;
  connecting: boolean;
  deviceName: string | null;
  error: string | null;
}

class BluetoothService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  
  // Service UUID for RFID readers - this may need to be updated based on the specific Allflex model
  private readonly SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
  // Characteristic UUID for reading data - this may need to be updated based on the specific Allflex model
  private readonly CHARACTERISTIC_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';
  
  // Check if Web Bluetooth API is available
  isBluetoothAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }
  
  // Request a device to connect with
  async requestDevice(): Promise<BluetoothDevice | null> {
    try {
      if (!this.isBluetoothAvailable()) {
        throw new Error('Bluetooth is not available on this device');
      }
      
      // Request the device
      const device = await navigator.bluetooth.requestDevice({
        // Accept all devices that advertise the RFID reader service
        filters: [
          { services: [this.SERVICE_UUID] }
        ],
        // Alternatively, if the service UUID isn't advertised, use name-based filtering
        // filters: [{ namePrefix: 'RS420' }],
        optionalServices: [this.SERVICE_UUID]
      });
      
      this.device = {
        id: device.id,
        name: device.name || 'Unknown Device'
      };
      
      // Set up disconnect listener
      device.addEventListener('gattserverdisconnected', () => {
        this.characteristic = null;
        this.server = null;
        console.log('Device disconnected');
      });
      
      return this.device;
    } catch (error) {
      console.error('Error requesting Bluetooth device:', error);
      return null;
    }
  }
  
  // Connect to the selected device
  async connect(): Promise<boolean> {
    if (!this.device) {
      console.error('No device selected');
      return false;
    }
    
    try {
      // Access the underlying BluetoothDevice
      const nativeDevice = await navigator.bluetooth.getDevices()
        .then(devices => devices.find(d => d.id === this.device?.id));
        
      if (!nativeDevice) {
        throw new Error('Device not found');
      }
      
      // Connect to GATT Server
      this.server = await nativeDevice.gatt?.connect();
      
      if (!this.server) {
        throw new Error('Failed to connect to GATT server');
      }
      
      // Get primary service
      const service = await this.server.getPrimaryService(this.SERVICE_UUID);
      
      // Get characteristic for reading EID data
      this.characteristic = await service.getCharacteristic(this.CHARACTERISTIC_UUID);
      
      // Start notifications
      await this.characteristic.startNotifications();
      
      console.log('Connected to device:', nativeDevice.name);
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  }
  
  // Disconnect from device
  async disconnect(): Promise<void> {
    if (this.server) {
      this.server.disconnect();
      this.server = null;
    }
    this.characteristic = null;
  }
  
  // Add a listener for EID scan data
  async startScanning(callback: (eid: string) => void): Promise<boolean> {
    if (!this.characteristic) {
      console.error('Not connected to device');
      return false;
    }
    
    try {
      // We need to define a handler function that we can later remove
      const handleValueChange = (event: Event) => {
        // The RS420 typically sends the EID as a string or buffer
        // We need to parse the data according to the device's specific format
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        const value = target.value;
        if (!value) return;
        
        // Parse the data buffer to extract the EID
        // This parsing logic may need to be adjusted based on the exact data format from the RS420
        let eid = '';
        for (let i = 0; i < value.byteLength; i++) {
          eid += String.fromCharCode(value.getUint8(i));
        }
        
        // Clean up the EID (remove non-printable chars, etc)
        eid = eid.trim();
        
        if (eid) {
          callback(eid);
        }
      };
      
      this.characteristic.addEventListener('characteristicvaluechanged', handleValueChange);
      
      await this.characteristic.startNotifications();
      console.log('Started scanning for EIDs');
      return true;
    } catch (error) {
      console.error('Error starting scan:', error);
      return false;
    }
  }
  
  // Get current connection status
  getConnectionStatus(): { connected: boolean; deviceName: string | null } {
    return {
      connected: !!this.server && !!this.characteristic,
      deviceName: this.device?.name || null
    };
  }
}

// Export a singleton instance
export const bluetoothService = new BluetoothService();
