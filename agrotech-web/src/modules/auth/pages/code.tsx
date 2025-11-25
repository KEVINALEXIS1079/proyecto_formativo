import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthLayout from "../widgets/AuthLayout";
import ToastDialog from "../widgets/ToastDialog";
import AuthBackButton from "../ui/AuthBackButton";
import AuthLogo from "../ui/AuthLogo";
import AuthCodeForm, { type AuthCodeValues } from "../ui/AuthCodeForm";
import { useVerifyEmail } from "../hooks/useRecover";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, stagger } from "@/lib/motion";

export default function CodePage() {
  const location = useLocation() as any;
  const email = location?.state?.email || ""; // ← leemos 'email', no 'correo'
  const type = location?.state?.type || "recover"; // 'verify' or 'recover'
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useVerifyEmail();
  const navigate = useNavigate();

  async function handleSubmit(v: AuthCodeValues) {
    if (!email || !v.codigo) {
      setMsg("Campos incompletos");
      setOpen(true);
      return;
    }
    try {
      if (type === "verify") {
        await mutateAsync({ correo: email, code: v.codigo });
        navigate("/login");
      } else {
        // For recover, just navigate to change-password
        navigate("/change-password", { state: { email, codigo: v.codigo } });
      }
    } catch (e: any) {
      setMsg(e?.message || "No se pudo verificar el código");
      setOpen(true);
    }
  }

  // si se llega sin email en state, vuelve a /recover
  useEffect(() => {
    if (!email) navigate("/recover");
  }, [email, navigate]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setOpen(false), 3500);
      return () => clearTimeout(t);
    }
  }, [open]);

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
          backSlot={<motion.div variants={fadeInUp} initial="initial" animate="animate"><AuthBackButton /></motion.div>}
          formTitle={<motion.span variants={fadeInUp} initial="initial" animate="animate">Código de verificación</motion.span>}
        >
          <motion.div variants={stagger} initial="initial" animate="animate">
            <motion.div variants={fadeInUp}>
              <AuthCodeForm onSubmit={handleSubmit} loading={isPending} />
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
              <ToastDialog open title="Verificación" message={msg} onClose={() => setOpen(false)} variant="warning" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
