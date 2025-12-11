import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthLayout from "../widgets/AuthLayout";
import ToastDialog from "../widgets/ToastDialog";
import AuthBackButton from "../ui/AuthBackButton";
import AuthLogo from "../ui/AuthLogo";
import AuthCodeForm, { type AuthCodeValues } from "../ui/AuthCodeForm";
import { useVerifyEmail, useResendVerificationCode } from "../hooks/useVerifyEmail";
import { useCompleteRegister } from "../hooks/useRegister";
// Keep existing imports for Recover flow if needed, but we focus on verify here or mixed?
// The file handles both "verify" and "recover". existing code imported useVerifyEmail from useRecover which handles "verify".
// But now useVerifyEmail is in new file. For "recover", we might still need useRecoverChange?
// Let's import useRecoverChange from useRecover for password reset flow.
// Keep existing imports for Recover flow if needed, but we focus on verify here or mixed?
// The file handles both "verify" and "recover". existing code imported useVerifyEmail from useRecover which handles "verify".
// But now useVerifyEmail is in new file. For "recover", we might still need useRecoverChange?
// Let's import useRecoverChange from useRecover for password reset flow.
// import { useRecoverChange } from "../hooks/useRecover";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, stagger } from "@/lib/motion";
import { Button } from "@heroui/react";

export default function CodePage() {
  const location = useLocation() as any;
  const email = location?.state?.email || "";
  const type = location?.state?.type || "recover"; // 'verify' or 'recover'
  const [msg, setMsg] = useState("");
  const [msgVariant, setMsgVariant] = useState<"success" | "warning" | "danger">("warning");
  const [verified, setVerified] = useState(false);
  const [open, setOpen] = useState(false);

  // Hooks
  const { mutateAsync: verifyEmail, isPending: isVerifying } = useVerifyEmail();
  const { mutateAsync: completeRegistration, isPending: isCompleting } = useCompleteRegister();
  const { mutateAsync: resendCode, isPending: isResending } = useResendVerificationCode();

  const navigate = useNavigate();

  async function handleSubmit(v: AuthCodeValues) {
    if (!email || !v.codigo) {
      setMsg("Campos incompletos");
      setMsgVariant("warning");
      setOpen(true);
      return;
    }
    try {
      if (type === "verify") {
        const res: any = await verifyEmail({ correo: email, code: v.codigo });
        if (res.success === false) throw new Error(res.message);

        setMsg("Tu cuenta ha sido verificada. Debes esperar a que un administrador active tu cuenta para poder iniciar sesión.");
        setMsgVariant("success");
        setVerified(true);
        setOpen(true);
      } else if (type === "registration") {
        // Complete registration flow
        const res: any = await completeRegistration({ correo: email, code: v.codigo });
        if (res.success === false) throw new Error(res.message);

        setMsg("Tu cuenta ha sido creada exitosamente. Espera la activación de un administrador.");
        setMsgVariant("success");
        setVerified(true); // Treat as verified for flow
        setOpen(true);
      } else {
        navigate("/change-password", { state: { email, codigo: v.codigo } });
      }
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || "No se pudo verificar el código";
      setMsg(Array.isArray(message) ? message.join(", ") : message);
      setMsgVariant("danger");
      setOpen(true);
    }
  }

  async function handleResend() {
    if (!email) return;
    try {
      await resendCode(email);
      setMsg("Código reenviado con éxito");
      setMsgVariant("success");
      setVerified(false);
      setOpen(true);
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Error al reenviar código");
      setMsgVariant("danger");
      setOpen(true);
    }
  }

  // Navigate back if no email
  useEffect(() => {
    if (!email) navigate("/recover");
  }, [email, navigate]);

  useEffect(() => {
    // Only auto-close if NOT the final verification success modal
    if (open && !verified) {
      const t = setTimeout(() => setOpen(false), 3500);
      return () => clearTimeout(t);
    }
  }, [open, verified]);

  const handleClose = () => {
    setOpen(false);
    if (verified) {
      navigate("/login");
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25 } }}>
        <AuthLayout
          title={<motion.span variants={fadeInUp} initial="initial" animate="animate">{type === "verify" ? "Verifica tu email" : "Actualiza tu contraseña"}</motion.span>}
          subtitle={<motion.span variants={fadeInUp} initial="initial" animate="animate">{type === "verify" ? "Ingresa el código enviado a tu email para verificar tu cuenta." : "Ingresa y confirma tu nueva contraseña para continuar gestionando tus cultivos de manera segura."}</motion.span>}
          logoSlot={
            <motion.div variants={fadeInUp} initial="initial" animate="animate" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
              <AuthLogo />
            </motion.div>
          }
          backSlot={
            <motion.div variants={fadeInUp} initial="initial" animate="animate">
              <AuthBackButton fallback={type === "registration" ? "/register" : "/recover"} />
            </motion.div>
          }
          formTitle={<motion.span variants={fadeInUp} initial="initial" animate="animate">Código de verificación</motion.span>}
        >
          <motion.div variants={stagger} initial="initial" animate="animate">
            <motion.div variants={fadeInUp}>
              <AuthCodeForm onSubmit={handleSubmit} loading={isVerifying || isCompleting} />
            </motion.div>

            {type === "verify" && (
              <motion.div variants={fadeInUp} className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline disabled:opacity-50 transition-colors"
                >
                  {isResending ? "Enviando..." : "¿No recibiste el código? Reenviar"}
                </button>
              </motion.div>
            )}

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
              <ToastDialog
                open
                title={verified ? "Verificación Exitosa" : (type === "verify" ? "Verificación" : "Recuperación")}
                message={msg}
                onClose={handleClose}
                variant={msgVariant}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
