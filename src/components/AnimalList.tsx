
import React from 'react';
import AnimalCard from './AnimalCard';
import { Animal } from '../types';

interface AnimalListProps {
  animals: Animal[];
  isSearchResult: boolean;
  selectedLotId: string;
}

const AnimalList: React.FC<AnimalListProps> = ({ 
  animals, 
  isSearchResult,
  selectedLotId
}) => {
  if (animals.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">
          {!selectedLotId && !isSearchResult
            ? 'Please select a Lot to view animals or search by EID.'
            : !isSearchResult
            ? 'Please select a Pen to view animals or search by EID.'
            : 'No animals found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        {isSearchResult ? "Search Results" : "Animals"}
      </h2>
      <div className="space-y-6">
        {animals.map(animal => (
          <AnimalCard 
            key={animal.id} 
            animal={animal}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimalList;
