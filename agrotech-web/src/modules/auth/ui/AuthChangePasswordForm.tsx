import { useState } from "react";
import { Input, Button } from "@heroui/react";
export type AuthChangePasswordValues = { nuevaContrasena: string; confirmar: string ; };
export default function AuthChangePasswordForm({ onSubmit, loading }: { onSubmit: (v: AuthChangePasswordValues) => void; loading?: boolean }) {
  const [pass, setPass] = useState(""); const [confirm, setConfirm] = useState("");
  return (
    <form className="grid gap-3" onSubmit={(e)=>{ e.preventDefault(); onSubmit({  nuevaContrasena : pass, confirmar: confirm }); }}>
      <Input label="Nueva contraseña" type="password" value={pass} onValueChange={setPass} radius="lg" required/>
      <Input label="Confirmar contraseña" type="password" value={confirm} onValueChange={setConfirm} radius="lg" required/>
      <Button type="submit" color="success" className="w-full rounded-full" isLoading={loading}>Guardar</Button>
    </form> 
  );
}
