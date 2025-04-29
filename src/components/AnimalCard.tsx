
import React from 'react';
import { Check, Heart, Skull } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Animal } from '../types';
import { formatCurrency, getWeekCount } from '../utils/formatUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface AnimalCardProps {
  animal: Animal;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal }) => {
  const navigate = useNavigate();

  const handleTreat = () => {
    navigate(`treatment/${animal.id}`);
  };

  const handleDead = () => {
    navigate(`dead/${animal.id}`);
  };

  const handleRealize = () => {
    navigate(`realize/${animal.id}`);
  };

  const isDead = animal.status === 'dead';
  const isRealized = animal.status === 'realized';

  return (
    <Card className="animate-fade-in hover:shadow-lg transition-shadow bg-white shadow-md border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-blue-600">{animal.visualTag}</h3>
            <div className="text-gray-500 text-sm">
              {animal.gender}
              {animal.animalEid && <span className="ml-2">• EID: {animal.animalEid}</span>}
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {isDead && (
                <Badge variant="destructive" className="text-xs font-normal">
                  Dead
                </Badge>
              )}
              {isRealized && (
                <Badge variant="secondary" className="text-xs font-normal bg-orange-500">
                  Realized
                </Badge>
              )}
            </div>
          </div>
          <Badge className={`${animal.pulls > 0 ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
            {animal.pulls > 0 ? `Pulls: ${animal.pulls}` : 'No Pulls'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-gray-500 text-xs">DOF (Weeks)</p>
            <p className="font-medium">{getWeekCount(animal.daysOnFeed)}</p>
          </div>
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-gray-500 text-xs">Days to Ship</p>
            <p className="font-medium">{animal.daysToShip}</p>
          </div>
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-gray-500 text-xs">LTD Treatment Cost</p>
            <p className="font-medium">{formatCurrency(animal.ltdTreatmentCost)}</p>
          </div>
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-gray-500 text-xs">Pulls / RePulls</p>
            <p className="font-medium">{animal.pulls} / {animal.rePulls}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3 flex-col sm:flex-row gap-2">
        <p className="text-gray-500 text-sm self-start">ReTreatments: {animal.reTreat}</p>
        
        <div className="flex gap-2 self-end sm:ml-auto">
          <Button 
            size="sm" 
            onClick={handleTreat} 
            className="bg-blue-500 hover:bg-blue-600"
            disabled={isDead || isRealized}
          >
            <Heart size={16} className="mr-1" /> Treat
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={handleDead} 
            disabled={isRealized}
          >
            <Skull size={16} className="mr-1" /> {isDead ? 'View Death' : 'Dead'}
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={handleRealize}
            disabled={isDead || isRealized}
            className={isRealized ? "bg-orange-200" : ""}
          >
            <Check size={16} className="mr-1" /> {isRealized ? 'Realized' : 'Realize'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AnimalCard;
