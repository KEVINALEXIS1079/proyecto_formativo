import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../widgets/AuthLayout";
import ToastDialog from "../widgets/ToastDialog";
import AuthBackButton from "../ui/AuthBackButton";
import AuthLogo from "../ui/AuthLogo";
import AuthRegisterForm, { type AuthRegisterValues } from "../ui/AuthRegisterForm";
import { useRegister } from "../hooks/useRegister";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, stagger } from "@/lib/motion";

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Solo volver a Login si venimos explícitamente de allí. Si no, a Start.
  const from = location.state?.from;
  const backPath = from === "/login" ? "/login" : "/start";

  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);
  const [goLogin, setGoLogin] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
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
      await mutateAsync(request);
      setRegisteredEmail(request.correo);
      setMsg("Registro iniciado. Hemos enviado un código a tu correo para verificar tu cuenta.");
      setGoLogin(true);
      setOpen(true);
    } catch (e: any) {
      setMsg(e?.message || "No se pudo registrar");
      setGoLogin(false);
      setOpen(true);
    }
  }

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setOpen(false), 3500);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open && goLogin) {
      navigate("/code", { state: { email: registeredEmail, type: "registration" } });
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
              <AuthBackButton fallback={backPath} />
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
              <Link to="/login" replace state={{ from: "/register" }} className="text-green-600 font-medium hover:underline">
                Inicia sesión
              </Link>
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
              <ToastDialog
                open
                title="Registro"
                message={msg}
                onClose={() => setOpen(false)}
                variant="primary"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
