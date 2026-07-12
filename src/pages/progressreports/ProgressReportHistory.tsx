/**
 * ProgressReportHistory.tsx
 * Historial Cronológico de Informes de Avance.
 * Roles: DOCENTE_INVESTIGADOR (solo sus proyectos), DIRECTOR_INVESTIGACION (todos).
 * Muestra línea de tiempo con barras de progreso físico y financiero.
 */
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  FileText, ChevronDown, ChevronUp, Calendar, User,
  BarChart2, TrendingUp, AlertTriangle, RefreshCcw,
  CheckCircle, Clock, Eye, X, Paperclip, MessageSquare,
  History, Activity,
} from 'lucide-react';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/common/Spinner';
import { AuthContext } from '../../context/AuthContext';
import {
  progressReportService,
  type ProgressReport,
  type ProgressReportDetail,
  type ProgressReportStatus,
  type ProjectSummary,
} from '../../services/progressReportService';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(v?: string): string {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

function getStatusColor(status: ProgressReportStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case 'APROBADO': return { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' };
    case 'OBSERVADO': return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
    case 'RECHAZADO': return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
    case 'EN_REVISION': return { bg: 'var(--primary-fixed)', text: 'var(--on-primary-fixed)', border: 'var(--primary-container)' };
    default: return { bg: 'var(--surface-container-high)', text: 'var(--on-surface-variant)', border: 'var(--outline-variant)' };
  }
}

function getStatusLabel(status: ProgressReportStatus): string {
  const map: Record<ProgressReportStatus, string> = {
    PENDIENTE: 'Pendiente', EN_REVISION: 'En revisión',
    OBSERVADO: 'Observado', APROBADO: 'Aprobado', RECHAZADO: 'Rechazado',
  };
  return map[status] ?? status;
}

function getStatusBadgeVariant(status: ProgressReportStatus): 'success' | 'warning' | 'info' | 'neutral' | 'error' {
  if (status === 'APROBADO') return 'success';
  if (status === 'OBSERVADO') return 'warning';
  if (status === 'RECHAZADO') return 'error';
  if (status === 'EN_REVISION') return 'info';
  return 'neutral';
}

function getProgressColor(pct: number): string {
  if (pct >= 75) return '#059669';
  if (pct >= 50) return '#d97706';
  if (pct >= 25) return '#ea580c';
  return '#dc2626';
}

// ── Componente: Barra de progreso ─────────────────────────────────────────────

interface ProgressBarProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, icon }) => {
  const pct = Math.min(100, Math.max(0, value));
  const color = getProgressColor(pct);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {icon} {label}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 800, color }}>{pct}%</span>
      </div>
      <div style={{ height: '8px', backgroundColor: 'var(--surface-container-high)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: 'var(--radius-full)', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      </div>
    </div>
  );
};

// ── Panel de detalle del informe ──────────────────────────────────────────────

