import { Spinner } from "@heroui/react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export default function Loading({ size = "md", label }: LoadingProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <Spinner size={size} label={label} />
    </div>
  );
}