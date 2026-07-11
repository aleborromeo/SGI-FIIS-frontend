import React from 'react';
import { Badge } from '../ui/Badge';
import { getEstadoTramiteLabel, getEstadoTramiteVariant } from '../../utils/tramiteLabels';
import type { EstadoTramite } from '../../types/tramites';

interface TramiteStatusBadgeProps {
  estado: EstadoTramite;
}

export const TramiteStatusBadge: React.FC<TramiteStatusBadgeProps> = ({ estado }) => (
  <Badge variant={getEstadoTramiteVariant(estado)}>{getEstadoTramiteLabel(estado)}</Badge>
);
