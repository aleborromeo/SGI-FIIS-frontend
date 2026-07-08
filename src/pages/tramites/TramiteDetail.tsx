import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Textarea } from '../../components/ui/Textarea';
import { Stepper, type StepStatus } from '../../components/ui/Stepper';
import { Timeline, TimelineItem } from '../../components/ui/Timeline';
import { Spinner } from '../../components/common/Spinner';
import { TramiteStatusBadge } from '../../components/business/TramiteStatusBadge';
import {
  getEstadoObservacionLabel,
  getEstadoObservacionVariant,
  getEstadoTramiteLabel,
  getRolLabel,
  getTipoObservacionLabel,
  getTipoTramiteLabel,
} from '../../utils/tramiteLabels';
import { ArrowLeft, CheckCircle, FileCheck, PenLine, ThumbsUp, XCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { tramiteService, PENDING_STATE_BY_ROLE } from '../../services/tramiteService';
import type { EstadoTramite, MovimientoTramite, ObservacionTramite, Tramite } from '../../types/tramites';

const ACCION_LABEL: Record<string, string> = {
  PRESENTADO_POR_SOLICITANTE: 'Presentado por el solicitante',
  APROBADO_POR_COORDINADOR: 'Aprobado por el Coordinador',
  APROBADO_POR_DIRECTOR: 'Aprobado por el Director',
  OBSERVADO_POR_COORDINADOR: 'Observado por el Coordinador',
  OBSERVADO_POR_DIRECTOR: 'Observado por el Director',
  OBSERVADO_POR_DECANO: 'Observado por el Decano',
  OBSERVADO_POR_REVISOR: 'Observado por el revisor',
  SUBSANADO_POR_SOLICITANTE: 'Subsanado por el solicitante',
  REENVIADO_A_COORDINADOR: 'Reenviado al Coordinador',
  RECHAZADO_POR_COORDINADOR: 'Rechazado por el Coordinador',
  RECHAZADO_POR_DIRECTOR: 'Rechazado por el Director',
  RECHAZADO_POR_REVISOR: 'Rechazado por el revisor',
  RESOLUCION_REGISTRADA: 'Resolución registrada',
  TRAMITE_FINALIZADO: 'Trámite finalizado',
};

const formatFechaHora = (iso: string): string =>
  new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// Índice de etapa del flujo de aprobación: 0=Coordinador, 1=Dirección, 2=Decanato, 3=Resolución
const STAGE_BY_ESTADO: Partial<Record<EstadoTramite, number>> = {
  PENDIENTE_COORDINADOR: 0,
  SUBSANADO: 0,
  PENDIENTE_DIRECCION: 1,
  PENDIENTE_DECANATO: 2,
  APROBADO_CON_RESOLUCION: 3,
};

const buildSteps = (tramite: Tramite, movimientos: MovimientoTramite[]) => {
  const labels = ['Coordinador', 'Dirección', 'Decanato', 'Resolución'];
  const estado = tramite.estadoActual;

  let currentStage: number;
  let currentStatus: StepStatus;
  let currentSublabel: string;

  if (estado === 'FINALIZADO') {
    return labels.map((label, i) => ({
      id: String(i + 1),
      label,
      status: 'listo' as StepStatus,
      sublabel: i === 3 ? 'Finalizado' : 'Aprobado',
    }));
  }

  if (estado === 'OBSERVADO' || estado === 'RECHAZADO') {
    // La etapa donde se detuvo el flujo sale del último movimiento hacia ese estado
    const movimiento = [...movimientos].reverse().find((m) => m.estadoNuevo === estado);
    currentStage = (movimiento && STAGE_BY_ESTADO[movimiento.estadoAnterior]) ?? 0;
    currentStatus = 'observado';
    currentSublabel = estado === 'OBSERVADO' ? 'Observado' : 'Rechazado';
  } else {
    currentStage = STAGE_BY_ESTADO[estado] ?? -1;
    currentStatus = 'actual';
    currentSublabel = estado === 'SUBSANADO' ? 'Subsanado' : 'En revisión';
  }

  return labels.map((label, i) => {
    if (i < currentStage) {
      return { id: String(i + 1), label, status: 'aprobado' as StepStatus, sublabel: 'Aprobado' };
    }
    if (i === currentStage) {
      return { id: String(i + 1), label, status: currentStatus, sublabel: currentSublabel };
    }
    return { id: String(i + 1), label, status: 'pendiente' as StepStatus, sublabel: 'Pendiente' };
  });
};

const getTimelineStatus = (movimiento: MovimientoTramite, isLast: boolean) => {
  if (movimiento.estadoNuevo === 'OBSERVADO' || movimiento.estadoNuevo === 'RECHAZADO') return 'error';
  if (movimiento.estadoNuevo === 'FINALIZADO' || movimiento.estadoNuevo === 'APROBADO_CON_RESOLUCION') return 'success';
  return isLast ? 'active' : 'success';
};

export const TramiteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRole } = useContext(AuthContext);

  const [tramite, setTramite] = useState<Tramite | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoTramite[]>([]);
  const [observaciones, setObservaciones] = useState<ObservacionTramite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showObservarForm, setShowObservarForm] = useState(false);
  const [textoObservacion, setTextoObservacion] = useState('');
  const [observacionError, setObservacionError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const tramiteId = Number(id);

  const cargarDatos = useCallback(() => {
    return Promise.all([
      tramiteService.getById(tramiteId),
      tramiteService.getTraceability(tramiteId),
      tramiteService.getObservacionesByTramite(tramiteId),
    ])
      .then(([dataTramite, dataMovimientos, dataObservaciones]) => {
        setTramite(dataTramite);
        setMovimientos(dataMovimientos);
        setObservaciones(dataObservaciones);
      })
      .catch((err: Error) => setError(err.message || 'Error al cargar el trámite'));
  }, [tramiteId]);

  useEffect(() => {
    if (!Number.isFinite(tramiteId)) {
      setError('Identificador de trámite inválido.');
      setLoading(false);
      return;
    }
    cargarDatos().finally(() => setLoading(false));
  }, [tramiteId, cargarDatos]);

  const ejecutarAccion = (accion: () => Promise<unknown>, mensaje: string) => {
    setSubmitting(true);
    setFeedback(null);
    accion()
      .then(() => cargarDatos())
      .then(() => {
        setFeedback(mensaje);
        setShowObservarForm(false);
        setTextoObservacion('');
        setObservacionError(undefined);
      })
      .catch((err: Error) => setError(err.message || 'Error al ejecutar la acción'))
      .finally(() => setSubmitting(false));
  };

  const handleObservar = () => {
    if (!textoObservacion.trim()) {
      setObservacionError('El texto de la observación es obligatorio.');
      return;
    }
    ejecutarAccion(
      () => tramiteService.flag(tramiteId, textoObservacion.trim()),
      'El trámite fue observado y devuelto al solicitante.',
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <Spinner size="large" />
      </div>
    );
  }

  if (error || !tramite) {
    return (
      <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        <div style={{ color: 'var(--error)', marginBottom: '16px' }}>{error || 'Trámite no encontrado.'}</div>
        <Link to="/tramites">
          <Button variant="secondary" icon={<ArrowLeft size={16} />}>Volver a la bandeja</Button>
        </Link>
      </div>
    );
  }

  const estado = tramite.estadoActual;
  const pendingState = currentRole ? PENDING_STATE_BY_ROLE[currentRole] : undefined;
  const isRevisor = Boolean(pendingState);
  const puedeRevisar = isRevisor && estado === pendingState;
  const puedeRechazar = puedeRevisar && currentRole !== 'DECANO';
  const puedeAprobar = puedeRevisar && currentRole !== 'DECANO';
  const puedeResolucion = puedeRevisar && currentRole === 'DECANO';
  const puedeSubsanar = !isRevisor && estado === 'OBSERVADO';

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Link to="/tramites" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, marginBottom: '8px' }} className="text-label-md">
            <ArrowLeft size={16} /> Volver a la bandeja
          </Link>
          <h1 className="text-headline-lg">{tramite.codigoTramite}</h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>{tramite.tituloReferencia}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Badge variant="info">{getTipoTramiteLabel(tramite.tipoTramite)}</Badge>
          <TramiteStatusBadge estado={estado} />
        </div>
      </div>

      {feedback && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', marginBottom: '24px', backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)' }}>
          <CheckCircle size={18} color="var(--primary)" />
          <span className="text-body-md" style={{ color: 'var(--on-surface)' }}>{feedback}</span>
        </div>
      )}

      {/* Flujo de aprobación */}
      <Card style={{ marginBottom: '24px' }}>
        <CardContent>
          <div style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '16px', marginBottom: '16px' }}>
            <h3 className="text-title-lg">Flujo de Aprobación</h3>
          </div>
          <Stepper steps={buildSteps(tramite, movimientos)} />
        </CardContent>
      </Card>

      {/* Observación vigente */}
      {estado === 'OBSERVADO' && tramite.observacionActual && (
        <div style={{ marginBottom: '24px' }}>
          <Alert variant="warning" title="Observación vigente">
            {tramite.observacionActual}
          </Alert>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Datos generales */}
        <Card>
          <CardContent>
            <h3 className="text-title-lg" style={{ marginBottom: '16px' }}>Datos Generales</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Solicitante', value: tramite.nombreSolicitante },
                { label: 'Tipo de trámite', value: getTipoTramiteLabel(tramite.tipoTramite) },
                { label: 'Revisor actual', value: getRolLabel(tramite.rolRevisorActual) },
                { label: 'Fecha de presentación', value: formatFechaHora(tramite.fechaCreacion) },
                { label: 'Última actualización', value: formatFechaHora(tramite.fechaActualizacion) },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                  <span className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>{item.label}</span>
                  <span className="text-body-md" style={{ fontWeight: 600, textAlign: 'right' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Acciones según rol y estado */}
        {(puedeRevisar || puedeSubsanar) && (
          <Card>
            <CardContent>
              <h3 className="text-title-lg" style={{ marginBottom: '16px' }}>Acciones</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {puedeAprobar && (
                  <Button
                    icon={<ThumbsUp size={16} />}
                    disabled={submitting}
                    onClick={() => ejecutarAccion(
                      () => tramiteService.approve(tramiteId),
                      'El trámite fue aprobado y avanzó a la siguiente etapa.',
                    )}
                  >
                    Aprobar trámite
                  </Button>
                )}
                {puedeResolucion && (
                  <Button
                    icon={<FileCheck size={16} />}
                    disabled={submitting}
                    onClick={() => ejecutarAccion(
                      () => tramiteService.registerResolution(tramiteId),
                      'Se registró la resolución y el trámite quedó finalizado.',
                    )}
                  >
                    Registrar resolución
                  </Button>
                )}
                {puedeRevisar && (
                  <Button
                    variant="secondary"
                    icon={<PenLine size={16} />}
                    disabled={submitting}
                    onClick={() => setShowObservarForm((prev) => !prev)}
                  >
                    Observar trámite
                  </Button>
                )}
                {showObservarForm && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Textarea
                      label="Texto de la observación"
                      rows={3}
                      value={textoObservacion}
                      error={observacionError}
                      placeholder="Describe qué debe corregir el solicitante..."
                      onChange={(e) => {
                        setTextoObservacion(e.target.value);
                        setObservacionError(undefined);
                      }}
                    />
                    <Button variant="secondary" disabled={submitting} onClick={handleObservar}>
                      Confirmar observación
                    </Button>
                  </div>
                )}
                {puedeRechazar && (
                  <Button
                    variant="danger"
                    icon={<XCircle size={16} />}
                    disabled={submitting}
                    onClick={() => ejecutarAccion(
                      () => tramiteService.reject(tramiteId),
                      'El trámite fue rechazado de forma definitiva.',
                    )}
                  >
                    Rechazar trámite
                  </Button>
                )}
                {puedeSubsanar && (
                  <Button
                    icon={<PenLine size={16} />}
                    onClick={() => navigate(`/observations/subsanacion?tramiteId=${tramite.id}`)}
                  >
                    Subsanar observaciones
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Historial de observaciones y subsanaciones */}
      {observaciones.length > 0 && (
        <Card style={{ marginBottom: '24px' }}>
          <CardContent>
            <h3 className="text-title-lg" style={{ marginBottom: '16px' }}>Observaciones y Subsanaciones</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {observaciones.map((obs) => (
                <div key={obs.id} style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Badge variant="neutral">{getTipoObservacionLabel(obs.tipoObservacion)}</Badge>
                      <Badge variant={getEstadoObservacionVariant(obs.estadoObservacion)}>
                        {getEstadoObservacionLabel(obs.estadoObservacion)}
                      </Badge>
                    </div>
                    <span className="text-caption" style={{ color: 'var(--on-surface-variant)' }}>
                      {getRolLabel(obs.rolRevisor)} · {formatFechaHora(obs.fechaRegistro)}
                    </span>
                  </div>
                  <p className="text-body-md" style={{ marginBottom: obs.subsanaciones.length > 0 ? '12px' : 0 }}>{obs.descripcion}</p>
                  {obs.subsanaciones.map((sub) => (
                    <div key={sub.id} style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', padding: '12px', marginTop: '8px' }}>
                      <div className="text-caption" style={{ color: 'var(--on-surface-variant)', marginBottom: '4px' }}>
                        Subsanación · {formatFechaHora(sub.fechaRegistro)}
                      </div>
                      <p className="text-body-md" style={{ margin: 0 }}>{sub.descripcion}</p>
                      {sub.nombreDocumentoAdjunto && (
                        <div className="text-caption" style={{ color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>
                          Adjunto: {sub.nombreDocumentoAdjunto}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trazabilidad */}
      <Card>
        <CardContent>
          <h3 className="text-title-lg" style={{ marginBottom: '24px' }}>Trazabilidad del Trámite</h3>
          {movimientos.length === 0 ? (
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
              Aún no hay movimientos registrados para este trámite.
            </p>
          ) : (
            <Timeline>
              {movimientos.map((mov, index) => {
                const isLast = index === movimientos.length - 1;
                return (
                  <TimelineItem
                    key={mov.id}
                    id={String(mov.id)}
                    title={ACCION_LABEL[mov.accion] ?? mov.accion.replaceAll('_', ' ')}
                    time={formatFechaHora(mov.fechaMovimiento)}
                    status={getTimelineStatus(mov, isLast)}
                    isLast={isLast}
                  >
                    <div className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                      {mov.nombreUsuarioAccion} · {getEstadoTramiteLabel(mov.estadoAnterior)} → {getEstadoTramiteLabel(mov.estadoNuevo)}
                    </div>
                    {mov.observacion && (
                      <p className="text-body-md" style={{ fontStyle: 'italic', marginTop: '4px' }}>“{mov.observacion}”</p>
                    )}
                  </TimelineItem>
                );
              })}
            </Timeline>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
