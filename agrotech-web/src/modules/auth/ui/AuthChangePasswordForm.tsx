import { useState } from "react";
import { Input, Button } from "@heroui/react";
export type AuthChangePasswordValues = { nuevaContrasena: string; confirmar: string ; };
export default function AuthChangePasswordForm({ onSubmit, loading }: { onSubmit: (v: AuthChangePasswordValues) => void; loading?: boolean }) {
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass)) {
      setError("La contraseña debe tener mín. 8 caracteres, mayúscula, minúscula y número");
      return;
    }
    if (pass !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setError("");
    onSubmit({ nuevaContrasena: pass, confirmar: confirm });
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <Input 
        label="Nueva contraseña" 
        type="password" 
        value={pass} 
        onValueChange={(v) => { setPass(v); setError(""); }} 
        radius="lg" 
        required
        isInvalid={!!error && error.includes("8 caracteres")}
        errorMessage={error && error.includes("8 caracteres") ? error : undefined}
      />
      <Input 
        label="Confirmar contraseña" 
        type="password" 
        value={confirm} 
        onValueChange={(v) => { setConfirm(v); setError(""); }} 
        radius="lg" 
        required
        isInvalid={!!error && error.includes("no coinciden")}
        errorMessage={error && error.includes("no coinciden") ? error : undefined}
      />
      <Button type="submit" color="success" className="w-full rounded-full" isLoading={loading}>Guardar</Button>
    </form> 
  );
}
