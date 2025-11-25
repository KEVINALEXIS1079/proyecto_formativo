import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../widgets/AuthLayout";
import ToastDialog from "../widgets/ToastDialog";
import AuthBackButton from "../ui/AuthBackButton";
import AuthLogo from "../ui/AuthLogo";
import AuthRegisterForm, { type AuthRegisterValues } from "../ui/AuthRegisterForm";
import { useRegister } from "../hooks/useRegister";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, stagger } from "@/lib/motion"; // si no tienes alias "@", usa la ruta relativa a src/lib/motion

export default function RegisterPage() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);
  const [goLogin, setGoLogin] = useState(false); // ← marcar si debemos ir a /code al cerrar
  const [registeredEmail, setRegisteredEmail] = useState(""); // ← email del registro
  const { mutateAsync, isPending } = useRegister();

  async function handleSubmit(v: AuthRegisterValues) {
    if (!Object.values(v).every(Boolean)) {
      setMsg("Todos los campos son obligatorios");
      setGoLogin(false);
      setOpen(true);
      return;
    }
    if (v.contrasena_usuario !== v.confirmar) {
      setMsg("Las contraseñas no coinciden");
      setGoLogin(false);
      setOpen(true);
      return;
    }
    if (!v.acepta) {
      setMsg("Debes aceptar los términos y condiciones");
      setGoLogin(false);
      setOpen(true);
      return;
    }

    const request = {
      nombre: v.nombre_usuario,
      apellido: v.apellido_usuario,
      identificacion: v.cedula_usuario,
      idFicha: v.id_ficha || undefined,
      telefono: v.telefono_usuario || undefined,
      correo: v.correo_usuario,
      password: v.contrasena_usuario,
    };

    try {
      const result = await mutateAsync(request);
      setRegisteredEmail(request.correo);
      setMsg("Usuario registrado con éxito. Revisa tu email para el código de verificación.");
      setGoLogin(true);   // ← éxito: al cerrar modal, navegamos a /code
      setOpen(true);
    } catch (e: any) {
      setMsg(e?.message || "No se pudo registrar");
      setGoLogin(false);  // ← error: no navegamos
      setOpen(true);
    }
  }

  // Auto-cierre (mantengo tu animación/comportamiento)
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setOpen(false), 3500);
      return () => clearTimeout(t);
    }
  }, [open]);

  // >>> Navegar cuando el modal se cierre y goLogin sea true (sirve para cierre manual o auto)
  useEffect(() => {
    if (!open && goLogin) {
      navigate("/code", { state: { email: registeredEmail, type: "verify" } });
    }
  }, [open, goLogin, navigate, registeredEmail]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.25 } }}
      >
        <AuthLayout
          title={
            <motion.span variants={fadeInUp} initial="initial" animate="animate">
              Crea tu cuenta
            </motion.span>
          }
          subtitle={
            <motion.span variants={fadeInUp} initial="initial" animate="animate">
              Empieza a gestionar tus cultivos
            </motion.span>
          }
          logoSlot={
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <AuthLogo />
            </motion.div>
          }
          backSlot={
            <motion.div variants={fadeInUp} initial="initial" animate="animate">
              <AuthBackButton />
            </motion.div>
          }
          formTitle={
            <motion.span variants={fadeInUp} initial="initial" animate="animate">
              Registro
            </motion.span>
          }
        >
          <motion.div variants={stagger} initial="initial" animate="animate">
            <motion.div variants={fadeInUp}>
              <AuthRegisterForm onSubmit={handleSubmit} loading={isPending} />
            </motion.div>

            <motion.p
              className="text-center text-sm mt-3"
              variants={fadeInUp}
              transition={{ delay: 0.05 }}
            >
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-primary">
                Inicia sesión
              </Link>
            </motion.p>
          </motion.div>
        </AuthLayout>
      </motion.div>

      {/* Toast animado */}
      <AnimatePresence>
        {open && (
          <motion.div
            key={msg}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } }}
            className="fixed inset-0 pointer-events-none"
          >
            <div className="pointer-events-auto">
              <ToastDialog
                open
                title="Registro"
                message={msg}
                onClose={() => setOpen(false)} // ← cerramos; el effect hará navigate si goLogin
                variant="primary"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
