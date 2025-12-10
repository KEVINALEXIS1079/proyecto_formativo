import { useState } from "react";
import { Input, Button, Checkbox } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";

export type AuthLoginValues = { correo: string; password: string; remember?: boolean };

export default function AuthLoginForm({
  onSubmit, loading, footerSlot,
}: { onSubmit: (v: AuthLoginValues) => void; loading?: boolean; footerSlot?: React.ReactNode }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); onSubmit({ correo, password, remember }); }}>
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
        <Checkbox isSelected={remember} onValueChange={setRemember}>Recordarme</Checkbox>
        {footerSlot}
      </div>
      <Button type="submit" color="success" className="w-full rounded-full" isLoading={loading}>Entrar</Button>
    </form>
  );
}
