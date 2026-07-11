import type {
  EstadoTramite,
  MovimientoTramite,
  ObservacionTramite,
  Tramite,
} from '../types/tramites';

// FASE DE VISTAS: este servicio devuelve datos mock con un delay simulado.
// Las firmas de los métodos ya corresponden a los endpoints reales del backend
// (/api/v1/procedures/**), por lo que al integrar solo se reemplaza el cuerpo
// de cada método por llamadas a api.get/api.put manteniendo las vistas intactas.

const MOCK_DELAY_MS = 400;

const delay = <T,>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));

// Estado pendiente que le corresponde revisar a cada rol
export const PENDING_STATE_BY_ROLE: Record<string, EstadoTramite> = {
  COORDINADOR_GRUPO: 'PENDIENTE_COORDINADOR',
  DIRECTOR_INVESTIGACION: 'PENDIENTE_DIRECCION',
  DECANO: 'PENDIENTE_DECANATO',
};

const mockTramites: Tramite[] = [
  {
    id: 1,
    codigoTramite: 'TRM-2026-000101',
    tipoTramite: 'PLAN_TESIS',
    tituloReferencia: 'Sistema de riego inteligente para cultivos de cacao en Tingo María',
    idSolicitante: 2,
    nombreSolicitante: 'José Evaristo',
    estadoActual: 'PENDIENTE_COORDINADOR',
    rolRevisorActual: 'COORDINADOR_GRUPO',
    observacionActual: null,
    fechaCreacion: '2026-06-20T09:15:00',
    fechaActualizacion: '2026-06-20T09:15:00',
  },
  {
    id: 2,
    codigoTramite: 'TRM-2026-000102',
    tipoTramite: 'PROYECTO',
    tituloReferencia: 'Impacto de la IA en la cadena de suministro agroindustrial regional',
    idSolicitante: 2,
    nombreSolicitante: 'José Evaristo',
    estadoActual: 'OBSERVADO',
    rolRevisorActual: null,
    observacionActual: 'Falta la firma del asesor en la carátula y actualizar las referencias del capítulo 2.',
    fechaCreacion: '2026-06-15T10:00:00',
    fechaActualizacion: '2026-06-28T16:40:00',
  },
  {
    id: 3,
    codigoTramite: 'TRM-2026-000103',
    tipoTramite: 'INFORME_AVANCE',
    tituloReferencia: 'Optimización de procesos industriales con IoT — Avance I',
    idSolicitante: 2,
    nombreSolicitante: 'José Evaristo',
    estadoActual: 'PENDIENTE_DIRECCION',
    rolRevisorActual: 'DIRECTOR_INVESTIGACION',
    observacionActual: null,
    fechaCreacion: '2026-06-10T08:30:00',
    fechaActualizacion: '2026-06-25T11:20:00',
  },
  {
    id: 4,
    codigoTramite: 'TRM-2026-000104',
    tipoTramite: 'PLAN_TESIS',
    tituloReferencia: 'Modelo predictivo de deserción estudiantil con aprendizaje automático',
    idSolicitante: 2,
    nombreSolicitante: 'José Evaristo',
    estadoActual: 'PENDIENTE_DECANATO',
    rolRevisorActual: 'DECANO',
    observacionActual: null,
    fechaCreacion: '2026-05-28T14:00:00',
    fechaActualizacion: '2026-06-30T09:05:00',
  },
  {
    id: 5,
    codigoTramite: 'TRM-2026-000105',
    tipoTramite: 'PROYECTO',
    tituloReferencia: 'Trazabilidad blockchain para la cadena productiva del café',
    idSolicitante: 2,
    nombreSolicitante: 'José Evaristo',
    estadoActual: 'FINALIZADO',
    rolRevisorActual: null,
    observacionActual: null,
    fechaCreacion: '2026-04-12T10:45:00',
    fechaActualizacion: '2026-06-18T15:30:00',
  },
  {
    id: 6,
    codigoTramite: 'TRM-2026-000106',
    tipoTramite: 'INFORME_AVANCE',
    tituloReferencia: 'Análisis de vulnerabilidades en redes académicas — Avance II',
    idSolicitante: 2,
    nombreSolicitante: 'José Evaristo',
    estadoActual: 'RECHAZADO',
    rolRevisorActual: null,
    observacionActual: null,
    fechaCreacion: '2026-05-05T09:00:00',
    fechaActualizacion: '2026-05-20T12:10:00',
  },
  {
    id: 7,
    codigoTramite: 'TRM-2026-000107',
    tipoTramite: 'PLAN_TESIS',
    tituloReferencia: 'Gestión de residuos sólidos con sensores de bajo costo',
    idSolicitante: 2,
    nombreSolicitante: 'José Evaristo',
    estadoActual: 'SUBSANADO',
    rolRevisorActual: 'COORDINADOR_GRUPO',
    observacionActual: null,
    fechaCreacion: '2026-06-01T11:30:00',
    fechaActualizacion: '2026-07-02T10:00:00',
  },
  {
    id: 8,
    codigoTramite: 'TRM-2026-000108',
    tipoTramite: 'PROYECTO',
    tituloReferencia: 'Plataforma de vigilancia epidemiológica para la Amazonía',
    idSolicitante: 2,
    nombreSolicitante: 'José Evaristo',
    estadoActual: 'REGISTRADO',
    rolRevisorActual: null,
    observacionActual: null,
    fechaCreacion: '2026-07-05T16:20:00',
    fechaActualizacion: '2026-07-05T16:20:00',
  },
  {
    id: 9,
    codigoTramite: 'TRM-2026-000109',
    tipoTramite: 'PLAN_TESIS',
    tituloReferencia: 'Realidad aumentada aplicada al aprendizaje de matemáticas',
    idSolicitante: 2,
    nombreSolicitante: 'José Evaristo',
    estadoActual: 'APROBADO_CON_RESOLUCION',
    rolRevisorActual: 'DECANO',
    observacionActual: null,
    fechaCreacion: '2026-05-15T08:00:00',
    fechaActualizacion: '2026-07-01T13:45:00',
  },
];

