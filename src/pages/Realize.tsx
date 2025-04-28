
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '../components/Layout';
import { Card, CardContent } from "@/components/ui/card";
import AnimalInfoCard from '../components/AnimalInfoCard';
import RealizeForm from '../components/RealizeForm';

const RealizePage: React.FC = () => {
  const { animalId } = useParams<{ animalId: string }>();
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

  if (isLoadingAnimal) {
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
