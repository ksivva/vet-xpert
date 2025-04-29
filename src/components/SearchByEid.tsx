
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Barcode, Search } from 'lucide-react';
import { toast } from 'sonner';

interface SearchByEidProps {
  onSearch: (eid: string) => Promise<void>;
  isSearching: boolean;
}

const SearchByEid: React.FC<SearchByEidProps> = ({ onSearch, isSearching }) => {
  const [animalEid, setAnimalEid] = useState<string>('');

  const handleBarcodeScan = () => {
    // Use realistic sample EIDs from the user requirements
    const sampleEids = ['EID-ABC9823', 'EID-QR98505'];
    const mockScannedEid = sampleEids[Math.floor(Math.random() * sampleEids.length)];
    setAnimalEid(mockScannedEid);
    toast.info(`Scanned EID: ${mockScannedEid}`);
  };

  const handleSearch = async () => {
    if (!animalEid.trim()) {
      toast.warning('Please enter or scan an Animal EID');
      return;
    }
    
    await onSearch(animalEid);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100">
      <h2 className="text-lg font-semibold mb-4">Find Animal by EID</h2>
      <div className="flex space-x-2">
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
          onClick={handleSearch}
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
    </div>
  );
};

export default SearchByEid;
