
import { Badge, Button } from "@heroui/react";

export function IconBadgeButton({
  count,
  icon,
  ariaLabel,
  onPress,
}: {
  count?: number;
  icon: React.ReactNode;
  ariaLabel: string;
  onPress?: () => void;
}) {
  return (
    <Badge content={count && count > 0 ? String(count) : null} shape="circle" color="danger">
      <Button isIconOnly variant="light" radius="full" className="h-9 w-9" aria-label={ariaLabel} onPress={onPress}>
        {icon}
      </Button>
    </Badge>
  );
}