const mockMovimientos: Record<number, MovimientoTramite[]> = {
  1: [
    { id: 1, idTramite: 1, idUsuarioAccion: 2, nombreUsuarioAccion: 'José Evaristo', accion: 'PRESENTADO_POR_SOLICITANTE', estadoAnterior: 'REGISTRADO', estadoNuevo: 'PENDIENTE_COORDINADOR', observacion: null, fechaMovimiento: '2026-06-20T09:15:00' },
  ],
  2: [
    { id: 2, idTramite: 2, idUsuarioAccion: 2, nombreUsuarioAccion: 'José Evaristo', accion: 'PRESENTADO_POR_SOLICITANTE', estadoAnterior: 'REGISTRADO', estadoNuevo: 'PENDIENTE_COORDINADOR', observacion: null, fechaMovimiento: '2026-06-15T10:00:00' },
    { id: 3, idTramite: 2, idUsuarioAccion: 4, nombreUsuarioAccion: 'Carlos Ramos', accion: 'OBSERVADO_POR_COORDINADOR', estadoAnterior: 'PENDIENTE_COORDINADOR', estadoNuevo: 'OBSERVADO', observacion: 'Falta la firma del asesor en la carátula y actualizar las referencias del capítulo 2.', fechaMovimiento: '2026-06-28T16:40:00' },
  ],
  3: [
    { id: 4, idTramite: 3, idUsuarioAccion: 2, nombreUsuarioAccion: 'José Evaristo', accion: 'PRESENTADO_POR_SOLICITANTE', estadoAnterior: 'REGISTRADO', estadoNuevo: 'PENDIENTE_COORDINADOR', observacion: null, fechaMovimiento: '2026-06-10T08:30:00' },
    { id: 5, idTramite: 3, idUsuarioAccion: 4, nombreUsuarioAccion: 'Carlos Ramos', accion: 'APROBADO_POR_COORDINADOR', estadoAnterior: 'PENDIENTE_COORDINADOR', estadoNuevo: 'PENDIENTE_DIRECCION', observacion: null, fechaMovimiento: '2026-06-25T11:20:00' },
  ],
  4: [
    { id: 6, idTramite: 4, idUsuarioAccion: 2, nombreUsuarioAccion: 'José Evaristo', accion: 'PRESENTADO_POR_SOLICITANTE', estadoAnterior: 'REGISTRADO', estadoNuevo: 'PENDIENTE_COORDINADOR', observacion: null, fechaMovimiento: '2026-05-28T14:00:00' },
    { id: 7, idTramite: 4, idUsuarioAccion: 4, nombreUsuarioAccion: 'Carlos Ramos', accion: 'APROBADO_POR_COORDINADOR', estadoAnterior: 'PENDIENTE_COORDINADOR', estadoNuevo: 'PENDIENTE_DIRECCION', observacion: null, fechaMovimiento: '2026-06-12T10:15:00' },
    { id: 8, idTramite: 4, idUsuarioAccion: 5, nombreUsuarioAccion: 'Ana Torres', accion: 'APROBADO_POR_DIRECTOR', estadoAnterior: 'PENDIENTE_DIRECCION', estadoNuevo: 'PENDIENTE_DECANATO', observacion: null, fechaMovimiento: '2026-06-30T09:05:00' },
  ],
  5: [
    { id: 9, idTramite: 5, idUsuarioAccion: 2, nombreUsuarioAccion: 'José Evaristo', accion: 'PRESENTADO_POR_SOLICITANTE', estadoAnterior: 'REGISTRADO', estadoNuevo: 'PENDIENTE_COORDINADOR', observacion: null, fechaMovimiento: '2026-04-12T10:45:00' },
    { id: 10, idTramite: 5, idUsuarioAccion: 4, nombreUsuarioAccion: 'Carlos Ramos', accion: 'APROBADO_POR_COORDINADOR', estadoAnterior: 'PENDIENTE_COORDINADOR', estadoNuevo: 'PENDIENTE_DIRECCION', observacion: null, fechaMovimiento: '2026-04-25T09:00:00' },
    { id: 11, idTramite: 5, idUsuarioAccion: 5, nombreUsuarioAccion: 'Ana Torres', accion: 'APROBADO_POR_DIRECTOR', estadoAnterior: 'PENDIENTE_DIRECCION', estadoNuevo: 'PENDIENTE_DECANATO', observacion: null, fechaMovimiento: '2026-05-15T14:30:00' },
    { id: 12, idTramite: 5, idUsuarioAccion: 6, nombreUsuarioAccion: 'Luis Mendoza', accion: 'RESOLUCION_REGISTRADA', estadoAnterior: 'PENDIENTE_DECANATO', estadoNuevo: 'APROBADO_CON_RESOLUCION', observacion: null, fechaMovimiento: '2026-06-18T15:30:00' },
    { id: 13, idTramite: 5, idUsuarioAccion: 6, nombreUsuarioAccion: 'Luis Mendoza', accion: 'TRAMITE_FINALIZADO', estadoAnterior: 'APROBADO_CON_RESOLUCION', estadoNuevo: 'FINALIZADO', observacion: null, fechaMovimiento: '2026-06-18T15:30:00' },
  ],
  6: [
    { id: 14, idTramite: 6, idUsuarioAccion: 2, nombreUsuarioAccion: 'José Evaristo', accion: 'PRESENTADO_POR_SOLICITANTE', estadoAnterior: 'REGISTRADO', estadoNuevo: 'PENDIENTE_COORDINADOR', observacion: null, fechaMovimiento: '2026-05-05T09:00:00' },
    { id: 15, idTramite: 6, idUsuarioAccion: 4, nombreUsuarioAccion: 'Carlos Ramos', accion: 'RECHAZADO_POR_COORDINADOR', estadoAnterior: 'PENDIENTE_COORDINADOR', estadoNuevo: 'RECHAZADO', observacion: null, fechaMovimiento: '2026-05-20T12:10:00' },
  ],
  7: [
    { id: 16, idTramite: 7, idUsuarioAccion: 2, nombreUsuarioAccion: 'José Evaristo', accion: 'PRESENTADO_POR_SOLICITANTE', estadoAnterior: 'REGISTRADO', estadoNuevo: 'PENDIENTE_COORDINADOR', observacion: null, fechaMovimiento: '2026-06-01T11:30:00' },
    { id: 17, idTramite: 7, idUsuarioAccion: 4, nombreUsuarioAccion: 'Carlos Ramos', accion: 'OBSERVADO_POR_COORDINADOR', estadoAnterior: 'PENDIENTE_COORDINADOR', estadoNuevo: 'OBSERVADO', observacion: 'Precisar el presupuesto de los sensores en el anexo B.', fechaMovimiento: '2026-06-20T09:40:00' },
    { id: 18, idTramite: 7, idUsuarioAccion: 2, nombreUsuarioAccion: 'José Evaristo', accion: 'SUBSANADO_POR_SOLICITANTE', estadoAnterior: 'OBSERVADO', estadoNuevo: 'SUBSANADO', observacion: 'Se adjunta el anexo B corregido con el detalle del presupuesto.', fechaMovimiento: '2026-07-02T10:00:00' },
  ],
  8: [],
  9: [
    { id: 19, idTramite: 9, idUsuarioAccion: 2, nombreUsuarioAccion: 'José Evaristo', accion: 'PRESENTADO_POR_SOLICITANTE', estadoAnterior: 'REGISTRADO', estadoNuevo: 'PENDIENTE_COORDINADOR', observacion: null, fechaMovimiento: '2026-05-15T08:00:00' },
    { id: 20, idTramite: 9, idUsuarioAccion: 4, nombreUsuarioAccion: 'Carlos Ramos', accion: 'APROBADO_POR_COORDINADOR', estadoAnterior: 'PENDIENTE_COORDINADOR', estadoNuevo: 'PENDIENTE_DIRECCION', observacion: null, fechaMovimiento: '2026-06-02T10:30:00' },
    { id: 21, idTramite: 9, idUsuarioAccion: 5, nombreUsuarioAccion: 'Ana Torres', accion: 'APROBADO_POR_DIRECTOR', estadoAnterior: 'PENDIENTE_DIRECCION', estadoNuevo: 'PENDIENTE_DECANATO', observacion: null, fechaMovimiento: '2026-06-20T11:00:00' },
    { id: 22, idTramite: 9, idUsuarioAccion: 6, nombreUsuarioAccion: 'Luis Mendoza', accion: 'RESOLUCION_REGISTRADA', estadoAnterior: 'PENDIENTE_DECANATO', estadoNuevo: 'APROBADO_CON_RESOLUCION', observacion: null, fechaMovimiento: '2026-07-01T13:45:00' },
  ],
};

