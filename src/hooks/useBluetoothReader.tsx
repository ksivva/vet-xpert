
import { useState, useEffect, useCallback } from 'react';
import { bluetoothService, BluetoothServiceState } from '../utils/bluetoothService';
import { toast } from 'sonner';

export const useBluetoothReader = () => {
  const [state, setState] = useState<BluetoothServiceState>({
    isAvailable: false,
    isConnected: false,
    connecting: false,
    deviceName: null,
    error: null
  });
  
  // Handler for scan data
  const [scannedEid, setScannedEid] = useState<string | null>(null);
  
  // Check Bluetooth availability on mount
  useEffect(() => {
    const isAvailable = bluetoothService.isBluetoothAvailable();
    setState(prev => ({ ...prev, isAvailable }));
    
    if (!isAvailable) {
      console.warn('Bluetooth is not available on this device/browser');
    }
  }, []);
  
  // Request device and connect
  const connectToReader = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, connecting: true, error: null }));
      
      // Request device selection
      const device = await bluetoothService.requestDevice();
      if (!device) {
        setState(prev => ({ 
          ...prev, 
          connecting: false, 
          error: 'No device selected' 
        }));
        return;
      }
      
      // Connect to the selected device
      const connected = await bluetoothService.connect();
      
      if (connected) {
        setState({
          isAvailable: true,
          isConnected: true,
          connecting: false,
          deviceName: device.name,
          error: null
        });
        toast.success(`Connected to ${device.name}`);
        
        // Start listening for scan data
        await startScanning();
      } else {
        setState(prev => ({ 
          ...prev, 
          connecting: false,
          isConnected: false,
          error: 'Failed to connect to device' 
        }));
        toast.error('Failed to connect to device');
      }
    } catch (error) {
      console.error('Error connecting:', error);
      setState(prev => ({ 
        ...prev, 
        connecting: false,
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
      toast.error('Connection error');
    }
  }, []);
  
  // Disconnect from reader
  const disconnectFromReader = useCallback(async () => {
    await bluetoothService.disconnect();
    setState(prev => ({
      ...prev,
      isConnected: false,
      deviceName: null
    }));
    toast.info('Disconnected from reader');
  }, []);
  
  // Start scanning for EIDs
  const startScanning = useCallback(async () => {
    const success = await bluetoothService.startScanning((eid) => {
      setScannedEid(eid);
      // Show toast for successful scan
      toast.success(`Scanned EID: ${eid}`);
    });
    
    if (!success) {
      toast.error('Failed to start scanning');
    }
    
    return success;
  }, []);
  
  // Clear the last scanned EID after it's been used
  const clearScannedEid = useCallback(() => {
    setScannedEid(null);
  }, []);
  
  return {
    ...state,
    connectToReader,
    disconnectFromReader,
    scannedEid,
    clearScannedEid
  };
};
