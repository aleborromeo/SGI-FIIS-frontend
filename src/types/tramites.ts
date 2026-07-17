export type TipoTramite = 'PROYECTO' | 'PLAN_TESIS' | 'INFORME_AVANCE';

export type EstadoTramite =
  | 'REGISTRADO'
  | 'PENDIENTE_COORDINADOR'
  | 'PENDIENTE_DIRECCION'
  | 'PENDIENTE_DECANATO'
  | 'OBSERVADO'
  | 'SUBSANADO'
  | 'APROBADO_CON_RESOLUCION'
  | 'FINALIZADO'
  | 'RECHAZADO';

export type TipoObservacion = 'TECNICA' | 'DOCUMENTAL' | 'PRESUPUESTAL' | 'FORMATO';

export type EstadoObservacion = 'PENDIENTE' | 'SUBSANADA' | 'VIGENTE';

export interface Tramite {
  id: number;
  codigoTramite: string;
  tipoTramite: TipoTramite;
  tituloReferencia: string;
  idSolicitante: number;
  nombreSolicitante: string;
  estadoActual: EstadoTramite;
  rolRevisorActual: string | null;
  observacionActual: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface MovimientoTramite {
  id: number;
  idTramite: number;
  idUsuarioAccion: number;
  nombreUsuarioAccion: string;
  accion: string;
  estadoAnterior: EstadoTramite;
  estadoNuevo: EstadoTramite;
  observacion: string | null;
  fechaMovimiento: string;
}

export interface SubsanacionTramite {
  id: number;
  idObservacion: number;
  idSolicitante: number;
  descripcion: string;
  nombreDocumentoAdjunto: string | null;
  fechaRegistro: string;
}

export interface ObservacionTramite {
  id: number;
  idTramite: number;
  tipoObservacion: TipoObservacion;
  descripcion: string;
  estadoObservacion: EstadoObservacion;
  rolRevisor: string;
  fechaRegistro: string;
  subsanaciones: SubsanacionTramite[];
}

export interface ProcedureResponseDto {
  id: number;
  code: string;
  procedureType: TipoTramite;
  currentStatus: EstadoTramite;
  applicantId: number;
  groupId: number | null;
  currentReviewerRole: string | null;
  currentObservation: string | null;
  projectReferenceId: number | null;
  thesisReferenceId: number | null;
  reportReferenceId: number | null;
  sentAt: string | null;
  updatedAt: string | null;
}

export interface ProcedureMovementResponseDto {
  actionUserId: number;
  action: string;
  previousStatus: EstadoTramite;
  newStatus: EstadoTramite;
  comment: string | null;
  movementAt: string;
}
