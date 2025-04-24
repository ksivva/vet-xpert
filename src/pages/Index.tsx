
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import Layout from '../components/Layout';
import SelectField from '../components/SelectField';
import AnimalCard from '../components/AnimalCard';
import { Animal } from '../types';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [selectedPenId, setSelectedPenId] = useState<string>('');
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

  // Handle lot selection
  const handleLotChange = (lotId: string) => {
    setSelectedLotId(lotId);
    setSelectedPenId('');
  };

  // Handle pen selection
  const handlePenChange = (penId: string) => {
    setSelectedPenId(penId);
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
        </div>

        {/* Animal List */}
        {filteredAnimals.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Animals</h2>
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
            <p className="text-gray-500">
              {selectedLotId 
                ? 'No animals found in the selected location.' 
                : 'Please select a Lot to view animals.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
