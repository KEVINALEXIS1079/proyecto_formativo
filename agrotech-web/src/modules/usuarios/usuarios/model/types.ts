export type EstadoUsuario = "activo" | "inactivo" | "eliminado";
export type RolLite = { id: number; nombre: string };
export type UsuarioLite = {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  idFicha: string;
  avatar?: string;
  rol: RolLite;
  estado: EstadoUsuario;
};

export const ESTADO_COLOR: Record<EstadoUsuario, "success" | "warning" | "danger"> = {
  activo: "success",
  inactivo: "warning",
  eliminado: "danger",
};
