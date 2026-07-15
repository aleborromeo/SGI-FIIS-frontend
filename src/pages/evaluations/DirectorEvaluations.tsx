import React, { useEffect, useState, useMemo } from 'react';
import { ClipboardList, RefreshCw, Eye, Search, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/common/Spinner';
import { evaluacionService, type EvaluationItem } from '../../services/evaluacionService';
import { useToast } from '../../context/ToastContext';
import {
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../../components/ui/Table';

function getStatusLabel(status?: string): string {
  if (!status) return 'Pendiente';
  const labels: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado',
    CON_OBSERVACIONES: 'Con observaciones',
  };
  return labels[status.toUpperCase()] ?? status;
}

function getBadgeVariant(status?: string): 'success' | 'warning' | 'info' | 'neutral' | 'error' {
  const norm = String(status || '').toUpperCase();
  if (norm === 'APROBADO') return 'success';
  if (norm === 'CON_OBSERVACIONES') return 'warning';
  if (norm === 'RECHAZADO') return 'error';
  return 'neutral';
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

export const DirectorEvaluations: React.FC = () => {
  const rawToast = useToast();
  const toast = useMemo(() => ({
    ...rawToast,
    showError: rawToast.error,
    showSuccess: rawToast.success,
  }), [rawToast]);

  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedEval, setSelectedEval] = useState<any | null>(null);
  const [_loadingDetail, setLoadingDetail] = useState(false);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const data = await evaluacionService.listAll();
      setEvaluations(data);
    } catch (err: any) {
      toast.showError(err.message || 'Error al obtener la lista de evaluaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    fetchEvaluations();
  };

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(e => {
      const matchesStatus = filterStatus ? String(e.estado || e.status || '').toUpperCase() === filterStatus.toUpperCase() : true;
      const idStr = String(e.id || e.evaluationId || e.idEvaluacion || '').toLowerCase();
      const codeStr = String(e.expedienteCode || '').toLowerCase();
      const matchesSearch = searchQuery
        ? idStr.includes(searchQuery.toLowerCase()) || codeStr.includes(searchQuery.toLowerCase())
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [evaluations, filterStatus, searchQuery]);

  const handleViewDetail = async (id: number | string) => {
    setLoadingDetail(true);
    try {
      const res = await evaluacionService.getById(id);
      setSelectedEval(res);
    } catch (err: any) {
      toast.showError(err.message || 'Error al obtener los detalles de la evaluación.');
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '28px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 className="text-headline-lg" style={{ fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipboardList size={28} />
            Monitoreo Global de Evaluaciones
          </h1>
          <p
            className="text-body-md"
            style={{
              color: 'var(--on-surface-variant)',
              marginTop: '4px',
              maxWidth: '760px',
            }}
          >
            Consulte y haga seguimiento a las evaluaciones asignadas a proyectos de investigación y planes de tesis.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={fetchEvaluations}>
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card style={{ marginBottom: '24px' }}>
        <CardContent style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--on-surface-variant)' }} />
            <input
              type="text"
              placeholder="Buscar por ID de evaluación o expediente..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline)',
                fontSize: '14px',
                backgroundColor: 'var(--surface)',
                color: 'var(--on-surface)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Estado:</span>
            <select
              id="filter-eval-status"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline)',
                fontSize: '14px',
                backgroundColor: 'var(--surface)',
                color: 'var(--on-surface)',
                outline: 'none',
              }}
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="APROBADO">Aprobados</option>
              <option value="RECHAZADO">Rechazados</option>
              <option value="CON_OBSERVACIONES">Con observaciones</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Listado */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <Spinner size="large" />
        </div>
      ) : filteredEvaluations.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            backgroundColor: 'var(--surface-container-low)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--outline)',
          }}
        >
          <ClipboardList size={48} style={{ color: 'var(--on-surface-variant)', opacity: 0.4, marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)', margin: 0 }}>
            No se encontraron evaluaciones
          </p>
        </div>
      ) : (
        <TableContainer>
          <TableHead>
            <TableRow>
              <TableHeader>ID Evaluación</TableHeader>
              <TableHeader>Código Expediente</TableHeader>
              <TableHeader>Fecha Asignación</TableHeader>
              <TableHeader>Dictamen / Resultado</TableHeader>
              <TableHeader style={{ textAlign: 'center' }}>Puntaje</TableHeader>
              <TableHeader style={{ textAlign: 'right' }}>Acciones</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvaluations.map(e => {
              const evalId = e.id || e.evaluationId || e.idEvaluacion;
              const result = e.resultado || e.result || 'PENDIENTE';
              const score = e.puntaje !== undefined && e.puntaje !== null ? e.puntaje : e.score;

              return (
                <TableRow key={evalId}>
                  <TableCell><strong>EVAL-{evalId}</strong></TableCell>
                  <TableCell>{e.expedienteCode || 'Expediente Anónimo'}</TableCell>
                  <TableCell>{formatDate(e.fechaAsignacion || e.assignedAt || e.dateAssigned)}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(result)}>
                      {getStatusLabel(result)}
                    </Badge>
                  </TableCell>
                  <TableCell style={{ textAlign: 'center', fontWeight: 700 }}>
                    {score !== undefined && score !== null ? `${score} pts` : '—'}
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <Button
                      variant="secondary"
                      icon={<Eye size={15} />}
                      onClick={() => handleViewDetail(evalId!)}
                    >
                      Detalle
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </TableContainer>
      )}

      {/* Modal de Detalle */}
      {selectedEval && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedEval(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--surface-container-lowest)',
              width: '100%',
              maxWidth: '600px',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  Detalle de la Evaluación (EVAL-{selectedEval.id || selectedEval.idEvaluacion})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEval(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px' }}>Código de Expediente:</strong>
                  <span>{selectedEval.expedienteCode || 'Anónimo'}</span>
                </div>
                <div>
                  <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px' }}>Dictamen:</strong>
                  <Badge variant={getBadgeVariant(selectedEval.resultado || selectedEval.result)}>
                    {getStatusLabel(selectedEval.resultado || selectedEval.result)}
                  </Badge>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px' }}>Puntaje Total:</strong>
                  <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--primary)' }}>
                    {selectedEval.puntaje || selectedEval.score || '—'} puntos
                  </span>
                </div>
                <div>
                  <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px' }}>Fecha Evaluación:</strong>
                  <span>{formatDate(selectedEval.fechaEvaluacion) || 'Pendiente'}</span>
                </div>
              </div>

              <div>
                <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px', marginBottom: '4px' }}>Observaciones del Evaluador:</strong>
                <p style={{ margin: 0, padding: '16px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', lineHeight: 1.6 }}>
                  {selectedEval.observaciones || 'Sin observaciones registradas.'}
                </p>
              </div>
            </div>

            <div style={{ padding: '16px 28px', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--surface-container-low)' }}>
              <Button onClick={() => setSelectedEval(null)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
