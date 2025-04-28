
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import SelectField from '../components/SelectField';
import { Button } from '@/components/ui/button';
import { saveDeathRecord, getAnimalById, getDeathRecordByAnimalId } from '../utils/dataUtils';
import { useQueryClient } from '@tanstack/react-query';

const DeathReasons = [
  { value: 'Respiratory Disease', label: 'Respiratory Disease' },
  { value: 'Digestive Disorder', label: 'Digestive Disorder' },
  { value: 'Injury', label: 'Injury' },
  { value: 'Neurological Issue', label: 'Neurological Issue' },
  { value: 'Metabolic Disease', label: 'Metabolic Disease' },
  { value: 'Unknown', label: 'Unknown' }
];

const DeadPage: React.FC = () => {
  const { animalId } = useParams<{ animalId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [animal, setAnimal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [existingRecord, setExistingRecord] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    reason: 'Unknown',
    necropsy: false,
    deathDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchAnimalAndDeathRecord = async () => {
      if (!animalId) return;
      
      try {
        console.log('Fetching animal data for ID:', animalId);
        const animalData = await getAnimalById(animalId);
        console.log('Received animal data:', animalData);
        
        if (animalData) {
          setAnimal(animalData);
          
          // Check if animal already has a death record
          console.log('Checking for death record...');
          const deathRecord = await getDeathRecordByAnimalId(animalId);
          console.log('Death record:', deathRecord);
          
          if (deathRecord) {
            console.log('Found existing death record:', deathRecord);
            setFormData({
              reason: deathRecord.reason,
              necropsy: deathRecord.necropsy,
              deathDate: deathRecord.deathDate
            });
            setExistingRecord(true);
          } else {
            console.log('No existing death record found');
          }
        } else {
          toast.error('Animal not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching animal data:', error);
        toast.error('Failed to load animal data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimalAndDeathRecord();
  }, [animalId, navigate]);

  const handleChange = (field: string, value: string | boolean) => {
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
      console.log('Submitting death record:', { animalId, ...formData });
      
      const success = await saveDeathRecord(animalId, {
        reason: formData.reason,
        necropsy: formData.necropsy,
        deathDate: formData.deathDate
      });
      
      if (success) {
        console.log('Death record saved successfully');
        toast.success(existingRecord ? 'Death record updated successfully' : 'Death record saved successfully');
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
        if (animal?.lotId) {
          queryClient.invalidateQueries({ queryKey: ['animals', animal.lotId] });
        }
        if (animal?.penId) {
          queryClient.invalidateQueries({ queryKey: ['animals', animal.penId] });
        }
        
        // Navigate back to home page
        navigate('/');
      } else {
        console.error('Failed to save death record');
        toast.error('Failed to save death record');
      }
    } catch (error) {
      console.error('Error in death record submission:', error);
      toast.error('An error occurred while saving the death record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <Layout title="Record Death" showBackButton>
        <div className="text-center py-10">
          <p className="text-gray-500">Loading animal data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${existingRecord ? 'Update' : 'Record'} Death: ${animal?.visualTag || ''}`} showBackButton>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          {existingRecord && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-700">
                This animal already has a death record. You are now updating the existing record.
              </p>
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Animal Details</h2>
              <span className={`px-3 py-1 rounded-full text-white ${
                animal?.pulls > 0 ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {animal?.pulls > 0 ? `Pulls: ${animal?.pulls}` : 'No Pulls'}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {animal?.gender} • {animal?.animalEid ? `EID: ${animal.animalEid} •` : ''} DOF: {animal?.daysOnFeed} days
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <SelectField
              id="reason"
              label="Reason for Death"
              value={formData.reason}
              options={DeathReasons}
              onChange={(value) => handleChange('reason', value)}
              required
            />
            
            <div className="mb-4">
              <label htmlFor="deathDate" className="block text-sm font-medium text-gray-700 mb-1">
                Death Date
              </label>
              <input
                id="deathDate"
                type="date"
                value={formData.deathDate}
                onChange={(e) => handleChange('deathDate', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.necropsy}
                  onChange={(e) => handleChange('necropsy', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-sm font-medium text-gray-700">Necropsy</span>
              </label>
            </div>
            
            <div className="pt-4 border-t flex space-x-4">
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : existingRecord ? 'Update Death Record' : 'Save Death Record'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DeadPage;
