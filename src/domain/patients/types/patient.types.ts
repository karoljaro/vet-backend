export type Species = 'dog' | 'cat' | (string & {});
export type Gender = 'male' | 'female';
export type PatientStatus = 'active' | 'deceased';

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
  ownerId: string;

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
  ownerId: string;
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
