import type { BadgeProps } from '../components/ui/Badge';
import type { EstadoObservacion, EstadoTramite, TipoObservacion, TipoTramite } from '../types/tramites';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

const ESTADO_TRAMITE_UI: Record<EstadoTramite, { label: string; variant: BadgeVariant }> = {
  REGISTRADO: { label: 'Registrado', variant: 'neutral' },
  PENDIENTE_COORDINADOR: { label: 'Pendiente de Coordinador', variant: 'warning' },
  PENDIENTE_DIRECCION: { label: 'Pendiente de Dirección', variant: 'warning' },
  PENDIENTE_DECANATO: { label: 'Pendiente de Decanato', variant: 'warning' },
  OBSERVADO: { label: 'Observado', variant: 'error' },
  SUBSANADO: { label: 'Subsanado', variant: 'info' },
  APROBADO_CON_RESOLUCION: { label: 'Aprobado con Resolución', variant: 'success' },
  FINALIZADO: { label: 'Finalizado', variant: 'success' },
  RECHAZADO: { label: 'Rechazado', variant: 'error' },
};

const TIPO_TRAMITE_LABEL: Record<TipoTramite, string> = {
  PROYECTO: 'Proyecto de Investigación',
  PLAN_TESIS: 'Plan de Tesis',
  INFORME_AVANCE: 'Informe de Avance',
};

const TIPO_OBSERVACION_LABEL: Record<TipoObservacion, string> = {
  TECNICA: 'Técnica',
  DOCUMENTAL: 'Documental',
  PRESUPUESTAL: 'Presupuestal',
  FORMATO: 'Formato',
};

const ESTADO_OBSERVACION_UI: Record<EstadoObservacion, { label: string; variant: BadgeVariant }> = {
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  SUBSANADA: { label: 'Subsanada', variant: 'success' },
  VIGENTE: { label: 'Vigente', variant: 'error' },
};

const ROL_LABEL: Record<string, string> = {
  ESTUDIANTE: 'Estudiante / Tesista',
  DOCENTE_INVESTIGADOR: 'Docente Investigador',
  COORDINADOR_GRUPO: 'Coordinador de Grupo',
  DIRECTOR_INVESTIGACION: 'Director de Investigación',
  DECANO: 'Decano',
};

export const getEstadoTramiteLabel = (estado: EstadoTramite): string =>
  ESTADO_TRAMITE_UI[estado]?.label ?? estado;

export const getEstadoTramiteVariant = (estado: EstadoTramite): BadgeVariant =>
  ESTADO_TRAMITE_UI[estado]?.variant ?? 'neutral';

export const getTipoTramiteLabel = (tipo: TipoTramite): string =>
  TIPO_TRAMITE_LABEL[tipo] ?? tipo;

export const getTipoObservacionLabel = (tipo: TipoObservacion): string =>
  TIPO_OBSERVACION_LABEL[tipo] ?? tipo;

export const getEstadoObservacionLabel = (estado: EstadoObservacion): string =>
  ESTADO_OBSERVACION_UI[estado]?.label ?? estado;

export const getEstadoObservacionVariant = (estado: EstadoObservacion): BadgeVariant =>
  ESTADO_OBSERVACION_UI[estado]?.variant ?? 'neutral';

export const getRolLabel = (rol: string | null): string =>
  (rol && ROL_LABEL[rol]) || '—';
