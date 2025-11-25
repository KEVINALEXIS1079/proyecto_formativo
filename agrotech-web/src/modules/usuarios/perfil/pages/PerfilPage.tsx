// src/modules/perfil/ui/PerfilPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Input,
  Select,
  SelectItem,
  Spinner,
  Tab,
  Tabs,
} from "@heroui/react";
import { Camera, Check, Mail, User as UserIcon, UserRoundCog } from "lucide-react";
import { usePerfil } from "../hooks/usePerfil";

type EditDTO = {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  correo?: string;
  idFicha?: string;
  estado?: "activo" | "inactivo";
  avatar?: File | string;
};

export default function PerfilPage() {
  const { me, loading, saving, previewUrl, handleAvatarPick, save } = usePerfil();
  const [edit, setEdit] = useState<EditDTO>({});
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!me) return;
    setEdit({
      nombre: me.nombre,
      apellido: me.apellido,
      telefono: me.telefono ?? "",
      correo: me.correo,
      idFicha: me.idFicha ?? "",
      estado: me.estado === "eliminado" ? "inactivo" : (me.estado as "activo" | "inactivo"),
    });
  }, [me]);

  const fullName = useMemo(() => (!me ? "" : `${me.nombre} ${me.apellido}`.trim()), [me]);

  const onPickAvatar = () => fileRef.current?.click();

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleAvatarPick(file); // preview blob inmediata
    setEdit((s) => ({ ...s, avatar: file })); // listo para save()
  };

  const onSave = () => {
    save(edit); // si avatar es File => multipart
  };

  if (loading || !me) {
    return (
      <div className="w-full h-[60vh] grid place-items-center">
        <Spinner label="Cargando perfil..." />
      </div>
    );
  }

  // 1) Usa preview si existe (blob:)
  // 2) Si no, usa URL del backend y agrega cache-buster para evitar caché tras guardar
  const rawSrc = (previewUrl ?? me.avatar ?? "") || "";
  const isBlob = typeof rawSrc === "string" && rawSrc.startsWith("blob:");
  const avatarSrc =
    !rawSrc
      ? undefined
      : isBlob
      ? rawSrc
      : `${rawSrc}${rawSrc.includes("?") ? "&" : "?"}v=${me.id}-${Date.now()}`;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              src={avatarSrc}
              className="w-24 h-24 text-large"
              radius="lg"
              showFallback
              name={fullName || "Usuario"}
            />
            <Button
              isIconOnly
              size="sm"
              className="absolute -bottom-2 -right-2"
              onPress={onPickAvatar}
              aria-label="Cambiar foto"
            >
              <Camera className="w-4 h-4" />
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarChange}
            />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              {fullName}
              <Chip color="primary" variant="flat" startContent={<UserRoundCog className="w-3.5 h-3.5" />}>
                {me.rol?.nombre}
              </Chip>
            </h1>
            <p className="text-default-500">{me.correo}</p>
          </div>
        </div>

        
      </div>

      <Tabs aria-label="Secciones de perfil" variant="underlined" className="mb-4">
        <Tab
          key="overview"
          title={
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Resumen
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Información básica</h3>
                  <p className="text-small text-default-500">Se actualizará en tu cuenta</p>
                </div>
              </CardHeader>

              <Divider />

              <CardBody className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  value={edit.nombre || ""}
                  onValueChange={(v) => setEdit((s) => ({ ...s, nombre: v }))}
                  isRequired
                />
                <Input
                  label="Apellido"
                  value={edit.apellido || ""}
                  onValueChange={(v) => setEdit((s) => ({ ...s, apellido: v }))}
                  isRequired
                />
                <Input
                  type="email"
                  label="Correo"
                  value={edit.correo || ""}
                  onValueChange={(v) => setEdit((s) => ({ ...s, correo: v }))}
                  startContent={<Mail className="w-4 h-4" />}
                  isRequired
                />
                <Input
                  label="Teléfono"
                  value={edit.telefono || ""}
                  onValueChange={(v) => setEdit((s) => ({ ...s, telefono: v }))}
                />
                <Input
                  label="ID Ficha"
                  value={edit.idFicha || ""}
                  onValueChange={(v) => setEdit((s) => ({ ...s, idFicha: v }))}
                />

                <Select
                  label="Estado"
                  selectedKeys={new Set([edit.estado ?? (me.estado === "eliminado" ? "inactivo" : me.estado)])}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0] as "activo" | "inactivo";
                    setEdit((s) => ({ ...s, estado: v }));
                  }}
                >
                  <SelectItem key="activo" textValue="Activo">
                    Activo
                  </SelectItem>
                  <SelectItem key="inactivo" textValue="Inactivo">
                    Inactivo
                  </SelectItem>
                </Select>
              </CardBody>

              <CardFooter className="justify-end">
                <Button color="primary" startContent={<Check className="w-4 h-4" />} isLoading={saving} onPress={onSave}>
                  Guardar cambios
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
