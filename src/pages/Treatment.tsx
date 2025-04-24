
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import SelectField from '../components/SelectField';
import { getAnimalById, getTreatmentsByDiagnosisId, saveTreatment } from '../utils/dataUtils';
import { diagnoses, treatments, pens, currentUser } from '../data/mockData';
import { TreatmentFormData, Severity, Treatment, Animal } from '../types';
import { useQuery } from '@tanstack/react-query';

const TreatmentPage: React.FC = () => {
  const { animalId } = useParams<{ animalId: string }>();
  const navigate = useNavigate();
  const [availableTreatments, setAvailableTreatments] = useState<Treatment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<TreatmentFormData>({
    diagnosisId: '',
    treatmentId: '',
    treatmentPerson: currentUser.id,
    currentWeight: '',
    severity: 'Medium' as Severity,
    date: new Date().toISOString().split('T')[0],
    moveTo: ''
  });

  // Get animal data using React Query
  const { data: animal, isLoading: isLoadingAnimal, error: animalError } = useQuery({
    queryKey: ['animal', animalId],
    queryFn: async () => {
      if (!animalId) return null;
      return getAnimalById(animalId);
    },
    enabled: !!animalId
  });
  
  useEffect(() => {
    // If no animal found, show error and redirect
    if (animalId && animalError) {
      toast.error('Error loading animal data');
      navigate('/');
    }
  }, [animalId, animalError, navigate]);

  // Update available treatments when diagnosis changes
  useEffect(() => {
    const fetchTreatments = async () => {
      if (formData.diagnosisId) {
        try {
          const treatments = await getTreatmentsByDiagnosisId(formData.diagnosisId);
          setAvailableTreatments(treatments || []);
          
          // Clear treatment selection if not in filtered list
          if (formData.treatmentId && !treatments.some(t => t.id === formData.treatmentId)) {
            setFormData(prev => ({ ...prev, treatmentId: '' }));
          }
        } catch (error) {
          console.error('Error fetching treatments:', error);
          toast.error('Failed to load treatments');
          setAvailableTreatments([]);
        }
      } else {
        setAvailableTreatments([]);
      }
    };
    
    fetchTreatments();
  }, [formData.diagnosisId, formData.treatmentId]);

  const handleChange = (field: keyof TreatmentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.diagnosisId || !formData.treatmentId || !formData.moveTo) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (!animalId) {
      toast.error('Animal ID is missing');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await saveTreatment(animalId, formData);
      
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
    <Layout title={`Treat ${animal.visualTag}`} showBackButton>
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
            {animal.gender} • DOF: {animal.daysOnFeed} days • Days to Ship: {animal.daysToShip}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <SelectField
            id="diagnosis"
            label="Diagnosis"
            value={formData.diagnosisId}
            options={diagnoses.map(diag => ({
              value: diag.id,
              label: diag.name
            }))}
            onChange={(value) => handleChange('diagnosisId', value)}
            required
          />
          
          <SelectField
            id="treatment"
            label="Treatment"
            value={formData.treatmentId}
            options={availableTreatments && availableTreatments.length > 0 ? 
              availableTreatments.map(treat => ({
                value: treat.id,
                label: treat.name
              })) : []
            }
            onChange={(value) => handleChange('treatmentId', value)}
            disabled={!formData.diagnosisId || availableTreatments.length === 0}
            required
          />
          
          <SelectField
            id="treatmentPerson"
            label="Treatment Person"
            value={formData.treatmentPerson}
            options={[currentUser].map(user => ({
              value: user.id,
              label: user.name
            }))}
            onChange={(value) => handleChange('treatmentPerson', value)}
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
            options={pens.map(pen => ({
              value: pen.id,
              label: pen.penNumber
            }))}
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
