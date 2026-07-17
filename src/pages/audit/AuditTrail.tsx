import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Hash,
  FileText,
  User,
  Calendar,
  Lock,
  Database,
  Activity,
  Users,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Input } from '../../components/ui/Input';
import {
  auditService,
  type TraceabilityMovement,
  type AuditLogEntry,
} from '../../services/auditService';
import { useToast } from '../../context/ToastContext';

const STATUS_COLORS: Record<string, string> = {
  REGISTRADO: '#6366f1',
  PENDIENTE_COORDINADOR: '#f59e0b',
  PENDIENTE_DIRECCION: '#3b82f6',
  PENDIENTE_DECANATO: '#8b5cf6',
  OBSERVADO: '#ef4444',
  SUBSANADO: '#22c55e',
  APROBADO_CON_RESOLUCION: '#15803d',
  FINALIZADO: '#059669',
  RECHAZADO: '#dc2626',
};

const STATUS_BG: Record<string, string> = {
  REGISTRADO: 'rgba(99,102,241,0.12)',
  PENDIENTE_COORDINADOR: 'rgba(245,158,11,0.12)',
  PENDIENTE_DIRECCION: 'rgba(59,130,246,0.12)',
  PENDIENTE_DECANATO: 'rgba(139,92,246,0.12)',
  OBSERVADO: 'rgba(239,68,68,0.12)',
  SUBSANADO: 'rgba(34,197,94,0.12)',
  APROBADO_CON_RESOLUCION: 'rgba(21,128,61,0.12)',
  FINALIZADO: 'rgba(5,150,105,0.12)',
  RECHAZADO: 'rgba(220,38,38,0.12)',
};

