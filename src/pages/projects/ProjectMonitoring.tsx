import React, { useEffect, useMemo, useState, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  DollarSign,
  FileText,
  HelpCircle,
  MapPin,
  RefreshCcw,
  Users,
} from 'lucide-react';

import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { TableContainer, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';

import { useTranslation } from 'react-i18next';
import { projectService } from '../../services/projectService';
import type { Project } from '../../services/projectService';
import { useToast } from '../../context/ToastContext';
import { documentService } from '../../services/documentService';
import { AuthContext } from '../../context/AuthContext';
import { progressReportService } from '../../services/progressReportService';
import { userService } from '../../services/userService';

function getStatusLabel(status?: string, t?: (key: string) => string): string {
  if (!status) {
    return t ? t('projects:statuses.noStatus') : 'Sin estado';
  }

  const upperStatus = status.toUpperCase();

  if (t) {
    const translationKeys: Record<string, string> = {
      POSTULATED: 'projects:statuses.postulado',
      POSTULADO: 'projects:statuses.postulado',
      OBSERVED: 'projects:statuses.observado',
      OBSERVADO: 'projects:statuses.observado',
      APPROVED: 'projects:statuses.aprobado',
      APROBADO: 'projects:statuses.aprobado',
      REJECTED: 'projects:statuses.rechazado',
      RECHAZADO: 'projects:statuses.rechazado',
      IN_PROGRESS: 'projects:statuses.enEjecucion',
      EN_EJECUCION: 'projects:statuses.enEjecucion',
      EN_EJECUCIÓN: 'projects:statuses.enEjecucion',
      COMPLETED: 'projects:statuses.finalizado',
      FINALIZADO: 'projects:statuses.finalizado',
      ACTIVE: 'projects:statuses.activo',
      ACTIVO: 'projects:statuses.activo',
    };
    const key = translationKeys[upperStatus];
    if (key) return t(key);
  } else {
    const fallbackDictionary: Record<string, string> = {
      POSTULATED: 'Postulado',
      POSTULADO: 'Postulado',
      OBSERVED: 'Observado',
      OBSERVADO: 'Observado',
      APPROVED: 'Aprobado',
      APROBADO: 'Aprobado',
      REJECTED: 'Rechazado',
      RECHAZADO: 'Rechazado',
      IN_PROGRESS: 'En ejecución',
      EN_EJECUCION: 'En ejecución',
      EN_EJECUCIÓN: 'En ejecución',
      COMPLETED: 'Finalizado',
      FINALIZADO: 'Finalizado',
      ACTIVE: 'Activo',
      ACTIVO: 'Activo',
    };
    const fallback = fallbackDictionary[upperStatus];
    if (fallback) return fallback;
  }

  return status;
}

function getStatusProgress(status?: string): number {
  const normalized = String(status ?? '').toUpperCase();

  const progressByStatus: Record<string, number> = {
    POSTULATED: 15,
    POSTULADO: 15,
    OBSERVED: 25,
    OBSERVADO: 25,
    APPROVED: 45,
    APROBADO: 45,
    IN_PROGRESS: 65,
    EN_EJECUCION: 65,
    EN_EJECUCIÓN: 65,
    COMPLETED: 100,
    FINALIZADO: 100,
    REJECTED: 0,
    RECHAZADO: 0,
  };

  return progressByStatus[normalized] ?? 20;
}

function formatDate(value?: string): string {
  if (!value) return 'No registrado';

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

function formatMoney(value?: number): string {
  if (value === null || value === undefined) return 'No registrado';

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}

function getDurationLabel(startDate?: string, endDate?: string, t?: (key: string, options?: any) => string): string {
  if (!startDate || !endDate) return t ? t('projects:monitoring.notRegisteredDuration') : 'No registrada';

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return t ? t('projects:monitoring.notRegisteredDuration') : 'No registrada';
  }

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (months <= 0) return t ? t('projects:monitoring.lessThanOneMonth') : 'Menos de 1 mes';

  if (t) {
    return t('projects:monitoring.months', { count: months });
  }

  const suffix = months === 1 ? '' : 'es';
  return `${months} mes${suffix}`;
}

export const ProjectMonitoring: React.FC = () => {
  const { t } = useTranslation('projects');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRole } = useContext(AuthContext);

  const [project, setProject] = useState<Project | null>(null);
  const [progressReports, setProgressReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const rawToast = useToast();
  const toast = useMemo(() => ({
    ...rawToast,
    showError: rawToast.error,
    showSuccess: rawToast.success,
  }), [rawToast]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const progress = useMemo(() => getStatusProgress(project?.status), [project?.status]);

  const parsedSummary = useMemo(() => {
    if (!project?.summary) return null;
    const summaryText = project.summary;

    const headers = [
      { key: 'fif', pattern: /\[FIF:\s*(SI|NO|SÍ)\]/i },
      { key: 'resumen', label: t('projects:monitoring.summaryLabels.resumen'), pattern: /RESUMEN:/ },
      { key: 'objetivos', label: t('projects:monitoring.summaryLabels.objetivos'), pattern: /OBJETIVOS ESPECÍFICOS:/ },
      { key: 'metodologia', label: t('projects:monitoring.summaryLabels.metodologia'), pattern: /METODOLOGÍA:/ },
      { key: 'resultados', label: t('projects:monitoring.summaryLabels.resultados'), pattern: /RESULTADOS ESPERADOS:/ },
      { key: 'tipo', label: t('projects:monitoring.summaryLabels.tipo'), pattern: /TIPO DE PROYECTO:/ }
    ];

    const matches: { key: string; label?: string; index: number; length: number }[] = [];

    const fifMatch = /\[FIF:\s*(SI|NO|SÍ)\]/i.exec(summaryText);
    let fifVal = '';
    if (fifMatch) {
      fifVal = fifMatch[1].toUpperCase() === 'SI' || fifMatch[1].toUpperCase() === 'SÍ' ? 'Sí' : 'No';
    }

    headers.forEach(h => {
      if (h.key === 'fif') return;
      const match = h.pattern.exec(summaryText);
      if (match?.index !== undefined) {
        matches.push({ key: h.key, label: h.label, index: match.index, length: match[0].length });
      }
    });

    matches.sort((a, b) => a.index - b.index);

    const sections: { label: string; content: string }[] = [];

    if (matches.length === 0) {
      sections.push({ label: t('projects:monitoring.summaryLabels.resumen'), content: summaryText });
    } else {
      for (let i = 0; i < matches.length; i++) {
        const current = matches[i];
        const next = matches[i + 1];
        const start = current.index + current.length;
        const end = next ? next.index : summaryText.length;
        const content = summaryText.substring(start, end).trim();
        if (content) {
          sections.push({ label: current.label!, content });
        }
      }
    }

    return { fifVal, sections };
  }, [project?.summary, t]);

  useEffect(() => {
    let mounted = true;


    async function loadProject() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await projectService.getById(id);

        if (mounted) {
          setProject(response);
        }

        try {
          const reports = await progressReportService.getByProject(Number(id));
          if (mounted) {
            setProgressReports(reports);
          }
        } catch (err) {
          console.warn('Error al cargar informes de avance:', err);
        }
      } catch (err) {
        console.error('Error al cargar el proyecto:', err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : t('projects:monitoring.errorLoading')
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      mounted = false;
    };
  }, [id]);

  const [responsibleName, setResponsibleName] = useState<string>(t('projects:monitoring.loadingDefault'));
  const [documentName, setDocumentName] = useState<string>(t('projects:monitoring.loadingDefault'));

  useEffect(() => {
    if (!project) return;

    if (project.responsibleId) {
      userService.getById(project.responsibleId)
        .then(u => setResponsibleName(`${u.firstNames} ${u.lastNames}`))
        .catch(() => setResponsibleName(`${t('projects:monitoring.userNumber', { id: project.responsibleId })}`));
    } else {
      setResponsibleName(t('projects:monitoring.notRegistered'));
    }

    if (project.documentId) {
      documentService.list()
        .then(docs => {
          const doc = docs.find(d => d.id === project.documentId);
          if (doc) {
            setDocumentName(doc.fileName);
          } else {
            setDocumentName(`${t('projects:monitoring.documentNumber', { id: project.documentId })}`);
          }
        })
        .catch(() => setDocumentName(`${t('projects:monitoring.documentNumber', { id: project.documentId })}`));
    } else {
      setDocumentName(t('projects:monitoring.notRegistered'));
    }
  }, [project?.responsibleId, project?.documentId]);

  const renderActionButton = (r: any, period: any) => {
    if (r) {
      if (r.status === 'OBSERVADO' && currentRole === 'DOCENTE_INVESTIGADOR') {
        return (
          <Button
            variant="primary"
            onClick={() => navigate(`/progressreports/amend/${r.id}`)}
          >
            {t('projects:monitoring.actionSubsanar')}
          </Button>
        );
      }
      return (
        <Button
          variant="secondary"
          onClick={() => {
            if (r.attachedDocumentId) {
              documentService.downloadFile(r.attachedDocumentId, r.fileName);
            }
          }}
        >
          {t('projects:monitoring.actionView')}
        </Button>
      );
    }

    if (currentRole === 'DOCENTE_INVESTIGADOR') {
      return (
        <Button
          variant="primary"
          onClick={() => navigate(`/progressreports/new?projectId=${id}&period=${period.name}`)}
        >
          {t('projects:monitoring.actionUpload')}
        </Button>
      );
    }

    return (
      <Button variant="secondary" disabled>
        Ver
      </Button>
    );
  };

  async function handleMoveToExecution() {
    if (!id) return;

    try {
      setUpdatingStatus(true);
      const updatedProject = await projectService.updateStatus(id, 'IN_PROGRESS');
      setProject(updatedProject);
      toast.success(t('projects:monitoring.statusUpdated'));
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      toast.error(t('projects:monitoring.statusUpdateError'));
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '32px', color: 'var(--on-surface-variant)' }}>
        {t('projects:monitoring.loading')}
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
          <ArrowLeft size={16} /> {t('projects:monitoring.backToProjects')}
        </Link>

        <Alert title={t('projects:monitoring.couldNotLoad')}>
          {t('projects:monitoring.backendResponse', { error, id })}
        </Alert>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '32px', color: 'var(--on-surface-variant)' }}>
        {t('projects:monitoring.notFound')}
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px 64px', maxWidth: '1440px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
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
        <ArrowLeft size={16} /> {t('projects:monitoring.backToProjects')}
      </Link>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <div style={{ flex: '1', minWidth: '280px' }}>
          <Badge variant="info">{project.code || `PRY-${project.id}`}</Badge>

          <h1
            className="text-headline-lg"
            style={{
              marginTop: '12px',
              marginBottom: '8px',
              color: 'var(--primary)',
              fontWeight: 800,
            }}
          >
            {project.title || t('projects:monitoring.untitledProject')}
          </h1>
        </div>

        <Button
          variant="secondary"
          icon={<RefreshCcw size={16} />}
          onClick={handleMoveToExecution}
          disabled={updatingStatus}
          style={{ height: 'fit-content' }}
        >
          {updatingStatus ? t('projects:monitoring.updatingStatus') : t('projects:monitoring.moveToExecution')}
        </Button>
      </div>

      <Card style={{ marginBottom: '32px', border: '1px solid var(--outline-variant)' }}>
        <CardHeader style={{ borderBottom: '1px solid var(--outline-variant)', padding: '18px 24px' }}>
          <h3 className="text-title-lg" style={{ margin: 0, fontWeight: 700 }}>{t('projects:monitoring.summaryTitle')}</h3>
        </CardHeader>
        <CardContent style={{ padding: '24px' }}>
          {parsedSummary ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {parsedSummary.fifVal && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Badge variant={parsedSummary.fifVal === 'Sí' ? 'success' : 'error'}>
                    Apoyo de Financiamiento FIF: {parsedSummary.fifVal}
                  </Badge>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {parsedSummary.sections.map(s => (
                  <div key={s.label} style={{ backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 0, marginBottom: '10px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '6px' }}>
                      {s.label}
                    </h4>
                    <p style={{ fontSize: '13.5px', color: 'var(--on-surface-variant)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                      {s.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', margin: 0 }}>
              {t('projects:monitoring.noSummary')}
            </p>
          )}
        </CardContent>
      </Card>

      <Card style={{ marginBottom: '24px', border: '1px solid var(--outline-variant)' }}>
        <CardContent style={{ padding: '24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
            }}
          >
            <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '16px', borderRadius: '12px', border: '1px solid var(--outline-variant)' }}>
              <div
                className="text-caption"
                style={{
                  color: 'var(--on-surface-variant)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                Estado
              </div>
              <Badge variant="neutral">{getStatusLabel(project.status, t)}</Badge>
            </div>

            <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '16px', borderRadius: '12px', border: '1px solid var(--outline-variant)' }}>
              <div
                className="text-caption"
                style={{
                  color: 'var(--on-surface-variant)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                Línea de investigación
              </div>
              <div className="text-body-md" style={{ fontWeight: 600 }}>
                {project.researchLineName || t('projects:monitoring.noResearchLine')}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '16px', borderRadius: '12px', border: '1px solid var(--outline-variant)' }}>
              <div
                className="text-caption"
                style={{
                  color: 'var(--on-surface-variant)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                Grupo
              </div>
              <div className="text-body-md" style={{ fontWeight: 600 }}>
                {project.researchGroupCode || t('projects:monitoring.noGroupRegistered')}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '16px', borderRadius: '12px', border: '1px solid var(--outline-variant)' }}>
              <div
                className="text-caption"
                style={{
                  color: 'var(--on-surface-variant)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                Presupuesto
              </div>
              <div className="text-body-md" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                {formatMoney(project.budget)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div
        className="responsive-grid-split"
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '32px',
        }}
      >
        <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          <Card>
            <CardHeader>
              <h3 className="text-title-lg">{t('projects:monitoring.progressTitle')}</h3>
            </CardHeader>

            <CardContent>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span className="text-label-md">
                  {t('projects:monitoring.currentStatus', { status: getStatusLabel(project.status, t) })}
                </span>
                <span className="text-label-md">{progress}%</span>
              </div>

              <div
                style={{
                  height: '10px',
                  backgroundColor: 'var(--surface-container-high)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: 'var(--primary)',
                  }}
                />
              </div>

              <div
                className="responsive-grid-5"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                  gap: '12px',
                  marginTop: '24px',
                }}
              >
                {[
                  [t('projects:monitoring.steps.postulation'), 'POSTULATED'],
                  [t('projects:monitoring.steps.observation'), 'OBSERVED'],
                  [t('projects:monitoring.steps.approval'), 'APPROVED'],
                  [t('projects:monitoring.steps.execution'), 'IN_PROGRESS'],
                  [t('projects:monitoring.steps.closure'), 'COMPLETED'],
                ].map(([label, status]) => (
                  <div
                    key={status}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      border: '1px solid var(--outline-variant)',
                      backgroundColor: 'var(--surface-container-lowest)',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                      {label}
                    </div>
                    <div
                      style={{
                        color: 'var(--on-surface-variant)',
                        fontSize: '12px',
                      }}
                    >
                      {t('projects:monitoring.referentialStatus')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-title-lg">{t('projects:monitoring.generalObjective')}</h3>
            </CardHeader>

            <CardContent>
              <p
                className="text-body-md"
                style={{
                  color: 'var(--on-surface-variant)',
                  lineHeight: 1.7,
                }}
              >
                {project.generalObjective || t('projects:monitoring.noObjective')}
              </p>
            </CardContent>
          </Card>

          <Card style={{ marginTop: '24px' }}>
            <CardHeader>
              <h3 className="text-title-lg">{t('projects:monitoring.reportsTitle')}</h3>
            </CardHeader>
            <CardContent>
              <TableContainer>
                <TableHead>
                  <TableRow>
                    <TableHeader>{t('projects:monitoring.reportsTable.period')}</TableHeader>
                    <TableHeader>{t('projects:monitoring.reportsTable.deadline')}</TableHeader>
                    <TableHeader>{t('projects:monitoring.reportsTable.uploadedDocument')}</TableHeader>
                    <TableHeader>{t('projects:monitoring.reportsTable.status')}</TableHeader>
                    <TableHeader>{t('projects:monitoring.reportsTable.observations')}</TableHeader>
                    <TableHeader style={{ textAlign: 'right' }}>{t('projects:monitoring.reportsTable.action')}</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { name: 'Trimestre 1', deadline: '30/09/2026' },
                    { name: 'Trimestre 2', deadline: '31/12/2026' },
                    { name: 'Trimestre 3', deadline: '31/03/2027' },
                    { name: 'Informe Final', deadline: '30/06/2027' },
                  ].map(period => {
                    const r = progressReports.find(x => x.period === period.name);
                    const getReportBadgeVariant = (status: string): 'success' | 'warning' | 'info' | 'neutral' | 'error' => {
                      const norm = String(status || '').toUpperCase();
                      if (['APROBADO', 'APPROVED'].includes(norm)) return 'success';
                      if (['OBSERVADO', 'OBSERVED'].includes(norm)) return 'warning';
                      if (['RECHAZADO', 'REJECTED'].includes(norm)) return 'error';
                      if (['EN_REVISION', 'PENDIENTE', 'UNDER_REVIEW'].includes(norm)) return 'info';
                      return 'neutral';
                    };
                    return (
                      <TableRow key={period.name}>
                        <TableCell>{period.name}</TableCell>
                        <TableCell>{period.deadline}</TableCell>
                        <TableCell>
                          {r?.attachedDocumentId ? (
                            <button
                              type="button"
                              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600, fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left' }}
                              onClick={() => documentService.downloadFile(r.attachedDocumentId, r.fileName)}
                            >
                              {r.fileName || `informe_${period.name.replace(' ', '_').toLowerCase()}.pdf`}
                            </button>
                          ) : (
                            <span>—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {r ? (
                            <Badge variant={getReportBadgeVariant(r.status)}>
                              {getStatusLabel(r.status, t)}
                            </Badge>
                          ) : (
                            <Badge variant="neutral">{t('projects:statuses.programado')}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {r?.comments?.[0]?.content || r?.observations || (r ? t('projects:monitoring.sentForReview') : '—')}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {renderActionButton(r, period)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </TableContainer>
              <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }}></span>
                <strong>{t('projects:monitoring.institutionalRule')}</strong> {t('projects:monitoring.institutionalRuleText')}
              </div>
            </CardContent>
          </Card>

          <Card style={{ marginTop: '24px' }}>
            <CardHeader style={{ borderBottom: '1px solid var(--outline-variant)', padding: '18px 24px' }}>
              <h3 className="text-title-lg" style={{ margin: 0, fontWeight: 700 }}>{t('projects:monitoring.documentsTitle')}</h3>
            </CardHeader>
            <CardContent style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>

                {/* Historial Documental */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
                    {t('projects:monitoring.documentHistory')}
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Document 1: Initial Proposal */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--surface-container-lowest)',
                      border: '1px solid var(--outline-variant)',
                      transition: 'all 0.2s',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ef4444',
                          flexShrink: 0
                        }}>
                          <FileText size={20} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {project.documentId ? documentName : 'Proyecto_inicial.pdf'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{t('projects:monitoring.investigator')}</span>
                            <span style={{ color: 'var(--outline-variant)' }}>•</span>
                            <span>{formatDate(project.startDate)}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (project.documentId) {
                            documentService.downloadFile(project.documentId, documentName);
                          } else {
                            toast.showError(t('projects:monitoring.noInitialFile'));
                          }
                        }}
                        style={{ padding: '6px 12px', fontSize: '12.5px', borderRadius: '8px', flexShrink: 0 }}
                      >
                        Descargar
                      </Button>
                    </div>

                    {/* Document 2: Resolution (conditional) */}
                    {['APPROVED', 'EN_EJECUCION', 'EN_EJECUCIÓN', 'FINALIZADO', 'COMPLETED'].includes(String(project.status).toUpperCase()) && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--surface-container-lowest)',
                        border: '1px solid var(--outline-variant)',
                        transition: 'all 0.2s',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(59, 130, 246, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#3b82f6',
                            flexShrink: 0
                          }}>
                            <FileText size={20} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              Resolución_R.D._045.pdf
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{t('projects:monitoring.deanOffice')}</span>
                              <span style={{ color: 'var(--outline-variant)' }}>•</span>
                              <span>{formatDate(project.startDate)}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            toast.showSuccess(t('projects:monitoring.downloadingResolution'));
                            documentService.downloadFile(project.documentId || 1, 'Resolución_R.D._045.pdf');
                          }}
                          style={{ padding: '6px 12px', fontSize: '12.5px', borderRadius: '8px', flexShrink: 0 }}
                        >
                          Descargar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trazabilidad lineal */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
                    {t('projects:monitoring.signatureTracking')}
                  </h4>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    paddingLeft: '24px',
                    marginLeft: '12px',
                    borderLeft: '2px dashed var(--outline-variant)',
                  }}>
                    {/* Paso 1 */}
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '-31px',
                        top: '2px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                        border: '3px solid var(--surface)',
                        boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.2)'
                      }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--on-surface)' }}>
                          {t('projects:monitoring.traceSteps.proposalSent')}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                          08/06/2026 10:25 — Docente Investigador
                        </span>
                      </div>
                    </div>

                    {/* Paso 2 */}
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '-31px',
                        top: '2px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                        border: '3px solid var(--surface)',
                        boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.2)'
                      }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--on-surface)' }}>
                          {t('projects:monitoring.traceSteps.approvedByCoordinator')}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                          09/06/2026 15:40 — Coordinador de Grupo
                        </span>
                      </div>
                    </div>

                    {/* Paso 3 */}
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '-31px',
                        top: '2px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                        border: '3px solid var(--surface)',
                        boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.2)'
                      }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--on-surface)' }}>
                          {t('projects:monitoring.traceSteps.approvedByDirection')}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                          12/06/2026 11:10 — Director de Investigación
                        </span>
                      </div>
                    </div>

                    {/* Paso 4 */}
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '-31px',
                        top: '2px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        border: '3px solid var(--surface)',
                        boxShadow: '0 0 0 2px rgba(26, 54, 93, 0.2)'
                      }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
                          {t('projects:monitoring.traceSteps.resolutionIssued')}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                          20/06/2026 09:30 — Decanato (Firma RD-045)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <CardHeader>
              <h3 className="text-title-lg">{t('projects:monitoring.adminDetails')}</h3>
            </CardHeader>

            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <CalendarDays size={20} color="var(--primary)" />
                  <div>
                    <strong>{t('projects:monitoring.dates')}</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <ClipboardCheck size={20} color="var(--primary)" />
                  <div>
                    <strong>{t('projects:monitoring.duration')}</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      {getDurationLabel(project.startDate, project.endDate, t)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <MapPin size={20} color="var(--primary)" />
                  <div>
                    <strong>{t('projects:monitoring.executionPlace')}</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      {project.executionPlace || t('projects:monitoring.notRegistered')}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <DollarSign size={20} color="var(--primary)" />
                  <div>
                    <strong>Presupuesto</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      {formatMoney(project.budget)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Users size={20} color="var(--primary)" />
                  <div>
                    <strong>{t('projects:monitoring.responsible')}</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      {responsibleName}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <FileText size={20} color="var(--primary)" />
                  <div>
                    <strong>{t('projects:monitoring.associatedDocument')}</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      {project.documentId ? (
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600, fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left' }}
                          onClick={() => documentService.downloadFile(project.documentId!, documentName)}
                        >
                          {documentName}
                        </button>
                      ) : (
                        t('projects:monitoring.notRegistered')
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <HelpCircle size={24} />
              <h3 className="text-title-lg">{t('projects:monitoring.needHelp')}</h3>
            </div>

            <p
              className="text-body-md"
              style={{ marginBottom: '24px', opacity: 0.9 }}
            >
              {t('projects:monitoring.helpText')}
            </p>

            <Link
              to="/progressreports/review"
              style={{
                color: 'white',
                textDecoration: 'underline',
                fontWeight: 600,
              }}
            >
              {t('projects:monitoring.goToReportReview')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectMonitoring;