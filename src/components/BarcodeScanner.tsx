
import React from 'react';

interface BarcodeScannerProps {
  onScan: (animalId: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => {
  // In a real app, this would connect to the device's camera
  // For this demo, we'll simulate scanning with a button
  
  const handleScan = () => {
    // Simulate scanning animal1 from our mock data
    onScan('animal1');
  };
  
  return (
    <div className="mt-2">
      <button
        onClick={handleScan}
        className="flex items-center justify-center w-full py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <rect width="20" height="5" x="2" y="2" rx="1"/>
          <rect width="20" height="5" x="2" y="9.5" rx="1"/>
          <rect width="20" height="5" x="2" y="17" rx="1"/>
        </svg>
        Scan Barcode
      </button>
      <p className="text-xs text-gray-500 mt-1 text-center">
        (Simulated - clicks will scan animal A1001)
      </p>
    </div>
  );
};

export default BarcodeScanner;
