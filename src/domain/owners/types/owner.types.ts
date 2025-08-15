export type OwnerId = string & { readonly __brand: 'OwnerId' };
export const asOwnerId = (id: string): OwnerId => id as OwnerId;

export type OwnerStatus = 'active' | 'inactive';

export interface OwnerProps {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: OwnerStatus;
  createdAt: Date;
  updatedAt: Date;
  version: number; // optimistic concurrency version
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
