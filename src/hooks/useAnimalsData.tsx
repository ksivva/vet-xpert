
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Animal } from '../types';
import { toast } from 'sonner';
import { searchAnimalByEid } from '../utils/dataUtils';

export const useAnimalsData = () => {
  const [selectedLotId, setSelectedLotId] = useState<string>(() => 
    localStorage.getItem('selectedLotId') || ''
  );
  const [selectedPenId, setSelectedPenId] = useState<string>(() => 
    localStorage.getItem('selectedPenId') || ''
  );
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [searchedAnimal, setSearchedAnimal] = useState<Animal | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Query for lots data
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

  // Query for pens data based on selected lot
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

  // Effect for fetching animals based on lot and pen selections
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

  // Save selections to localStorage
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

  const handleSearchByEid = async (animalEid: string) => {
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

  // Determine which animals to display
  const displayedAnimals = searchedAnimal ? [searchedAnimal] : filteredAnimals;

  return {
    lots,
    pens,
    selectedLotId,
    selectedPenId,
    isSearching,
    displayedAnimals,
    handleLotChange,
    handlePenChange,
    handleSearchByEid,
    searchedAnimal: !!searchedAnimal
  };
};

export default useAnimalsData;
