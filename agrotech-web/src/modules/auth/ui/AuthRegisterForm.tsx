import { useState } from "react";
import { Input, Button, Checkbox } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";

export type AuthRegisterValues = {
  cedula_usuario: string; nombre_usuario: string; apellido_usuario: string;
  correo_usuario: string; telefono_usuario: string; id_ficha: string; contrasena_usuario: string; confirmar: string; acepta?: boolean;
};

export default function AuthRegisterForm({ onSubmit, loading }: { onSubmit: (v: AuthRegisterValues) => void; loading?: boolean }) {
  const [form, setForm] = useState<AuthRegisterValues>({
    cedula_usuario: "", nombre_usuario: "", apellido_usuario: "", correo_usuario: "", telefono_usuario: "", id_ficha: "", contrasena_usuario: "", confirmar: "", acepta: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [visiblePass, setVisiblePass] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (field: string, value: any): string => {
    switch (field) {
      case "cedula_usuario":
        return (!/^\d{10}$/.test(value)) ? "Debe tener exactamente 10 dígitos numéricos" : "";
      case "telefono_usuario":
        return (!/^\d{10}$/.test(value)) ? "Debe tener exactamente 10 dígitos numéricos" : "";
      case "id_ficha":
        return (!/^\d{6,8}$/.test(value)) ? "Debe tener entre 6 y 8 dígitos numéricos" : "";
      case "correo_usuario":
        return (!/^[a-z0-9._%+-]+@gmail\.com$/.test(value)) ? "Debe ser un correo @gmail.com válido" : "";
      case "contrasena_usuario":
        return (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)) ? "Mín. 8 caracteres, mayúscula, minúscula y número" : "";
      case "confirmar":
        return (value !== form.contrasena_usuario) ? "Las contraseñas no coinciden" : "";
      default:
        return "";
    }
  };

  const handleChange = (field: keyof AuthRegisterValues, value: any) => {
    let finalValue = value;
    
    // Numeric enforcement
    if (["cedula_usuario", "telefono_usuario", "id_ficha"].includes(field)) {
      if (value && !/^\d*$/.test(value)) return; // Reject non-numeric
      finalValue = value;
    }

    // Email handling
    if (field === "correo_usuario") {
      finalValue = value.toLowerCase();
      // Auto-complete legacy aid
      if (finalValue.includes("@g") && !finalValue.includes("@gmail.com")) {
         // simple heuristic, user likely typing fast
      }
    }

    setForm(p => ({ ...p, [field]: finalValue }));
    
    if (touched[field]) {
      setErrors(p => ({ ...p, [field]: validate(field, finalValue) }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(p => ({ ...p, [field]: true }));
    setErrors(p => ({ ...p, [field]: validate(field, form[field as keyof AuthRegisterValues]) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let isValid = true;
    (Object.keys(form) as Array<keyof AuthRegisterValues>).forEach(k => {
      if (k === "acepta") return;
      const err = validate(k, form[k]);
      if (err) {
        newErrors[k] = err;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {}));

    if (isValid && form.acepta) {
      onSubmit(form);
    }
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input 
            label="Nombre" value={form.nombre_usuario} 
            onValueChange={(v) => handleChange("nombre_usuario", v)} 
            radius="lg" required 
        />
        <Input 
            label="Apellido" value={form.apellido_usuario} 
            onValueChange={(v) => handleChange("apellido_usuario", v)} 
            radius="lg" required 
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input 
            label="Número de documento" value={form.cedula_usuario} 
            onValueChange={(v) => handleChange("cedula_usuario", v)} 
            onBlur={() => handleBlur("cedula_usuario")}
            isInvalid={!!errors.cedula_usuario}
            errorMessage={errors.cedula_usuario}
            radius="lg" inputMode="numeric" maxLength={10} required 
        />
        <Input 
            label="Teléfono" value={form.telefono_usuario} 
            onValueChange={(v) => handleChange("telefono_usuario", v)} 
            onBlur={() => handleBlur("telefono_usuario")}
            isInvalid={!!errors.telefono_usuario}
            errorMessage={errors.telefono_usuario}
            radius="lg" inputMode="numeric" maxLength={10} required 
        />
      </div>
      <Input 
          label="Correo electrónico" type="email" value={form.correo_usuario} 
          onValueChange={(v) => handleChange("correo_usuario", v)} 
          onBlur={() => handleBlur("correo_usuario")}
          isInvalid={!!errors.correo_usuario}
          errorMessage={errors.correo_usuario}
          description="Solo se permiten correos @gmail.com"
          placeholder="usuario@gmail.com"
          radius="lg" required 
      />
      <Input 
          label="ID ficha" value={form.id_ficha} 
          onValueChange={(v) => handleChange("id_ficha", v)} 
          onBlur={() => handleBlur("id_ficha")}
          isInvalid={!!errors.id_ficha}
          errorMessage={errors.id_ficha}
          radius="lg" inputMode="numeric" maxLength={8} required 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="Contraseña"
          type={visiblePass ? "text" : "password"}
          value={form.contrasena_usuario}
          onValueChange={(v) => handleChange("contrasena_usuario", v)} 
          onBlur={() => handleBlur("contrasena_usuario")}
          isInvalid={!!errors.contrasena_usuario}
          errorMessage={errors.contrasena_usuario}
          radius="lg"
          required
          endContent={
            <button className="focus:outline-none" type="button" onClick={() => setVisiblePass(!visiblePass)}>
              {visiblePass ? <EyeOff className="text-2xl text-default-400 pointer-events-none" /> : <Eye className="text-2xl text-default-400 pointer-events-none" />}
            </button>
          }
        />
        <Input
          label="Confirmar contraseña"
          type={visibleConfirm ? "text" : "password"}
          value={form.confirmar}
          onValueChange={(v) => handleChange("confirmar", v)}
          onBlur={() => handleBlur("confirmar")}
          isInvalid={!!errors.confirmar}
          errorMessage={errors.confirmar}
          radius="lg"
          required
          endContent={
            <button className="focus:outline-none" type="button" onClick={() => setVisibleConfirm(!visibleConfirm)}>
              {visibleConfirm ? <EyeOff className="text-2xl text-default-400 pointer-events-none" /> : <Eye className="text-2xl text-default-400 pointer-events-none" />}
            </button>
          }
        />
      </div>

      <Checkbox isSelected={!!form.acepta} onValueChange={(v) => setForm(p => ({ ...p, acepta: v }))}>
        Acepto términos y condiciones
      </Checkbox>
      <Button type="submit" color="success" className="w-full rounded-full" isLoading={loading}>Registrarse</Button>
    </form>
  );
}
