
import React, { useEffect } from 'react';
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

  // Debug log for dead/:animalId route issues
  useEffect(() => {
    console.log(`AnimalCard rendered for animal:`, {
      id: animal.id,
      visualTag: animal.visualTag,
      status: animal.status
    });
  }, [animal]);

  // Use path-based navigation without leading slashes for compatibility
  // with both development and production environments
  const handleTreat = () => {
    navigate(`treatment/${animal.id}`);
  };

  const handleDead = () => {
    console.log(`Navigating to dead/${animal.id}`);
    navigate(`dead/${animal.id}`);
  };

  const handleRealize = () => {
    toast.info("Realize functionality not yet implemented");
  };

  const isDead = animal.status === 'dead';

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
          {isDead && (
            <span className="inline-block bg-red-500 text-white px-2 py-0.5 rounded-full text-xs mt-1">
              Dead
            </span>
          )}
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
              disabled={isDead}
            >
              <Heart size={16} className="mr-1" /> Treat
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={handleDead} 
              disabled={false} // Always allow viewing/editing death records
            >
              <Skull size={16} className="mr-1" /> {isDead ? 'View Death' : 'Dead'}
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={handleRealize} 
              disabled={isDead}
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
