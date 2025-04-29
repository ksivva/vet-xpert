
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
import { searchAnimalByEid } from '../utils/dataUtils';

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
  const [searchedAnimal, setSearchedAnimal] = useState<Animal | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

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

  useEffect(() => {
    const fetchAnimals = async () => {
      if (searchedAnimal || (!selectedLotId && !selectedPenId)) {
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
        lotId: animal.lot_id,
        animalEid: animal.animal_eid,
        status: (animal.status === 'active' || animal.status === 'dead' || animal.status === 'realized') 
          ? animal.status as 'active' | 'dead' | 'realized'
          : 'active'
      })));
    };

    fetchAnimals();
  }, [selectedLotId, selectedPenId, searchedAnimal]);

  useEffect(() => {
    localStorage.setItem('selectedLotId', selectedLotId);
  }, [selectedLotId]);

  useEffect(() => {
    localStorage.setItem('selectedPenId', selectedPenId);
  }, [selectedPenId]);

  const handleLotChange = (lotId: string) => {
    setSelectedLotId(lotId);
    setSelectedPenId('');
    localStorage.removeItem('selectedPenId');
    setSearchedAnimal(null);
  };

  const handlePenChange = (penId: string) => {
    setSelectedPenId(penId);
    setSearchedAnimal(null);
  };

  const handleStartTreatment = (animal: Animal) => {
    navigate(`/treatment/${animal.id}`);
  };

  const handleBarcodeScan = () => {
    // Use realistic sample EIDs from the user requirements
    const sampleEids = ['EID-ABC9823', 'EID-QR98505'];
    const mockScannedEid = sampleEids[Math.floor(Math.random() * sampleEids.length)];
    setAnimalEid(mockScannedEid);
    toast.info(`Scanned EID: ${mockScannedEid}`);
  };

  const handleSearchByEid = async () => {
    if (!animalEid.trim()) {
      toast.warning('Please enter or scan an Animal EID');
      return;
    }

    setIsSearching(true);
    toast.info(`Searching for animal with EID: ${animalEid}`);
    
    try {
      const animal = await searchAnimalByEid(animalEid);
      
      if (animal) {
        setSearchedAnimal(animal);
        
        setSelectedLotId('');
        setSelectedPenId('');
        localStorage.removeItem('selectedLotId');
        localStorage.removeItem('selectedPenId');
        setFilteredAnimals([]);
      } else {
        setSearchedAnimal(null);
        toast.error('Animal not found with the given EID');
      }
    } catch (error) {
      console.error('Error searching for animal:', error);
      toast.error('Failed to search for animal');
      setSearchedAnimal(null);
    } finally {
      setIsSearching(false);
    }
  };

  const displayedAnimals = searchedAnimal ? [searchedAnimal] : filteredAnimals;

  return (
    <Layout title="VetXpert">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
                    handleSearchByEid();
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
              onClick={handleSearchByEid}
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

        {displayedAnimals.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {searchedAnimal ? "Search Results" : "Animals"}
            </h2>
            <div className="space-y-4">
              {displayedAnimals.map(animal => (
                <AnimalCard 
                  key={animal.id} 
                  animal={animal}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {!selectedLotId && !searchedAnimal
                ? 'Please select a Lot to view animals or search by EID.'
                : !selectedPenId && !searchedAnimal
                ? 'Please select a Pen to view animals or search by EID.'
                : 'No animals found.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
