
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import SelectField from '../components/SelectField';
import { saveTreatment } from '../utils/dataUtils';
import { TreatmentFormData, Severity } from '../types';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const TreatmentPage: React.FC = () => {
  const { animalId } = useParams<{ animalId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePens, setAvailablePens] = useState<{value: string, label: string}[]>([]);
  const [availableDiagnoses, setAvailableDiagnoses] = useState<{value: string, label: string}[]>([]);
  const [availableTreatments, setAvailableTreatments] = useState<{value: string, label: string}[]>([]);
  
  const [formData, setFormData] = useState<TreatmentFormData>({
    diagnosisId: '',
    treatmentId: '',
    treatmentPerson: '', // Keep this as it's required by the type, but we won't show it in UI
    currentWeight: '',
    severity: 'Medium' as Severity,
    date: new Date().toISOString().split('T')[0],
    moveTo: ''
  });

  // Get animal data
  const { data: animal, isLoading: isLoadingAnimal } = useQuery({
    queryKey: ['animal', animalId],
    queryFn: async () => {
      if (!animalId) return null;
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('id', animalId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!animalId
  });

  // Fetch pens and diagnoses when component mounts
  useEffect(() => {
    const fetchData = async () => {
      // Fetch pens
      const { data: pensData, error: pensError } = await supabase
        .from('pens')
        .select('id, pen_number');
      
      if (pensError) {
        console.error('Error fetching pens:', pensError);
        toast.error('Failed to load pens');
        return;
      }
      
      setAvailablePens(pensData.map(pen => ({
        value: pen.id,
        label: pen.pen_number
      })));

      // Fetch diagnoses
      const { data: diagnosesData, error: diagnosesError } = await supabase
        .from('diagnoses')
        .select('id, name');
      
      if (diagnosesError) {
        console.error('Error fetching diagnoses:', diagnosesError);
        toast.error('Failed to load diagnoses');
        return;
      }
      
      setAvailableDiagnoses(diagnosesData.map(diag => ({
        value: diag.id,
        label: diag.name
      })));
    };

    fetchData();
  }, []);

  // Fetch treatments when diagnosis changes
  useEffect(() => {
    const fetchTreatments = async () => {
      if (!formData.diagnosisId) {
        setAvailableTreatments([]);
        return;
      }

      const { data, error } = await supabase
        .from('treatment_diagnoses')
        .select(`
          treatment_id,
          treatments (id, name)
        `)
        .eq('diagnosis_id', formData.diagnosisId);
      
      if (error) {
        console.error('Error fetching treatments:', error);
        toast.error('Failed to load treatments');
        return;
      }

      setAvailableTreatments(data.map(item => ({
        value: item.treatments.id,
        label: item.treatments.name
      })));
    };

    fetchTreatments();
  }, [formData.diagnosisId]);

  const handleChange = (field: keyof TreatmentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!animalId) {
      toast.error('Animal ID is missing');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Set a default treatment person (can be updated later if needed)
      const success = await saveTreatment(animalId, {
        ...formData,
        treatmentPerson: 'system'
      });
      
      if (success) {
        toast.success('Treatment saved successfully');
        navigate('/');
      } else {
        toast.error('Failed to save treatment');
      }
    } catch (error) {
      console.error('Error in treatment submission:', error);
      toast.error('An error occurred while saving the treatment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingAnimal) {
    return (
      <Layout title="Treatment" showBackButton>
        <div className="text-center py-10">
          <p className="text-gray-500">Loading animal data...</p>
        </div>
      </Layout>
    );
  }

  if (!animal) {
    return (
      <Layout title="Treatment" showBackButton>
        <div className="text-center py-10">
          <p className="text-gray-500">Animal not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Treat ${animal.visual_tag}`} showBackButton>
      <div className="card-container">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Animal Details</h2>
            <span className={`px-3 py-1 rounded-full text-white ${
              animal.pulls > 0 ? 'bg-yellow-500' : 'bg-green-500'
            }`}>
              {animal.pulls > 0 ? `Pulls: ${animal.pulls}` : 'No Pulls'}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {animal.gender} • DOF: {animal.days_on_feed} days • Days to Ship: {animal.days_to_ship}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <SelectField
            id="diagnosis"
            label="Diagnosis"
            value={formData.diagnosisId}
            options={availableDiagnoses}
            onChange={(value) => handleChange('diagnosisId', value)}
            required
          />
          
          <SelectField
            id="treatment"
            label="Treatment"
            value={formData.treatmentId}
            options={availableTreatments}
            onChange={(value) => handleChange('treatmentId', value)}
            disabled={!formData.diagnosisId || availableTreatments.length === 0}
            required
          />
          
          <div className="mb-4">
            <label htmlFor="currentWeight" className="label">
              Current Weight (lbs)
            </label>
            <input
              id="currentWeight"
              type="number"
              value={formData.currentWeight}
              onChange={(e) => handleChange('currentWeight', e.target.value)}
              className="input-field"
              placeholder="Enter weight"
            />
          </div>
          
          <div className="mb-4">
            <label className="label">Severity</label>
            <div className="grid grid-cols-3 gap-3">
              {(['Critical', 'Medium', 'Low'] as Severity[]).map((severity) => (
                <button
                  key={severity}
                  type="button"
                  className={`py-2 px-4 border rounded-md transition-all ${
                    formData.severity === severity 
                      ? 'bg-vetxpert-purple text-white border-vetxpert-purple' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleChange('severity', severity)}
                >
                  {severity}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="date" className="label">Date</label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="input-field"
            />
          </div>
          
          <SelectField
            id="moveTo"
            label="Move To"
            value={formData.moveTo}
            options={availablePens}
            onChange={(value) => handleChange('moveTo', value)}
            required
          />
          
          <div className="pt-4 border-t">
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Treatment'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TreatmentPage;
