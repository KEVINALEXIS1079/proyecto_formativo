import type { ReactNode } from "react";

export default function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-end py-2">{children}</div>
  );
}
