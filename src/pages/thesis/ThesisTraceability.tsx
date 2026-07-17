import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

function getStatusLabel(t: any, status?: string): string {
  if (!status) return t('thesis:statusLabels.noStatus');

  const normalized = status.toUpperCase();

  const dictionary: Record<string, string> = {
    REGISTERED: t('thesis:statusLabels.registered'),
    REGISTRADO: t('thesis:statusLabels.registered'),
    PENDING: t('thesis:statusLabels.pending'),
    PENDIENTE: t('thesis:statusLabels.pending'),
    UNDER_REVIEW: t('thesis:statusLabels.underReview'),
    EN_REVISION: t('thesis:statusLabels.underReview'),
    EN_REVISIÓN: t('thesis:statusLabels.underReview'),
    OBSERVED: t('thesis:statusLabels.observed'),
    OBSERVADO: t('thesis:statusLabels.observed'),
    APPROVED: t('thesis:statusLabels.approved'),
    APROBADO: t('thesis:statusLabels.approved'),
    REJECTED: t('thesis:statusLabels.rejected'),
    RECHAZADO: t('thesis:statusLabels.rejected'),
    RECTIFIED: t('thesis:statusLabels.rectified'),
    SUBSANADO: t('thesis:statusLabels.rectified'),
    POSTULADO: t('thesis:statusLabels.postulado'),
    PENDIENTE_COORDINADOR: t('thesis:statusLabels.pendingCoordinator'),
    PENDIENTE_DIRECCION: t('thesis:statusLabels.pendingDirection'),
    PENDIENTE_DECANATO: t('thesis:statusLabels.pendingDean'),
    APROBADO_CON_RESOLUCION: t('thesis:statusLabels.approvedWithResolution'),
    FINALIZADO: t('thesis:statusLabels.finalized'),
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
  const { t } = useTranslation('thesis');
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
  const [observeModal, setObserveModal] = useState<{ open: boolean; type: 'plan' | 'report' }>({ open: false, type: 'plan' });
  const [observeText, setObserveText] = useState('');

  const steps = useMemo(() => {
    const [studentStatus, coordinatorStatus, directorStatus, currentStatus] =
      getStepStatus((plan as any)?.estadoPlan || plan?.status);

    return [
      {
        id: '1',
        label: t('thesis:traceability.timeline.planRegistration'),
        status: studentStatus,
        sublabel: t('thesis:traceability.timeline.initialStage'),
      },
      {
        id: '2',
        label: t('thesis:traceability.timeline.academicReview'),
        status: coordinatorStatus,
        sublabel: t('thesis:traceability.timeline.currentStage'),
      },
      {
        id: '3',
        label: t('thesis:traceability.timeline.academicReview'),
        status: directorStatus,
        sublabel: t('thesis:traceability.timeline.processResult'),
      },
      {
        id: '4',
        label: t('thesis:traceability.processResult'),
        status: currentStatus,
        sublabel: t('thesis:traceability.timeline.processResult'),
      },
    ];
  }, [plan?.status, (plan as any)?.estadoPlan, t]);

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
              : t('thesis:traceability.errorTitle')
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
  }, [id, t]);

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
      toast.showSuccess(t('thesis:traceability.actions.approveReportSuccess'));
      window.location.reload();
    } catch (err: any) {
      toast.showError(err.message || t('thesis:traceability.actions.approveReportError'));
    } finally {
      setLoading(false);
    }
  }

  function handleObserveReport() {
    if (!report) return;
    setObserveText('');
    setObserveModal({ open: true, type: 'report' });
  }

  function handleObserve() {
    if (!plan || !id) return;
    setObserveText('');
    setObserveModal({ open: true, type: 'plan' });
  }

  async function submitObserve() {
    const notes = observeText.trim();
    if (!notes) {
      toast.showError(t('thesis:traceability.actions.observeRequired'));
      return;
    }

    setObserveModal({ open: false, type: observeModal.type });

    if (observeModal.type === 'report') {
      if (!report) return;
      try {
        setLoading(true);
        await thesisService.observeReport(report.idInformeTesis, notes);
        toast.showSuccess(t('thesis:traceability.actions.observeReportSuccess'));
        window.location.reload();
      } catch (err: any) {
        toast.showError(err.message || t('thesis:traceability.actions.observeReportError'));
      } finally {
        setLoading(false);
      }
    } else {
      if (!plan || !id) return;
      try {
        setLoading(true);
        if (currentRole === 'COORDINADOR_GRUPO') {
          await thesisService.observeCoordinator(id, notes);
        } else if (currentRole === 'DIRECTOR_INVESTIGACION') {
          await thesisService.observeDirector(id, notes);
        } else {
          toast.showError(t('thesis:traceability.actions.observeRoleError'));
          return;
        }
        toast.showSuccess(t('thesis:traceability.actions.observeSuccess'));
        window.location.reload();
      } catch (err: any) {
        toast.showError(err.message || t('thesis:traceability.actions.observeError'));
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleApprove() {
    if (!plan || !id) return;
    if (!window.confirm(t('thesis:traceability.actions.approveConfirm'))) return;

    try {
      setLoading(true);
      if (currentRole === 'COORDINADOR_GRUPO') {
        await thesisService.approveCoordinator(id);
      } else if (currentRole === 'DIRECTOR_INVESTIGACION') {
        await thesisService.approveDirector(id);
      } else if (currentRole === 'DECANO') {
        const resolutionNum = window.prompt(t('thesis:traceability.actions.resolutionPrompt'));
        if (resolutionNum === null) return;
        if (!resolutionNum.trim()) {
          toast.error(t('thesis:traceability.actions.resolutionRequired'));
          return;
        }
        await thesisService.issueDeanResolution(id, {
          numeroResolucion: resolutionNum,
          fechaEmision: new Date().toISOString().split('T')[0],
          asunto: `Aprobación y emisión de resolución de plan de tesis ID: ${id}`,
          idDocumentoAdjunto: null
        });
      } else {
        toast.error(t('thesis:traceability.actions.approveRoleError'));
        return;
      }
      toast.success(t('thesis:traceability.actions.approveSuccess'));
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || t('thesis:traceability.actions.approveError'));
    } finally {
      setLoading(false);
    }
  }

  async function handleReturnForCorrection() {
    if (!plan || !id) return;
    const comment = window.prompt(t('thesis:traceability.actions.rectifyPrompt'));
    if (comment === null) return;
    if (!comment.trim()) {
      toast.error(t('thesis:traceability.actions.rectifyRequired'));
      return;
    }

    try {
      setLoading(true);
      await thesisService.rectifyPlan(id, {
        resumenSubsanado: plan.resumen,
        comentarioSubsanacion: comment,
        idDocumentoActual: plan.idDocumentoActual
      });
      toast.success(t('thesis:traceability.actions.rectifySuccess'));
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || t('thesis:traceability.actions.rectifyError'));
    } finally {
      setLoading(false);
    }
  }



  if (loading) {
    return (
      <div style={{ padding: '32px', color: 'var(--on-surface-variant)' }}>
        {t('thesis:traceability.loading')}
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
          {t('thesis:traceability.backToPlans')}
        </Link>

        <Alert title={t('thesis:traceability.errorTitle')}>
          {error}
        </Alert>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ padding: '32px', color: 'var(--on-surface-variant)' }}>
        {t('thesis:traceability.notFound')}
      </div>
    );
  }

  const title = readValue(plan, ['tituloTesis', 'titulo', 'title'], t('thesis:traceability.untitledPlan'));
  const statusLabel = getStatusLabel(t, (plan as any).estadoPlan || plan.status);
  const studentName = readValue(plan, ['nombreEstudiante', 'studentName', 'estudiante'], '');
  const studentLast = readValue(plan, ['apellidoEstudiante', 'studentLastName'], '');
  const student = studentName || studentLast ? `${studentName} ${studentLast}`.trim() : t('thesis:traceability.notRegistered');
  const group = readValue(plan, ['nombreGrupo', 'groupCode', 'grupo'], t('thesis:traceability.notRegistered'));
  const groupCode = readValue(plan, ['codigoGrupo', 'groupCode'], '');
  const researchLine = readValue(plan, ['nombreLinea', 'lineaInvestigacion', 'line'], t('thesis:traceability.notRegisteredLine'));
  const advisor = readValue(plan, ['advisorName', 'asesor', 'advisor'], t('thesis:traceability.notRegistered'));

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
          <h2 className="text-title-lg">{t('thesis:traceability.pageTitle')}</h2>
          <p
            className="text-body-md"
            style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}
          >
            {t('thesis:traceability.pageSubtitle')}
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
        {t('thesis:traceability.backToPlans')}
      </Link>

      {actionMessage && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title={t('thesis:traceability.quickActions')}>
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
            {t('thesis:traceability.planId')} {plan.idPlanTesis || id}
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
              <strong style={{ color: 'var(--on-surface)' }}>{t('thesis:traceability.statusLabel')}</strong>{' '}
              <Badge variant="neutral">{statusLabel}</Badge>
            </span>

            <span className="text-body-md">
              <strong style={{ color: 'var(--on-surface)' }}>{t('thesis:traceability.studentLabel')}</strong>{' '}
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
              {t('thesis:traceability.quickActions')}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" onClick={handleObserve}>
                {t('thesis:traceability.observe')}
              </Button>

              <Button variant="primary" onClick={handleApprove}>
                {currentRole === 'DECANO' ? t('thesis:traceability.issueResolution') : t('thesis:traceability.approve')}
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
            <h3 className="text-title-lg">{t('thesis:traceability.processTraceability')}</h3>
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
                  {t('thesis:traceability.finalReport')}
                </h3>
              </CardHeader>
              <CardContent>
                {!report ? (
                  currentRole === 'ESTUDIANTE' ? (
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginBottom: '16px' }}>
                        {t('thesis:traceability.planApprovedMessage')}
                      </p>
                      <Link to={`/thesis/report/new/${id}`}>
                        <Button variant="primary" icon={<Upload size={16} />}>
                          {t('thesis:traceability.registerReport')}
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div style={{ fontSize: '14px', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>
                      {t('thesis:traceability.waitingForStudent')}
                    </div>
                  )
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{report.tituloFinal}</div>
                        <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                          {t('thesis:traceability.sentOn')} {formatDate(report.fechaPresentacion)}
                        </span>
                      </div>
                      <Badge variant={getReportBadgeVariant(report.estadoInforme || 'PENDIENTE')}>
                        {getStatusLabel(t, report.estadoInforme || 'PENDIENTE')}
                      </Badge>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <Button
                        variant="secondary"
                        icon={<Download size={16} />}
                        onClick={() => {
                          documentService.downloadFile(report.idDocumentoTesis, report.tituloFinal || 'Informe_Tesis_Final.pdf');
                        }}
                      >
                        {t('thesis:traceability.downloadThesis')}
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
                            {t('thesis:traceability.approveReport')}
                          </Button>
                          <Button
                            variant="secondary"
                            icon={<X size={16} />}
                            style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                            onClick={handleObserveReport}
                          >
                            {t('thesis:traceability.observeReport')}
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
                {t('thesis:traceability.currentDocument')}
              </h3>

              <Button variant="secondary" style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => {
                  if (plan.idTramite) {
                    window.open(`/reports/traceability/${plan.idTramite}`, '_blank');
                  }
                }}
              >
                {t('thesis:traceability.history')}
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
                      {t('thesis:traceability.planDocument')}
                    </div>

                    <div
                      className="text-caption"
                      style={{ color: 'var(--on-surface-variant)' }}
                    >
                      {readValue(plan, ['nombreDocumento', 'documentName', 'fileName'], t('thesis:traceability.pendingIntegration'))}
                    </div>
                  </div>
                </div>

                <Button 
                  variant="secondary"
                  onClick={() => {
                    if (plan.idDocumentoActual) {
                      documentService.downloadFile(plan.idDocumentoActual, readValue(plan, ['nombreDocumento', 'documentName', 'fileName'], 'Plan_Tesis.pdf'));
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
                {t('thesis:traceability.researchClassification')}
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
                  {t('thesis:traceability.projectLine')}
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
                  {t('thesis:traceability.researchGroup')}
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
                  {t('thesis:traceability.advisor')}
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
              {t('thesis:traceability.institutionalObservationFlow')}
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
              {t('thesis:traceability.traceabilityBadge')}
            </span>
          </CardHeader>

          <CardContent style={{ paddingTop: '32px' }}>
            <Timeline>
              <TimelineItem
                id="registro"
                title={t('thesis:traceability.timeline.planRegistration')}
                time={t('thesis:traceability.timeline.initialStage')}
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
                    {t('thesis:traceability.timeline.planRegistered')}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18} />
                    {t('thesis:traceability.timeline.registrationValidated')}
                  </div>
                </div>
              </TimelineItem>

              <TimelineItem
                id="revision"
                title={t('thesis:traceability.timeline.academicReview')}
                time={t('thesis:traceability.timeline.currentStage')}
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
                    {t('thesis:traceability.timeline.planAvailable')}
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
                    defaultValue={t('thesis:traceability.timeline.registerGuide')}
                  />
                </div>
              </TimelineItem>

              <TimelineItem
                id="resultado"
                title={t('thesis:traceability.timeline.processResult')}
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
                  {t('thesis:traceability.timeline.currentPlanStatus')} <strong>{statusLabel}</strong>
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
            {t('thesis:traceability.registerRectification')}
          </Button>
        </div>
      )}

      {observeModal.open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setObserveModal({ open: false, type: observeModal.type })}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)',
              padding: '28px', width: '100%', maxWidth: '520px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>
                {observeModal.type === 'report'
                  ? t('thesis:traceability.actions.observeReportPrompt')
                  : t('thesis:traceability.actions.observePrompt')}
              </h3>
              <button
                type="button"
                onClick={() => setObserveModal({ open: false, type: observeModal.type })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>
            <textarea
              rows={5}
              value={observeText}
              onChange={e => setObserveText(e.target.value)}
              placeholder={t('thesis:traceability.actions.observePrompt')}
              style={{
                width: '100%', padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline)',
                fontSize: '14px', fontFamily: 'inherit',
                backgroundColor: 'var(--surface)', color: 'var(--on-surface)',
                resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--outline)')}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <Button
                variant="secondary"
                onClick={() => setObserveModal({ open: false, type: observeModal.type })}
              >
                {t('thesis:traceability.cancel', 'Cancelar')}
              </Button>
              <Button
                variant="primary"
                onClick={submitObserve}
                disabled={!observeText.trim()}
              >
                {t('thesis:traceability.send', 'Enviar')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThesisTraceability;
