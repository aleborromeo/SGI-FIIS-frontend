import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  Download,
  FileText,
  HelpCircle,
  RotateCcw,
  Send,
  ShieldAlert,
} from 'lucide-react';

import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Stepper, type StepStatus } from '../../components/ui/Stepper';
import { Timeline, TimelineItem } from '../../components/ui/Timeline';

import { thesisService } from '../../services/thesisService';
import type { ThesisPlan } from '../../services/thesisService';

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
  };

  return dictionary[normalized] ?? status;
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

function updatePlanStatus(plan: ThesisPlan, status: string): ThesisPlan {
  return {
    ...(plan as unknown as Record<string, unknown>),
    status,
  } as ThesisPlan;
}

export const ThesisTraceability: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [plan, setPlan] = useState<ThesisPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const steps = useMemo(() => {
    const [studentStatus, coordinatorStatus, directorStatus, currentStatus] =
      getStepStatus(plan?.status);

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
  }, [plan?.status]);

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

  function handleObserve() {
    if (!plan) return;

    setPlan(updatePlanStatus(plan, 'OBSERVED'));
    setActionMessage(
      'Vista actualizada: el plan quedó marcado como observado. La integración real con backend queda pendiente.'
    );
  }

  function handleApprove() {
    if (!plan) return;

    setPlan(updatePlanStatus(plan, 'APPROVED'));
    setActionMessage(
      'Vista actualizada: el plan quedó marcado como aprobado. La integración real con backend queda pendiente.'
    );
  }

  function handleReturnForCorrection() {
    if (!plan) return;

    setPlan(updatePlanStatus(plan, 'OBSERVED'));
    setActionMessage(
      'Vista actualizada: el plan quedó marcado para subsanación. La integración real con backend queda pendiente.'
    );
  }

  function handleResendToDirector() {
    if (!plan) return;

    setPlan(updatePlanStatus(plan, 'UNDER_REVIEW'));
    setActionMessage(
      'Vista actualizada: el plan quedó marcado como reenviado a dirección. La integración real con backend queda pendiente.'
    );
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
          to="/projects"
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
          Volver a proyectos
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

  const title = readValue(plan, ['title', 'titulo', 'tituloPlan'], 'Plan de tesis sin título');
  const statusLabel = getStatusLabel(plan.status);
  const student = readValue(plan, ['studentName', 'estudiante', 'studentFullName'], 'No registrado');
  const group = readValue(plan, ['researchGroupCode', 'groupCode', 'grupo'], 'No registrado');
  const researchLine = readValue(plan, ['researchLineName', 'lineaInvestigacion', 'line'], 'No registrada');
  const advisor = readValue(plan, ['advisorName', 'asesor', 'advisor'], 'No registrado');

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
        to="/projects"
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
        Volver a proyectos
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
            PLAN ID: {plan.id || id}
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
            Acciones rápidas
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" onClick={handleObserve}>
              Observar
            </Button>

            <Button variant="primary" onClick={handleApprove}>
              Aprobar
            </Button>
          </div>
        </div>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
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

              <Button variant="secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>
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
                      {readValue(plan, ['documentName', 'fileName'], 'Archivo pendiente de integración')}
                    </div>
                  </div>
                </div>

                <Button variant="secondary">
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
          variant="danger"
          icon={<RotateCcw size={18} />}
          style={{ width: '300px' }}
          onClick={handleReturnForCorrection}
        >
          Devolver para subsanación
        </Button>

        <Button
          variant="primary"
          icon={<Send size={18} />}
          style={{ width: '300px' }}
          onClick={handleResendToDirector}
        >
          Reenviar a dirección
        </Button>
      </div>
    </div>
  );
};

export default ThesisTraceability;