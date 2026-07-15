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

function getActionColor(action: string): string {
  if (action.includes('APROBADO') || action.includes('FINALIZADO') || action.includes('RESOLUCION'))
    return '#15803d';
  if (action.includes('OBSERVADO') || action.includes('RECHAZADO')) return '#dc2626';
  if (action.includes('SUBSANADO')) return '#059669';
  if (action.includes('PRESENTADO') || action.includes('REGISTRADO')) return '#6366f1';
  return '#3b82f6';
}

function getActionIcon(action: string) {
  if (action.includes('APROBADO') || action.includes('FINALIZADO'))
    return <CheckCircle size={16} />;
  if (action.includes('OBSERVADO') || action.includes('RECHAZADO'))
    return <AlertTriangle size={16} />;
  return <ArrowRight size={16} />;
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
      toast.error('Ingrese un ID de tramite valido (numero entero positivo).');
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
      setError(err?.message || 'No se pudo cargar la trazabilidad del tramite.');
      setMovements([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--primary-container)',
                color: 'var(--on-primary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-headline-lg">{t('tramites:auditTrail.title')}</h1>
          </div>
          <p
            className="text-body-md"
            style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}
          >
            {t('tramites:auditTrail.subtitle')}
          </p>
        </div>
      </div>

      <Card style={{ marginBottom: '28px', maxWidth: '600px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)' }}>
        <CardContent style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '6px' }}>
            {t('tramites:auditTrail.searchTitle')}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginBottom: '18px', lineHeight: '1.4' }}>
            {t('tramites:auditTrail.searchDescription')}
          </p>
          <div
            className="search-card-input"
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <style>{`
              .search-card-input .input-group {
                margin-bottom: 0 !important;
              }
            `}</style>
            <div style={{ flex: 1 }}>
              <Input
                placeholder="Ej: 1, 2, 3..."
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
              style={{
                height: '46px',
                padding: '0 24px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}
            >
              {loading ? t('common:searching') : t('tramites:auditTrail.searchButton')}
            </Button>
          </div>
        </CardContent>
      </Card>

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

      {searched && !loading && movements.length === 0 && !error && (
        <Card>
          <CardContent>
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--on-surface-variant)' }}>
              <ShieldCheck size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
              <p>{t('tramites:auditTrail.noMovements', { id: procedureId })}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {movements.length > 0 && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '28px',
            }}
          >
            <Card>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Hash size={24} color="var(--primary)" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '20px' }}>
                      {movements[0]?.procedureCode || `#${procedureId}`}
                    </strong>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
                      {t('tramites:auditTrail.procedureCode')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={24} color="#6366f1" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '20px' }}>
                      {movements.length}
                    </strong>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
                      {t('tramites:auditTrail.totalMovements')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle size={24} color="#15803d" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '20px' }}>
                      {getStatusLabel(movements.at(-1)?.newStatus || '', t) || '-'}
                    </strong>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
                      {t('tramites:auditTrail.currentStatus')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AlertTriangle size={24} color="#f59e0b" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '20px' }}>
                      {movements.filter((m) => m.observation).length}
                    </strong>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
                      {t('tramites:auditTrail.withObservation')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card style={{ overflow: 'hidden' }}>
            <div
              style={{
                backgroundColor: '#111827',
                color: 'white',
                padding: '20px 24px',
              }}
            >
              <h2
                className="text-title-lg"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ShieldCheck size={20} />
                {t('tramites:auditTrail.timelineTitle')}
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '4px' }}>
                {t('tramites:auditTrail.procedureLabel')} {movements[0]?.procedureCode || `#${procedureId}`}
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#111827',
                color: '#e5e7eb',
                padding: '24px',
              }}
            >
              <div style={{ display: 'grid', gap: '0' }}>
                {[...movements].reverse().map((m, idx) => (
                  <div
                    key={m.movementId || idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '24px 1fr',
                      gap: '16px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '999px',
                          backgroundColor: getActionColor(m.action),
                          flexShrink: 0,
                          marginTop: '6px',
                        }}
                      />
                      {idx < movements.length - 1 && (
                        <div
                          style={{
                            width: '2px',
                            flex: 1,
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            marginTop: '4px',
                          }}
                        />
                      )}
                    </div>

                    <div
                      style={{
                        paddingBottom: '24px',
                        borderBottom:
                          idx < movements.length - 1
                            ? '1px solid rgba(255,255,255,0.08)'
                            : 'none',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '12px',
                          marginBottom: '8px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: getActionColor(m.action),
                          }}
                        >
                          {getActionIcon(m.action)}
                          <strong style={{ color: 'white', fontSize: '0.95rem' }}>
                            {m.action.replaceAll('_', ' ')}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          {m.previousStatus && (
                            <>
                              <Badge
                                variant="neutral"
                                style={{
                                  backgroundColor: STATUS_COLORS[m.previousStatus] || '#6b7280',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              >
                                 {getStatusLabel(m.previousStatus, t) || m.previousStatus}
                              </Badge>
                              <span style={{ color: '#6b7280', alignSelf: 'center' }}>→</span>
                            </>
                          )}
                          <Badge
                            variant="neutral"
                            style={{
                              backgroundColor: STATUS_COLORS[m.newStatus] || '#6b7280',
                              color: 'white',
                              fontSize: '0.7rem',
                            }}
                          >
                             {getStatusLabel(m.newStatus, t) || m.newStatus}
                          </Badge>
                        </div>
                      </div>

                      {m.observation && (
                        <div
                          style={{
                            backgroundColor: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            marginBottom: '8px',
                          }}
                        >
                          <span style={{ color: '#fca5a5', fontSize: '0.8rem', fontWeight: 600 }}>
                            {t('tramites:auditTrail.observationLabel')}
                          </span>
                          <p style={{ color: '#e5e7eb', margin: '4px 0 0', lineHeight: 1.5, fontSize: '0.875rem' }}>
                            {m.observation}
                          </p>
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          color: '#9ca3af',
                          fontSize: '0.8rem',
                        }}
                      >
                        <Clock size={13} />
                        <span>
                          {formatDate(m.movementDate)} {formatTime(m.movementDate)}
                        </span>
                        <span style={{ color: '#6b7280' }}>|</span>
                        <span>{m.actionUserName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
