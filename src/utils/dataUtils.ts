import { supabase } from "@/integrations/supabase/client";
import { Animal, Pen, Lot, Treatment, TreatmentFormData, DeathFormData } from '../types';

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
    animalEid: data.animal_eid
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
    animalEid: data.animal_eid
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
  if (diagnosisId && !diagnosisId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    console.log('Using mock treatments data for diagnosis:', diagnosisId);
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
    
    return data.map(item => ({
      id: item.treatments.id,
      name: item.treatments.name,
      diagnosisIds: [diagnosisId]
    }));
  } catch (error) {
    console.error('Exception fetching treatments:', error);
    return [];
  }
};

export const saveTreatment = async (animalId: string, formData: TreatmentFormData): Promise<boolean> => {
  try {
    const { error: treatmentError } = await supabase
      .from('animal_treatments')
      .insert({
        animal_id: animalId,
        diagnosis_id: formData.diagnosisId,
        treatment_id: formData.treatmentId,
        treatment_person: formData.treatmentPerson || 'system',
        current_weight: formData.currentWeight ? parseFloat(formData.currentWeight) : null,
        severity: formData.severity,
        treatment_date: formData.date,
        moved_to_pen_id: formData.moveTo
      });
      
    if (treatmentError) {
      console.error('Detailed treatment insertion error:', treatmentError);
      return false;
    }
    
    const { data: animalData, error: animalFetchError } = await supabase
      .from('animals')
      .select('pulls, re_treat')
      .eq('id', animalId)
      .single();
      
    if (animalFetchError) {
      console.error('Error fetching animal for update:', animalFetchError);
      return true;
    }

    const updateData: any = {
      re_treat: (animalData?.re_treat || 0) + 1,
    };
    
    if (formData.moveTo) {
      updateData.pen_id = formData.moveTo;
    }
    
    const { error: animalUpdateError } = await supabase
      .from('animals')
      .update(updateData)
      .eq('id', animalId);
        
    if (animalUpdateError) {
      console.error('Error updating animal data:', animalUpdateError);
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error saving treatment:', error);
    return false;
  }
};

export const saveDeathRecord = async (animalId: string, formData: DeathFormData): Promise<boolean> => {
  try {
    const { error: deathRecordError } = await supabase
      .from('animal_deaths')
      .insert({
        animal_id: animalId,
        reason: formData.reason,
        necropsy: formData.necropsy,
        death_date: formData.deathDate
      });
      
    if (deathRecordError) {
      console.error('Error inserting death record:', deathRecordError);
      return false;
    }
    
    const { error: animalUpdateError } = await supabase
      .from('animals')
      .update({
        status: 'dead'
      })
      .eq('id', animalId);
        
    if (animalUpdateError) {
      console.error('Error updating animal status:', animalUpdateError);
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error saving death record:', error);
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
