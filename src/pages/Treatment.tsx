
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import SelectField from '../components/SelectField';
import { getAnimalById, getTreatmentsByDiagnosisId } from '../utils/dataUtils';
import { diagnoses, treatments, pens, currentUser } from '../data/mockData';
import { TreatmentFormData, Severity, Treatment } from '../types';

const TreatmentPage: React.FC = () => {
  const { animalId } = useParams<{ animalId: string }>();
  const navigate = useNavigate();
  const [availableTreatments, setAvailableTreatments] = useState<Treatment[]>([]);
  
  const [formData, setFormData] = useState<TreatmentFormData>({
    diagnosisId: '',
    treatmentId: '',
    treatmentPerson: currentUser.id,
    currentWeight: '',
    severity: 'Medium' as Severity,
    date: new Date().toISOString().split('T')[0],
    moveTo: ''
  });

  // Get animal data
  const animal = animalId ? getAnimalById(animalId) : undefined;
  
  useEffect(() => {
    // If no animal found, show error and redirect
    if (animalId && !animal) {
      toast.error('Animal not found');
      navigate('/');
      return;
    }
  }, [animal, animalId, navigate]);

  // Update available treatments when diagnosis changes
  useEffect(() => {
    if (formData.diagnosisId) {
      const filtered = getTreatmentsByDiagnosisId(formData.diagnosisId);
      setAvailableTreatments(filtered);
      
      // Clear treatment selection if not in filtered list
      if (formData.treatmentId && !filtered.some(t => t.id === formData.treatmentId)) {
        setFormData(prev => ({ ...prev, treatmentId: '' }));
      }
    } else {
      setAvailableTreatments([]);
    }
  }, [formData.diagnosisId, formData.treatmentId]);

  const handleChange = (field: keyof TreatmentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.diagnosisId || !formData.treatmentId || !formData.moveTo) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // In a real app, this would save the treatment to the database
    console.log('Saving treatment:', {
      animalId,
      ...formData
    });
    
    toast.success('Treatment saved successfully');
    navigate('/');
  };

  if (!animal) {
    return (
      <Layout title="Treatment" showBackButton>
        <div className="text-center py-10">
          <p className="text-gray-500">Loading animal data...</p>
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
            options={availableTreatments.map(treat => ({
              value: treat.id,
              label: treat.name
            }))}
            onChange={(value) => handleChange('treatmentId', value)}
            disabled={!formData.diagnosisId}
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
            >
              Save Treatment
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TreatmentPage;
