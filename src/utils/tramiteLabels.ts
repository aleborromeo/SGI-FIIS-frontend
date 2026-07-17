import type { TFunction } from 'i18next';
import type { BadgeProps } from '../components/ui/Badge';
import type { EstadoObservacion, EstadoTramite, TipoObservacion, TipoTramite } from '../types/tramites';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

const ESTADO_TRAMITE_VARIANTS: Record<EstadoTramite, BadgeVariant> = {
  REGISTRADO: 'neutral',
  PENDIENTE_COORDINADOR: 'warning',
  PENDIENTE_DIRECCION: 'warning',
  PENDIENTE_DECANATO: 'warning',
  OBSERVADO: 'error',
  SUBSANADO: 'info',
  APROBADO_CON_RESOLUCION: 'success',
  FINALIZADO: 'success',
  RECHAZADO: 'error',
};

const ESTADO_OBSERVACION_VARIANTS: Record<EstadoObservacion, BadgeVariant> = {
  PENDIENTE: 'warning',
  SUBSANADA: 'success',
  VIGENTE: 'error',
};

export const getEstadoTramiteLabel = (estado: EstadoTramite, t: TFunction): string =>
  t(`tramites:estadosTramite.${estado}`, { defaultValue: estado });

export const getEstadoTramiteVariant = (estado: EstadoTramite): BadgeVariant =>
  ESTADO_TRAMITE_VARIANTS[estado] ?? 'neutral';

export const getTipoTramiteLabel = (tipo: TipoTramite, t: TFunction): string =>
  t(`tramites:tiposTramite.${tipo}`, { defaultValue: tipo });

export const getTipoObservacionLabel = (tipo: TipoObservacion, t: TFunction): string =>
  t(`tramites:tiposObservacion.${tipo}`, { defaultValue: tipo });

export const getEstadoObservacionLabel = (estado: EstadoObservacion, t: TFunction): string =>
  t(`tramites:estadosObservacion.${estado}`, { defaultValue: estado });

export const getEstadoObservacionVariant = (estado: EstadoObservacion): BadgeVariant =>
  ESTADO_OBSERVACION_VARIANTS[estado] ?? 'neutral';

export const getRolLabel = (rol: string | null, t: TFunction): string =>
  (rol && t(`admin:users.roles.${rol}`, { defaultValue: '—' })) || '—';
