
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import SelectField from '../components/SelectField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RealizeFormData {
  reasonId: string;
  weight: string;
  price: string; 
  date: string;
}

const RealizePage: React.FC = () => {
  const { animalId } = useParams<{ animalId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reasons, setReasons] = useState<{value: string, label: string}[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const [formData, setFormData] = useState<RealizeFormData>({
    reasonId: '',
    weight: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
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

  // Update form data when animal data is loaded
  useEffect(() => {
    if (animal) {
      // Pre-fill the weight if we have animal data
      setFormData(prev => ({
        ...prev,
        weight: animal.current_weight?.toString() || ''
      }));
    }
  }, [animal]);

  const handleChange = (field: keyof RealizeFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      handleChange('date', format(selectedDate, 'yyyy-MM-dd'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!animalId) {
      toast.error('Animal ID is missing');
      return;
    }
    
    if (!formData.reasonId) {
      toast.error('Please select a reason');
      return;
    }
    
    setIsSubmitting(true);
    
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
        toast.error('Failed to save realization');
        return;
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
        // Still show success since the realization record was saved
      }
      
      toast.success('Animal has been realized successfully');
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
      if (animal?.lot_id) {
        queryClient.invalidateQueries({ queryKey: ['animals', animal.lot_id] });
      }
      
      // Navigate back to the list
      navigate('/');
    } catch (error) {
      console.error('Error in realization submission:', error);
      toast.error('An error occurred while saving the realization');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingAnimal) {
    return (
      <Layout title="Realize Animal" showBackButton>
        <div className="text-center py-10">
          <p className="text-gray-500">Loading animal data...</p>
        </div>
      </Layout>
    );
  }

  if (!animal) {
    return (
      <Layout title="Realize Animal" showBackButton>
        <div className="text-center py-10">
          <p className="text-gray-500">Animal not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Realize ${animal.visual_tag}`} showBackButton>
      <div className="card-container">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Animal Details</h2>
            <span className={`px-3 py-1 rounded-full text-white ${
              animal.pulls > 0 ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              {animal.pulls > 0 ? `Pulls: ${animal.pulls}` : 'No Pulls'}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {animal.gender} • {animal.animal_eid ? `EID: ${animal.animal_eid} •` : ''} DOF: {animal.days_on_feed} days • Days to Ship: {animal.days_to_ship}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <SelectField
            id="reason"
            label="Reason"
            value={formData.reasonId}
            options={reasons}
            onChange={(value) => handleChange('reasonId', value)}
            required
            className="text-red-500 font-medium"
          />
          
          <div className="mb-4">
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Current Weight (lbs)
            </label>
            <Input
              id="weight"
              type="number"
              value={formData.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="input-field"
              placeholder="Enter weight"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              className="input-field"
              placeholder="Enter price"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-red-500 mb-1">
              Date*
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="pt-4 border-t flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-black text-white hover:bg-gray-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save
                </>
              )}
            </Button>
          </div>
          
          <div className="text-center text-xs text-red-500 mt-2">
            * Items in red are required information
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default RealizePage;
