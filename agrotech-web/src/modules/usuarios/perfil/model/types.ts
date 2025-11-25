// Types “puros” del módulo Perfil

export type EstadoUsuario = "activo" | "inactivo" | "eliminado";

export type Perfil = {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  idFicha: string;
  avatar?: string | null;
  rol: { id: number; nombre: string } | null;
  estado: EstadoUsuario;
};

export type UpdatePerfilInput = Partial<{
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  idFicha: string;
  estado: EstadoUsuario;
  /** Puede ser File (sube multipart) o string (URL) */
  avatar: File | string | null;
}>;
