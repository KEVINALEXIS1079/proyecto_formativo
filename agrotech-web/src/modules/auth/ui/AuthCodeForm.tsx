import { useState } from "react";
import { Input, Button } from "@heroui/react";

export type AuthCodeValues = { codigo: string };

export default function AuthCodeForm({
  onSubmit,
  loading
}: {
  onSubmit: (v: AuthCodeValues) => void;
  loading?: boolean;
}) {
  const [codigo, setCodigo] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation(); // ← evita submit nativo disparado por HeroUI
    onSubmit({ codigo });
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit} noValidate>
      <Input
        label="Código de verificación"
        value={codigo}
        onValueChange={setCodigo}
        radius="lg"
        required
      />

      <Button
        type="submit"
        color="success"
        className="w-full rounded-full"
        isLoading={loading}
        onPress={() => onSubmit({ codigo })}
      >
        Verificar
      </Button>
    </form>
  );
}