const mockObservaciones: ObservacionTramite[] = [
  {
    id: 1,
    idTramite: 2,
    tipoObservacion: 'DOCUMENTAL',
    descripcion: 'Falta la firma del asesor en la carátula del documento.',
    estadoObservacion: 'PENDIENTE',
    rolRevisor: 'COORDINADOR_GRUPO',
    fechaRegistro: '2026-06-28T16:40:00',
    subsanaciones: [],
  },
  {
    id: 2,
    idTramite: 2,
    tipoObservacion: 'TECNICA',
    descripcion: 'Actualizar las referencias bibliográficas del capítulo 2 con fuentes posteriores a 2022.',
    estadoObservacion: 'PENDIENTE',
    rolRevisor: 'COORDINADOR_GRUPO',
    fechaRegistro: '2026-06-28T16:40:00',
    subsanaciones: [],
  },
  {
    id: 3,
    idTramite: 7,
    tipoObservacion: 'PRESUPUESTAL',
    descripcion: 'Precisar el presupuesto de los sensores en el anexo B.',
    estadoObservacion: 'SUBSANADA',
    rolRevisor: 'COORDINADOR_GRUPO',
    fechaRegistro: '2026-06-20T09:40:00',
    subsanaciones: [
      {
        id: 1,
        idObservacion: 3,
        idSolicitante: 2,
        descripcion: 'Se adjunta el anexo B corregido con el detalle del presupuesto por sensor.',
        nombreDocumentoAdjunto: 'AnexoB_presupuesto_v2.pdf',
        fechaRegistro: '2026-07-02T10:00:00',
      },
    ],
  },
];

