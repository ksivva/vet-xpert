
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '../components/Layout';
import { Card, CardContent } from "@/components/ui/card";
import AnimalInfoCard from '../components/AnimalInfoCard';
import RealizeForm from '../components/RealizeForm';
import { getRealizationDetails } from '../utils/realizeUtils';

const RealizePage: React.FC = () => {
  const { animalId } = useParams<{ animalId: string }>();
  const navigate = useNavigate();
  const [reasons, setReasons] = useState<{value: string, label: string}[]>([]);
  
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

  // Get realization details if animal is already realized
  const { data: realizationDetails, isLoading: isLoadingRealization } = useQuery({
    queryKey: ['realization', animalId],
    queryFn: async () => {
      if (!animalId) return null;
      return getRealizationDetails(animalId);
    },
    enabled: !!animalId && !!animal?.status && animal.status === 'realized'
  });

  // Fetch reasons when component mounts
  useEffect(() => {
    const fetchReasons = async () => {
      const { data, error } = await supabase
        .from('diagnoses')
        .select('id, name');
      
      if (error) {
        console.error('Error fetching reasons:', error);
        toast.error('Failed to load reasons');
        return;
      }
      
      setReasons(data.map(reason => ({
        value: reason.id,
        label: reason.name
      })));
    };

    fetchReasons();
  }, []);

  useEffect(() => {
    // If animal is already realized and we have the realization details, show notification
    if (animal?.status === 'realized' && realizationDetails) {
      toast.info('This animal has already been realized');
    }
  }, [animal, realizationDetails]);

  if (isLoadingAnimal || (animal?.status === 'realized' && isLoadingRealization)) {
    return (
      <Layout title="Animal Realization" showBackButton>
        <div className="text-center py-10">
          <p className="text-gray-500">Loading animal data...</p>
        </div>
      </Layout>
    );
  }

  if (!animal) {
    return (
      <Layout title="Animal Realization" showBackButton>
        <div className="text-center py-10">
          <p className="text-gray-500">Animal not found</p>
        </div>
      </Layout>
    );
  }

  // If animal is already realized, show notification and don't allow re-realization
  if (animal.status === 'realized') {
    return (
      <Layout title={`Realize Animal ${animal.visual_tag}`} showBackButton>
        <Card className="w-full mb-6">
          <AnimalInfoCard animal={animal} />
          
          <CardContent className="pt-6">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
              <h3 className="text-amber-800 font-medium mb-2">Animal Already Realized</h3>
              <p className="text-amber-700">
                This animal has been realized on {realizationDetails?.realization_date ? new Date(realizationDetails.realization_date).toLocaleDateString() : 'unknown date'}.
              </p>
              {realizationDetails && (
                <div className="mt-4 space-y-2 text-sm">
                  <p><span className="font-medium">Reason:</span> {realizationDetails.diagnoses?.name}</p>
                  {realizationDetails.weight && <p><span className="font-medium">Weight:</span> {realizationDetails.weight} lbs</p>}
                  {realizationDetails.price && <p><span className="font-medium">Price:</span> ${realizationDetails.price}</p>}
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Return to Home
              </button>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title={`Realize Animal ${animal.visual_tag}`} showBackButton>
      <Card className="w-full mb-6">
        <AnimalInfoCard animal={animal} />
        
        <CardContent className="pt-0">
          <RealizeForm 
            animalId={animalId || ''} 
            reasons={reasons} 
            animal={animal} 
          />
        </CardContent>
      </Card>
    </Layout>
  );
};

export default RealizePage;
