import { Input } from "@heroui/react";

export default function UserToolbar({
  q,
  setQ,
}: {
  q: string;
  setQ: (v: string) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-3">
      <Input
        isClearable
        label="Buscar"
        placeholder="Nombre, cédula, ficha o rol..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </div>
  );
}
