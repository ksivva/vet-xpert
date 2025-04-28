
import { supabase } from "@/integrations/supabase/client";
import { Treatment, TreatmentFormData } from '../types';

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
