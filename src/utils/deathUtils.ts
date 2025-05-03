
import { supabase } from "@/integrations/supabase/client";
import { DeathFormData } from '../types';
import { toast } from "sonner";

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
    
    // Get image URL if it exists
    let imageUrl = null;
    // Check if image_path exists as a property on data using hasOwnProperty
    if (data && Object.prototype.hasOwnProperty.call(data, 'image_path') && data.image_path) {
      const { data: imageData } = await supabase
        .storage
        .from('animal_deaths')
        .getPublicUrl(data.image_path);
        
      if (imageData) {
        imageUrl = imageData.publicUrl;
      }
    }
    
    return {
      reason: data.reason,
      necropsy: data.necropsy,
      deathDate: data.death_date,
      imageUrl: imageUrl
    };
  } catch (error) {
    console.error('Exception fetching death record:', error);
    return null;
  }
};

export const saveDeathRecord = async (animalId: string, formData: DeathFormData): Promise<boolean> => {
  try {
    console.log('Saving death record for animal ID:', animalId, formData);
    
    // Handle image upload if there is one
    let imagePath = null;
    if (formData.image) {
      const fileExt = formData.image.name.split('.').pop();
      const fileName = `${animalId}_${Date.now()}.${fileExt}`;
      const filePath = `${animalId}/${fileName}`;
      
      console.log('Uploading image:', filePath);
      
      // Ensure storage bucket exists
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('animal_deaths');
        
      if (bucketError) {
        // Create bucket if it doesn't exist
        if (bucketError.message.includes('does not exist')) {
          const { error: createError } = await supabase
            .storage
            .createBucket('animal_deaths', {
              public: true,
              fileSizeLimit: 10485760 // 10MB
            });
            
          if (createError) {
            console.error('Error creating bucket:', createError);
            return false;
          }
        } else {
          console.error('Error checking bucket:', bucketError);
          return false;
        }
      }
      
      // Upload image
      const { error: uploadError } = await supabase
        .storage
        .from('animal_deaths')
        .upload(filePath, formData.image);
        
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast.error('Failed to upload image');
        return false;
      }
      
      imagePath = filePath;
    }
    
    const { data: existingRecord } = await supabase
      .from('animal_deaths')
      .select('id')
      .eq('animal_id', animalId)
      .maybeSingle();
      
    if (existingRecord) {
      // Update existing record
      console.log('Updating existing death record ID:', existingRecord.id);
      
      let updateData: any = {
        reason: formData.reason,
        necropsy: formData.necropsy,
        death_date: formData.deathDate
      };
      
      // Only update the image path if a new image was uploaded
      if (imagePath) {
        updateData.image_path = imagePath;
      }
      
      const { error: updateError } = await supabase
        .from('animal_deaths')
        .update(updateData)
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
          death_date: formData.deathDate,
          image_path: imagePath
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
