
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
import { RealizeFormData } from '../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

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

  // No need to pre-fill weight from animal data since it doesn't have a weight property

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
      <Card className="w-full mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Animal Details</CardTitle>
            <span className={`px-3 py-1 rounded-full text-white text-sm ${
              animal.pulls > 0 ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              {animal.pulls > 0 ? `Pulls: ${animal.pulls}` : 'No Pulls'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {animal.gender} • {animal.animal_eid ? `EID: ${animal.animal_eid} •` : ''} DOF: {animal.days_on_feed} days • Days to Ship: {animal.days_to_ship}
          </p>
        </CardHeader>
        
        <CardContent className="pt-0">
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
            
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                Current Weight (lbs)
              </Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                placeholder="Enter weight"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="Enter price"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-red-500">
                Date*
              </Label>
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
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
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
        </CardFooter>
        
        <div className="text-center text-xs text-red-500 mt-2 pb-4">
          * Items in red are required information
        </div>
      </Card>
    </Layout>
  );
};

export default RealizePage;
