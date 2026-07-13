/**
 * ConvocatoriasList.tsx
 * Gestión de Convocatorias de Investigación (DIRECTOR_INVESTIGACION / ADMIN).
 * Tarjetas visuales, filtros por estado, cambio de estado con confirmación, buscador.
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, RefreshCw, Search, Megaphone, Calendar, Clock,
  ChevronRight, AlertTriangle, ArrowRight, BookOpen,
  CheckCircle2, FileEdit, Lock, Flag, Filter, X,
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { callService } from '../../services/callService';
import type { CallResponse } from '../../services/callService';

// ── Constantes ────────────────────────────────────────────────────────────────

type CallStatus = 'ABIERTA' | 'CERRADA' | 'FINALIZADA';

const STATUS_META: Record<CallStatus, {
  label: string;
  badgeVariant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
  description: string;
}> = {
  ABIERTA: {
    label: 'Abierta',
    badgeVariant: 'success',
    icon: <CheckCircle2 size={15} />,
    accentColor: '#059669',
    bgColor: '#d1fae5',
    description: 'Recibiendo postulaciones',
  },
  CERRADA: {
    label: 'Cerrada',
    badgeVariant: 'warning',
    icon: <Lock size={15} />,
    accentColor: '#d97706',
    bgColor: '#fef3c7',
    description: 'Postulaciones cerradas',
  },
  FINALIZADA: {
    label: 'Finalizada',
    badgeVariant: 'error',
    icon: <Flag size={15} />,
    accentColor: '#dc2626',
    bgColor: '#fee2e2',
    description: 'Proceso concluido',
  },
};

const TRANSITIONS: Record<string, { next: string; label: string; confirmMsg: string; danger: boolean }> = {
  ABIERTA:   { next: 'CERRADA',   label: 'Cerrar Convocatoria', confirmMsg: '¿Cerrar esta convocatoria? No se aceptarán más postulaciones.', danger: true },
  CERRADA: { next: 'FINALIZADA', label: 'Finalizar Proceso',   confirmMsg: '¿Finalizar esta convocatoria? Esta acción no se puede deshacer.', danger: true },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(v?: string): string {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
}

function getDaysLeft(endDate: string): number | null {
  const d = new Date(endDate);
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

// ── Componente tarjeta de convocatoria ────────────────────────────────────────

interface CallCardProps {
  call: CallResponse;
  updating: boolean;
  onStatusChange: (call: CallResponse) => void;
}

const CallCard: React.FC<CallCardProps> = ({ call, updating, onStatusChange }) => {
  const meta = STATUS_META[call.status as CallStatus] ?? STATUS_META.ABIERTA;
  const transition = TRANSITIONS[call.status];
  const daysLeft = call.status === 'ABIERTA' ? getDaysLeft(call.endDate) : null;
  const isOverdue = daysLeft !== null && daysLeft < 0;

  return (
    <div style={{
      backgroundColor: 'var(--surface-container-lowest)',
      border: '1px solid var(--outline-variant)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.2s, transform 0.2s',
      display: 'flex',
      flexDirection: 'column',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
    }}
    >
      {/* Banda de color por estado */}
      <div style={{ height: '5px', backgroundColor: meta.accentColor, flexShrink: 0 }} />

      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--on-surface)', margin: 0, lineHeight: 1.3 }}>
                {call.title}
              </h3>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '4px 10px', borderRadius: 'var(--radius-full)',
                fontSize: '12px', fontWeight: 700,
                backgroundColor: meta.bgColor, color: meta.accentColor,
              }}>
                {meta.icon}
                {meta.label}
              </span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {call.description}
            </p>
          </div>
        </div>

        {/* Fechas y detalles */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
            <Calendar size={14} style={{ color: meta.accentColor }} />
            <span>Inicio: <strong style={{ color: 'var(--on-surface)' }}>{formatDate(call.startDate)}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
            <Clock size={14} style={{ color: meta.accentColor }} />
            <span>Cierre: <strong style={{ color: 'var(--on-surface)' }}>{formatDate(call.endDate)}</strong></span>
          </div>
          {call.researchLineIds?.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
              <BookOpen size={14} style={{ color: meta.accentColor }} />
              <span><strong style={{ color: 'var(--on-surface)' }}>{call.researchLineIds.length}</strong> línea(s)</span>
            </div>
          )}
          {daysLeft !== null && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700,
              padding: '3px 10px', borderRadius: 'var(--radius-full)',
              backgroundColor: isOverdue ? '#fee2e2' : daysLeft <= 5 ? '#fef3c7' : '#d1fae5',
              color: isOverdue ? '#991b1b' : daysLeft <= 5 ? '#92400e' : '#065f46',
            }}>
              <Clock size={12} />
              {isOverdue ? `Venció hace ${Math.abs(daysLeft)}d` : `${daysLeft}d restante${daysLeft !== 1 ? 's' : ''}`}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
          {call.status === 'ABIERTA' && (
            <Link to={`/convocatorias/${call.id}/edit`}>
              <button
                type="button"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '9px 18px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 700, border: '1px solid var(--outline-variant)',
                  backgroundColor: 'var(--surface)', color: 'var(--on-surface)', transition: 'all 0.2s',
                }}
              >
                <FileEdit size={14} /> Editar
              </button>
            </Link>
          )}
          {transition && (
            <button
              id={`btn-transition-call-${call.id}`}
              type="button"
              disabled={updating}
              onClick={() => onStatusChange(call)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '9px 18px', borderRadius: 'var(--radius-md)', cursor: updating ? 'not-allowed' : 'pointer',
                fontSize: '13px', fontWeight: 700, border: 'none', transition: 'all 0.2s',
                backgroundColor: transition.danger ? '#dc2626' : meta.accentColor,
                color: 'white', opacity: updating ? 0.6 : 1,
              }}
            >
              {updating
                ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Actualizando...</>
                : <>{transition.label} <ArrowRight size={14} /></>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────

export const ConvocatoriasList: React.FC = () => {
  const toast = useToast();
  const { confirmDialog } = useConfirm();

  const [calls, setCalls] = useState<CallResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchCalls = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callService.getAll();
      setCalls(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar las convocatorias.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCalls(); }, [fetchCalls]);

  const handleStatusChange = async (call: CallResponse) => {
    const transition = TRANSITIONS[call.status];
    if (!transition) return;

    const confirmed = await confirmDialog({
      title: transition.label,
      message: transition.confirmMsg,
      confirmText: transition.label,
      danger: transition.danger,
    });
    if (!confirmed) return;

    setUpdatingId(call.id);
    try {
      const updated = await callService.updateStatus(call.id, transition.next);
      setCalls(prev => prev.map(c => c.id === call.id ? { ...c, status: updated.status } : c));
      toast.success(`Convocatoria actualizada a "${STATUS_META[transition.next as CallStatus]?.label ?? transition.next}"`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar el estado.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    let r = [...calls];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(c => c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
    }
    if (filterStatus) r = r.filter(c => c.status === filterStatus);
    return r;
  }, [calls, search, filterStatus]);

  // Stats
  const stats: { status: CallStatus; count: number }[] = (['ABIERTA', 'CERRADA', 'FINALIZADA'] as CallStatus[]).map(s => ({
    status: s,
    count: calls.filter(c => c.status === s).length,
  }));

  return (
    <div className="animate-fade-in" style={{ padding: '28px' }}>
      {/* ── Encabezado ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Megaphone size={22} style={{ color: 'var(--on-primary)' }} />
            </span>
            Convocatorias de Investigación
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)', marginLeft: '54px' }}>
            Gestión de periodos de postulación científica institucional.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={<RefreshCw size={15} />} onClick={fetchCalls} disabled={loading}>
            Actualizar
          </Button>
          <Link to="/convocatorias/new">
            <Button variant="primary" icon={<Plus size={16} />}>Nueva Convocatoria</Button>
          </Link>
        </div>
      </div>

      {/* ── Tarjetas de estado ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {stats.map(({ status, count }) => {
          const meta = STATUS_META[status];
          const isFiltered = filterStatus === status;
          return (
            <button
              key={status}
              type="button"
              id={`stat-${status}`}
              onClick={() => setFilterStatus(isFiltered ? '' : status)}
              style={{
                padding: '20px', borderRadius: 'var(--radius-xl)', textAlign: 'left', cursor: 'pointer',
                border: `2px solid ${isFiltered ? meta.accentColor : 'var(--outline-variant)'}`,
                backgroundColor: isFiltered ? meta.bgColor : 'var(--surface-container-lowest)',
                transition: 'all 0.2s', boxShadow: isFiltered ? `0 4px 16px ${meta.accentColor}30` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: meta.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.accentColor }}>
                  {meta.icon}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: meta.accentColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {meta.label}
                </span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: isFiltered ? meta.accentColor : 'var(--on-surface)', lineHeight: 1 }}>
                {count}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>{meta.description}</div>
            </button>
          );
        })}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button type="button" onClick={fetchCalls} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
            <RefreshCw size={13} /> Reintentar
          </button>
        </div>
      )}

      {/* ── Filtros ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '460px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
          <input
            id="search-convocatorias"
            type="text"
            placeholder="Buscar por título o descripción..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '38px', paddingRight: search ? '36px' : '12px', paddingTop: '11px', paddingBottom: '11px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.target.style.borderColor = 'var(--outline-variant)')}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: '2px' }}>
              <X size={14} />
            </button>
          )}
        </div>
        {filterStatus && (
          <button type="button" onClick={() => setFilterStatus('')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: 'var(--radius-full)', border: `1px solid ${STATUS_META[filterStatus as CallStatus]?.accentColor ?? 'var(--outline)'}`, backgroundColor: STATUS_META[filterStatus as CallStatus]?.bgColor ?? 'var(--surface)', color: STATUS_META[filterStatus as CallStatus]?.accentColor ?? 'var(--on-surface)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            <Filter size={12} /> Filtrando: {STATUS_META[filterStatus as CallStatus]?.label} <X size={12} />
          </button>
        )}
        <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginLeft: 'auto' }}>
          {filtered.length} convocatoria{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Contenido ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <Spinner size="large" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--outline)' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '24px', backgroundColor: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Megaphone size={32} style={{ color: 'var(--primary)', opacity: 0.7 }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '8px' }}>
            {search || filterStatus ? 'Sin resultados' : 'No hay convocatorias'}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginBottom: '24px' }}>
            {search || filterStatus
              ? 'Intenta con otros términos o limpia los filtros.'
              : 'Crea la primera convocatoria institucional de investigación.'}
          </p>
          {!search && !filterStatus && (
            <Link to="/convocatorias/new">
              <Button variant="primary" icon={<Plus size={16} />}>Nueva Convocatoria</Button>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px' }}>
          {filtered.map(call => (
            <CallCard
              key={call.id}
              call={call}
              updating={updatingId === call.id}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ConvocatoriasList;
