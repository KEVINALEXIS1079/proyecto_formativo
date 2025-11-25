import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthLayout from "../widgets/AuthLayout";
import ToastDialog from "../widgets/ToastDialog";
import AuthBackButton from "../ui/AuthBackButton";
import AuthLogo from "../ui/AuthLogo";
import AuthLoginForm, { type AuthLoginValues } from "../ui/AuthLoginForm";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, stagger } from "@/lib/motion";

const BYPASS = import.meta.env.VITE_BYPASS_AUTH === "true";

export default function LoginPage() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);
  const { login, loading } = useAuth();

  async function handleSubmit(v: AuthLoginValues) {
    if (!v.correo || !v.password) {
      setMsg("Completa correo y contraseña");
      setOpen(true);
      return;
    }
    if (BYPASS) {
      localStorage.setItem("token", "bypass");
      navigate("/home");
      return;
    }
    try {
      await login({ username: v.correo, password: v.password });
      navigate("/home");
    } catch (e: any) {
      setMsg(e?.message || "No se pudo iniciar sesión");
      setOpen(true);
    }
  }

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
          title={<motion.span variants={fadeInUp} initial="initial" animate="animate">Bienvenido</motion.span>}
          subtitle={<motion.span variants={fadeInUp} initial="initial" animate="animate">Conéctate de nuevo con tus cultivos</motion.span>}
          logoSlot={
            <motion.div variants={fadeInUp} initial="initial" animate="animate" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
              <AuthLogo />
            </motion.div>
          }
          backSlot={
            <motion.div variants={fadeInUp} initial="initial" animate="animate">
              <AuthBackButton fallback="/start" />
            </motion.div>
          }
          formTitle={<motion.span variants={fadeInUp} initial="initial" animate="animate">Inicia sesión</motion.span>}
        >
          <motion.div variants={stagger} initial="initial" animate="animate">
            <motion.div variants={fadeInUp}>
              <AuthLoginForm
                onSubmit={handleSubmit}
                loading={loading}
                footerSlot={<Link to="/recover" className="text-primary text-sm">¿Olvidaste tu contraseña?</Link>}
              />
            </motion.div>

            <motion.p className="text-center text-sm mt-3" variants={fadeInUp} transition={{ delay: 0.05 }}>
              ¿No tienes cuenta? <Link to="/register" className="text-primary">Regístrate</Link>
            </motion.p>
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
              <ToastDialog open title="Inicio de sesión" message={msg} onClose={() => setOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
