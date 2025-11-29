import type { Profile } from "../types/profile.types";

export const mapProfileToForm = (profile: Profile) => ({
  nombre: profile.nombre,
  apellido: profile.apellido,
  correo: profile.correo,
  telefono: profile.telefono ?? "",
  idFicha: profile.idFicha ?? "",
  avatarUrl: profile.avatarUrl,
});

export const mapProfileToUser = (profile: Profile) => ({
  ...profile,
  rolName: profile.rol?.nombre ?? "Sin rol",
});
