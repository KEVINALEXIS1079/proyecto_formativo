import React from 'react';

export default function SectionTitle({ children }: React.PropsWithChildren) {
  return <h3 className="text-sm font-semibold tracking-wide opacity-70">{children}</h3>;
}
