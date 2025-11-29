interface UserRoleBadgeProps {
  roleName?: string;
}

export const UserRoleBadge = ({ roleName }: UserRoleBadgeProps) => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
      {roleName || 'Sin Rol'}
    </span>
  );
};
