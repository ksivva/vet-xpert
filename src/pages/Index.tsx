
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import Layout from '../components/Layout';
import SelectField from '../components/SelectField';
import AnimalCard from '../components/AnimalCard';
import { Animal } from '../types';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Barcode, Search } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLotId, setSelectedLotId] = useState<string>(() => 
    localStorage.getItem('selectedLotId') || ''
  );
  const [selectedPenId, setSelectedPenId] = useState<string>(() => 
    localStorage.getItem('selectedPenId') || ''
  );
  const [animalEid, setAnimalEid] = useState<string>('');
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);

  // Fetch lots
  const { data: lots } = useQuery({
    queryKey: ['lots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lots')
        .select('*');
      if (error) throw error;
      return data.map(lot => ({
        id: lot.id,
        lotNumber: lot.lot_number
      }));
    }
  });

  // Fetch pens based on selected lot
  const { data: pens } = useQuery({
    queryKey: ['pens', selectedLotId],
    queryFn: async () => {
      if (!selectedLotId) return [];
      const { data, error } = await supabase
        .from('pens')
        .select('*')
        .eq('lot_id', selectedLotId);
      if (error) throw error;
      return data.map(pen => ({
        id: pen.id,
        penNumber: pen.pen_number,
        lotId: pen.lot_id
      }));
    },
    enabled: !!selectedLotId
  });

  // Fetch animals based on filters
  useEffect(() => {
    const fetchAnimals = async () => {
      // Only fetch animals if both lot and pen are selected
      if (!selectedLotId || !selectedPenId) {
        setFilteredAnimals([]);
        return;
      }

      let query = supabase.from('animals').select('*');
      
      if (selectedPenId) {
        query = query.eq('pen_id', selectedPenId);
      } else if (selectedLotId) {
        query = query.eq('lot_id', selectedLotId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching animals:', error);
        toast.error('Failed to load animals');
        return;
      }

      setFilteredAnimals(data.map(animal => ({
        id: animal.id,
        visualTag: animal.visual_tag,
        gender: animal.gender as 'Steer' | 'Cow',
        daysOnFeed: animal.days_on_feed,
        daysToShip: animal.days_to_ship,
        ltdTreatmentCost: animal.ltd_treatment_cost,
        pulls: animal.pulls,
        rePulls: animal.re_pulls,
        reTreat: animal.re_treat,
        penId: animal.pen_id,
        lotId: animal.lot_id
      })));
    };

    fetchAnimals();
  }, [selectedLotId, selectedPenId]);

  // Update localStorage when selections change
  useEffect(() => {
    localStorage.setItem('selectedLotId', selectedLotId);
  }, [selectedLotId]);

  useEffect(() => {
    localStorage.setItem('selectedPenId', selectedPenId);
  }, [selectedPenId]);

  // Handle lot selection
  const handleLotChange = (lotId: string) => {
    setSelectedLotId(lotId);
    setSelectedPenId('');
    localStorage.removeItem('selectedPenId'); // Clear pen when lot changes
  };

  // Handle pen selection
  const handlePenChange = (penId: string) => {
    setSelectedPenId(penId);
  };

  // Handle treatment button click
  const handleStartTreatment = (animal: Animal) => {
    navigate(`/treatment/${animal.id}`);
  };

  // Handle barcode scan button click
  const handleBarcodeScan = () => {
    // In a real application, this would trigger the device's camera/scanner
    // For now, we'll just simulate a scan by populating with a sample EID
    const mockScannedEid = `EID-${Math.floor(Math.random() * 10000)}`;
    setAnimalEid(mockScannedEid);
    toast.info(`Scanned EID: ${mockScannedEid}`);
    
    // In a real app, you might want to search for this animal in the database
    // and navigate to its treatment page if found
  };

  // Handle search by EID
  const handleSearchByEid = () => {
    if (!animalEid.trim()) {
      toast.warning('Please enter or scan an Animal EID');
      return;
    }

    // In a real app, this would query the database for the animal with this EID
    // For now, we'll just simulate finding it or not
    toast.info(`Searching for animal with EID: ${animalEid}`);
    
    // Example implementation:
    // searchAnimalByEid(animalEid)
    //   .then(animal => {
    //     if (animal) navigate(`/treatment/${animal.id}`);
    //     else toast.error('Animal not found');
    //   });
  };

  return (
    <Layout title="VetXpert">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* EID Search Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Find Animal by EID</h2>
          <div className="flex space-x-2">
            <div className="flex-grow">
              <Input
                type="text"
                placeholder="Enter Animal EID"
                value={animalEid}
                onChange={(e) => setAnimalEid(e.target.value)}
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
              onClick={handleSearchByEid}
              className="flex-shrink-0"
            >
              <Search className="h-5 w-5 mr-1" />
              Search
            </Button>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Find Animal by Location</h2>
          
          <div className="space-y-4">
            <SelectField
              id="lot"
              label="Lot"
              value={selectedLotId}
              options={lots?.map(lot => ({
                value: lot.id,
                label: `Lot ${lot.lotNumber}`
              })) || []}
              onChange={handleLotChange}
            />
            
            <SelectField
              id="pen"
              label="Pen"
              value={selectedPenId}
              options={pens?.map(pen => ({
                value: pen.id,
                label: `Pen ${pen.penNumber}`
              })) || []}
              onChange={handlePenChange}
              disabled={!selectedLotId}
            />
          </div>
        </div>

        {/* Animal List */}
        {filteredAnimals.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Animals</h2>
            <div className="space-y-4">
              {filteredAnimals.map(animal => (
                <AnimalCard 
                  key={animal.id} 
                  animal={animal}
                  onClick={() => handleStartTreatment(animal)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {!selectedLotId
                ? 'Please select a Lot to view animals.'
                : !selectedPenId
                ? 'Please select a Pen to view animals.'
                : 'No animals found in the selected location.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
