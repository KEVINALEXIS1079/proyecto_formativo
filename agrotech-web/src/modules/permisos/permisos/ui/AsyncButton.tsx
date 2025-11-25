import { Button } from "@heroui/react";

type Props = {
  isLoading?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  onPress?: () => void;
};

export default function AsyncButton({
  isLoading,
  isDisabled,
  children,
  className,
  type = "button",
  onPress,
}: Props) {
  return (
    <Button
      type={type}
      isLoading={isLoading}
      isDisabled={isDisabled || isLoading}
      className={className ?? "w-full"}
      onPress={onPress}
    >
      {children}
    </Button>
  );
}
