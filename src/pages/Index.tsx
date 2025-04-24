
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import Layout from '../components/Layout';
import SelectField from '../components/SelectField';
import BarcodeScanner from '../components/BarcodeScanner';
import AnimalCard from '../components/AnimalCard';
import { 
  getAnimalById, 
  getAnimalsByLotId, 
  getAnimalsByPenId, 
  getPensByLotId
} from '../utils/dataUtils';
import { Animal, Pen, Lot } from '../types';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [selectedPenId, setSelectedPenId] = useState<string>('');
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  // Fetch initial data
  const { data: lots } = useQuery({
    queryKey: ['lots'],
    queryFn: async () => {
      const { data, error } = await supabase.from('lots').select('*');
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
      return getPensByLotId(selectedLotId);
    },
    enabled: !!selectedLotId
  });

  // Update filtered animals when selections change
  useEffect(() => {
    const fetchAnimals = async () => {
      let animals: Animal[] = [];
      
      if (selectedAnimalId) {
        const animal = await getAnimalById(selectedAnimalId);
        animals = animal ? [animal] : [];
      } else if (selectedPenId) {
        animals = await getAnimalsByPenId(selectedPenId);
      } else if (selectedLotId) {
        animals = await getAnimalsByLotId(selectedLotId);
      }
      
      setFilteredAnimals(animals);
      setSelectedAnimal(animals.length === 1 ? animals[0] : null);
    };

    fetchAnimals();
  }, [selectedAnimalId, selectedLotId, selectedPenId]);

  // Handle barcode scan
  const handleScan = async (animalId: string) => {
    const animal = await getAnimalById(animalId);
    if (animal) {
      setSelectedAnimalId(animal.id);
      setSelectedLotId(animal.lotId);
      setSelectedPenId(animal.penId);
      toast.success(`Scanned animal: ${animal.visualTag}`);
    } else {
      toast.error('Animal not found');
    }
  };

  // Handle lot selection
  const handleLotChange = (lotId: string) => {
    setSelectedLotId(lotId);
    setSelectedPenId('');
    setSelectedAnimalId('');
  };

  // Handle pen selection
  const handlePenChange = (penId: string) => {
    setSelectedPenId(penId);
    setSelectedAnimalId('');
  };

  // Handle animal selection
  const handleAnimalChange = (animalId: string) => {
    setSelectedAnimalId(animalId);
  };

  // Handle treatment button click
  const handleStartTreatment = (animal: Animal) => {
    navigate(`/treatment/${animal.id}`);
  };

  return (
    <Layout title="VetXpert">
      <div className="space-y-6">
        {/* Search Filters */}
        <div className="card-container">
          <h2 className="text-lg font-semibold mb-3">Find Animal</h2>
          
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
          
          <SelectField
            id="animal"
            label="Animal ID"
            value={selectedAnimalId}
            options={filteredAnimals.map(animal => ({
              value: animal.id,
              label: animal.visualTag
            }))}
            onChange={handleAnimalChange}
            disabled={filteredAnimals.length === 0}
          />
          
          <BarcodeScanner onScan={handleScan} />
        </div>

        {/* Animal Details */}
        {selectedAnimal ? (
          <AnimalCard 
            animal={selectedAnimal} 
            onClick={() => handleStartTreatment(selectedAnimal)}
          />
        ) : (
          filteredAnimals.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Available Animals</h2>
              {filteredAnimals.map(animal => (
                <AnimalCard 
                  key={animal.id} 
                  animal={animal}
                  onClick={() => handleStartTreatment(animal)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No animals found. Please select a Lot and Pen or scan an Animal ID.</p>
            </div>
          )
        )}
      </div>
    </Layout>
  );
};

export default Index;