interface DetailPanelProps {
  report: ProgressReport;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ report, onClose }) => {
  const [detail, setDetail] = useState<ProgressReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'activities' | 'evidences' | 'comments' | 'history'>('activities');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    progressReportService.getDetail(report.id)
      .then(d => { if (!cancelled) setDetail(d); })
      .catch(() => { if (!cancelled) setDetail(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [report.id]);

  const statusStyle = getStatusColor(report.status);

  const sections = [
    { id: 'activities' as const, label: 'Actividades', icon: <Activity size={15} />, count: detail?.executedActivities.length },
    { id: 'evidences' as const, label: 'Evidencias', icon: <Eye size={15} />, count: detail?.evidences.length },
    { id: 'comments' as const, label: 'Comentarios', icon: <MessageSquare size={15} />, count: detail?.comments.length },
    { id: 'history' as const, label: 'Historial de Cambios', icon: <History size={15} />, count: detail?.changeHistory.length },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 0 }} onClick={onClose}>
      <div
        style={{ backgroundColor: 'var(--surface-container-lowest)', width: '100%', maxWidth: '600px', height: '100dvh', overflowY: 'auto', boxShadow: '-8px 0 40px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid var(--outline-variant)', position: 'sticky', top: 0, backgroundColor: 'var(--surface-container-lowest)', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Informe #{report.reportNumber}
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>
                Detalle del Informe de Avance
              </h2>
            </div>
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: '4px' }}>
              <X size={22} />
            </button>
          </div>

          {/* Info general */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} /> {formatDate(report.reportDate)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={13} /> {report.responsibleName}
            </span>
            <Badge variant={getStatusBadgeVariant(report.status)}>{getStatusLabel(report.status)}</Badge>
          </div>

          {/* Progreso */}
          <div className="form-row" style={{ marginTop: '16px', gap: '12px' }}>
            <ProgressBar label="Avance Físico" value={report.physicalProgress} icon={<Activity size={12} />} />
            <ProgressBar label="Avance Financiero" value={report.financialProgress} icon={<BarChart2 size={12} />} />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Spinner size="large" /></div>
        ) : detail ? (
          <div style={{ padding: '24px 28px' }}>
            {/* Observaciones */}
            {report.observations && (
              <div style={{ backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={13} /> Observaciones
                </div>
                <p style={{ fontSize: '14px', color: 'var(--on-surface)', lineHeight: 1.6, margin: 0 }}>{report.observations}</p>
              </div>
            )}

            {/* Tabs de secciones */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--outline-variant)', marginBottom: '20px', overflowX: 'auto' }}>
              {sections.map(s => (
                <button
                  key={s.id}
                  id={`detail-section-${s.id}`}
                  type="button"
                  onClick={() => setActiveSection(s.id)}
                  style={{ background: 'none', border: 'none', padding: '10px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', color: activeSection === s.id ? 'var(--primary)' : 'var(--on-surface-variant)', borderBottom: `2px solid ${activeSection === s.id ? 'var(--primary)' : 'transparent'}`, marginBottom: '-1px', transition: 'all 0.2s' }}
                >
                  {s.icon} {s.label}
                  {s.count !== undefined && (
                    <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '10px', backgroundColor: activeSection === s.id ? 'var(--primary-container)' : 'var(--surface-container)', color: activeSection === s.id ? 'var(--on-primary-container)' : 'var(--on-surface-variant)', fontWeight: 700 }}>
                      {s.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Actividades */}
            {activeSection === 'activities' && (
              <div>
                {detail.executedActivities.length === 0 ? (
                  <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', textAlign: 'center', padding: '32px' }}>Sin actividades registradas.</p>
                ) : detail.executedActivities.map(a => (
                  <div key={a.id} style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', marginBottom: '10px', backgroundColor: 'var(--surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--on-surface)', margin: 0, flex: 1 }}>{a.description}</p>
                      <span style={{ marginLeft: '12px', fontSize: '11px', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: a.completed ? '#d1fae5' : 'var(--surface-container-high)', color: a.completed ? '#065f46' : 'var(--on-surface-variant)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {a.completed ? '✓ Completada' : 'En curso'}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', margin: 0 }}>
                      {formatDate(a.startDate)} → {formatDate(a.endDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Evidencias */}
            {activeSection === 'evidences' && (
              <div>
                {detail.evidences.length === 0 ? (
                  <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', textAlign: 'center', padding: '32px' }}>Sin evidencias registradas.</p>
                ) : detail.evidences.map(e => (
                  <div key={e.id} style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', marginBottom: '10px', backgroundColor: 'var(--surface)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Eye size={16} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--on-surface)', margin: '0 0 4px' }}>{e.title}</p>
                      {e.description && <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: 0 }}>{e.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comentarios */}
            {activeSection === 'comments' && (
              <div>
                {detail.comments.length === 0 ? (
                  <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', textAlign: 'center', padding: '32px' }}>Sin comentarios.</p>
                ) : detail.comments.map(c => (
                  <div key={c.id} style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', marginBottom: '10px', backgroundColor: 'var(--surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--on-surface)' }}>{c.authorName}</span>
                        <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginLeft: '8px' }}>{c.authorRole}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{formatDate(c.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--on-surface)', margin: 0, lineHeight: 1.6 }}>{c.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Historial de cambios */}
            {activeSection === 'history' && (
              <div>
                {detail.changeHistory.length === 0 ? (
                  <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', textAlign: 'center', padding: '32px' }}>Sin historial de cambios.</p>
                ) : detail.changeHistory.map(h => (
                  <div key={h.id} style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', marginBottom: '10px', backgroundColor: 'var(--surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{h.field}</span>
                      <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{formatDate(h.changedAt)} · {h.changedBy}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: '#fee2e2', color: '#991b1b' }}>{h.oldValue || '—'}</span>
                      <span style={{ color: 'var(--on-surface-variant)' }}>→</span>
                      <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: '#d1fae5', color: '#065f46' }}>{h.newValue || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Archivos adjuntos */}
            {detail.attachments.length > 0 && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--outline-variant)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Paperclip size={14} /> Archivos Adjuntos ({detail.attachments.length})
                </h4>
                {detail.attachments.map(a => (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', marginBottom: '8px', textDecoration: 'none', backgroundColor: 'var(--surface-container-lowest)', transition: 'background-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--primary-fixed)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--surface-container-lowest)')}
                  >
                    <Paperclip size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', flex: 1 }}>{a.fileName}</span>
                    <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', fontFamily: 'monospace' }}>{a.fileType}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
            No se pudo cargar el detalle del informe.
          </div>
        )}
      </div>
    </div>
  );
};

// ── Nodo de la línea de tiempo ────────────────────────────────────────────────

interface TimelineNodeProps {
  report: ProgressReport;
  isLast: boolean;
  onViewDetail: (r: ProgressReport) => void;
}

const TimelineNode: React.FC<TimelineNodeProps> = ({ report, isLast, onViewDetail }) => {
  const [expanded, setExpanded] = useState(false);
  const statusStyle = getStatusColor(report.status);

  return (
    <div style={{ display: 'flex', gap: '0', position: 'relative' }}>
      {/* Línea vertical */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '48px', flexShrink: 0 }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: statusStyle.bg, border: `2px solid ${statusStyle.border}`, zIndex: 1, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {report.status === 'APROBADO' ? (
            <CheckCircle size={18} style={{ color: statusStyle.text }} />
          ) : report.status === 'PENDIENTE' ? (
            <Clock size={18} style={{ color: statusStyle.text }} />
          ) : (
            <FileText size={18} style={{ color: statusStyle.text }} />
          )}
        </div>
        {!isLast && (
          <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--outline-variant)', minHeight: '40px', marginTop: '4px' }} />
        )}
      </div>

      {/* Contenido del nodo */}
      <div style={{ flex: 1, marginLeft: '16px', paddingBottom: isLast ? '0' : '28px' }}>
        <div style={{ backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)', marginBottom: '4px' }}>
          {/* Cabecera */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--on-surface)' }}>
                  Informe #{report.reportNumber}
                </span>
                <Badge variant={getStatusBadgeVariant(report.status)}>{getStatusLabel(report.status)}</Badge>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--on-surface-variant)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} /> {formatDate(report.reportDate)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={13} /> {report.responsibleName}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                id={`btn-view-detail-report-${report.id}`}
                type="button"
                onClick={() => onViewDetail(report)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--primary)', transition: 'all 0.15s' }}
              >
                <Eye size={14} /> Ver detalle
              </button>
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                style={{ display: 'flex', alignItems: 'center', padding: '7px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface)', cursor: 'pointer', color: 'var(--on-surface-variant)' }}
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* Barras de progreso */}
          <div className="form-row" style={{ gap: '16px', marginBottom: expanded ? '16px' : '0' }}>
            <ProgressBar label="Avance Físico" value={report.physicalProgress} icon={<Activity size={12} />} />
            <ProgressBar label="Avance Financiero" value={report.financialProgress} icon={<BarChart2 size={12} />} />
          </div>

          {/* Observaciones expandidas */}
          {expanded && report.observations && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--outline-variant)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '6px' }}>
                Observaciones
              </div>
              <p style={{ fontSize: '14px', color: 'var(--on-surface)', lineHeight: 1.6, margin: 0 }}>
                {report.observations}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────

export const ProgressReportHistory: React.FC = () => {
  const { currentRole } = useContext(AuthContext);
  const isDirector = currentRole === 'DIRECTOR_INVESTIGACION';

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [reports, setReports] = useState<ProgressReport[]>([]);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [errorProjects, setErrorProjects] = useState<string | null>(null);
  const [errorReports, setErrorReports] = useState<string | null>(null);

  const [detailReport, setDetailReport] = useState<ProgressReport | null>(null);

  // Cargar proyectos según rol
  const fetchProjects = useCallback(async () => {
    try {
      setLoadingProjects(true);
      setErrorProjects(null);
      const data = await progressReportService.getProjectsByRole();
      setProjects(data);
      if (data.length === 1) setSelectedProjectId(data[0].id);
    } catch (err: unknown) {
      setErrorProjects(err instanceof Error ? err.message : 'Error al cargar proyectos');
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // Cargar informes cuando se selecciona un proyecto
  const fetchReports = useCallback(async () => {
    if (!selectedProjectId) return;
    try {
      setLoadingReports(true);
      setErrorReports(null);
      const data = await progressReportService.getByProject(selectedProjectId);
      setReports(data);
    } catch (err: unknown) {
      setErrorReports(err instanceof Error ? err.message : 'Error al cargar los informes');
    } finally {
      setLoadingReports(false);
    }
  }, [selectedProjectId]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Estadísticas de progreso general
  const stats = reports.length > 0 ? {
    latest: reports[reports.length - 1],
    avgPhysical: Math.round(reports.reduce((s, r) => s + r.physicalProgress, 0) / reports.length),
    avgFinancial: Math.round(reports.reduce((s, r) => s + r.financialProgress, 0) / reports.length),
    approved: reports.filter(r => r.status === 'APROBADO').length,
  } : null;

  return (
    <div className="animate-fade-in" style={{ padding: '28px' }}>
      {detailReport && (
        <DetailPanel report={detailReport} onClose={() => setDetailReport(null)} />
      )}

      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '6px' }}>
            Historial de Informes de Avance
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}>
            {isDirector
              ? 'Seguimiento cronológico del avance de todos los proyectos activos.'
              : 'Evolución cronológica de tus proyectos de investigación.'}
          </p>
        </div>
        <Button variant="secondary" onClick={fetchReports} icon={<RefreshCcw size={15} />} disabled={!selectedProjectId}>
          Actualizar
        </Button>
      </div>

      {/* Selector de proyecto */}
      {loadingProjects ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Spinner size="large" /></div>
      ) : errorProjects ? (
        <div style={{ padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <AlertTriangle size={16} style={{ display: 'inline', marginRight: '8px' }} />
          {errorProjects}
        </div>
      ) : (
        <>
          {projects.length > 1 && (
            <div style={{ backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '10px' }}>
                Seleccionar Proyecto
              </label>
              <select
                id="select-project-history"
                value={selectedProjectId ?? ''}
                onChange={e => { setSelectedProjectId(Number(e.target.value)); setReports([]); }}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline)', fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--outline)')}
              >
                <option value="">— Seleccione un proyecto —</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          {selectedProjectId && (
            <>
              {/* Encabezado del proyecto seleccionado */}
              {selectedProject && (
                <div style={{ backgroundColor: 'var(--primary-container)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--on-primary-container)', opacity: 0.8, marginBottom: '4px' }}>
                      Proyecto seleccionado
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--on-primary-container)' }}>
                      {selectedProject.title}
                    </div>
                  </div>
                  <Badge variant="info">{selectedProject.status}</Badge>
                </div>
              )}

              {/* Tarjetas de estadísticas */}
              {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                  {[
                    { label: 'Total de Informes', value: String(reports.length), icon: <FileText size={20} />, color: 'var(--primary)' },
                    { label: 'Informes Aprobados', value: String(stats.approved), icon: <CheckCircle size={20} />, color: '#059669' },
                    { label: 'Avance Físico Prom.', value: `${stats.avgPhysical}%`, icon: <Activity size={20} />, color: getProgressColor(stats.avgPhysical) },
                    { label: 'Avance Financiero Prom.', value: `${stats.avgFinancial}%`, icon: <TrendingUp size={20} />, color: getProgressColor(stats.avgFinancial) },
                  ].map(stat => (
                    <div key={stat.label} style={{ backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {React.cloneElement(stat.icon, { style: { color: stat.color } })}
                        </div>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
                      <div style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Línea de tiempo */}
              {loadingReports ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}><Spinner size="large" /></div>
              ) : errorReports ? (
                <div style={{ padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)' }}>
                  <AlertTriangle size={16} style={{ display: 'inline', marginRight: '8px' }} />
                  {errorReports}
                </div>
              ) : reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 24px', backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--outline)' }}>
                  <FileText size={48} style={{ color: 'var(--on-surface-variant)', opacity: 0.4, marginBottom: '16px' }} />
                  <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '8px' }}>Sin informes de avance</p>
                  <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                    Aún no se han registrado informes de avance para este proyecto.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>
                      Línea de Tiempo ({reports.length} informe{reports.length !== 1 ? 's' : ''})
                    </h2>
                    <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>— Del más reciente al más antiguo</span>
                  </div>
                  <div>
                    {[...reports].reverse().map((report, idx) => (
                      <TimelineNode
                        key={report.id}
                        report={report}
                        isLast={idx === reports.length - 1}
                        onViewDetail={setDetailReport}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!selectedProjectId && projects.length > 0 && (
            <div style={{ textAlign: 'center', padding: '64px 24px', backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--outline)' }}>
              <BarChart2 size={48} style={{ color: 'var(--on-surface-variant)', opacity: 0.4, marginBottom: '16px' }} />
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)' }}>
                Selecciona un proyecto para ver su historial
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
