import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Megaphone,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

import { callService } from '../../services/callService';
import type { CallResponse } from '../../services/callService';

const STATUS_LABELS: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  DRAFT:    { label: 'Borrador',   color: 'default' },
  OPEN:     { label: 'Abierta',    color: 'success' },
  CLOSED:   { label: 'Cerrada',    color: 'warning' },
  FINISHED: { label: 'Finalizada', color: 'error' },
};

const NEXT_STATUS: Record<string, string> = {
  DRAFT:    'OPEN',
  OPEN:     'CLOSED',
  CLOSED:   'FINISHED',
};

const NEXT_STATUS_LABEL: Record<string, string> = {
  DRAFT:    'Abrir convocatoria',
  OPEN:     'Cerrar convocatoria',
  CLOSED:   'Finalizar',
};

export const ConvocatoriasList: React.FC = () => {
  const [calls, setCalls] = useState<CallResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchCalls = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callService.getAll();
      setCalls(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las convocatorias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCalls(); }, []);

  const handleStatusChange = async (call: CallResponse) => {
    const nextStatus = NEXT_STATUS[call.status];
    if (!nextStatus) return;
    setUpdatingId(call.id);
    try {
      const updated = await callService.updateStatus(call.id, nextStatus);
      setCalls(prev => prev.map(c => c.id === call.id ? { ...c, status: updated.status } : c));
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el estado.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = calls.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 className="text-headline-lg" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Megaphone size={28} style={{ color: 'var(--primary)' }} />
            Convocatorias de Investigación
          </h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '6px' }}>
            Gestión de periodos de postulación científica institucional.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="secondary"
            icon={<RefreshCw size={16} />}
            onClick={fetchCalls}
            disabled={loading}
          >
            Actualizar
          </Button>
          <Link to="/convocatorias/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Nueva Convocatoria
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {(['OPEN', 'DRAFT', 'CLOSED', 'FINISHED'] as const).map(status => {
          const count = calls.filter(c => c.status === status).length;
          const info = STATUS_LABELS[status];
          return (
            <Card key={status} style={{ padding: '20px' }}>
              <CardContent>
                <p className="text-label-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '6px' }}>
                  {info.label}
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1 }}>
                  {count}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && (
        <div style={{ marginBottom: '20px' }}>
          <Alert title="Error">{error}</Alert>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
        <input
          type="text"
          placeholder="Buscar convocatoria..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px 10px 38px',
            border: '1px solid var(--outline)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-container)',
            color: 'var(--on-surface)',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
      </div>

      {/* Cards list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--on-surface-variant)' }}>
          <RefreshCw size={32} style={{ margin: '0 auto 12px', opacity: 0.5, animation: 'spin 1s linear infinite' }} />
          <p>Cargando convocatorias...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent>
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--on-surface-variant)' }}>
              <Megaphone size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <h3 className="text-title-lg" style={{ marginBottom: '8px' }}>No hay convocatorias</h3>
              <p className="text-body-md">Crea la primera convocatoria institucional.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(call => {
            const statusInfo = STATUS_LABELS[call.status] ?? { label: call.status, color: 'default' as const };
            const nextAction = NEXT_STATUS_LABEL[call.status];
            return (
              <Card key={call.id} style={{ transition: 'box-shadow 0.2s' }}>
                <CardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <h3 className="text-title-lg">{call.title}</h3>
                        <Badge variant={statusInfo.color}>{statusInfo.label}</Badge>
                      </div>
                      <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '12px' }}>
                        {call.description}
                      </p>
                      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                          <Calendar size={14} />
                          Inicio: <strong>{call.startDate}</strong>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                          <Clock size={14} />
                          Fin: <strong>{call.endDate}</strong>
                        </span>
                        {call.researchLineIds?.length > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                            <BookOpen size={14} />
                            {call.researchLineIds.length} línea(s) asociadas
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                      {nextAction && (
                        <Button
                          variant="secondary"
                          onClick={() => handleStatusChange(call)}
                          disabled={updatingId === call.id}
                          icon={call.status === 'OPEN' ? <XCircle size={15} /> : <CheckCircle size={15} />}
                        >
                          {updatingId === call.id ? 'Actualizando...' : nextAction}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConvocatoriasList;
