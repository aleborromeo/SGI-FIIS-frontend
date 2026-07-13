/**
 * MyEvaluations.tsx
 * Bandeja de Evaluaciones Asignadas (rol: EVALUADOR).
 * ANONIMATO ESTRICTO: NO se muestra nombre del investigador, grupo ni escuela.
 * Incluye panel de evaluación con criterios, cálculo automático y dictamen.
 */
import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  ClipboardCheck, RefreshCcw, Clock, CheckCircle,
  ChevronRight, AlertTriangle, Search, X, Send, Calculator,
  FileText, ChevronLeft,
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/common/Spinner';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  evaluacionService,
  type EvaluationItem,
  type Dictamen,
  type EvaluationCriterion,
  type AnonymousProjectDetail,
} from '../../services/evaluacionService';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(v?: string): string {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

function getDaysLeft(deadline?: string): number | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function readValue(item: EvaluationItem, keys: string[], fallback = '—'): string {
  const r = item as Record<string, unknown>;
  for (const k of keys) {
    const v = r[k];
    if (v !== null && v !== undefined && String(v).trim()) return String(v);
  }
  return fallback;
}

function getEvalId(item: EvaluationItem): string | number {
  return item.id ?? item.evaluationId ?? item.idEvaluacion ?? 'SIN-ID';
}

function getStatus(item: EvaluationItem): string {
  return readValue(item, ['status', 'estado'], 'PENDIENTE');
}

function getStatusBadge(status: string): 'warning' | 'success' | 'info' | 'neutral' | 'error' {
  const s = status.toUpperCase();
  if (s === 'PENDIENTE') return 'warning';
  if (s === 'COMPLETADO' || s === 'ENVIADO') return 'success';
  if (s === 'EN_REVISION') return 'info';
  return 'neutral';
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    EN_REVISION: 'En revisión',
    COMPLETADO: 'Completado',
    ENVIADO: 'Enviado',
  };
  return map[status.toUpperCase()] ?? status;
}

// ── Criterios de evaluación por defecto (fallback si el backend no los devuelve) ──

const DEFAULT_CRITERIA: EvaluationCriterion[] = [
  { id: 1, name: 'Pertinencia y Relevancia', description: 'Alineación con las líneas de investigación y necesidades de la facultad.', maxScore: 20 },
  { id: 2, name: 'Marco Teórico y Metodología', description: 'Solidez del fundamento teórico y adecuación de la metodología propuesta.', maxScore: 25 },
  { id: 3, name: 'Objetivos y Metas', description: 'Claridad, pertinencia y alcanzabilidad de los objetivos planteados.', maxScore: 20 },
  { id: 4, name: 'Viabilidad y Presupuesto', description: 'Factibilidad técnica, financiera y temporal del proyecto.', maxScore: 20 },
  { id: 5, name: 'Impacto Esperado', description: 'Potencial de contribución científica, académica o social.', maxScore: 15 },
];

// ── Panel de evaluación ───────────────────────────────────────────────────────

interface EvaluationPanelProps {
  evalItem: EvaluationItem;
  onClose: () => void;
  onSubmitted: () => void;
}

