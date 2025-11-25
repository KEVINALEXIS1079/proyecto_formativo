import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthLayout from "../widgets/AuthLayout";
import ToastDialog from "../widgets/ToastDialog";
import AuthBackButton from "../ui/AuthBackButton";
import AuthLogo from "../ui/AuthLogo";
import AuthChangePasswordForm, { type AuthChangePasswordValues } from "../ui/AuthChangePasswordForm";
import { useRecoverChange } from "../hooks/useRecover";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, stagger } from "@/lib/motion";

export default function ChangePasswordPage() {
  const location = useLocation() as any;
  // 👇 OJO: leer 'email' y 'codigo' (no 'correo'), con fallback a localStorage
  const email  = location?.state?.email  || localStorage.getItem("recoveryEmail") || "";
  const codigo = location?.state?.codigo || localStorage.getItem("recoveryCode")  || "";

  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useRecoverChange();
  const navigate = useNavigate();

  async function handleSubmit(v: AuthChangePasswordValues) {
    if (!v.nuevaContrasena || !v.confirmar) {
      setMsg("Completa todos los campos");
      setOpen(true);
      return;
    }
    if (v.nuevaContrasena !== v.confirmar) {
      setMsg("Las contraseñas no coinciden");
      setOpen(true);
      return;
    }
    if (!email || !codigo) {
      setMsg("Falta el correo o el código de verificación");
      setOpen(true);
      return;
    }

    try {
      await mutateAsync({ email, nuevaContrasena: v.nuevaContrasena, codigo });
      // limpiar contexto y redirigir
      localStorage.removeItem("recoveryEmail");
      localStorage.removeItem("recoveryCode");
      navigate("/login");
    } catch (e: any) {
      setMsg(e?.message || "No se pudo cambiar la contraseña");
      setOpen(true);
    }
  }

  // auto-cierre del toast
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setOpen(false), 3500);
      return () => clearTimeout(t);
    }
  }, [open]);

  // si entran sin email/código, reencaminar
  useEffect(() => {
    if (!email) navigate("/recover", { replace: true });
    else if (!codigo) navigate("/code", { replace: true, state: { email } });
  }, [email, codigo, navigate]);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25 } }}>
        <AuthLayout
          title={<motion.span variants={fadeInUp} initial="initial" animate="animate">Actualiza tu contraseña</motion.span>}
          subtitle={<motion.span variants={fadeInUp} initial="initial" animate="animate">Ingresa y confirma tu nueva contraseña para continuar gestionando tus cultivos de manera segura.</motion.span>}
          logoSlot={
            <motion.div variants={fadeInUp} initial="initial" animate="animate" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
              <AuthLogo />
            </motion.div>
          }
          backSlot={<motion.div variants={fadeInUp} initial="initial" animate="animate"><AuthBackButton /></motion.div>}
          formTitle={<motion.span variants={fadeInUp} initial="initial" animate="animate">Actualizar contraseña</motion.span>}
        >
          <motion.div variants={stagger} initial="initial" animate="animate">
            <motion.div variants={fadeInUp}>
              <AuthChangePasswordForm onSubmit={handleSubmit} loading={isPending} />
            </motion.div>
          </motion.div>
        </AuthLayout>
      </motion.div>

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
              <ToastDialog open title="Cambio de contraseña" message={msg} onClose={() => setOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
  