
import { supabase } from "@/integrations/supabase/client";
import { RealizeFormData } from '../types';

export const saveRealization = async (animalId: string, formData: RealizeFormData): Promise<boolean> => {
  try {
    // Save the realization record
    const { error: realizationError } = await supabase
      .from('animal_realizations')
      .insert({
        animal_id: animalId,
        reason_id: formData.reasonId,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        price: formData.price ? parseFloat(formData.price) : null,
        realization_date: formData.date
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
