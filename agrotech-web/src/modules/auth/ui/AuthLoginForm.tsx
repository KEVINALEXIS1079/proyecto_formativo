  import { useState } from "react";
  import { Input, Button, Checkbox } from "@heroui/react";

  export type AuthLoginValues = { correo: string; password: string; remember?: boolean };

  export default function AuthLoginForm({
    onSubmit, loading, footerSlot,
  }: { onSubmit: (v: AuthLoginValues) => void; loading?: boolean; footerSlot?: React.ReactNode }) {
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);

    return (
      <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); onSubmit({ correo, password, remember }); }}>
        <Input label="Correo electrónico" type="email" value={correo} onValueChange={setCorreo} radius="lg" isClearable required/>
        <Input label="Contraseña" type="password" value={password} onValueChange={setPassword} radius="lg" required/>
        <div className="flex items-center justify-between">
          <Checkbox isSelected={remember} onValueChange={setRemember}>Recordarme</Checkbox>
          {footerSlot}
        </div>
        <Button type="submit" color="success" className="w-full rounded-full" isLoading={loading}>Entrar</Button>
      </form>
    );
  }