let nextMovimientoId = 23;
let nextSubsanacionId = 2;

const findTramite = (id: number): Tramite => {
  const tramite = mockTramites.find((t) => t.id === id);
  if (!tramite) {
    throw new Error(`Trámite no encontrado con id: ${id}`);
  }
  return tramite;
};

const pushMovimiento = (
  tramite: Tramite,
  accion: string,
  estadoNuevo: EstadoTramite,
  observacion: string | null = null,
) => {
  const movimientos = mockMovimientos[tramite.id] ?? (mockMovimientos[tramite.id] = []);
  movimientos.push({
    id: nextMovimientoId++,
    idTramite: tramite.id,
    idUsuarioAccion: 0,
    nombreUsuarioAccion: 'Usuario actual',
    accion,
    estadoAnterior: tramite.estadoActual,
    estadoNuevo,
    observacion,
    fechaMovimiento: new Date().toISOString(),
  });
  tramite.estadoActual = estadoNuevo;
  tramite.fechaActualizacion = new Date().toISOString();
};

export const tramiteService = {
  // Trámites presentados por el usuario autenticado (solicitante)
  getMyProcedures: async (): Promise<Tramite[]> => {
    return delay([...mockTramites]);
  },

  // Bandeja del revisor: los pendientes de su rol más los que ya atendió (mock)
  getPendingForRole: async (role: string): Promise<Tramite[]> => {
    const pendingState = PENDING_STATE_BY_ROLE[role];
    if (!pendingState) {
      return delay([]);
    }
    return delay(mockTramites.filter((t) => t.estadoActual !== 'REGISTRADO'));
  },

  getById: async (id: number): Promise<Tramite> => {
    return delay({ ...findTramite(id) });
  },

  getTraceability: async (id: number): Promise<MovimientoTramite[]> => {
    return delay([...(mockMovimientos[id] ?? [])]);
  },

  getObservacionesByTramite: async (idTramite: number): Promise<ObservacionTramite[]> => {
    return delay(mockObservaciones.filter((o) => o.idTramite === idTramite).map((o) => ({ ...o })));
  },

  approve: async (id: number): Promise<Tramite> => {
    const tramite = findTramite(id);
    if (tramite.estadoActual === 'PENDIENTE_COORDINADOR') {
      pushMovimiento(tramite, 'APROBADO_POR_COORDINADOR', 'PENDIENTE_DIRECCION');
      tramite.rolRevisorActual = 'DIRECTOR_INVESTIGACION';
    } else if (tramite.estadoActual === 'PENDIENTE_DIRECCION') {
      pushMovimiento(tramite, 'APROBADO_POR_DIRECTOR', 'PENDIENTE_DECANATO');
      tramite.rolRevisorActual = 'DECANO';
    }
    return delay({ ...tramite });
  },

  flag: async (id: number, textoObservacion: string): Promise<Tramite> => {
    const tramite = findTramite(id);
    pushMovimiento(tramite, 'OBSERVADO_POR_REVISOR', 'OBSERVADO', textoObservacion);
    tramite.rolRevisorActual = null;
    tramite.observacionActual = textoObservacion;
    mockObservaciones.push({
      id: mockObservaciones.length + 1,
      idTramite: id,
      tipoObservacion: 'TECNICA',
      descripcion: textoObservacion,
      estadoObservacion: 'PENDIENTE',
      rolRevisor: 'COORDINADOR_GRUPO',
      fechaRegistro: new Date().toISOString(),
      subsanaciones: [],
    });
    return delay({ ...tramite });
  },

  reject: async (id: number): Promise<Tramite> => {
    const tramite = findTramite(id);
    pushMovimiento(tramite, 'RECHAZADO_POR_REVISOR', 'RECHAZADO');
    tramite.rolRevisorActual = null;
    return delay({ ...tramite });
  },

  // OBSERVADO → SUBSANADO → PENDIENTE_COORDINADOR (doble transición del backend)
  remediate: async (id: number, detalleSubsanacion: string): Promise<Tramite> => {
    const tramite = findTramite(id);
    pushMovimiento(tramite, 'SUBSANADO_POR_SOLICITANTE', 'SUBSANADO', detalleSubsanacion);
    pushMovimiento(tramite, 'REENVIADO_A_COORDINADOR', 'PENDIENTE_COORDINADOR');
    tramite.rolRevisorActual = 'COORDINADOR_GRUPO';
    tramite.observacionActual = null;
    return delay({ ...tramite });
  },

  // Subsana una observación puntual; si ya no quedan pendientes, el trámite regresa al flujo
  subsanarObservacion: async (
    idObservacion: number,
    descripcion: string,
    nombreDocumentoAdjunto: string | null = null,
  ): Promise<ObservacionTramite> => {
    const observacion = mockObservaciones.find((o) => o.id === idObservacion);
    if (!observacion) {
      throw new Error(`Observación no encontrada con id: ${idObservacion}`);
    }
    observacion.subsanaciones.push({
      id: nextSubsanacionId++,
      idObservacion,
      idSolicitante: 2,
      descripcion,
      nombreDocumentoAdjunto,
      fechaRegistro: new Date().toISOString(),
    });
    observacion.estadoObservacion = 'SUBSANADA';

    const quedanPendientes = mockObservaciones.some(
      (o) => o.idTramite === observacion.idTramite && o.estadoObservacion === 'PENDIENTE',
    );
    if (!quedanPendientes) {
      const tramite = mockTramites.find((t) => t.id === observacion.idTramite);
      if (tramite && tramite.estadoActual === 'OBSERVADO') {
        pushMovimiento(tramite, 'SUBSANADO_POR_SOLICITANTE', 'SUBSANADO', descripcion);
        pushMovimiento(tramite, 'REENVIADO_A_COORDINADOR', 'PENDIENTE_COORDINADOR');
        tramite.rolRevisorActual = 'COORDINADOR_GRUPO';
        tramite.observacionActual = null;
      }
    }
    return delay({ ...observacion });
  },

  // PENDIENTE_DECANATO → APROBADO_CON_RESOLUCION → FINALIZADO (doble transición del backend)
  registerResolution: async (id: number): Promise<Tramite> => {
    const tramite = findTramite(id);
    pushMovimiento(tramite, 'RESOLUCION_REGISTRADA', 'APROBADO_CON_RESOLUCION');
    pushMovimiento(tramite, 'TRAMITE_FINALIZADO', 'FINALIZADO');
    tramite.rolRevisorActual = null;
    return delay({ ...tramite });
  },
};
