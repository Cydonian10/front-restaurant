export type UserRole = 'ADMIN' | 'COCINA' | 'ATENCION' | 'MOZO' | 'CLIENTE';

export interface PersonProfile {
  id: string;
  name: string;
  lastName: string | null;
  phone: string | null;
  document: string | null;
  birthDate: string | null;
  residence: string | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  person: PersonProfile;
  emailVerified: boolean;
  createdAt: string;
}
