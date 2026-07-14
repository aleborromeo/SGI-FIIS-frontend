import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  Download,
  FileText,
  HelpCircle,
  Send,
  ShieldAlert,
  Upload,
  X,
} from 'lucide-react';

import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Stepper, type StepStatus } from '../../components/ui/Stepper';
import { Timeline, TimelineItem } from '../../components/ui/Timeline';

import { thesisService } from '../../services/thesisService';
import type { ThesisPlan } from '../../services/thesisService';
import { useToast } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';
import { documentService } from '../../services/documentService';

function getStatusLabel(status?: string): string {
  if (!status) return 'Sin estado';

  const normalized = status.toUpperCase();

  const dictionary: Record<string, string> = {
    REGISTERED: 'Registrado',
    REGISTRADO: 'Registrado',
    PENDING: 'Pendiente',
    PENDIENTE: 'Pendiente',
    UNDER_REVIEW: 'En revisión',
    EN_REVISION: 'En revisión',
    EN_REVISIÓN: 'En revisión',
    OBSERVED: 'Observado',
    OBSERVADO: 'Observado',
    APPROVED: 'Aprobado',
    APROBADO: 'Aprobado',
    REJECTED: 'Rechazado',
    RECHAZADO: 'Rechazado',
    RECTIFIED: 'Subsanado',
    SUBSANADO: 'Subsanado',
    POSTULADO: 'Postulado',
    PENDIENTE_COORDINADOR: 'Pendiente de coordinador',
    PENDIENTE_DIRECCION: 'Pendiente de dirección',
    PENDIENTE_DECANATO: 'Pendiente de decanato',
    APROBADO_CON_RESOLUCION: 'Aprobado con resolución',
    FINALIZADO: 'Finalizado',
  };

  return dictionary[normalized] ?? status;
}

function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function getStepStatus(status?: string): StepStatus[] {
  const normalized = String(status ?? '').toUpperCase();

  if (['APPROVED', 'APROBADO'].includes(normalized)) {
    return ['listo', 'aprobado', 'aprobado', 'aprobado'] as StepStatus[];
  }

  if (['OBSERVED', 'OBSERVADO'].includes(normalized)) {
    return ['listo', 'aprobado', 'observado', 'actual'] as StepStatus[];
  }

  if (['REJECTED', 'RECHAZADO'].includes(normalized)) {
    return ['listo', 'aprobado', 'observado', 'observado'] as StepStatus[];
  }

  if (['UNDER_REVIEW', 'EN_REVISION', 'EN_REVISIÓN'].includes(normalized)) {
    return ['listo', 'aprobado', 'actual', 'pendiente'] as StepStatus[];
  }

  return ['listo', 'actual', 'pendiente', 'pendiente'] as StepStatus[];
}

function readValue(plan: ThesisPlan | null, keys: string[], fallback = 'No registrado'): string {
  if (!plan) return fallback;

  const record = plan as unknown as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value);
    }
  }

  return fallback;
}



