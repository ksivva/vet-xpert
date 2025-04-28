
import { supabase } from "@/integrations/supabase/client";
import { Pen, Lot } from '../types';

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
