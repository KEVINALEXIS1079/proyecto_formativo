export interface Profile {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  identificacion: string;
  telefono?: string;
  idFicha?: string;
  avatarUrl?: string;
  estado: string;
  rol?: {
    id: number;
    nombre: string;
  };
}

export interface UpdateProfileInput {
  nombre?: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  idFicha?: string;
}
