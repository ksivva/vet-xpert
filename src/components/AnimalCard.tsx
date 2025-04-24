
import React from 'react';
import { Animal } from '../types';
import { formatCurrency, getWeekCount } from '../utils/dataUtils';

interface AnimalCardProps {
  animal: Animal;
  onClick?: () => void;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100 animate-fade-in cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold">{animal.visualTag}</h3>
          <p className="text-gray-500">{animal.gender}</p>
        </div>
        <span className="inline-block bg-vetxpert-purple text-white px-3 py-1 rounded-full text-sm">
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
          <button 
            className="text-vetxpert-purple hover:underline text-sm flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
          >
            Start Treatment
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="ml-1"
            >
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;
