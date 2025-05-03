
export interface Animal {
  id: string;
  visualTag: string;
  gender: 'Steer' | 'Cow';
  daysOnFeed: number;
  daysToShip: number;
  ltdTreatmentCost: number;
  pulls: number;
  rePulls: number;
  reTreat: number;
  penId?: string;
  lotId?: string;
  animalEid?: string;
  status?: 'active' | 'dead' | 'realized';
}

export interface Pen {
  id: string;
  penNumber: string;
  lotId: string;
}

export interface Lot {
  id: string;
  lotNumber: string;
}

export interface Diagnosis {
  id: string;
  name: string;
}

export interface Treatment {
  id: string;
  name: string;
  diagnosisIds: string[];
}

export interface TreatmentFormData {
  diagnosisId: string;
  treatmentId: string;
  treatmentPerson: string;
  currentWeight: string;
  severity: 'Critical' | 'Medium' | 'Low';
  date: string;
  moveTo: string;
}

export interface DeathFormData {
  reason: string;
  necropsy: boolean;
  deathDate: string;
  image?: File | null;
  imageUrl?: string | null;
}

export type Severity = 'Critical' | 'Medium' | 'Low';

export interface User {
  id: string;
  name: string;
}

export interface RealizeFormData {
  reasonId: string;
  weight: string;
  price: string;
  date: string;
}
