
import { supabase } from "@/integrations/supabase/client";
import { DeathFormData } from '../types';

export const getDeathRecordByAnimalId = async (animalId: string): Promise<DeathFormData | null> => {
  try {
    console.log('Fetching death record for animal ID:', animalId);
    const { data, error } = await supabase
      .from('animal_deaths')
      .select('*')
      .eq('animal_id', animalId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching death record:', error);
      return null;
    }
    
    if (!data) {
      console.log('No death record found for animal ID:', animalId);
      return null;
    }
    
    console.log('Found death record:', data);
    return {
      reason: data.reason,
      necropsy: data.necropsy,
      deathDate: data.death_date
    };
  } catch (error) {
    console.error('Exception fetching death record:', error);
    return null;
  }
};

export const saveDeathRecord = async (animalId: string, formData: DeathFormData): Promise<boolean> => {
  try {
    console.log('Saving death record for animal ID:', animalId, formData);
    
    const { data: existingRecord } = await supabase
      .from('animal_deaths')
      .select('id')
      .eq('animal_id', animalId)
      .maybeSingle();
      
    if (existingRecord) {
      // Update existing record
      console.log('Updating existing death record ID:', existingRecord.id);
      const { error: updateError } = await supabase
        .from('animal_deaths')
        .update({
          reason: formData.reason,
          necropsy: formData.necropsy,
          death_date: formData.deathDate
        })
        .eq('id', existingRecord.id);
        
      if (updateError) {
        console.error('Error updating death record:', updateError);
        return false;
      }
      
      console.log('Death record updated successfully');
    } else {
      // Insert new record
      console.log('Creating new death record');
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
      
      console.log('New death record created successfully');
      
      // Update animal status to dead
      const { error: animalUpdateError } = await supabase
        .from('animals')
        .update({
          status: 'dead'
        })
        .eq('id', animalId);
          
      if (animalUpdateError) {
        console.error('Error updating animal status:', animalUpdateError);
        return true; // Still return true as the death record was created
      }
      
      console.log('Animal status updated to dead');
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error saving death record:', error);
    return false;
  }
};
