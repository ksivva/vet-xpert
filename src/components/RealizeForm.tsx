
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { format } from "date-fns";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import SelectField from '../components/SelectField';
import DatePickerField from './DatePickerField';
import { RealizeFormData } from '../types';
import { saveRealization } from '../utils/realizeUtils';

interface RealizeFormProps {
  animalId: string;
  reasons: {value: string, label: string}[];
  animal: any;
}

const RealizeForm: React.FC<RealizeFormProps> = ({ animalId, reasons, animal }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const [formData, setFormData] = useState<RealizeFormData>({
    reasonId: '',
    weight: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
  });

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
      const success = await saveRealization(animalId, formData);
      
      if (success) {
        toast.success('Animal has been realized successfully');
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
        if (animal?.lot_id) {
          queryClient.invalidateQueries({ queryKey: ['animals', animal.lot_id] });
        }
        
        // Navigate back to the list
        navigate('/');
      } else {
        toast.error('Failed to save realization');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SelectField
        id="reason"
        label="Reason"
        value={formData.reasonId}
        options={reasons}
        onChange={(value) => handleChange('reasonId', value)}
        required
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
      
      <DatePickerField
        label="Date"
        date={date}
        onSelect={handleDateSelect}
        required
      />
      
      <div className="flex justify-between border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/')}
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
      
      <div className="text-center text-xs text-red-500 mt-2 pb-4">
        * Items in red are required information
      </div>
    </form>
  );
};

export default RealizeForm;
