import { Card, CardHeader, CardBody, CardFooter, Divider, Input, Button } from "@heroui/react";
import { Mail } from "lucide-react";
import type { UpdateProfileInput } from "../models/types/profile.types";

interface ProfileFormProps {
  values: UpdateProfileInput;
  onChange: (values: UpdateProfileInput) => void;
  onSave: () => void;
  onCancel?: () => void;
  isSaving: boolean;
  isEditMode?: boolean;
  errorMessage?: string;
}

export function ProfileForm({ values, onChange, onSave, onCancel, isSaving, isEditMode = true, errorMessage }: ProfileFormProps) {
  const handleChange = (key: keyof UpdateProfileInput, value: string) => {
    onChange({ ...values, [key]: value });
  };

  const isPhoneValid = !values.telefono || values.telefono.length === 10;

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Información básica</h3>
          <p className="text-small text-default-500">
            {isEditMode ? 'Actualiza tu información personal' : 'Tu información personal'}
          </p>
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="grid md:grid-cols-2 gap-4">
        <Input
          label="Nombre"
          value={values.nombre || ''}
          onValueChange={(v) => handleChange('nombre', v)}
          isRequired
          isDisabled={!isEditMode}
        />
        <Input
          label="Apellido"
          value={values.apellido || ''}
          onValueChange={(v) => handleChange('apellido', v)}
          isRequired
          isDisabled={!isEditMode}
        />
        <Input
          type="email"
          label="Correo"
          value={values.correo || ''}
          onValueChange={(v) => handleChange('correo', v)}
          startContent={<Mail className="w-4 h-4" />}
          isRequired
          isDisabled={!isEditMode}
        />
        <Input
          label="Teléfono"
          value={values.telefono || ''}
          onValueChange={(v) => handleChange('telefono', v)}
          isDisabled={!isEditMode}
          maxLength={10}
          isInvalid={isEditMode && !isPhoneValid}
          errorMessage={!isPhoneValid ? "El teléfono debe tener exactamente 10 dígitos" : ""}
          description={isEditMode ? "Debe contener exactamente 10 dígitos" : ""}
        />
        <Input
          label="ID Ficha"
          value={values.idFicha || ''}
          onValueChange={(v) => handleChange('idFicha', v)}
          isDisabled={!isEditMode}
        />
      </CardBody>

      {errorMessage && !errorMessage.includes("teléfono") && !errorMessage.includes("dígitos") && (
        <div className="px-6 py-3 bg-danger-50 dark:bg-danger-900/20 border-t border-danger-200 dark:border-danger-800">
          <p className="text-sm text-danger-600 dark:text-danger-400">{errorMessage}</p>
        </div>
      )}

      {isEditMode && (
        <CardFooter className="justify-end gap-2">
          {onCancel && (
            <Button
              variant="light"
              onPress={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button
            color="success"
            className="text-black font-semibold"
            isLoading={isSaving}
            onPress={onSave}
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
