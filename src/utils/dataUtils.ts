import { supabase } from "@/integrations/supabase/client";
import { Animal, Pen, Lot, Treatment, TreatmentFormData } from '../types';

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
  
  // Map from database schema to our TypeScript types, ensuring gender is the right type
  return {
    id: data.id,
    visualTag: data.visual_tag,
    gender: (data.gender === 'Steer' || data.gender === 'Cow') 
      ? data.gender as 'Steer' | 'Cow'
      : 'Steer', // Default to 'Steer' if gender is invalid
    daysOnFeed: data.days_on_feed,
    daysToShip: data.days_to_ship,
    ltdTreatmentCost: data.ltd_treatment_cost,
    pulls: data.pulls,
    rePulls: data.re_pulls,
    reTreat: data.re_treat,
    penId: data.pen_id,
    lotId: data.lot_id
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
  
  // Map each item from database schema to our TypeScript types, handling gender type
  return data.map(item => ({
    id: item.id,
    visualTag: item.visual_tag,
    gender: (item.gender === 'Steer' || item.gender === 'Cow') 
      ? item.gender as 'Steer' | 'Cow'
      : 'Steer', // Default to 'Steer' if gender is invalid
    daysOnFeed: item.days_on_feed,
    daysToShip: item.days_to_ship,
    ltdTreatmentCost: item.ltd_treatment_cost,
    pulls: item.pulls,
    rePulls: item.re_pulls,
    reTreat: item.re_treat,
    penId: item.pen_id,
    lotId: item.lot_id
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
  
  // Map each item from database schema to our TypeScript types, handling gender type
  return data.map(item => ({
    id: item.id,
    visualTag: item.visual_tag,
    gender: (item.gender === 'Steer' || item.gender === 'Cow') 
      ? item.gender as 'Steer' | 'Cow'
      : 'Steer', // Default to 'Steer' if gender is invalid
    daysOnFeed: item.days_on_feed,
    daysToShip: item.days_to_ship,
    ltdTreatmentCost: item.ltd_treatment_cost,
    pulls: item.pulls,
    rePulls: item.re_pulls,
    reTreat: item.re_treat,
    penId: item.pen_id,
    lotId: item.lot_id
  }));
};

export const getPensByLotId = async (lotId: string): Promise<Pen[]> => {
  const { data, error } = await supabase
    .from('pens')
    .select('*')
    .eq('lot_id', lotId);
    
  if (error) {
    console.error('Error fetching pens:', error);
    return [];
  }
  
  if (!data) return [];
  
  // Map each item from database schema to our TypeScript types
  return data.map(item => ({
    id: item.id,
    penNumber: item.pen_number,
    lotId: item.lot_id
  }));
};

export const getPenById = async (penId: string): Promise<Pen | null> => {
  const { data, error } = await supabase
    .from('pens')
    .select('*')
    .eq('id', penId)
    .single();
    
  if (error) {
    console.error('Error fetching pen:', error);
    return null;
  }
  
  if (!data) return null;
  
  // Map from database schema to our TypeScript types
  return {
    id: data.id,
    penNumber: data.pen_number,
    lotId: data.lot_id
  };
};

export const getLotById = async (lotId: string): Promise<Lot | null> => {
  const { data, error } = await supabase
    .from('lots')
    .select('*')
    .eq('id', lotId)
    .single();
    
  if (error) {
    console.error('Error fetching lot:', error);
    return null;
  }
  
  if (!data) return null;
  
  // Map from database schema to our TypeScript types
  return {
    id: data.id,
    lotNumber: data.lot_number
  };
};

export const getLotByPenId = async (penId: string): Promise<Lot | null> => {
  const pen = await getPenById(penId);
  if (!pen || !pen.lotId) return null;
  return getLotById(pen.lotId);
};

export const getTreatmentsByDiagnosisId = async (diagnosisId: string): Promise<Treatment[]> => {
  // Check if we're using mock data (non-UUID strings)
  if (diagnosisId && !diagnosisId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    console.log('Using mock treatments data for diagnosis:', diagnosisId);
    // Return mock data for development
    return [
      { id: 'treat1', name: 'Treatment A', diagnosisIds: [diagnosisId] },
      { id: 'treat2', name: 'Treatment B', diagnosisIds: [diagnosisId] },
      { id: 'treat3', name: 'Treatment C', diagnosisIds: [diagnosisId] }
    ];
  }

  try {
    const { data, error } = await supabase
      .from('treatment_diagnoses')
      .select(`
        treatment_id,
        treatments (*)
      `)
      .eq('diagnosis_id', diagnosisId);
      
    if (error) {
      console.error('Error fetching treatments:', error);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    // Map each treatment and add the diagnosisId
    return data.map(item => ({
      id: item.treatments.id,
      name: item.treatments.name,
      diagnosisIds: [diagnosisId] // We only know this diagnosis ID from this query
    }));
  } catch (error) {
    console.error('Exception fetching treatments:', error);
    return [];
  }
};

export const saveTreatment = async (animalId: string, formData: TreatmentFormData): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('animal_treatments')
      .insert({
        animal_id: animalId,
        diagnosis_id: formData.diagnosisId,
        treatment_id: formData.treatmentId,
        treatment_person: formData.treatmentPerson,
        current_weight: formData.currentWeight ? parseFloat(formData.currentWeight) : null,
        severity: formData.severity,
        treatment_date: formData.date,
        moved_to_pen_id: formData.moveTo
      });
      
    if (error) {
      console.error('Error saving treatment:', error);
      return false;
    }
    
    // Update animal's pen if moved
    if (formData.moveTo) {
      const { error: updateError } = await supabase
        .from('animals')
        .update({ pen_id: formData.moveTo })
        .eq('id', animalId);
        
      if (updateError) {
        console.error('Error updating animal pen:', updateError);
        // We still return true as the treatment was saved
      }
    }
    
    return true;
  } catch (error) {
    console.error('Exception saving treatment:', error);
    return false;
  }
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

export const getWeekCount = (days: number): number => {
  return Math.ceil(days / 7);
};
