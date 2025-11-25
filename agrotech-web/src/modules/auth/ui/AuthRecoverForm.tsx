import { useState } from "react";
import { Input, Button } from "@heroui/react";

export type AuthRecoverValues = { email: string };

export default function AuthRecoverForm({
  onSubmit,
  loading
}: {
  onSubmit: (v: AuthRecoverValues) => void;
  loading?: boolean;
}) {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation(); // ← CLAVE: evita doble submit interno de HeroUI
    onSubmit({ email });
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit} noValidate>
      <Input
        label="Correo electrónico"
        type="email"
        value={email}
        onValueChange={setEmail}
        radius="lg"
        required
      />

      <Button
        type="submit"
        color="success"
        className="w-full rounded-full"
        isLoading={loading}
        // IMPORTANTE: evita un segundo submit interno
        onPress={() => onSubmit({ email })}
      >
        Verificar
      </Button>
    </form>
  );
}
