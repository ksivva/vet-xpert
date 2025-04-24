import { supabase } from "@/integrations/supabase/client";
import { Animal, Pen, Lot, Treatment } from '../types';

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
  return data;
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
  return data || [];
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
  return data || [];
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
  return data || [];
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
  return data;
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
  return data;
};

export const getLotByPenId = async (penId: string): Promise<Lot | null> => {
  const pen = await getPenById(penId);
  if (!pen || !pen.lotId) return null;
  return getLotById(pen.lotId);
};

export const getTreatmentsByDiagnosisId = async (diagnosisId: string): Promise<Treatment[]> => {
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
  
  return data?.map(item => item.treatments) || [];
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