const EvaluationPanel: React.FC<EvaluationPanelProps> = ({ evalItem, onClose, onSubmitted }) => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const evalId = getEvalId(evalItem);

  const [detail, setDetail] = useState<AnonymousProjectDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  const [scores, setScores] = useState<Record<number, number>>({});
  const [criterionObs, setCriterionObs] = useState<Record<number, string>>({});
  const [observations, setObservations] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [dictamen, setDictamen] = useState<Dictamen | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setLoadingDetail(true);
    evaluacionService.getAnonymousDetail(evalId)
      .then(d => { if (!cancelled) setDetail(d); })
      .catch(() => {
        // Si el endpoint no está disponible, usamos criterios por defecto
        if (!cancelled) setDetail(null);
      })
      .finally(() => { if (!cancelled) setLoadingDetail(false); });
    return () => { cancelled = true; };
  }, [evalId]);

  const criteria: EvaluationCriterion[] = detail?.criterios?.length ? detail.criterios : DEFAULT_CRITERIA;
  const maxTotal = criteria.reduce((s, c) => s + c.maxScore, 0);
  const currentTotal = criteria.reduce((s, c) => s + (scores[c.id] ?? 0), 0);
  const progressPct = maxTotal > 0 ? Math.round((currentTotal / maxTotal) * 100) : 0;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    criteria.forEach(c => {
      const v = scores[c.id];
      if (v === undefined || v === null) e[`score_${c.id}`] = 'Requerido';
      else if (v < 0 || v > c.maxScore) e[`score_${c.id}`] = `0–${c.maxScore}`;
    });
    if (!dictamen) e.dictamen = 'Seleccione un dictamen';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Complete todos los criterios y seleccione un dictamen antes de enviar.');
      return;
    }
    setSubmitting(true);
    try {
      await evaluacionService.submitEvaluationForm(evalId, {
        evaluatorId: user?.id ?? 0,
        criteriaScores: criteria.map(c => ({
          criterionId: c.id,
          criterionName: c.name,
          score: scores[c.id] ?? 0,
          maxScore: c.maxScore,
          observations: criterionObs[c.id],
        })),
        totalScore: currentTotal,
        observations,
        recommendations,
        dictamen: dictamen as Dictamen,
      });
      toast.success('Evaluación enviada exitosamente');
      onSubmitted();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al enviar la evaluación');
    } finally {
      setSubmitting(false);
    }
  };

  const dictamenOptions: { value: Dictamen; label: string; color: string }[] = [
    { value: 'APROBADO', label: '✓ Aprobado', color: '#065f46' },
    { value: 'APROBADO_CON_OBSERVACIONES', label: '⚠ Aprobado con observaciones', color: '#92400e' },
    { value: 'DESAPROBADO', label: '✗ Desaprobado', color: '#9b1c1c' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }} onClick={onClose}>
      <div
        style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '860px', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', marginTop: '20px', marginBottom: '40px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header del panel */}
        <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <ClipboardCheck size={22} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>
                Formulario de Evaluación
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--on-surface-variant)', flexWrap: 'wrap' }}>
              <span>Expediente: <strong style={{ fontFamily: 'monospace' }}>
                {readValue(evalItem, ['expedienteCode', 'id', 'evaluationId', 'idEvaluacion'])}
              </strong></span>
              <span>Convocatoria: <strong>{readValue(evalItem, ['convocatoria', 'convocatoriaName'], '—')}</strong></span>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        {loadingDetail ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Spinner size="large" /></div>
        ) : (
          <div style={{ padding: '32px' }}>
            {/* Información técnica del proyecto (anonimizada) */}
            {detail && (
              <div style={{ backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} /> Información Técnica del Proyecto
                </h3>
                <div className="form-row" style={{ gap: '16px', fontSize: '14px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '4px' }}>Título</div>
                    <div style={{ color: 'var(--on-surface)', fontWeight: 600 }}>{detail.titulo}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '4px' }}>Convocatoria</div>
                    <div style={{ color: 'var(--on-surface)' }}>{detail.convocatoria}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '4px' }}>Resumen</div>
                    <div style={{ color: 'var(--on-surface)', lineHeight: 1.6 }}>{detail.resumen}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '4px' }}>Objetivo General</div>
                    <div style={{ color: 'var(--on-surface)', lineHeight: 1.6 }}>{detail.objetivoGeneral}</div>
                  </div>
                  {detail.presupuestoTotal && (
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '4px' }}>Presupuesto Total</div>
                      <div style={{ color: 'var(--on-surface)', fontWeight: 600 }}>
                        S/. {detail.presupuestoTotal.toLocaleString('es-PE')}
                      </div>
                    </div>
                  )}
                  {detail.duracionMeses && (
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '4px' }}>Duración</div>
                      <div style={{ color: 'var(--on-surface)' }}>{detail.duracionMeses} meses</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Puntaje total en tiempo real */}
            <div style={{ backgroundColor: 'var(--primary-container)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--on-primary-container)' }}>
                <Calculator size={20} />
                <span style={{ fontWeight: 700, fontSize: '15px' }}>Puntaje Total Calculado</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: 'var(--radius-full)', height: '8px', width: '160px' }}>
                  <div style={{ height: '100%', borderRadius: 'var(--radius-full)', width: `${progressPct}%`, backgroundColor: 'var(--on-primary-container)', transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--on-primary-container)' }}>
                  {currentTotal} / {maxTotal}
                </span>
              </div>
            </div>

            {/* Criterios de evaluación */}
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '16px' }}>
              Criterios de Evaluación
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              {criteria.map(criterion => {
                const hasError = !!errors[`score_${criterion.id}`];
                const hasScore = scores[criterion.id] !== undefined;
                
                let borderInputColor = 'var(--outline-variant)';
                if (hasError) {
                  borderInputColor = 'var(--error)';
                } else if (hasScore) {
                  borderInputColor = 'var(--primary)';
                }

                return (
                  <div
                    key={criterion.id}
                    style={{ border: `1px solid ${hasError ? 'var(--error)' : 'var(--outline-variant)'}`, borderRadius: 'var(--radius-lg)', padding: '20px', backgroundColor: 'var(--surface)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--on-surface)', marginBottom: '4px' }}>{criterion.name}</div>
                        {criterion.description && (
                          <div style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>{criterion.description}</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Puntaje (máx. {criterion.maxScore}):</span>
                        <input
                          id={`score-criterion-${criterion.id}`}
                          type="number"
                          min={0}
                          max={criterion.maxScore}
                          value={scores[criterion.id] ?? ''}
                          onChange={e => {
                            const v = Number(e.target.value);
                            setScores(prev => ({ ...prev, [criterion.id]: Math.min(criterion.maxScore, Math.max(0, v)) }));
                            setErrors(prev => { const next = { ...prev }; delete next[`score_${criterion.id}`]; return next; });
                          }}
                          style={{
                            width: '80px', padding: '8px 10px', textAlign: 'center', fontWeight: 700, fontSize: '16px',
                            border: `2px solid ${borderInputColor}`,
                            borderRadius: 'var(--radius-md)', outline: 'none', backgroundColor: 'var(--surface)',
                            color: 'var(--on-surface)',
                          }}
                        />
                      </div>
                    </div>
                  {errors[`score_${criterion.id}`] && (
                    <p style={{ fontSize: '12px', color: 'var(--error)', marginBottom: '8px' }}>
                      {errors[`score_${criterion.id}`] === 'Requerido' ? 'Este criterio es obligatorio' : `El puntaje debe estar entre 0 y ${criterion.maxScore}`}
                    </p>
                  )}
                  <input
                    id={`obs-criterion-${criterion.id}`}
                    type="text"
                    placeholder="Observación sobre este criterio (opcional)"
                    value={criterionObs[criterion.id] ?? ''}
                    onChange={e => setCriterionObs(prev => ({ ...prev, [criterion.id]: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: '13px', backgroundColor: 'var(--surface-container-lowest)', color: 'var(--on-surface)', outline: 'none' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--outline-variant)')}
                  />
                </div>
              );
            })}
            </div>

            {/* Observaciones generales */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
                Observaciones Generales
              </label>
              <textarea
                id="eval-observations"
                value={observations}
                onChange={e => setObservations(e.target.value)}
                rows={4}
                placeholder="Comentarios generales sobre el proyecto evaluado..."
                style={{ width: '100%', padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--outline-variant)')}
              />
            </div>

            {/* Recomendaciones */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
                Recomendaciones
              </label>
              <textarea
                id="eval-recommendations"
                value={recommendations}
                onChange={e => setRecommendations(e.target.value)}
                rows={3}
                placeholder="Recomendaciones para mejorar el proyecto..."
                style={{ width: '100%', padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--outline-variant)')}
              />
            </div>

            {/* Dictamen final */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '12px' }}>
                Dictamen Final <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {dictamenOptions.map(opt => (
                  <button
                    key={opt.value}
                    id={`dictamen-${opt.value}`}
                    type="button"
                    onClick={() => { setDictamen(opt.value); setErrors(prev => { const n = { ...prev }; delete n.dictamen; return n; }); }}
                    style={{
                      flex: '1 1 180px', padding: '14px 18px', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                      fontWeight: 700, fontSize: '14px', transition: 'all 0.2s',
                      border: `2px solid ${dictamen === opt.value ? opt.color : 'var(--outline-variant)'}`,
                      backgroundColor: dictamen === opt.value ? `${opt.color}15` : 'var(--surface)',
                      color: dictamen === opt.value ? opt.color : 'var(--on-surface-variant)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.dictamen && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '8px' }}>{errors.dictamen}</p>}
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid var(--outline-variant)' }}>
              <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancelar</Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting}
                icon={submitting ? undefined : <Send size={16} />}
              >
                {submitting ? 'Enviando…' : 'Enviar Evaluación'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────

export const MyEvaluations: React.FC = () => {
  const { user } = useContext(AuthContext);

  const [items, setItems] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const [evaluatingItem, setEvaluatingItem] = useState<EvaluationItem | null>(null);

  const fetchEvaluations = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const raw = await evaluacionService.getByEvaluator(user.id);
      const arr = Array.isArray(raw) ? raw : (raw as Record<string, unknown>).content as EvaluationItem[] ?? [];
      setItems(arr);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar las evaluaciones');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchEvaluations(); }, [fetchEvaluations]);

  const filtered = useMemo(() => {
    let r = [...items];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(i =>
        readValue(i, ['expedienteCode', 'id', 'evaluationId']).toLowerCase().includes(q) ||
        readValue(i, ['convocatoria', 'convocatoriaName']).toLowerCase().includes(q)
      );
    }
    if (filterStatus) r = r.filter(i => getStatus(i).toUpperCase() === filterStatus);
    return r;
  }, [items, search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const pendingCount = items.filter(i => getStatus(i).toUpperCase() === 'PENDIENTE').length;

  // Estilos
  const thS: React.CSSProperties = { padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', backgroundColor: 'var(--surface-container-low)', borderBottom: '1px solid var(--outline-variant)', whiteSpace: 'nowrap' };
  const tdS: React.CSSProperties = { padding: '14px 20px', fontSize: '14px', color: 'var(--on-surface)', borderBottom: '1px solid var(--surface-container-high)', verticalAlign: 'middle' };

  return (
    <div className="animate-fade-in" style={{ padding: '28px' }}>
      {evaluatingItem && (
        <EvaluationPanel
          evalItem={evaluatingItem}
          onClose={() => setEvaluatingItem(null)}
          onSubmitted={() => { setEvaluatingItem(null); fetchEvaluations(); }}
        />
      )}

      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '6px' }}>
            Bandeja de Evaluaciones
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}>
            Expedientes asignados para evaluación. Los datos del investigador son confidenciales.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {pendingCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#fef3c7', borderRadius: 'var(--radius-full)', border: '1px solid #f59e0b' }}>
              <Clock size={15} style={{ color: '#92400e' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#92400e' }}>{pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          <Button variant="secondary" onClick={fetchEvaluations} icon={<RefreshCcw size={15} />}>Actualizar</Button>
        </div>
      </div>

      {/* Aviso de anonimato */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', backgroundColor: 'var(--primary-fixed)', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--outline-variant)' }}>
        <AlertTriangle size={16} style={{ color: 'var(--on-primary-fixed)', flexShrink: 0 }} />
        <p style={{ fontSize: '13px', color: 'var(--on-primary-fixed)', margin: 0 }}>
          <strong>Proceso anónimo:</strong> Por integridad del proceso, no se muestra el nombre del investigador, grupo de investigación ni escuela profesional.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button type="button" onClick={fetchEvaluations} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <RefreshCcw size={14} /> Reintentar
          </button>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
          <input
            id="search-evaluations"
            type="text"
            placeholder="Buscar por código o convocatoria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '38px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', outline: 'none' }}
            onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.target.style.borderColor = 'var(--outline-variant)')}
          />
        </div>
        <select
          id="filter-status-eval"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', cursor: 'pointer', outline: 'none' }}
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_REVISION">En revisión</option>
          <option value="COMPLETADO">Completado</option>
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}><Spinner size="large" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--outline)' }}>
          <ClipboardCheck size={48} style={{ color: 'var(--on-surface-variant)', opacity: 0.4, marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '8px' }}>
            {search || filterStatus ? 'No se encontraron evaluaciones con esos filtros' : 'No tienes evaluaciones asignadas'}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>
            {search || filterStatus ? 'Intenta con otros criterios de búsqueda.' : 'Cuando se te asignen expedientes, aparecerán aquí.'}
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--surface-container-lowest)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thS}>Código Expediente</th>
                  <th style={thS}>Convocatoria</th>
                  <th style={thS}>Estado</th>
                  <th style={thS}>Fecha Asignación</th>
                  <th style={thS}>Fecha Límite</th>
                  <th style={{ ...thS, textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((item, idx) => {
                  const status = getStatus(item);
                  const daysLeft = getDaysLeft(readValue(item, ['deadline', 'fechaLimite', 'dueDate'], ''));
                  const isOverdue = daysLeft !== null && daysLeft < 0;
                  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
                  const isPending = status.toUpperCase() === 'PENDIENTE';

                  return (
                    <tr
                      key={`eval-${getEvalId(item)}-${idx}`}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      style={{ transition: 'background-color 0.15s' }}
                    >
                      <td style={{ ...tdS, fontWeight: 700, fontFamily: 'monospace', fontSize: '15px' }}>
                        {readValue(item, ['expedienteCode', 'id', 'evaluationId', 'idEvaluacion'])}
                      </td>
                      <td style={tdS}>{readValue(item, ['convocatoria', 'convocatoriaName'])}</td>
                      <td style={tdS}>
                        <Badge variant={getStatusBadge(status)}>{getStatusLabel(status)}</Badge>
                      </td>
                      <td style={{ ...tdS, color: 'var(--on-surface-variant)', fontSize: '13px' }}>
                        {formatDate(readValue(item, ['dateAssigned', 'fechaAsignacion', 'assignedAt'], ''))}
                      </td>
                      <td style={tdS}>
                        <div>
                          <div style={{ fontSize: '13px', color: isOverdue ? 'var(--error)' : isUrgent ? '#92400e' : 'var(--on-surface-variant)' }}>
                            {formatDate(readValue(item, ['deadline', 'fechaLimite', 'dueDate'], ''))}
                          </div>
                          {daysLeft !== null && (
                            <div style={{ fontSize: '11px', fontWeight: 600, color: isOverdue ? 'var(--error)' : isUrgent ? '#92400e' : 'var(--on-surface-variant)' }}>
                              {isOverdue ? `Vencido hace ${Math.abs(daysLeft)}d` : `${daysLeft}d restante${daysLeft !== 1 ? 's' : ''}`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ ...tdS, textAlign: 'center' }}>
                        {isPending ? (
                          <button
                            id={`btn-evaluar-${getEvalId(item)}`}
                            type="button"
                            onClick={() => setEvaluatingItem(item)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--primary)', color: 'var(--on-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'all 0.15s' }}
                          >
                            <ClipboardCheck size={15} /> Evaluar <ChevronRight size={14} />
                          </button>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                            <CheckCircle size={15} style={{ color: '#065f46' }} /> Completado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} type="button" onClick={() => setPage(p)} style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${page === p ? 'var(--primary)' : 'var(--outline-variant)'}`, backgroundColor: page === p ? 'var(--primary)' : 'var(--surface)', color: page === p ? 'var(--on-primary)' : 'var(--on-surface)', fontWeight: page === p ? 700 : 400, cursor: 'pointer', fontSize: '13px' }}>
                    {p}
                  </button>
                ))}
                <button type="button" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};