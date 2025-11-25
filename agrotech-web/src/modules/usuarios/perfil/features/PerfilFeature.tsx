import type { PropsWithChildren } from "react";

/** Útil si en el futuro agregas más providers específicos del módulo */
export default function PerfilFeature({ children }: PropsWithChildren) {
  return <>{children}</>;
}
