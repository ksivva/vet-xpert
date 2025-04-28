
import { supabase } from "@/integrations/supabase/client";
import { Animal } from '../types';

export const getAnimalById = async (id: string): Promise<Animal | null> => {
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching animal:', error);
    return null;
  }
  
  if (!data) return null;
  
  return {
    id: data.id,
    visualTag: data.visual_tag,
    gender: (data.gender === 'Steer' || data.gender === 'Cow') 
      ? data.gender as 'Steer' | 'Cow'
      : 'Steer',
    daysOnFeed: data.days_on_feed,
    daysToShip: data.days_to_ship,
    ltdTreatmentCost: data.ltd_treatment_cost,
    pulls: data.pulls,
    rePulls: data.re_pulls,
    reTreat: data.re_treat,
    penId: data.pen_id,
    lotId: data.lot_id,
    animalEid: data.animal_eid,
    status: (data.status === 'active' || data.status === 'dead' || data.status === 'realized') 
      ? data.status as 'active' | 'dead' | 'realized'
      : 'active'
  };
};

export const searchAnimalByEid = async (eid: string): Promise<Animal | null> => {
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .ilike('animal_eid', `%${eid}%`)
    .limit(1)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      console.log('No animal found with EID:', eid);
      return null;
    }
    console.error('Error searching for animal by EID:', error);
    return null;
  }
  
  if (!data) return null;
  
  return {
    id: data.id,
    visualTag: data.visual_tag,
    gender: (data.gender === 'Steer' || data.gender === 'Cow') 
      ? data.gender as 'Steer' | 'Cow'
      : 'Steer',
    daysOnFeed: data.days_on_feed,
    daysToShip: data.days_to_ship,
    ltdTreatmentCost: data.ltd_treatment_cost,
    pulls: data.pulls,
    rePulls: data.re_pulls,
    reTreat: data.re_treat,
    penId: data.pen_id,
    lotId: data.lot_id,
    animalEid: data.animal_eid,
    status: (data.status === 'active' || data.status === 'dead' || data.status === 'realized') 
      ? data.status as 'active' | 'dead' | 'realized'
      : 'active'
  };
};

export const getAnimalsByLotId = async (lotId: string): Promise<Animal[]> => {
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .eq('lot_id', lotId);
    
  if (error) {
    console.error('Error fetching animals by lot:', error);
    return [];
  }
  
  if (!data) return [];
  
  return data.map(item => ({
    id: item.id,
    visualTag: item.visual_tag,
    gender: (item.gender === 'Steer' || item.gender === 'Cow') 
      ? item.gender as 'Steer' | 'Cow'
      : 'Steer',
    daysOnFeed: item.days_on_feed,
    daysToShip: item.days_to_ship,
    ltdTreatmentCost: item.ltd_treatment_cost,
    pulls: item.pulls,
    rePulls: item.re_pulls,
    reTreat: item.re_treat,
    penId: item.pen_id,
    lotId: item.lot_id,
    animalEid: item.animal_eid,
    status: (item.status === 'active' || item.status === 'dead' || item.status === 'realized') 
      ? item.status as 'active' | 'dead' | 'realized'
      : 'active'
  }));
};

export const getAnimalsByPenId = async (penId: string): Promise<Animal[]> => {
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .eq('pen_id', penId);
    
  if (error) {
    console.error('Error fetching animals by pen:', error);
    return [];
  }
  
  if (!data) return [];
  
  return data.map(item => ({
    id: item.id,
    visualTag: item.visual_tag,
    gender: (item.gender === 'Steer' || item.gender === 'Cow') 
      ? item.gender as 'Steer' | 'Cow'
      : 'Steer',
    daysOnFeed: item.days_on_feed,
    daysToShip: item.days_to_ship,
    ltdTreatmentCost: item.ltd_treatment_cost,
    pulls: item.pulls,
    rePulls: item.re_pulls,
    reTreat: item.re_treat,
    penId: item.pen_id,
    lotId: item.lot_id,
    animalEid: item.animal_eid,
    status: (item.status === 'active' || item.status === 'dead' || item.status === 'realized') 
      ? item.status as 'active' | 'dead' | 'realized'
      : 'active'
  }));
};
