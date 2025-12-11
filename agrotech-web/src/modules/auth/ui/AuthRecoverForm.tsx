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
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();

    const val = email.trim();

    if (!val) {
      setError("Por favor ingresa un correo");
      return;
    }

    if (!val.endsWith("@gmail.com")) {
      setError("Solo se permiten correos @gmail.com");
      return;
    }
    setError("");
    onSubmit({ email: val });
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit} noValidate>
      <Input
        label="Correo electrónico"
        type="email"
        value={email}
        onValueChange={(v) => { setEmail(v); setError(""); }}
        radius="lg"
        required
        placeholder="usuario@gmail.com"
        isInvalid={!!error}
        errorMessage={error}
      />

      <Button
        type="submit"
        color="success"
        className="w-full rounded-full"
        isLoading={loading}
      >
        Verificar
      </Button>
    </form>
  );
}
