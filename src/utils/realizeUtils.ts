
import { supabase } from "@/integrations/supabase/client";
import { RealizeFormData } from '../types';

export const saveRealization = async (animalId: string, formData: RealizeFormData): Promise<boolean> => {
  try {
    // Start a transaction by using the same timestamp for all operations
    const timestamp = new Date().toISOString();
    
    // Save the realization record
    const { error: realizationError } = await supabase
      .from('animal_realizations')
      .insert({
        animal_id: animalId,
        reason_id: formData.reasonId,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        price: formData.price ? parseFloat(formData.price) : null,
        realization_date: formData.date,
        created_at: timestamp
      });
      
    if (realizationError) {
      console.error('Error saving realization:', realizationError);
      return false;
    }
    
    // Update animal status to realized
    const { error: animalUpdateError } = await supabase
      .from('animals')
      .update({
        status: 'realized'
      })
      .eq('id', animalId);
    
    if (animalUpdateError) {
      console.error('Error updating animal status:', animalUpdateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in realization submission:', error);
    return false;
  }
};

// Function to retrieve realization details for an animal
export const getRealizationDetails = async (animalId: string) => {
  try {
    const { data, error } = await supabase
      .from('animal_realizations')
      .select(`
        id, 
        weight, 
        price, 
        realization_date,
        reason_id,
        diagnoses(id, name)
      `)
      .eq('animal_id', animalId)
      .single();
    
    if (error) {
      console.error('Error fetching realization details:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getRealizationDetails:', error);
    return null;
  }
};
