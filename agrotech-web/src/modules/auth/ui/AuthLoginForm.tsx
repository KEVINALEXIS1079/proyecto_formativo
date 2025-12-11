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
    if (remember) {
      localStorage.setItem("remember_email", correo);
    } else {
      localStorage.removeItem("remember_email");
    }
    onSubmit({ correo, password, remember });
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <Input
        label="Correo electrónico"
        type="email"
        value={correo}
        onValueChange={(v) => setCorreo(v.toLowerCase())}
        radius="lg"
        placeholder="usuario@gmail.com"
        isClearable
        required
      />
      <Input
        label="Contraseña"
        type={isVisible ? "text" : "password"}
        value={password}
        onValueChange={setPassword}
        radius="lg"
        required
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
      <Button type="submit" color="success" className="w-full rounded-full" isLoading={loading}>Entrar</Button>
    </form>
  );
}
