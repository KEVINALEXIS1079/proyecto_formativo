import { Card, CardBody } from "@heroui/react";

export default function Surface({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
    return (
        <Card shadow="sm" className={`rounded-2xl backdrop-blur-xl bg-white/60 dark:bg-zinc-900/40 ring-1 ring-black/5 dark:ring-white/10 ${className}`}>
            <CardBody className="p-0">{children}</CardBody>
        </Card>
    );
}
