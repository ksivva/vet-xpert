
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Barcode, Search, Bluetooth, BluetoothOff } from 'lucide-react';
import { toast } from 'sonner';
import { useBluetoothReader } from '../hooks/useBluetoothReader';

interface SearchByEidProps {
  onSearch: (eid: string) => Promise<void>;
  isSearching: boolean;
}

const SearchByEid: React.FC<SearchByEidProps> = ({ onSearch, isSearching }) => {
  const [animalEid, setAnimalEid] = useState<string>('');
  const { 
    isAvailable, 
    isConnected, 
    connecting, 
    deviceName,
    connectToReader, 
    disconnectFromReader,
    scannedEid,
    clearScannedEid
  } = useBluetoothReader();

  // When an EID is scanned via Bluetooth, update the input field
  useEffect(() => {
    if (scannedEid) {
      setAnimalEid(scannedEid);
      // Automatically trigger search when EID is scanned
      handleSearch(scannedEid);
      // Clear the scanned EID to prepare for next scan
      clearScannedEid();
    }
  }, [scannedEid, onSearch, clearScannedEid]);

  const handleBarcodeScan = () => {
    // Use realistic sample EIDs from the user requirements
    const sampleEids = ['EID-ABC9823', 'EID-QR98505'];
    const mockScannedEid = sampleEids[Math.floor(Math.random() * sampleEids.length)];
    setAnimalEid(mockScannedEid);
    toast.info(`Scanned EID: ${mockScannedEid}`);
  };

  const handleSearch = async (eid?: string) => {
    const searchEid = eid || animalEid;
    if (!searchEid.trim()) {
      toast.warning('Please enter or scan an Animal EID');
      return;
    }
    
    await onSearch(searchEid);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100">
      <h2 className="text-lg font-semibold mb-4">Find Animal by EID</h2>
      <div className="flex space-x-2 mb-3">
        <div className="flex-grow">
          <Input
            type="text"
            placeholder="Enter Animal EID"
            value={animalEid}
            onChange={(e) => setAnimalEid(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
        <Button 
          type="button" 
          variant="outline"
          onClick={handleBarcodeScan}
          className="flex-shrink-0"
        >
          <Barcode className="h-5 w-5" />
        </Button>
        <Button 
          type="button"
          onClick={() => handleSearch()}
          className="flex-shrink-0"
          disabled={isSearching}
        >
          {isSearching ? (
            <span className="animate-pulse">Searching...</span>
          ) : (
            <>
              <Search className="h-5 w-5 mr-1" />
              Search
            </>
          )}
        </Button>
      </div>

      {/* Bluetooth Reader Connection UI */}
      {isAvailable && (
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium flex items-center">
                <Bluetooth className="h-4 w-4 mr-2 text-vetxpert-blue" />
                RS420 Stick Reader
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {isConnected 
                  ? `Connected to ${deviceName}` 
                  : 'Connect to scan EID tags directly'}
              </p>
            </div>
            <Button
              variant={isConnected ? "destructive" : "secondary"}
              size="sm"
              onClick={isConnected ? disconnectFromReader : connectToReader}
              disabled={connecting}
            >
              {connecting ? (
                <span className="animate-pulse">Connecting...</span>
              ) : isConnected ? (
                <>
                  <BluetoothOff className="h-4 w-4 mr-1" />
                  Disconnect
                </>
              ) : (
                <>
                  <Bluetooth className="h-4 w-4 mr-1" />
                  Connect
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchByEid;
