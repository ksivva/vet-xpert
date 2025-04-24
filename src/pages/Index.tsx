
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SelectField from '../components/SelectField';
import BarcodeScanner from '../components/BarcodeScanner';
import AnimalCard from '../components/AnimalCard';
import { 
  animals, 
  lots, 
  pens 
} from '../data/mockData';
import { 
  getAnimalById, 
  getAnimalsByLotId, 
  getAnimalsByPenId, 
  getPensByLotId
} from '../utils/dataUtils';
import { Animal } from '../types';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [selectedPenId, setSelectedPenId] = useState<string>('');
  const [filteredPens, setFilteredPens] = useState(pens);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  // Update filtered pens when lot changes
  useEffect(() => {
    if (selectedLotId) {
      const pensByLot = getPensByLotId(selectedLotId);
      setFilteredPens(pensByLot);
      // Clear pen selection if current selection is not in filtered pens
      if (selectedPenId && !pensByLot.some(pen => pen.id === selectedPenId)) {
        setSelectedPenId('');
      }
    } else {
      setFilteredPens(pens);
    }
  }, [selectedLotId, selectedPenId]);

  // Update filtered animals
  useEffect(() => {
    let filtered: Animal[] = [];
    
    if (selectedAnimalId) {
      const animal = getAnimalById(selectedAnimalId);
      filtered = animal ? [animal] : [];
    } else if (selectedPenId) {
      filtered = getAnimalsByPenId(selectedPenId);
    } else if (selectedLotId) {
      filtered = getAnimalsByLotId(selectedLotId);
    }
    
    setFilteredAnimals(filtered);
    
    // Auto-select the animal if there's only one
    if (filtered.length === 1) {
      setSelectedAnimal(filtered[0]);
    } else {
      setSelectedAnimal(null);
    }
  }, [selectedAnimalId, selectedLotId, selectedPenId]);

  // Handle barcode scan
  const handleScan = (animalId: string) => {
    const animal = getAnimalById(animalId);
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
            options={lots.map(lot => ({
              value: lot.id,
              label: `Lot ${lot.lotNumber}`
            }))}
            onChange={handleLotChange}
          />
          
          <SelectField
            id="pen"
            label="Pen"
            value={selectedPenId}
            options={filteredPens.map(pen => ({
              value: pen.id,
              label: `Pen ${pen.penNumber}`
            }))}
            onChange={handlePenChange}
            disabled={!selectedLotId && filteredPens.length === pens.length}
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
