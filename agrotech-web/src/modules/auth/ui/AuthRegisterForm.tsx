import { useState } from "react";
import { Input, Button, Checkbox } from "@heroui/react";

export type AuthRegisterValues = {
  cedula_usuario: string; nombre_usuario: string; apellido_usuario: string;
  correo_usuario: string; telefono_usuario: string; id_ficha: string; contrasena_usuario: string; confirmar: string; acepta?: boolean;
};

export default function AuthRegisterForm({ onSubmit, loading }: { onSubmit: (v: AuthRegisterValues) => void; loading?: boolean }) {
  const [form, setForm] = useState<AuthRegisterValues>({
    cedula_usuario:"", nombre_usuario:"", apellido_usuario:"", correo_usuario:"", telefono_usuario:"", id_ficha:"", contrasena_usuario:"", confirmar:"", acepta:false,
  });
  const set = <K extends keyof AuthRegisterValues>(k: K, v: any) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form className="grid gap-3" onSubmit={(e)=>{ e.preventDefault(); onSubmit(form); }}>
      <Input label="Número de documento" value={form.cedula_usuario} onValueChange={(v)=>set("cedula_usuario", v)} radius="lg" required/>
      <Input label="Nombre" value={form.nombre_usuario} onValueChange={(v)=>set("nombre_usuario", v)} radius="lg" required/>
      <Input label="Apellido" value={form.apellido_usuario} onValueChange={(v)=>set("apellido_usuario", v)} radius="lg" required/>
      <Input label="Correo electrónico" type="email" value={form.correo_usuario} onValueChange={(v)=>set("correo_usuario", v)} radius="lg" required/>
      <Input label="Teléfono" value={form.telefono_usuario} onValueChange={(v)=>set("telefono_usuario", v)} radius="lg" required/>
      <Input label="ID ficha" value={form.id_ficha} onValueChange={(v)=>set("id_ficha", v)} radius="lg" required/>
      <Input label="Contraseña" type="password" value={form.contrasena_usuario} onValueChange={(v)=>set("contrasena_usuario", v)} radius="lg" required/>
      <Input label="Confirmar contraseña" type="password" value={form.confirmar} onValueChange={(v)=>set("confirmar", v)} radius="lg" required/>
      <Checkbox isSelected={!!form.acepta} onValueChange={(v)=>set("acepta", v)}>Acepto términos y condiciones</Checkbox>
      <Button type="submit" color="success" className="w-full rounded-full" isLoading={loading}>Registrarse</Button>
    </form>
  );
}