export const ThesisTraceability: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentRole } = useContext(AuthContext);
  const rawToast = useToast();
  const toast = useMemo(() => ({
    ...rawToast,
    showError: rawToast.error,
    showSuccess: rawToast.success,
  }), [rawToast]);

  const [plan, setPlan] = useState<ThesisPlan | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage] = useState<string | null>(null);

  const steps = useMemo(() => {
    const [studentStatus, coordinatorStatus, directorStatus, currentStatus] =
      getStepStatus((plan as any)?.estadoPlan || plan?.status);

    return [
      {
        id: '1',
        label: 'Estudiante',
        status: studentStatus,
        sublabel: 'Registro',
      },
      {
        id: '2',
        label: 'Coord. de grupo',
        status: coordinatorStatus,
        sublabel: 'Validación',
      },
      {
        id: '3',
        label: 'Director Inv.',
        status: directorStatus,
        sublabel: 'Revisión',
      },
      {
        id: '4',
        label: 'Cierre',
        status: currentStatus,
        sublabel: 'Resultado',
      },
    ];
  }, [plan?.status, (plan as any)?.estadoPlan]);

  useEffect(() => {
    let mounted = true;

    async function loadPlan() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await thesisService.getPlanById(id);

        if (mounted) {
          setPlan(response);
        }

        try {
          const reports = await thesisService.getReportByPlanId(id);
          if (mounted && Array.isArray(reports) && reports.length > 0) {
            setReport(reports[reports.length - 1]);
          }
        } catch (err) {
          // Ignore 404
        }
      } catch (err) {
        console.error('Error al cargar trazabilidad:', err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar la trazabilidad del plan.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPlan();

    return () => {
      mounted = false;
    };
  }, [id]);

  function getReportBadgeVariant(status: string): 'success' | 'warning' | 'info' | 'neutral' | 'error' {
    const norm = String(status || '').toUpperCase();
    if (['APROBADO', 'APPROVED'].includes(norm)) return 'success';
    if (['OBSERVADO', 'OBSERVED'].includes(norm)) return 'warning';
    if (['RECHAZADO', 'REJECTED'].includes(norm)) return 'error';
    if (['EN_REVISION', 'PENDIENTE', 'UNDER_REVIEW'].includes(norm)) return 'info';
    return 'neutral';
  }

  async function handleApproveReport() {
    if (!report) return;
    try {
      setLoading(true);
      await thesisService.approveReport(report.idInformeTesis);
      toast.showSuccess("Informe de tesis final aprobado exitosamente.");
      window.location.reload();
    } catch (err: any) {
      toast.showError(err.message || "Error al aprobar informe de tesis.");
    } finally {
      setLoading(false);
    }
  }

  async function handleObserveReport() {
    if (!report) return;
    const obs = window.prompt("Ingrese el detalle de la observación para el informe de tesis:");
    if (obs === null) return;
    if (!obs.trim()) {
      toast.showError("Debe ingresar una observación.");
      return;
    }
    try {
      setLoading(true);
      await thesisService.observeReport(report.idInformeTesis, obs.trim());
      toast.showSuccess("Informe de tesis devuelto con observaciones.");
      window.location.reload();
    } catch (err: any) {
      toast.showError(err.message || "Error al observar informe de tesis.");
    } finally {
      setLoading(false);
    }
  }

  async function handleObserve() {
    if (!plan || !id) return;
    const notes = window.prompt("Ingrese las observaciones académicas o motivos de observación:");
    if (notes === null) return;
    if (!notes.trim()) {
      toast.error("Debe ingresar las observaciones a registrar.");
      return;
    }

    try {
      setLoading(true);
      if (currentRole === 'COORDINADOR_GRUPO') {
        await thesisService.observeCoordinator(id, notes);
      } else if (currentRole === 'DIRECTOR_INVESTIGACION') {
        await thesisService.observeDirector(id, notes);
      } else {
        toast.error("Tu rol actual no permite realizar observaciones.");
        return;
      }
      toast.success("Observación registrada con éxito.");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Error al registrar la observación.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!plan || !id) return;
    if (!window.confirm("¿Está seguro de que desea aprobar este plan de tesis?")) return;

    try {
      setLoading(true);
      if (currentRole === 'COORDINADOR_GRUPO') {
        await thesisService.approveCoordinator(id);
      } else if (currentRole === 'DIRECTOR_INVESTIGACION') {
        await thesisService.approveDirector(id);
      } else if (currentRole === 'DECANO') {
        const resolutionNum = window.prompt("Ingrese el número de la Resolución Decanal para emisión final:");
        if (resolutionNum === null) return;
        if (!resolutionNum.trim()) {
          toast.error("Debe ingresar un número de resolución válido.");
          return;
        }
        await thesisService.issueDeanResolution(id, {
          numeroResolucion: resolutionNum,
          fechaEmision: new Date().toISOString().split('T')[0],
          asunto: `Aprobación y emisión de resolución de plan de tesis ID: ${id}`,
          idDocumentoAdjunto: null
        });
      } else {
        toast.error("Tu rol actual no permite aprobar planes de tesis.");
        return;
      }
      toast.success("Plan de tesis aprobado correctamente.");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Error al aprobar el plan de tesis.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReturnForCorrection() {
    if (!plan || !id) return;
    const comment = window.prompt("Describa las subsanaciones realizadas en el plan de tesis:");
    if (comment === null) return;
    if (!comment.trim()) {
      toast.error("Debe describir las correcciones para poder subsanar.");
      return;
    }

    try {
      setLoading(true);
      await thesisService.rectifyPlan(id, {
        resumenSubsanado: plan.resumen,
        comentarioSubsanacion: comment,
        idDocumentoActual: plan.idDocumentoActual
      });
      toast.success("Subsanación enviada exitosamente.");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Error al enviar subsanación.");
    } finally {
      setLoading(false);
    }
  }



  if (loading) {
    return (
      <div style={{ padding: '32px', color: 'var(--on-surface-variant)' }}>
        Cargando trazabilidad del plan...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        <Link
          to={currentRole === 'DECANO' ? '/thesis/plans' : '/projects'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--on-surface-variant)',
            textDecoration: 'none',
            marginBottom: '24px',
          }}
        >
          <ArrowLeft size={16} />
          Volver a planes de tesis
        </Link>

        <Alert title="No se pudo cargar la trazabilidad">
          El backend respondió: {error}. Verifica el endpoint GET /api/v1/thesis/plans/{id}.
        </Alert>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ padding: '32px', color: 'var(--on-surface-variant)' }}>
        Plan de tesis no encontrado.
      </div>
    );
  }

  const title = readValue(plan, ['tituloTesis', 'titulo', 'title'], 'Plan de tesis sin título');
  const statusLabel = getStatusLabel((plan as any).estadoPlan || plan.status);
  const studentName = readValue(plan, ['nombreEstudiante', 'studentName', 'estudiante'], '');
  const studentLast = readValue(plan, ['apellidoEstudiante', 'studentLastName'], '');
  const student = studentName || studentLast ? `${studentName} ${studentLast}`.trim() : 'No registrado';
  const group = readValue(plan, ['nombreGrupo', 'groupCode', 'grupo'], 'No registrado');
  const groupCode = readValue(plan, ['codigoGrupo', 'groupCode'], '');
  const researchLine = readValue(plan, ['nombreLinea', 'lineaInvestigacion', 'line'], 'No registrada');
  const advisor = readValue(plan, ['advisorName', 'asesor', 'advisor'], 'No registrado');

  const revisor = plan.revisorActual || '';

  const showReviewActions = 
    (currentRole === 'COORDINADOR_GRUPO' && revisor === 'COORDINADOR_GRUPO') ||
    (currentRole === 'DIRECTOR_INVESTIGACION' && revisor === 'DIRECTOR_INVESTIGACION') ||
    (currentRole === 'DECANO' && revisor === 'DECANO');

  const showStudentActions = 
    currentRole === 'ESTUDIANTE' && revisor === 'ESTUDIANTE' &&
    ['OBSERVED', 'OBSERVADO'].includes(String((plan as any).estadoPlan || plan.status).toUpperCase());

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--outline-variant)',
          paddingBottom: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h2 className="text-title-lg">Gestión y revisión de plan de tesis</h2>
          <p
            className="text-body-md"
            style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}
          >
            Consulta el estado, observaciones y avance institucional del plan.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Bell size={20} color="var(--on-surface-variant)" />
          <HelpCircle size={20} color="var(--on-surface-variant)" />
        </div>
      </div>

      <Link
        to={currentRole === 'DECANO' ? '/thesis/plans' : '/projects'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--on-surface-variant)',
          textDecoration: 'none',
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={16} />
        Volver a planes de tesis
      </Link>

      {actionMessage && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title="Acción registrada en la vista">
            {actionMessage}
          </Alert>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        <div>
          <Badge variant="info" style={{ marginBottom: '12px' }}>
            PLAN ID: {plan.idPlanTesis || id}
          </Badge>

          <h1
            className="text-headline-lg"
            style={{
              color: 'var(--primary)',
              marginBottom: '8px',
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>

          <div
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              color: 'var(--on-surface-variant)',
            }}
          >
            <span className="text-body-md">
              <strong style={{ color: 'var(--on-surface)' }}>Estado:</strong>{' '}
              <Badge variant="neutral">{statusLabel}</Badge>
            </span>

            <span className="text-body-md">
              <strong style={{ color: 'var(--on-surface)' }}>Estudiante:</strong>{' '}
              {student}
            </span>
          </div>
        </div>

        {showReviewActions && (
          <div style={{ textAlign: 'right' }}>
            <div
              className="text-caption"
              style={{
                color: 'var(--on-surface-variant)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Acciones rápidas de revisión
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" onClick={handleObserve}>
                Observar
              </Button>

              <Button variant="primary" onClick={handleApprove}>
                {currentRole === 'DECANO' ? 'Emitir Resolución' : 'Aprobar'}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Card style={{ marginBottom: '32px' }}>
        <CardContent>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--outline-variant)',
              paddingBottom: '16px',
              marginBottom: '16px',
            }}
          >
            <h3 className="text-title-lg">Trazabilidad del proceso</h3>
            <Badge variant="error">{statusLabel}</Badge>
          </div>

          <Stepper steps={steps} />
        </CardContent>
      </Card>

      <div className="section-grid" style={{ gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Tarjeta del Informe de Tesis Final */}
          {(['APPROVED', 'APROBADO'].includes(String((plan as any).estadoPlan || plan.status).toUpperCase()) || report) && (
            <Card style={{ borderTop: '4px solid var(--primary)' }}>
              <CardHeader>
                <h3 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} />
                  Informe de Tesis Final
                </h3>
              </CardHeader>
              <CardContent>
                {!report ? (
                  currentRole === 'ESTUDIANTE' ? (
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginBottom: '16px' }}>
                        Su plan de tesis está aprobado. Ya puede registrar el informe de tesis final.
                      </p>
                      <Link to={`/thesis/report/new/${id}`}>
                        <Button variant="primary" icon={<Upload size={16} />}>
                          Registrar Informe de Tesis Final
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div style={{ fontSize: '14px', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>
                      Esperando que el estudiante registre el informe de tesis final.
                    </div>
                  )
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{report.tituloFinal}</div>
                        <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                          Enviado el {formatDate(report.fechaPresentacion)}
                        </span>
                      </div>
                      <Badge variant={getReportBadgeVariant(report.estadoInforme || 'PENDIENTE')}>
                        {getStatusLabel(report.estadoInforme || 'PENDIENTE')}
                      </Badge>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <Button
                        variant="secondary"
                        icon={<Download size={16} />}
                        onClick={() => {
                          const url = documentService.download(report.idDocumentoTesis);
                          window.open(url, '_blank');
                        }}
                      >
                        Descargar Tesis
                      </Button>

                      {report.estadoInforme === 'EN_REVISION' && 
                       (currentRole === 'COORDINADOR_GRUPO' || currentRole === 'DIRECTOR_INVESTIGACION') && (
                        <>
                          <Button
                            variant="primary"
                            icon={<CheckCircle size={16} />}
                            style={{ backgroundColor: '#059669' }}
                            onClick={handleApproveReport}
                          >
                            Aprobar Informe
                          </Button>
                          <Button
                            variant="secondary"
                            icon={<X size={16} />}
                            style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                            onClick={handleObserveReport}
                          >
                            Observar Informe
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3
                className="text-title-lg"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <FileText size={20} />
                Documento actual
              </h3>

              <Button variant="secondary" style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => {
                  if (plan.idTramite) {
                    window.open(`/reports/traceability/${plan.idTramite}`, '_blank');
                  }
                }}
              >
                Historial
              </Button>
            </CardHeader>

            <CardContent>
              <div
                style={{
                  border: '1px dashed var(--outline)',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      backgroundColor: '#fee2e2',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <FileText size={32} color="#dc2626" />
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>
                      Documento del plan
                    </div>

                    <div
                      className="text-caption"
                      style={{ color: 'var(--on-surface-variant)' }}
                    >
                      {readValue(plan, ['nombreDocumento', 'documentName', 'fileName'], 'Archivo pendiente de integración')}
                    </div>
                  </div>
                </div>

                <Button 
                  variant="secondary"
                  onClick={() => {
                    if (plan.idDocumentoActual) {
                      const url = documentService.download(plan.idDocumentoActual);
                      window.open(url, '_blank');
                    }
                  }}
                  disabled={!plan.idDocumentoActual}
                >
                  <Download size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-title-lg" style={{ marginBottom: '24px' }}>
                Clasificación de investigación
              </h3>

              <div
                style={{
                  backgroundColor: 'var(--surface-container-low)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                }}
              >
                <div
                  className="text-caption"
                  style={{
                    color: 'var(--on-surface-variant)',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  Línea del proyecto
                </div>

                <div style={{ fontWeight: 700 }}>{researchLine}</div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--surface-container-low)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                }}
              >
                <div
                  className="text-caption"
                  style={{
                    color: 'var(--on-surface-variant)',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  Grupo de investigación
                </div>

                <div style={{ fontWeight: 700 }}>{group}</div>
              </div>

              <div>
                <div
                  className="text-caption"
                  style={{
                    color: 'var(--on-surface-variant)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  Asesor
                </div>

                <Badge variant="info">{advisor}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card style={{ borderTop: '4px solid var(--primary)' }}>
          <CardHeader
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3
              className="text-title-lg"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ShieldAlert size={20} />
              Flujo de observación institucional
            </h3>

            <span
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Trazabilidad
            </span>
          </CardHeader>

          <CardContent style={{ paddingTop: '32px' }}>
            <Timeline>
              <TimelineItem
                id="registro"
                title="Registro del plan"
                time="Etapa inicial"
                status="success"
              >
                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #86efac',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    color: '#14532d',
                  }}
                >
                  <p style={{ marginBottom: '12px' }}>
                    El plan fue registrado para iniciar el flujo de revisión académica.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18} />
                    Registro validado por el sistema.
                  </div>
                </div>
              </TimelineItem>

              <TimelineItem
                id="revision"
                title="Revisión académica"
                time="Etapa actual"
                status="active"
              >
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    color: '#1e3a8a',
                  }}
                >
                  <p style={{ marginBottom: '16px' }}>
                    El plan se encuentra disponible para revisión, aprobación u observación
                    según el rol institucional correspondiente.
                  </p>

                  <textarea
                    style={{
                      width: '100%',
                      minHeight: '96px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--outline-variant)',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                    defaultValue="Registrar guía u observación para el estudiante."
                  />
                </div>
              </TimelineItem>

              <TimelineItem
                id="resultado"
                title="Resultado del proceso"
                status="pending"
                isLast
              >
                <div
                  style={{
                    backgroundColor: 'var(--surface-container-low)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--outline-variant)',
                  }}
                >
                  Estado actual del plan: <strong>{statusLabel}</strong>
                </div>
              </TimelineItem>
            </Timeline>
          </CardContent>
        </Card>
      </div>

      {showStudentActions && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '32px',
            paddingTop: '32px',
            borderTop: '1px solid var(--outline-variant)',
          }}
        >
          <Button
            variant="primary"
            icon={<Send size={18} />}
            style={{ width: '100%', maxWidth: '300px' }}
            onClick={handleReturnForCorrection}
          >
            Registrar Subsanación
          </Button>
        </div>
      )}
    </div>
  );
};

export default ThesisTraceability;