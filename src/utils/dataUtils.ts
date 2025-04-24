
import { animals, pens, lots, treatments } from '../data/mockData';
import { Animal, Pen, Lot, Treatment } from '../types';

export const getAnimalById = (id: string): Animal | undefined => {
  return animals.find(animal => animal.id === id);
};

export const getAnimalsByLotId = (lotId: string): Animal[] => {
  return animals.filter(animal => animal.lotId === lotId);
};

export const getAnimalsByPenId = (penId: string): Animal[] => {
  return animals.filter(animal => animal.penId === penId);
};

export const getPensByLotId = (lotId: string): Pen[] => {
  return pens.filter(pen => pen.lotId === lotId);
};

export const getPenById = (penId: string): Pen | undefined => {
  return pens.find(pen => pen.id === penId);
};

export const getLotById = (lotId: string): Lot | undefined => {
  return lots.find(lot => lot.id === lotId);
};

export const getLotByPenId = (penId: string): Lot | undefined => {
  const pen = pens.find(p => p.id === penId);
  if (!pen || !pen.lotId) return undefined;
  return lots.find(lot => lot.id === pen.lotId);
};

export const getTreatmentsByDiagnosisId = (diagnosisId: string): Treatment[] => {
  return treatments.filter(treatment => 
    treatment.diagnosisIds.includes(diagnosisId)
  );
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

export const getWeekCount = (days: number): number => {
  return Math.ceil(days / 7);
};
