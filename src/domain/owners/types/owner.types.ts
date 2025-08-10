export type OwnerId = string;

export type OwnerStatus = 'active' | 'inactive';

export interface OwnerProps {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: OwnerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateOwnerProps = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

export type UpdateOwnerProps = Partial<{
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}>;
