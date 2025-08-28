import { PatientRepository } from '@/app/_shared/ports';

export async function getAllPatientsQuery(deps: { repo: PatientRepository }) {
  const { repo } = deps;

  const patients = await repo.getAll();

  return patients;
}
