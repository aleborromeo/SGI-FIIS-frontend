import React, { useState } from 'react';
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
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Input } from '../../components/ui/Input';
import {
  auditService,
  type TraceabilityMovement,
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

function getActionMeta(action: string) {
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

export const AuditTrail: React.FC = () => {
  const { t } = useTranslation();
  const [procedureId, setProcedureId] = useState('');
  const [movements, setMovements] = useState<TraceabilityMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const toast = useToast();

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

  const totalWithObs = movements.filter((m) => m.observation).length;
  const currentState = movements.length > 0 ? movements.at(-1) : null;

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
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
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(99,102,241,0.08)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
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
            <h1 style={{ color: '#f1f5f9', fontSize: '22px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
              {t('tramites:auditTrail.title')}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0', lineHeight: '1.4' }}>
              {t('tramites:auditTrail.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: '24px', border: '1px solid var(--outline-variant)' }}>
        <CardContent style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Search size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--on-surface)', margin: 0 }}>
              {t('tramites:auditTrail.searchTitle')}
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginBottom: '16px', lineHeight: '1.5' }}>
            {t('tramites:auditTrail.searchDescription')}
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1, maxWidth: '320px' }}>
              <Input
                placeholder={t('tramites:auditTrail.inputPlaceholder')}
                value={procedureId}
                onChange={(e) => setProcedureId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              variant="primary"
              icon={<Search size={16} />}
              onClick={handleSearch}
              disabled={loading}
              style={{ height: '42px', padding: '0 20px', whiteSpace: 'nowrap' }}
            >
              {loading ? t('common:searching') : t('tramites:auditTrail.searchButton')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title={t('common:error')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          </Alert>
        </div>
      )}

      {/* Empty */}
      {searched && !loading && movements.length === 0 && !error && (
        <Card style={{ border: '1px solid var(--outline-variant)' }}>
          <CardContent>
            <div style={{ textAlign: 'center', padding: '56px 24px', color: 'var(--on-surface-variant)' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'var(--surface-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Lock size={28} style={{ opacity: 0.3 }} />
              </div>
              <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '4px' }}>
                {t('tramites:auditTrail.noMovements', { id: procedureId })}
              </p>
              <p style={{ fontSize: '13px', opacity: 0.6 }}>
                Verifique el identificador e intente nuevamente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {movements.length > 0 && (
        <>
          {/* Summary cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <SummaryCard
              icon={<Hash size={18} />}
              value={movements[0]?.procedureCode || `#${procedureId}`}
              label={t('tramites:auditTrail.procedureCode')}
              color="#6366f1"
            />
            <SummaryCard
              icon={<Clock size={18} />}
              value={String(movements.length)}
              label={t('tramites:auditTrail.totalMovements')}
              color="#3b82f6"
            />
            <SummaryCard
              icon={<CheckCircle size={18} />}
              value={getStatusLabel(currentState?.newStatus || '', t) || '-'}
              label={t('tramites:auditTrail.currentStatus')}
              color="#15803d"
            />
            <SummaryCard
              icon={<AlertTriangle size={18} />}
              value={String(totalWithObs)}
              label={t('tramites:auditTrail.withObservation')}
              color="#f59e0b"
            />
          </div>

          {/* Timeline */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid #1e293b',
            }}
          >
            {/* Timeline header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(99,102,241,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={16} color="#818cf8" />
                </div>
                <div>
                  <h2 style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: 600, margin: 0 }}>
                    {t('tramites:auditTrail.timelineTitle')}
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '12px', margin: '2px 0 0' }}>
                    {t('tramites:auditTrail.procedureLabel')} {movements[0]?.procedureCode || `#${procedureId}`}
                  </p>
                </div>
              </div>
              <Badge
                variant="info"
                style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: '#818cf8', fontSize: '11px' }}
              >
                Solo lectura
              </Badge>
            </div>

            {/* Timeline items */}
            <div style={{ padding: '24px' }}>
              {[...movements].reverse().map((m, idx) => {
                const meta = getActionMeta(m.action);
                const isFirst = idx === 0;
                return (
                  <div
                    key={m.movementId || idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '32px 1fr',
                      gap: '16px',
                      position: 'relative',
                    }}
                  >
                    {/* Vertical line + dot */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: isFirst ? '14px' : '10px',
                          height: isFirst ? '14px' : '10px',
                          borderRadius: '50%',
                          backgroundColor: meta.color,
                          border: isFirst ? `3px solid ${meta.bg}` : 'none',
                          flexShrink: 0,
                          marginTop: '5px',
                          boxShadow: isFirst ? `0 0 0 4px ${meta.bg}` : 'none',
                        }}
                      />
                      {idx < movements.length - 1 && (
                        <div
                          style={{
                            width: '1px',
                            flex: 1,
                            backgroundColor: '#1e293b',
                            marginTop: '6px',
                          }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div
                      style={{
                        paddingBottom: idx < movements.length - 1 ? '28px' : '0',
                      }}
                    >
                      {/* Action + status badges */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '12px',
                          marginBottom: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              background: meta.bg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: meta.color,
                            }}
                          >
                            {meta.icon}
                          </div>
                          <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600 }}>
                            {m.action.replaceAll('_', ' ')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                          {m.previousStatus && (
                            <>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  padding: '3px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: STATUS_BG[m.previousStatus] || 'rgba(107,114,128,0.12)',
                                  color: STATUS_COLORS[m.previousStatus] || '#9ca3af',
                                }}
                              >
                                {getStatusLabel(m.previousStatus, t) || m.previousStatus}
                              </span>
                              <ArrowRight size={12} color="#475569" />
                            </>
                          )}
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '3px 10px',
                              borderRadius: '6px',
                              backgroundColor: STATUS_BG[m.newStatus] || 'rgba(107,114,128,0.12)',
                              color: STATUS_COLORS[m.newStatus] || '#9ca3af',
                            }}
                          >
                            {getStatusLabel(m.newStatus, t) || m.newStatus}
                          </span>
                        </div>
                      </div>

                      {/* Observation */}
                      {m.observation && (
                        <div
                          style={{
                            backgroundColor: 'rgba(239,68,68,0.06)',
                            border: '1px solid rgba(239,68,68,0.15)',
                            borderRadius: '8px',
                            padding: '12px 14px',
                            marginBottom: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <AlertTriangle size={12} color="#f87171" />
                            <span style={{ color: '#f87171', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {t('tramites:auditTrail.observationLabel')}
                            </span>
                          </div>
                          <p style={{ color: '#cbd5e1', margin: 0, lineHeight: 1.5, fontSize: '13px' }}>
                            {m.observation}
                          </p>
                        </div>
                      )}

                      {/* Meta row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          color: '#64748b',
                          fontSize: '12px',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          {formatDateTime(m.movementDate)}
                        </span>
                        <span style={{ color: '#334155' }}>|</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} />
                          {m.actionUserName}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Summary card sub-component ── */
function SummaryCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <Card style={{ border: '1px solid var(--outline-variant)' }}>
      <CardContent style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: `${color}12`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--on-surface)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
              {label}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
