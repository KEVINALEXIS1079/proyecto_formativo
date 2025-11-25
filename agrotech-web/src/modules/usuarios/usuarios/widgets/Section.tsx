import { Card, CardBody, CardHeader, Divider } from "@heroui/react";

export default function Section({
  title,
  actions,
  children,
}: {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="backdrop-blur bg-white/60 dark:bg-black/40 border border-default-200 rounded-2xl">
      {(title || actions) && (
        <>
          <CardHeader className="flex items-center justify-between p-4 md:p-6">
            <div className="text-xl font-semibold">{title}</div>
            <div className="flex items-center gap-2">{actions}</div>
          </CardHeader>
          <Divider />
        </>
      )}
      <CardBody className="p-4 md:p-6">{children}</CardBody>
    </Card>
  );
}
