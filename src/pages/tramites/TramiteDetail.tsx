import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { ArrowLeft, CheckCircle, Download, FileCheck, FileText, PenLine, Send, ThumbsUp, XCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { tramiteService, PENDING_STATE_BY_ROLE } from '../../services/tramiteService';
import { documentService } from '../../services/documentService';
import { thesisService, type ThesisPlan } from '../../services/thesisService';
import { projectService, type Project } from '../../services/projectService';
import type { EstadoTramite, MovimientoTramite, ObservacionTramite, Tramite } from '../../types/tramites';

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

const buildSteps = (tramite: Tramite, movimientos: MovimientoTramite[], t: (key: string) => string) => {
  const labels = [
    t('tramites:detailPage.workflowLabels.coordinator'),
    t('tramites:detailPage.workflowLabels.direction'),
    t('tramites:detailPage.workflowLabels.deanOffice'),
    t('tramites:detailPage.workflowLabels.resolution'),
  ];
  const estado = tramite.estadoActual;

  let currentStage: number;
  let currentStatus: StepStatus;
  let currentSublabel: string;

  if (estado === 'FINALIZADO') {
    return labels.map((label, i) => ({
      id: String(i + 1),
      label,
      status: 'listo' as StepStatus,
      sublabel: i === 3 ? t('tramites:detailPage.workflowLabels.finalized') : t('tramites:detailPage.workflowLabels.approved'),
    }));
  }

  if (estado === 'OBSERVADO' || estado === 'RECHAZADO') {
    const movimiento = [...movimientos].reverse().find((m) => m.estadoNuevo === estado);
    currentStage = (movimiento && STAGE_BY_ESTADO[movimiento.estadoAnterior]) ?? 0;
    currentStatus = 'observado';
    currentSublabel = estado === 'OBSERVADO' ? t('tramites:detailPage.workflowLabels.observed') : t('tramites:detailPage.workflowLabels.rejected');
  } else {
    currentStage = STAGE_BY_ESTADO[estado] ?? -1;
    currentStatus = 'actual';
    currentSublabel = estado === 'SUBSANADO' ? t('tramites:detailPage.workflowLabels.subsanado') : t('tramites:detailPage.workflowLabels.inReview');
  }

  return labels.map((label, i) => {
    if (i < currentStage) {
      return { id: String(i + 1), label, status: 'aprobado' as StepStatus, sublabel: t('tramites:detailPage.workflowLabels.approved') };
    }
    if (i === currentStage) {
      return { id: String(i + 1), label, status: currentStatus, sublabel: currentSublabel };
    }
    return { id: String(i + 1), label, status: 'pendiente' as StepStatus, sublabel: t('tramites:detailPage.workflowLabels.pending') };
  });
};

const getTimelineStatus = (movimiento: MovimientoTramite, isLast: boolean) => {
  if (movimiento.estadoNuevo === 'OBSERVADO' || movimiento.estadoNuevo === 'RECHAZADO') return 'error';
  if (movimiento.estadoNuevo === 'FINALIZADO' || movimiento.estadoNuevo === 'APROBADO_CON_RESOLUCION') return 'success';
  return isLast ? 'active' : 'success';
};

export const TramiteDetail: React.FC = () => {
  const { t } = useTranslation('tramites');
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
  const [observationFile, setObservationFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [thesisPlan, setThesisPlan] = useState<ThesisPlan | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  const tramiteId = Number(id);

  const getAccionLabel = useCallback((accion: string): string => {
    const key = `tramites:detailPage.actionLabels.${accion}`;
    const translated = t(key);
    return translated === key ? accion.replaceAll('_', ' ') : translated;
  }, [t]);

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
        if (dataTramite.thesisReferenceId) {
          thesisService.getPlanById(String(dataTramite.thesisReferenceId)).then(setThesisPlan).catch(() => {});
        } else {
          setThesisPlan(null);
        }
        if (dataTramite.projectReferenceId) {
          projectService.getById(Number(dataTramite.projectReferenceId)).then(setProject).catch(() => {});
        } else {
          setProject(null);
        }
      })
      .catch((err: Error) => setError(err.message || t('tramites:detailPage.errors.loadingTramite')));
  }, [tramiteId, t]);

  useEffect(() => {
    if (!Number.isFinite(tramiteId)) {
      setError(t('tramites:detailPage.invalidId'));
      setLoading(false);
      return;
    }
    cargarDatos().finally(() => setLoading(false));
  }, [tramiteId, cargarDatos, t]);

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
      .catch((err: Error) => setError(err.message || t('tramites:detailPage.errors.executingAction')))
      .finally(() => setSubmitting(false));
  };

  const handleObservar = async () => {
    if (!textoObservacion.trim()) {
      setObservacionError(t('tramites:detailPage.observationForm.requiredError'));
      return;
    }
    let attachedDocumentId: number | undefined;
    if (observationFile) {
      try {
        const uploaded = await documentService.upload(observationFile);
        attachedDocumentId = uploaded.id;
      } catch {
        setObservacionError(t('tramites:detailPage.observationForm.uploadError', { defaultValue: 'Error al subir el archivo adjunto.' }));
        return;
      }
    }
    ejecutarAccion(
      () => tramiteService.flag(tramiteId, textoObservacion.trim(), attachedDocumentId),
      t('tramites:detailPage.feedback.observed'),
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
        <div style={{ color: 'var(--error)', marginBottom: '16px' }}>{error || t('tramites:detailPage.tramiteNotFound')}</div>
        <Link to="/tramites">
          <Button variant="secondary" icon={<ArrowLeft size={16} />}>{t('tramites:detailPage.backToInbox')}</Button>
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
            <ArrowLeft size={16} /> {t('tramites:detailPage.backToInbox')}
          </Link>
          <h1 className="text-headline-lg">{tramite.codigoTramite}</h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>{tramite.tituloReferencia}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Badge variant="info">{getTipoTramiteLabel(tramite.tipoTramite, t)}</Badge>
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
            <h3 className="text-title-lg">{t('tramites:detailPage.approvalFlow')}</h3>
          </div>
          <Stepper steps={buildSteps(tramite, movimientos, t)} />
        </CardContent>
      </Card>

      {/* Observación vigente */}
      {estado === 'OBSERVADO' && tramite.observacionActual && (
        <div style={{ marginBottom: '24px' }}>
          <Alert variant="warning" title={t('tramites:detailPage.currentObservation')}>
            {tramite.observacionActual}
          </Alert>
        </div>
      )}

      {thesisPlan && (
        <Card style={{ marginBottom: '24px' }}>
          <CardContent>
            <h3 className="text-title-lg" style={{ marginBottom: '16px' }}>{t('tramites:detailPage.thesisPlanData', { defaultValue: 'Datos del Plan de Tesis' })}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><strong>{t('tramites:detailPage.fields.title', { defaultValue: 'Título' })}:</strong> {thesisPlan.tituloTesis}</div>
              {thesisPlan.resumen && <div><strong>{t('tramites:detailPage.fields.abstract', { defaultValue: 'Resumen' })}:</strong> {thesisPlan.resumen}</div>}
              {thesisPlan.nombreEstudiante && (
                <div><strong>{t('tramites:detailPage.fields.student', { defaultValue: 'Estudiante' })}:</strong> {thesisPlan.nombreEstudiante} {thesisPlan.apellidoEstudiante || ''}</div>
              )}
              {thesisPlan.nombreLinea && <div><strong>{t('tramites:detailPage.fields.researchLine', { defaultValue: 'Línea' })}:</strong> {thesisPlan.nombreLinea}</div>}
              {thesisPlan.nombreGrupo && <div><strong>{t('tramites:detailPage.fields.researchGroup', { defaultValue: 'Grupo' })}:</strong> {thesisPlan.nombreGrupo}</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {project && (
        <Card style={{ marginBottom: '24px' }}>
          <CardContent>
            <h3 className="text-title-lg" style={{ marginBottom: '16px' }}>{t('tramites:detailPage.projectData', { defaultValue: 'Datos del Proyecto' })}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><strong>{t('tramites:detailPage.fields.title')}:</strong> {project.title || project.code}</div>
              {project.summary && <div><strong>{t('tramites:detailPage.fields.abstract')}:</strong> {project.summary}</div>}
              {project.researchLineName && <div><strong>{t('tramites:detailPage.fields.researchLine')}:</strong> {project.researchLineName}</div>}
              {project.researchGroupCode && <div><strong>{t('tramites:detailPage.fields.researchGroup')}:</strong> {project.researchGroupCode}</div>}
            </div>
          </CardContent>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Datos generales */}
        <Card>
          <CardContent>
            <h3 className="text-title-lg" style={{ marginBottom: '16px' }}>{t('tramites:detailPage.generalData')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: t('tramites:detailPage.fields.applicant'), value: tramite.nombreSolicitante },
                { label: t('tramites:detailPage.fields.tramiteType'), value: getTipoTramiteLabel(tramite.tipoTramite, t) },
                { label: t('tramites:detailPage.fields.currentReviewer'), value: getRolLabel(tramite.rolRevisorActual, t) },
                { label: t('tramites:detailPage.fields.submissionDate'), value: formatFechaHora(tramite.fechaCreacion) },
                { label: t('tramites:detailPage.fields.lastUpdate'), value: formatFechaHora(tramite.fechaActualizacion) },
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
              <h3 className="text-title-lg" style={{ marginBottom: '16px' }}>{t('tramites:detailPage.actionsSection')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {puedeAprobar && (
                  <Button
                    icon={<ThumbsUp size={16} />}
                    disabled={submitting}
                    onClick={() => ejecutarAccion(
                      () => tramiteService.approve(tramiteId),
                      t('tramites:detailPage.feedback.approved'),
                    )}
                  >
                    {t('tramites:detailPage.buttons.approve')}
                  </Button>
                )}
                {puedeResolucion && (
                  <Button
                    icon={<FileCheck size={16} />}
                    disabled={submitting}
                    onClick={() => ejecutarAccion(
                      () => tramiteService.registerResolution(tramiteId),
                      t('tramites:detailPage.feedback.resolutionRegistered'),
                    )}
                  >
                    {t('tramites:detailPage.buttons.registerResolution')}
                  </Button>
                )}
                {puedeRevisar && (
                  <Button
                    variant="secondary"
                    icon={<PenLine size={16} />}
                    disabled={submitting}
                    onClick={() => setShowObservarForm((prev) => !prev)}
                  >
                    {t('tramites:detailPage.buttons.observe')}
                  </Button>
                )}
                {showObservarForm && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Textarea
                      label={t('tramites:detailPage.observationForm.label')}
                      rows={3}
                      value={textoObservacion}
                      error={observacionError}
                      placeholder={t('tramites:detailPage.observationForm.placeholder')}
                      onChange={(e) => {
                        setTextoObservacion(e.target.value);
                        setObservacionError(undefined);
                      }}
                    />
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--on-surface)' }}>
                        {t('tramites:detailPage.observationForm.attachmentLabel', { defaultValue: 'Archivo adjunto (opcional)' })}
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => setObservationFile(e.target.files?.[0] ?? null)}
                        style={{ display: 'block', width: '100%', padding: '8px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}
                      />
                      {observationFile && (
                        <span style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '4px', display: 'block' }}>
                          {observationFile.name}
                        </span>
                      )}
                    </div>
                    <Button variant="secondary" disabled={submitting} onClick={handleObservar}>
                      {t('tramites:detailPage.buttons.confirmObservation')}
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
                      t('tramites:detailPage.feedback.rejected'),
                    )}
                  >
                    {t('tramites:detailPage.buttons.reject')}
                  </Button>
                )}
                {puedeSubsanar && (
                  <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px', textAlign: 'center' }}>
                    <Link
                      to={`/observations/subsanacion?tramiteId=${tramite.id}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', padding: '8px 0' }}
                      className="text-label-md"
                    >
                      <FileText size={16} />
                      {t('tramites:detailPage.irSubsanacion', { defaultValue: 'Ir a subsanación' })}
                    </Link>
                  </div>
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
            <h3 className="text-title-lg" style={{ marginBottom: '16px' }}>{t('tramites:detailPage.observationsSection')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {observaciones.map((obs) => (
                <div key={obs.id} style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Badge variant="neutral">{getTipoObservacionLabel(obs.tipoObservacion, t)}</Badge>
                      <Badge variant={getEstadoObservacionVariant(obs.estadoObservacion)}>
                        {getEstadoObservacionLabel(obs.estadoObservacion, t)}
                      </Badge>
                    </div>
                    <span className="text-caption" style={{ color: 'var(--on-surface-variant)' }}>
                      {getRolLabel(obs.rolRevisor, t)} · {formatFechaHora(obs.fechaRegistro)}
                    </span>
                  </div>
                  <p className="text-body-md" style={{ marginBottom: obs.subsanaciones.length > 0 ? '12px' : 0 }}>{obs.descripcion}</p>
                  {obs.subsanaciones.map((sub) => (
                    <div key={sub.id} style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', padding: '12px', marginTop: '8px' }}>
                      <div className="text-caption" style={{ color: 'var(--on-surface-variant)', marginBottom: '4px' }}>
                        {t('tramites:detailPage.subsancionPrefix')} {formatFechaHora(sub.fechaRegistro)}
                      </div>
                      <p className="text-body-md" style={{ margin: 0 }}>{sub.descripcion}</p>
                      {sub.nombreDocumentoAdjunto && (
                        <div className="text-caption" style={{ color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>
                          {t('tramites:detailPage.attachmentPrefix')} {sub.nombreDocumentoAdjunto}
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
          <h3 className="text-title-lg" style={{ marginBottom: '24px' }}>{t('tramites:detailPage.traceabilitySection')}</h3>
          {movimientos.length === 0 ? (
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
              {t('tramites:detailPage.noMovements')}
            </p>
          ) : (
            <Timeline>
              {movimientos.map((mov, index) => {
                const isLast = index === movimientos.length - 1;
                return (
                  <TimelineItem
                    key={`mov-${index}`}
                    id={String(mov.id)}
                    title={getAccionLabel(mov.accion)}
                    time={formatFechaHora(mov.fechaMovimiento)}
                    status={getTimelineStatus(mov, isLast)}
                    isLast={isLast}
                  >
                    <div className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                      {mov.nombreUsuarioAccion} · {getEstadoTramiteLabel(mov.estadoAnterior, t)} → {getEstadoTramiteLabel(mov.estadoNuevo, t)}
                    </div>
                    {mov.observacion && (
                      <p className="text-body-md" style={{ fontStyle: 'italic', marginTop: '4px' }}>"{mov.observacion}"</p>
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
