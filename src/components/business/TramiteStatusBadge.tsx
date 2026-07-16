import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/Badge';
import { getEstadoTramiteLabel, getEstadoTramiteVariant } from '../../utils/tramiteLabels';
import type { EstadoTramite } from '../../types/tramites';

interface TramiteStatusBadgeProps {
  estado: EstadoTramite;
}

export const TramiteStatusBadge: React.FC<TramiteStatusBadgeProps> = ({ estado }) => {
  const { t } = useTranslation();
  return (
    <Badge variant={getEstadoTramiteVariant(estado)}>{getEstadoTramiteLabel(estado, t)}</Badge>
  );
};
