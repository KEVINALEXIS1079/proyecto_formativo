import { useState, useEffect } from "react";
import { Input, Button, Checkbox } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";

export type AuthLoginValues = { correo: string; password: string; remember?: boolean };

export default function AuthLoginForm({
  onSubmit, loading, footerSlot,
}: { onSubmit: (v: AuthLoginValues) => void; loading?: boolean; footerSlot?: React.ReactNode }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("remember_email");
    if (savedEmail) {
      setCorreo(savedEmail);
      setRemember(true);
    }
  }, []);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-append @gmail.com if missing to allow username login
    let finalCorreo = correo;
    if (finalCorreo && !finalCorreo.includes('@')) {
      finalCorreo += '@gmail.com';
    }

    if (remember) {
      localStorage.setItem("remember_email", finalCorreo);
    } else {
      localStorage.removeItem("remember_email");
    }
    onSubmit({ correo: finalCorreo, password, remember });
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <Input
        label="Correo electrónico"
        type="text"
        inputMode="email"
        value={correo}
        onValueChange={(v) => setCorreo(v.toLowerCase())}
        radius="lg"
        placeholder="usuario@gmail.com"
        isClearable
        required
        autoComplete="username"
        endContent={
          !correo.includes('@') && (
            <span className="text-default-400 text-small pointer-events-none">@gmail.com</span>
          )
        }
      />
      <Input
        label="Contraseña"
        type={isVisible ? "text" : "password"}
        value={password}
        onValueChange={setPassword}
        radius="lg"
        required
        autoComplete="current-password"
        endContent={
          <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
            {isVisible ? (
              <EyeOff className="text-2xl text-default-400 pointer-events-none" />
            ) : (
              <Eye className="text-2xl text-default-400 pointer-events-none" />
            )}
          </button>
        }
      />
      <div className="flex items-center justify-between">
        <Checkbox
          isSelected={remember}
          onValueChange={setRemember}
          color="success"
        >
          Recordarme
        </Checkbox>
        {footerSlot}
      </div>
      <Button type="submit" color="success" className="w-full rounded-full" isLoading={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