function getStatusLabel(status: string, t: (key: string) => string): string {
  const key = `tramites:estadosTramite.${status}`;
  const translated = t(key);
  return translated !== key ? translated : status;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  return `${formatDate(dateStr)} · ${formatTime(dateStr)}`;
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora mismo';
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days}d`;
  return formatDate(dateStr);
}

function getActionMeta(action: string) {
  const a = action.toUpperCase();
  if (a === 'CREAR' || a.includes('CREATE') || a.includes('REGISTRAR') || a.includes('POSTULAR'))
    return { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: <FileText size={13} />, label: 'Creación' };
  if (a === 'EDITAR' || a.includes('UPDATE') || a.includes('MODIFICAR'))
    return { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <RefreshCw size={13} />, label: 'Edición' };
  if (a === 'ELIMINAR' || a.includes('DELETE') || a.includes('ELIMINAR') || a.includes('REJECT'))
    return { color: '#dc2626', bg: 'rgba(220,38,38,0.1)', icon: <AlertTriangle size={13} />, label: 'Eliminación' };
  if (a === 'DESACTIVAR' || a.includes('DEACTIVATE'))
    return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <AlertTriangle size={13} />, label: 'Desactivación' };
  if (a === 'ACTIVAR' || a.includes('ACTIVATE'))
    return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: <CheckCircle size={13} />, label: 'Activación' };
  if (a === 'LOGIN')
    return { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: <User size={13} />, label: 'Inicio de sesión' };
  if (a === 'LOGOUT')
    return { color: '#64748b', bg: 'rgba(100,116,139,0.1)', icon: <User size={13} />, label: 'Cierre de sesión' };
  return { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <ArrowRight size={13} />, label: action };
}

function getTimelineActionMeta(action: string) {
  if (action.includes('APROBADO') || action.includes('FINALIZADO') || action.includes('RESOLUCION'))
    return { color: '#15803d', bg: 'rgba(21,128,61,0.1)', icon: <CheckCircle size={14} />, label: 'Aprobación' };
  if (action.includes('OBSERVADO'))
    return { color: '#dc2626', bg: 'rgba(220,38,38,0.1)', icon: <AlertTriangle size={14} />, label: 'Observación' };
  if (action.includes('RECHAZADO'))
    return { color: '#dc2626', bg: 'rgba(220,38,38,0.1)', icon: <AlertTriangle size={14} />, label: 'Rechazo' };
  if (action.includes('SUBSANADO'))
    return { color: '#059669', bg: 'rgba(5,150,105,0.1)', icon: <CheckCircle size={14} />, label: 'Subsanación' };
  if (action.includes('PRESENTADO') || action.includes('REGISTRADO'))
    return { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: <FileText size={14} />, label: 'Registro' };
  return { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <ArrowRight size={14} />, label: 'Movimiento' };
}

const TABLE_LABELS: Record<string, string> = {
  createcall: 'Convocatorias',
  call: 'Convocatorias',
  updatecall: 'Convocatorias',
  deletecall: 'Convocatorias',
  createproject: 'Proyectos',
  project: 'Proyectos',
  updateproject: 'Proyectos',
  deleteproject: 'Proyectos',
  createtramite: 'Trámites',
  tramite: 'Trámites',
  updatetramite: 'Trámites',
  tramites: 'Trámites',
  createuser: 'Usuarios',
  user: 'Usuarios',
  updateuser: 'Usuarios',
  deleteuser: 'Usuarios',
  usuarios: 'Usuarios',
  convocatorias: 'Convocatorias',
  grupos: 'Grupos de Investigación',
  grupos_investigacion: 'Grupos de Investigación',
  group: 'Grupos de Investigación',
  creategroup: 'Grupos de Investigación',
  line: 'Líneas de Investigación',
  lineas: 'Líneas de Investigación',
  lineas_investigacion: 'Líneas de Investigación',
  createline: 'Líneas de Investigación',
  observacion: 'Observaciones',
  observaciones: 'Observaciones',
  observation: 'Observaciones',
  proyecto: 'Proyectos',
  proyectos: 'Proyectos',
  resolucion: 'Resoluciones',
  resoluciones: 'Resoluciones',
  documento: 'Documentos',
  documentos: 'Documentos',
  document: 'Documentos',
  auditoria_general: 'Auditoría',
  login: 'Sesiones',
  logout: 'Sesiones',
  thesis: 'Planes de Tesis',
  thesisplan: 'Planes de Tesis',
  createplan: 'Planes de Tesis',
  progressreport: 'Informes de Avance',
  evaluacion: 'Evaluaciones',
  evaluation: 'Evaluaciones',
};

export const AuditTrail: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();

  // ── Audit log state ──
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditPage, setAuditPage] = useState(0);
  const [auditHasMore, setAuditHasMore] = useState(true);

  // ── Traceability state ──
  const [procedureId, setProcedureId] = useState('');
  const [movements, setMovements] = useState<TraceabilityMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // ── Load audit log ──
  const loadAuditLog = useCallback(async (page: number, append = false) => {
    try {
      setAuditLoading(true);
      const data = await auditService.getAuditLog(page, 15);
      if (append) {
        setAuditLogs((prev) => [...prev, ...data]);
      } else {
        setAuditLogs(data);
      }
      setAuditHasMore(data.length === 15);
    } catch (err) {
      console.error('Error loading audit log:', err);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuditLog(0);
  }, [loadAuditLog]);

  const handleLoadMore = () => {
    const nextPage = auditPage + 1;
    setAuditPage(nextPage);
    loadAuditLog(nextPage, true);
  };

  // ── Traceability search ──
  const handleSearch = async () => {
    const id = Number.parseInt(procedureId, 10);
    if (Number.isNaN(id) || id <= 0) {
      toast.error('Ingrese un ID de trámite válido (número entero positivo).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await auditService.getTraceability(id);
      setMovements(data);
      setSearched(true);
    } catch (err: any) {
      console.error('Error al cargar trazabilidad:', err);
      setError(err?.message || 'No se pudo cargar la trazabilidad del trámite.');
      setMovements([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // ── Stats ──
  const totalRecords = auditLogs.length;
  const tablesSet = new Set(auditLogs.map((l) => TABLE_LABELS[l.tablaAfectada.toLowerCase()] || l.tablaAfectada));
  const usersSet = new Set(auditLogs.filter((l) => l.idUsuario).map((l) => l.idUsuario));
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = auditLogs.filter((l) => l.fechaAccion?.startsWith(todayStr)).length;

  const totalWithObs = movements.filter((m) => m.observation).length;
  const currentState = movements.length > 0 ? movements.at(-1) : null;

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '1040px', margin: '0 auto' }}>
      {/* ── Header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(99,102,241,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-20px', right: '80px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59,130,246,0.05)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(99,102,241,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <ShieldCheck size={24} color="#818cf8" />
          </div>
          <div>
            <h1 style={{ color: '#f1f5f9', fontSize: '22px', fontWeight: 700, margin: 0 }}>
              {t('tramites:auditTrail.title')}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0' }}>
              {t('tramites:auditTrail.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <StatCard icon={<Database size={18} />} value={String(totalRecords)} label={t('tramites:auditTrail.totalRecords')} color="#6366f1" />
        <StatCard icon={<Activity size={18} />} value={String(tablesSet.size)} label={t('tramites:auditTrail.tablesAffected')} color="#3b82f6" />
        <StatCard icon={<Users size={18} />} value={String(usersSet.size)} label={t('tramites:auditTrail.activeUsers')} color="#8b5cf6" />
        <StatCard icon={<Calendar size={18} />} value={String(todayCount)} label={t('tramites:auditTrail.todayActions')} color="#15803d" />
      </div>

      {/* ── Two-column layout: Audit log + Traceability search ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>

        {/* ── Left: Audit log table ── */}
        <Card style={{ border: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--outline-variant)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={16} color="#6366f1" />
                </div>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--on-surface)', margin: 0 }}>
                    {t('tramites:auditTrail.recentActivity')}
                  </h2>
                  <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', margin: '2px 0 0' }}>
                    {t('tramites:auditTrail.recentActivityDesc')}
                  </p>
                </div>
              </div>
              <Badge variant="info" style={{ fontSize: '11px' }}>
                {totalRecords} {t('tramites:auditTrail.totalRecords').toLowerCase()}
              </Badge>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {auditLoading && auditLogs.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontSize: '13px' }}>Cargando registros...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                <Database size={32} style={{ opacity: 0.15, margin: '0 auto 12px' }} />
                <p style={{ fontSize: '13px' }}>{t('tramites:auditTrail.noAuditData')}</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                    <th style={thStyle}>{t('tramites:auditTrail.action')}</th>
                    <th style={thStyle}>{t('tramites:auditTrail.table')}</th>
                    <th style={thStyle}>{t('tramites:auditTrail.record')}</th>
                    <th style={thStyle}>{t('tramites:auditTrail.user')}</th>
                    <th style={thStyle}>{t('tramites:auditTrail.date')}</th>
                    <th style={thStyle}>{t('tramites:auditTrail.ip')}</th>
                    <th style={{ ...thStyle, minWidth: '200px' }}>{t('tramites:auditTrail.details')}</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => {
                    const meta = getActionMeta(log.accion);
                    const hasDetails = log.datosAnteriores || log.datosNuevos;
                    return (
                      <tr
                        key={log.id}
                        style={{ borderBottom: '1px solid var(--outline-variant)', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color, flexShrink: 0 }}>
                              {meta.icon}
                            </div>
                            <span style={{ fontWeight: 500, color: meta.color }}>{meta.label}</span>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 500 }}>
                            {TABLE_LABELS[log.tablaAfectada.toLowerCase()] || log.tablaAfectada}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <code style={{ background: 'var(--surface-container)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                            #{log.idRegistro}
                          </code>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ color: 'var(--on-surface-variant)' }}>{log.nombreUsuario || `#${log.idUsuario}`}</span>
                        </td>
                        <td style={tdStyle}>
                          <div>
                            <div style={{ color: 'var(--on-surface)' }}>{formatDate(log.fechaAccion)}</div>
                            <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>{formatRelativeTime(log.fechaAccion)}</div>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <code style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>{log.ipOrigen || '-'}</code>
                        </td>
                        <td style={tdStyle}>
                          {hasDetails ? (
                            <AuditDetailsChip anterior={log.datosAnteriores} nuevo={log.datosNuevos} />
                          ) : (
                            <span style={{ color: 'var(--on-surface-variant)', fontSize: '12px' }}>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {auditHasMore && auditLogs.length > 0 && (
            <div style={{ padding: '12px 24px', borderTop: '1px solid var(--outline-variant)', textAlign: 'center' }}>
              <Button
                variant="secondary"
                icon={<ChevronDown size={16} />}
                onClick={handleLoadMore}
                disabled={auditLoading}
                style={{ fontSize: '13px' }}
              >
                {auditLoading ? 'Cargando...' : t('tramites:auditTrail.loadMore')}
              </Button>
            </div>
          )}
        </Card>

        {/* ── Right: Traceability search ── */}
        <div>
          <Card style={{ border: '1px solid var(--outline-variant)', marginBottom: '20px' }}>
            <CardContent style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={16} color="#3b82f6" />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--on-surface)', margin: 0 }}>
                  {t('tramites:auditTrail.searchTitle')}
                </h3>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginBottom: '16px', lineHeight: '1.5' }}>
                {t('tramites:auditTrail.searchDescription')}
              </p>
              <Input
                placeholder={t('tramites:auditTrail.inputPlaceholder')}
                value={procedureId}
                onChange={(e) => setProcedureId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                variant="primary"
                icon={<Search size={16} />}
                onClick={handleSearch}
                disabled={loading}
                style={{ width: '100%', marginTop: '12px', height: '40px' }}
              >
                {loading ? t('common:searching') : t('tramites:auditTrail.searchButton')}
              </Button>
            </CardContent>
          </Card>

          {/* Traceability results */}
          {error && (
            <Alert title={t('common:error')} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} />
                <span style={{ fontSize: '13px' }}>{error}</span>
              </div>
            </Alert>
          )}

          {searched && !loading && movements.length === 0 && !error && (
            <Card style={{ border: '1px solid var(--outline-variant)' }}>
              <CardContent>
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--on-surface-variant)' }}>
                  <Lock size={28} style={{ opacity: 0.2, margin: '0 auto 10px' }} />
                  <p style={{ fontSize: '13px' }}>{t('tramites:auditTrail.noMovements', { id: procedureId })}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {movements.length > 0 && (
            <Card style={{ border: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={15} color="#6366f1" />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('tramites:auditTrail.timelineTitle')}</span>
                </div>
                <Badge variant="info" style={{ fontSize: '10px' }}>Solo lectura</Badge>
              </div>

              <div style={{ padding: '16px 20px' }}>
                {/* Quick stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  <MiniStat value={movements[0]?.procedureCode || `#${procedureId}`} label={t('tramites:auditTrail.procedureCode')} />
                  <MiniStat value={String(movements.length)} label={t('tramites:auditTrail.totalMovements')} />
                  <MiniStat value={getStatusLabel(currentState?.newStatus || '', t) || '-'} label={t('tramites:auditTrail.currentStatus')} />
                </div>

                {/* Timeline */}
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {[...movements].reverse().map((m, idx) => {
                    const meta = getTimelineActionMeta(m.action);
                    const isFirst = idx === 0;
                    return (
                      <div key={m.movementId || idx} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div
                            style={{
                              width: isFirst ? '12px' : '8px',
                              height: isFirst ? '12px' : '8px',
                              borderRadius: '50%',
                              backgroundColor: meta.color,
                              border: isFirst ? `2px solid ${meta.bg}` : 'none',
                              flexShrink: 0,
                              marginTop: '5px',
                              boxShadow: isFirst ? `0 0 0 3px ${meta.bg}` : 'none',
                            }}
                          />
                          {idx < movements.length - 1 && (
                            <div style={{ width: '1px', flex: 1, backgroundColor: 'var(--outline-variant)', marginTop: '4px' }} />
                          )}
                        </div>

                        <div style={{ paddingBottom: idx < movements.length - 1 ? '16px' : '0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '20px', height: '20px', borderRadius: '5px', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color }}>
                                {meta.icon}
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface)' }}>
                                {m.action.replaceAll('_', ' ')}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0, alignItems: 'center' }}>
                              {m.previousStatus && (
                                <>
                                  <span style={{ fontSize: '10px', fontWeight: 500, padding: '2px 6px', borderRadius: '4px', backgroundColor: STATUS_BG[m.previousStatus] || 'rgba(107,114,128,0.08)', color: STATUS_COLORS[m.previousStatus] || '#9ca3af' }}>
                                    {getStatusLabel(m.previousStatus, t) || m.previousStatus}
                                  </span>
                                  <ArrowRight size={10} color="var(--on-surface-variant)" />
                                </>
                              )}
                              <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', backgroundColor: STATUS_BG[m.newStatus] || 'rgba(107,114,128,0.08)', color: STATUS_COLORS[m.newStatus] || '#9ca3af' }}>
                                {getStatusLabel(m.newStatus, t) || m.newStatus}
                              </span>
                            </div>
                          </div>

                          {m.observation && (
                            <div style={{ backgroundColor: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '6px', padding: '8px 10px', marginBottom: '6px', marginTop: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                <AlertTriangle size={10} color="#f87171" />
                                <span style={{ color: '#f87171', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  {t('tramites:auditTrail.observationLabel')}
                                </span>
                              </div>
                              <p style={{ color: 'var(--on-surface)', margin: 0, fontSize: '12px', lineHeight: 1.4 }}>
                                {m.observation}
                              </p>
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', fontSize: '11px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={10} />
                              {formatDate(m.movementDate)} {formatTime(m.movementDate)}
                            </span>
                            <span style={{ color: 'var(--outline-variant)' }}>|</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <User size={10} />
                              {m.actionUserName}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Sub-components ── */
function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <Card style={{ border: '1px solid var(--outline-variant)' }}>
      <CardContent style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
            {icon}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--on-surface)' }}>{value}</div>
            <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '1px' }}>{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ background: 'var(--surface-container)', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
      <div style={{ fontSize: '10px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

function AuditDetailsChip({ anterior, nuevo }: { anterior: string | null; nuevo: string | null }) {
  const [expanded, setExpanded] = useState(false);

  const parseJson = (s: string | null): Record<string, unknown> | null => {
    if (!s) return null;
    try { return JSON.parse(s); } catch { return null; }
  };

  const anteriorObj = parseJson(anterior);
  const nuevoObj = parseJson(nuevo);

  if (!anteriorObj && !nuevoObj) {
    return <span style={{ color: 'var(--on-surface-variant)', fontSize: '12px' }}>-</span>;
  }

  const getChangedKeys = (): string[] => {
    const keys = new Set<string>();
    if (anteriorObj) Object.keys(anteriorObj).forEach((k) => keys.add(k));
    if (nuevoObj) Object.keys(nuevoObj).forEach((k) => keys.add(k));
    return [...keys].filter((k) => {
      const a = anteriorObj?.[k];
      const n = nuevoObj?.[k];
      return JSON.stringify(a) !== JSON.stringify(n);
    });
  };

  const changedKeys = getChangedKeys();
  const previewKeys = changedKeys.slice(0, 2);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: 'var(--surface-container)',
          border: '1px solid var(--outline-variant)',
          borderRadius: '6px',
          padding: '4px 8px',
          fontSize: '11px',
          color: 'var(--on-surface)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <FileText size={11} color="var(--on-surface-variant)" />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {expanded ? 'Ocultar' : `${changedKeys.length} campo${changedKeys.length !== 1 ? 's' : ''}`}
        </span>
      </button>
      {expanded && (
        <div style={{ marginTop: '6px', fontSize: '11px', lineHeight: '1.4' }}>
          {(anteriorObj || nuevoObj) && changedKeys.map((key) => (
            <div key={key} style={{ marginBottom: '4px', display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 600, color: 'var(--on-surface)', minWidth: '60px', flexShrink: 0 }}>{key}:</span>
              <span style={{ color: '#dc2626', textDecoration: 'line-through', wordBreak: 'break-all' }}>
                {anteriorObj?.[key] != null ? String(anteriorObj[key]) : '—'}
              </span>
              <span style={{ color: '#15803d', wordBreak: 'break-all' }}>
                {nuevoObj?.[key] != null ? String(nuevoObj[key]) : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  fontWeight: 600,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--on-surface-variant)',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  verticalAlign: 'middle',
};
