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

import { projectService } from '../../services/projectService';
import type { Project } from '../../services/projectService';
import { useToast } from '../../context/ToastContext';
import { documentService } from '../../services/documentService';
import { AuthContext } from '../../context/AuthContext';
import { progressReportService } from '../../services/progressReportService';
import { userService } from '../../services/userService';

function getStatusLabel(status?: string): string {
  if (!status) return 'Sin estado';

  const dictionary: Record<string, string> = {
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

  return dictionary[status.toUpperCase()] ?? status;
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

function getDurationLabel(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return 'No registrada';

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'No registrada';
  }

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (months <= 0) return 'Menos de 1 mes';

  return `${months} mes${months === 1 ? '' : 'es'}`;
}

export const ProjectMonitoring: React.FC = () => {
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
      { key: 'resumen', label: 'Resumen', pattern: /RESUMEN:/ },
      { key: 'objetivos', label: 'Objetivos específicos', pattern: /OBJETIVOS ESPECÍFICOS:/ },
      { key: 'metodologia', label: 'Metodología', pattern: /METODOLOGÍA:/ },
      { key: 'resultados', label: 'Resultados esperados', pattern: /RESULTADOS ESPERADOS:/ },
      { key: 'tipo', label: 'Tipo de proyecto', pattern: /TIPO DE PROYECTO:/ }
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
      sections.push({ label: 'Resumen', content: summaryText });
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
  }, [project?.summary]);

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
              : 'No se pudo cargar el detalle del proyecto.'
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

  const [responsibleName, setResponsibleName] = useState<string>('Cargando...');
  const [documentName, setDocumentName] = useState<string>('Cargando...');

  useEffect(() => {
    if (!project) return;

    if (project.responsibleId) {
      userService.getById(project.responsibleId)
        .then(u => setResponsibleName(`${u.firstNames} ${u.lastNames}`))
        .catch(() => setResponsibleName(`Usuario #${project.responsibleId}`));
    } else {
      setResponsibleName('No registrado');
    }

    if (project.documentId) {
      documentService.list()
        .then(docs => {
          const doc = docs.find(d => d.id === project.documentId);
          if (doc) {
            setDocumentName(doc.fileName);
          } else {
            setDocumentName(`Documento #${project.documentId}`);
          }
        })
        .catch(() => setDocumentName(`Documento #${project.documentId}`));
    } else {
      setDocumentName('No registrado');
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
            Subsanar
          </Button>
        );
      }
      return (
        <Button 
          variant="secondary"
          onClick={() => {
            if (r.attachedDocumentId) {
              window.open(documentService.download(r.attachedDocumentId), '_blank');
            }
          }}
        >
          Ver
        </Button>
      );
    }

    if (currentRole === 'DOCENTE_INVESTIGADOR') {
      return (
        <Button 
          variant="primary"
          onClick={() => navigate(`/progressreports/new?projectId=${id}&period=${period.name}`)}
        >
          Subir
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
      toast.success('Estado actualizado correctamente.');
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      toast.error('No se pudo actualizar el estado del proyecto.');
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '32px', color: 'var(--on-surface-variant)' }}>
        Cargando detalle del proyecto...
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
          <ArrowLeft size={16} /> Volver a proyectos
        </Link>

        <Alert title="No se pudo cargar el proyecto">
          El backend respondió: {error}. Verifica el endpoint GET /api/v1/projects/{id}.
        </Alert>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '32px', color: 'var(--on-surface-variant)' }}>
        Proyecto no encontrado.
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
        <ArrowLeft size={16} /> Volver a proyectos
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
            {project.title || 'Proyecto sin título'}
          </h1>
        </div>

        <Button
          variant="secondary"
          icon={<RefreshCcw size={16} />}
          onClick={handleMoveToExecution}
          disabled={updatingStatus}
          style={{ height: 'fit-content' }}
        >
          {updatingStatus ? 'Actualizando...' : 'Pasar a ejecución'}
        </Button>
      </div>

      <Card style={{ marginBottom: '32px', border: '1px solid var(--outline-variant)' }}>
        <CardHeader style={{ borderBottom: '1px solid var(--outline-variant)', padding: '18px 24px' }}>
          <h3 className="text-title-lg" style={{ margin: 0, fontWeight: 700 }}>Resumen y Detalles de la Propuesta</h3>
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
              Este proyecto no tiene resumen registrado.
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
              <Badge variant="neutral">{getStatusLabel(project.status)}</Badge>
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
                {project.researchLineName || 'Sin línea registrada'}
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
                {project.researchGroupCode || 'Sin grupo registrado'}
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
              <h3 className="text-title-lg">Progreso general del proyecto</h3>
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
                  Estado actual: {getStatusLabel(project.status)}
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
                  ['Postulación', 'POSTULATED'],
                  ['Observación', 'OBSERVED'],
                  ['Aprobación', 'APPROVED'],
                  ['Ejecución', 'IN_PROGRESS'],
                  ['Cierre', 'COMPLETED'],
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
                      Estado referencial
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-title-lg">Objetivo general</h3>
            </CardHeader>

            <CardContent>
              <p
                className="text-body-md"
                style={{
                  color: 'var(--on-surface-variant)',
                  lineHeight: 1.7,
                }}
              >
                {project.generalObjective || 'No se registró el objetivo general del proyecto.'}
              </p>
            </CardContent>
          </Card>

          <Card style={{ marginTop: '24px' }}>
            <CardHeader>
              <h3 className="text-title-lg">Informes Trimestrales y Final de Ejecución</h3>
            </CardHeader>
            <CardContent>
              <TableContainer>
                <TableHead>
                  <TableRow>
                    <TableHeader>Periodo</TableHeader>
                    <TableHeader>Fecha Límite</TableHeader>
                    <TableHeader>Documento Subido</TableHeader>
                    <TableHeader>Estado</TableHeader>
                    <TableHeader>Observaciones</TableHeader>
                    <TableHeader style={{ textAlign: 'right' }}>Acción</TableHeader>
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
                              onClick={() => window.open(documentService.download(r.attachedDocumentId), '_blank')}
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
                              {getStatusLabel(r.status)}
                            </Badge>
                          ) : (
                            <Badge variant="neutral">Programado</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {r?.comments?.[0]?.content || r?.observations || (r ? 'Enviado para revisión' : '—')}
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
                <strong>Regla institucional:</strong> La omisión de informes trimestrales suspende el financiamiento FIF de forma automática.
              </div>
            </CardContent>
          </Card>

          <Card style={{ marginTop: '24px' }}>
            <CardHeader>
              <h3 className="text-title-lg">Documentos del Expediente y Trazabilidad</h3>
            </CardHeader>
            <CardContent>
              <div className="section-grid-asymmetric" style={{ gap: '24px' }}>
                
                {/* Lista de Documentos */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Historial Documental</h4>
                  <TableContainer>
                    <TableHead>
                      <TableRow>
                        <TableHeader>Archivo</TableHeader>
                        <TableHeader>Subido por</TableHeader>
                        <TableHeader>Fecha</TableHeader>
                        <TableHeader style={{ textAlign: 'right' }}>Descarga</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>{project.documentId ? documentName : 'Proyecto_inicial.pdf'}</strong></TableCell>
                        <TableCell>Investigador</TableCell>
                        <TableCell>{formatDate(project.startDate)}</TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          <Button 
                            variant="secondary"
                            onClick={() => {
                              if (project.documentId) {
                                window.open(documentService.download(project.documentId), '_blank');
                              } else {
                                toast.showError("No hay archivo registrado para la propuesta inicial.");
                              }
                            }}
                          >
                            Descargar
                          </Button>
                        </TableCell>
                      </TableRow>
                      {['APPROVED', 'EN_EJECUCION', 'EN_EJECUCIÓN', 'FINALIZADO', 'COMPLETED'].includes(String(project.status).toUpperCase()) && (
                        <TableRow>
                          <TableCell><strong>Resolución_R.D._045.pdf</strong></TableCell>
                          <TableCell>Decanato</TableCell>
                          <TableCell>{formatDate(project.startDate)}</TableCell>
                          <TableCell style={{ textAlign: 'right' }}>
                            <Button 
                              variant="secondary"
                              onClick={() => {
                                toast.showSuccess("Descargando resolución del proyecto...");
                                window.open(documentService.download(project.documentId || 1), '_blank');
                              }}
                            >
                              Descargar
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </TableContainer>
                </div>

                {/* Trazabilidad lineal */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Trazabilidad de Firmas y Cambios</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid var(--outline-variant)', paddingLeft: '16px', marginLeft: '6px', overflowX: 'hidden' }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-22px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                      <strong style={{ fontSize: '13px' }}>Postulación Enviada</strong>
                      <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>08/06/2026 10:25 - Docente Investigador</div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-22px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                      <strong style={{ fontSize: '13px' }}>Aprobado por Coordinador</strong>
                      <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>09/06/2026 15:40 - Coordinador de Grupo</div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-22px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                      <strong style={{ fontSize: '13px' }}>Aprobado por Dirección</strong>
                      <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>12/06/2026 11:10 - Director de Investigación</div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-22px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
                      <strong style={{ fontSize: '13px' }}>Resolución Emitida</strong>
                      <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>20/06/2026 09:30 - Decanato (Firma RD-045)</div>
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
              <h3 className="text-title-lg">Detalles administrativos</h3>
            </CardHeader>

            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <CalendarDays size={20} color="var(--primary)" />
                  <div>
                    <strong>Fechas</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <ClipboardCheck size={20} color="var(--primary)" />
                  <div>
                    <strong>Duración</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      {getDurationLabel(project.startDate, project.endDate)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <MapPin size={20} color="var(--primary)" />
                  <div>
                    <strong>Lugar de ejecución</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      {project.executionPlace || 'No registrado'}
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
                    <strong>Responsable</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      {responsibleName}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <FileText size={20} color="var(--primary)" />
                  <div>
                    <strong>Documento asociado</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      {project.documentId ? (
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600, fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left' }}
                          onClick={() => window.open(documentService.download(project.documentId!), '_blank')}
                        >
                          {documentName}
                        </button>
                      ) : (
                        'No registrado'
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
              <h3 className="text-title-lg">¿Necesitas ayuda?</h3>
            </div>

            <p
              className="text-body-md"
              style={{ marginBottom: '24px', opacity: 0.9 }}
            >
              Si tienes problemas con la revisión, trazabilidad o documentación del proyecto,
              contacta a la oficina de investigación.
            </p>

            <Link
              to="/progressreports/review"
              style={{
                color: 'white',
                textDecoration: 'underline',
                fontWeight: 600,
              }}
            >
              Ir a revisión de informes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectMonitoring;