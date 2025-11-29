import { UserStatus } from '../models/types/user.types';

interface UserStatusBadgeProps {
  status: UserStatus;
}

export const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVO:
        return 'bg-green-100 text-green-800';
      case UserStatus.INACTIVO:
        return 'bg-gray-100 text-gray-800';
      case UserStatus.BLOQUEADO:
        return 'bg-red-100 text-red-800';
      case UserStatus.PENDIENTE_VERIFICACION:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVO:
        return 'Activo';
      case UserStatus.INACTIVO:
        return 'Inactivo';
      case UserStatus.BLOQUEADO:
        return 'Bloqueado';
      case UserStatus.PENDIENTE_VERIFICACION:
        return 'Pendiente';
      default:
        return status;
    }
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
};
