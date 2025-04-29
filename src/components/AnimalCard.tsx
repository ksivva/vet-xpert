
import React from 'react';
import { Heart, Skull, Check } from 'lucide-react';
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
    <Card className="animate-fade-in hover:shadow transition-shadow bg-white shadow-sm border-vetxpert-border">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-vetxpert-blue">{animal.visualTag}</h3>
            <div className="text-vetxpert-gray text-sm">
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
                <Badge className="text-xs font-normal bg-vetxpert-yellow text-vetxpert-dark">
                  Realized
                </Badge>
              )}
            </div>
          </div>
          <Badge className={`${animal.pulls > 0 ? 'bg-vetxpert-secondary' : 'bg-vetxpert-green'} text-white`}>
            {animal.pulls > 0 ? `Pulls: ${animal.pulls}` : 'No Pulls'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-vetxpert-light p-2 rounded">
            <p className="text-vetxpert-gray text-xs">DOF (Weeks)</p>
            <p className="font-medium text-vetxpert-dark">{getWeekCount(animal.daysOnFeed)}</p>
          </div>
          <div className="bg-vetxpert-light p-2 rounded">
            <p className="text-vetxpert-gray text-xs">Days to Ship</p>
            <p className="font-medium text-vetxpert-dark">{animal.daysToShip}</p>
          </div>
          <div className="bg-vetxpert-light p-2 rounded">
            <p className="text-vetxpert-gray text-xs">LTD Treatment Cost</p>
            <p className="font-medium text-vetxpert-dark">{formatCurrency(animal.ltdTreatmentCost)}</p>
          </div>
          <div className="bg-vetxpert-light p-2 rounded">
            <p className="text-vetxpert-gray text-xs">Pulls / RePulls</p>
            <p className="font-medium text-vetxpert-dark">{animal.pulls} / {animal.rePulls}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-vetxpert-border pt-3 flex-col sm:flex-row gap-2">
        <p className="text-vetxpert-gray text-sm self-start">ReTreatments: {animal.reTreat}</p>
        
        <div className="flex gap-2 self-end sm:ml-auto">
          <Button 
            size="sm" 
            onClick={handleTreat} 
            className="bg-vetxpert-primary hover:bg-vetxpert-blue/90"
            disabled={isDead || isRealized}
          >
            <Heart size={16} className="mr-1" /> Treat
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={handleDead} 
            disabled={isRealized}
            className="bg-vetxpert-red hover:bg-vetxpert-red/90"
          >
            <Skull size={16} className="mr-1" /> {isDead ? 'View Death' : 'Dead'}
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={handleRealize}
            disabled={isDead || isRealized}
            className={isRealized ? "bg-vetxpert-yellow/50 text-vetxpert-dark" : "bg-vetxpert-yellow text-vetxpert-dark hover:bg-vetxpert-yellow/90"}
          >
            <Check size={16} className="mr-1" /> {isRealized ? 'Realized' : 'Realize'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AnimalCard;
