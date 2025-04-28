
import React from 'react';
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnimalInfoProps {
  animal: {
    visual_tag: string;
    gender: string;
    animal_eid?: string;
    days_on_feed: number;
    days_to_ship: number;
    pulls: number;
  };
}

const AnimalInfoCard: React.FC<AnimalInfoProps> = ({ animal }) => {
  return (
    <>
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
    </>
  );
};

export default AnimalInfoCard;
