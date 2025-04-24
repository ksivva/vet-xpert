
import { Animal, Pen, Lot, Diagnosis, Treatment, User } from '../types';

export const users: User[] = [
  { id: 'user1', name: 'Dr. John Smith' },
  { id: 'user2', name: 'Dr. Sarah Johnson' },
  { id: 'user3', name: 'Dr. Michael Brown' }
];

export const lots: Lot[] = [
  { id: 'lot1', lotNumber: 'L001' },
  { id: 'lot2', lotNumber: 'L002' },
  { id: 'lot3', lotNumber: 'L003' }
];

export const pens: Pen[] = [
  { id: 'pen1', penNumber: 'P001', lotId: 'lot1' },
  { id: 'pen2', penNumber: 'P002', lotId: 'lot1' },
  { id: 'pen3', penNumber: 'P003', lotId: 'lot2' },
  { id: 'pen4', penNumber: 'P004', lotId: 'lot2' },
  { id: 'pen5', penNumber: 'P005', lotId: 'lot3' },
  { id: 'pen6', penNumber: 'Hospital', lotId: '' },
  { id: 'pen7', penNumber: 'Buller', lotId: '' },
  { id: 'pen8', penNumber: 'Home', lotId: '' }
];

export const animals: Animal[] = [
  {
    id: 'animal1',
    visualTag: 'A1001',
    gender: 'Steer',
    daysOnFeed: 45,
    daysToShip: 30,
    ltdTreatmentCost: 120.50,
    pulls: 1,
    rePulls: 0,
    reTreat: 0,
    penId: 'pen1',
    lotId: 'lot1'
  },
  {
    id: 'animal2',
    visualTag: 'A1002',
    gender: 'Cow',
    daysOnFeed: 30,
    daysToShip: 45,
    ltdTreatmentCost: 85.25,
    pulls: 2,
    rePulls: 1,
    reTreat: 1,
    penId: 'pen1',
    lotId: 'lot1'
  },
  {
    id: 'animal3',
    visualTag: 'A1003',
    gender: 'Steer',
    daysOnFeed: 60,
    daysToShip: 15,
    ltdTreatmentCost: 150.75,
    pulls: 0,
    rePulls: 0,
    reTreat: 0,
    penId: 'pen2',
    lotId: 'lot1'
  },
  {
    id: 'animal4',
    visualTag: 'A2001',
    gender: 'Cow',
    daysOnFeed: 20,
    daysToShip: 55,
    ltdTreatmentCost: 75.00,
    pulls: 1,
    rePulls: 0,
    reTreat: 0,
    penId: 'pen3',
    lotId: 'lot2'
  },
  {
    id: 'animal5',
    visualTag: 'A2002',
    gender: 'Steer',
    daysOnFeed: 40,
    daysToShip: 35,
    ltdTreatmentCost: 110.30,
    pulls: 3,
    rePulls: 1,
    reTreat: 2,
    penId: 'pen3',
    lotId: 'lot2'
  },
  {
    id: 'animal6',
    visualTag: 'A3001',
    gender: 'Cow',
    daysOnFeed: 15,
    daysToShip: 60,
    ltdTreatmentCost: 95.40,
    pulls: 0,
    rePulls: 0,
    reTreat: 0,
    penId: 'pen5',
    lotId: 'lot3'
  }
];

export const diagnoses: Diagnosis[] = [
  { id: 'diag1', name: 'Respiratory Disease' },
  { id: 'diag2', name: 'Lameness' },
  { id: 'diag3', name: 'Digestive Issues' },
  { id: 'diag4', name: 'Eye Infection' },
  { id: 'diag5', name: 'Fever' }
];

export const treatments: Treatment[] = [
  { id: 'treat1', name: 'Antibiotic A', diagnosisIds: ['diag1', 'diag5'] },
  { id: 'treat2', name: 'Antibiotic B', diagnosisIds: ['diag1', 'diag4', 'diag5'] },
  { id: 'treat3', name: 'Anti-inflammatory', diagnosisIds: ['diag2', 'diag3'] },
  { id: 'treat4', name: 'Pain Management', diagnosisIds: ['diag2'] },
  { id: 'treat5', name: 'Eye Drops', diagnosisIds: ['diag4'] },
  { id: 'treat6', name: 'Digestive Aid', diagnosisIds: ['diag3'] },
  { id: 'treat7', name: 'Fever Reducer', diagnosisIds: ['diag5'] }
];

export const currentUser = users[0];
