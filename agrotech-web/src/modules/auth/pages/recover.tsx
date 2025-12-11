import { useNavigate } from "react-router-dom";
import AuthLayout from "../widgets/AuthLayout";
import AuthBackButton from "../ui/AuthBackButton";
import AuthLogo from "../ui/AuthLogo";
import { PasswordRecoveryFeature } from "../features/PasswordRecoveryFeature";
import { motion } from "framer-motion";
import { fadeInUp, stagger } from "@/lib/motion";

export default function RecoverPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/login");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25 } }}>
      <AuthLayout
        title={
          <motion.span variants={fadeInUp} initial="initial" animate="animate">
            Recuperar tu acceso
          </motion.span>
        }
        subtitle={
          <motion.span variants={fadeInUp} initial="initial" animate="animate">
            Escribe tu correo y te enviaremos un enlace para restablecer tu contraseña.
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
            <AuthBackButton fallback="/login" />
          </motion.div>
        }
        formTitle={
          <motion.span variants={fadeInUp} initial="initial" animate="animate">
            Verificación
          </motion.span>
        }
      >
        <motion.div variants={stagger} initial="initial" animate="animate">
          <motion.div variants={fadeInUp}>
            <PasswordRecoveryFeature onBack={handleBack} />
          </motion.div>
        </motion.div>
      </AuthLayout>
    </motion.div>
  );
}
