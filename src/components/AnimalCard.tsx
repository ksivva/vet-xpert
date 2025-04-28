
import React from 'react';
import { Check, Heart, Skull } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Animal } from '../types';
import { formatCurrency, getWeekCount } from '../utils/dataUtils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface AnimalCardProps {
  animal: Animal;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal }) => {
  const navigate = useNavigate();

  const handleTreat = () => {
    navigate(`/treatment/${animal.id}`);
  };

  const handleDead = () => {
    toast.info("Dead functionality not yet implemented");
  };

  const handleRealize = () => {
    toast.info("Realize functionality not yet implemented");
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100 animate-fade-in hover:shadow-lg transition-shadow"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold">{animal.visualTag}</h3>
          <div className="text-gray-500">
            {animal.gender}
            {animal.animalEid && <span className="ml-2">• EID: {animal.animalEid}</span>}
          </div>
        </div>
        <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
          {animal.pulls > 0 ? `Pulls: ${animal.pulls}` : 'No Pulls'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
        <div>
          <p className="text-gray-500">DOF (Weeks)</p>
          <p className="font-medium">{getWeekCount(animal.daysOnFeed)}</p>
        </div>
        <div>
          <p className="text-gray-500">Days to Ship</p>
          <p className="font-medium">{animal.daysToShip}</p>
        </div>
        <div>
          <p className="text-gray-500">LTD Treatment Cost</p>
          <p className="font-medium">{formatCurrency(animal.ltdTreatmentCost)}</p>
        </div>
        <div>
          <p className="text-gray-500">Pulls / RePulls</p>
          <p className="font-medium">{animal.pulls} / {animal.rePulls}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
          <p className="text-gray-500 text-sm">ReTreatments: {animal.reTreat}</p>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleTreat} 
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Heart size={16} className="mr-1" /> Treat
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={handleDead} 
            >
              <Skull size={16} className="mr-1" /> Dead
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={handleRealize} 
            >
              <Check size={16} className="mr-1" /> Realize
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;
