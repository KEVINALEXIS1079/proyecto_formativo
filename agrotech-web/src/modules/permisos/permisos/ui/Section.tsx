import { Card, CardBody } from "@heroui/react";
import type{ ReactNode } from "react";

export default function Section({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className ?? "max-w-3xl mx-auto p-4"}>
      {title ? <h2 className="text-xl font-semibold mb-3">{title}</h2> : null}
      <Card>
        <CardBody>{children}</CardBody>
      </Card>
    </section>
  );
}
