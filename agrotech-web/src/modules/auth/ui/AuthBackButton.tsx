// src/modules/auth/ui/AuthBackButton.tsx
import { useNavigate } from "react-router-dom";

type Props = { fallback?: string; className?: string };

export default function AuthBackButton({ fallback = "/start", className = "" }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Si hay historial real, vuelve; si no, ve a /start
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback, { replace: true });
  };

  return (
    <button
      type="button"
      aria-label="Volver"
      className={`h-8 w-8 grid place-items-center rounded-full hover:bg-black/5 ${className}`}
      onClick={handleClick}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}
