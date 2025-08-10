import { OwnerId } from '@/domain/owners';

export type Species = 'dog' | 'cat' | (string & {});
export type Gender = 'male' | 'female';
export type PatientStatus = 'active' | 'deceased';
export type PatientId = string & { readonly __brand: 'PatientId' };
export const asPatientId = (id: string): PatientId => id as PatientId;

export interface PatientProps {
  // Core identity
  name: string;
  species: Species;
  breed: string;
  dateOfBirth?: Date;
  gender: Gender;

  // Physical attributes
  weight?: number;
  photoUrl?: string;

  // Ownership
  ownerId: OwnerId;

  // Status
  status: PatientStatus;

  // Audit
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePatientProps {
  name: string;
  species: Species;
  breed: string;
  gender: Gender;
  ownerId: OwnerId;
  dateOfBirth?: Date;
  weight?: number;
  photoUrl?: string;
}

export interface UpdatePatientBasicInfoProps {
  name?: string;
  breed?: string;
  weight?: number;
  photoUrl?: string;
}
