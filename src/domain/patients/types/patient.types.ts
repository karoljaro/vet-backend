export type Species = "dog" | "cat" | "bird" | "rabbit" | "hamster" | "other";
export type Gender = "male" | "female";
export type PatientStatus = "active" | "inactive" | "deceased" | "lost";
export type BehaviorFlag =
  | "aggressive"
  | "fearful"
  | "muzzle_required"
  | "gentle";

export interface PatientProps {
  // Core identity
  name: string;
  species: Species;
  breed: string;
  dateOfBirth?: Date;
  gender: Gender;

  // Physical attributes
  color?: string;
  weight?: number;
  neutered?: boolean;
  dateOfNeutering?: Date;

  // Identification
  microchipNumber?: string;
  tattooNumber?: string;
  registrationNumber?: string;

  // Ownership
  ownerId: string;
  acquisitionDate?: Date;

  // Status and behavior
  status: PatientStatus;
  behaviorFlags: BehaviorFlag[];

  // Medical basics
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];

  // Administration
  notesInternal?: string;
  notesOwnerVisible?: string;
  tags: string[];
  preferredVetId?: string;

  // Insurance
  insuranceProvider?: string;
  insurancePolicyNumber?: string;

  // Photos/documents
  photoUrl?: string;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreatePatientProps {
  name: string;
  species: Species;
  breed: string;
  gender: Gender;
  ownerId: string;
  dateOfBirth?: Date;
  color?: string;
  weight?: number;
  microchipNumber?: string;
  behaviorFlags?: BehaviorFlag[];
  allergies?: string[];
  chronicConditions?: string[];
  tags?: string[];
  createdBy?: string;
}

export interface UpdatePatientBasicInfoProps {
  name?: string;
  breed?: string;
  color?: string;
  weight?: number;
  updatedBy?: string;
}
