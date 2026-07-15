/**
 * ResearchLines.tsx
 * Pantalla de Gestión de Líneas de Investigación (rol: ADMIN).
 * Tabla con búsqueda, filtros, paginación, ordenamiento.
 * Edición inline mediante modal/panel. Cambio de estado con confirmación.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, BookOpen, ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, RefreshCcw, AlertTriangle, Edit2,
  CheckCircle, XCircle, X, Save, Loader,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { researchService, type ResearchLine, type ResearchLineUpdateRequest } from '../../services/researchService';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

// ── Tipos ─────────────────────────────────────────────────────────────────────

type SortField = 'lineName' | 'lineCode' | 'active' | 'createdAt';
type SortDir = 'asc' | 'desc' | 'none';
type FilterStatus = 'all' | 'active' | 'inactive';

const PAGE_SIZE = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(v?: string): string {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

function nextSort(cur: SortDir): SortDir {
  return cur === 'none' ? 'asc' : cur === 'asc' ? 'desc' : 'none';
}

// ── Modal de edición inline ───────────────────────────────────────────────────

interface EditModalProps {
  line: ResearchLine;
  onSave: (data: ResearchLineUpdateRequest) => Promise<void>;
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ line, onSave, onClose }) => {
  const { t } = useTranslation('admin');
  const [name, setName] = useState(line.lineName);
  const [code, setCode] = useState(line.lineCode ?? '');
  const [desc, setDesc] = useState(line.description ?? '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = t('lines.editModal.validationNameRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({ lineName: name.trim(), lineCode: code.trim() || undefined, description: desc.trim() || undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '32px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>{t('lines.editModal.title')}</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Nombre */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
            {t('lines.editModal.nameRequired')} <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            id="edit-line-name"
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); if (errors.name) setErrors({}); }}
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)',
              border: `1px solid ${errors.name ? 'var(--error)' : 'var(--outline-variant)'}`,
              fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = errors.name ? 'var(--error)' : 'var(--primary)')}
            onBlur={e => (e.target.style.borderColor = errors.name ? 'var(--error)' : 'var(--outline-variant)')}
          />
          {errors.name && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>{errors.name}</p>}
        </div>

        {/* Código */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
            {t('lines.editModal.codeLabel')}
          </label>
          <input
            id="edit-line-code"
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={t('lines.editModal.codePlaceholder')}
            style={{ width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', outline: 'none', fontFamily: 'monospace' }}
            onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.target.style.borderColor = 'var(--outline-variant)')}
          />
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
            {t('lines.editModal.descLabel')}
          </label>
          <textarea
            id="edit-line-desc"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.target.style.borderColor = 'var(--outline-variant)')}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose} disabled={saving}>{t('lines.editModal.btnCancel')}</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving} icon={saving ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}>
            {saving ? t('lines.editModal.saving') : t('lines.editModal.btnSave')}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────

export const ResearchLines: React.FC = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const toast = useToast();
  const { confirmDialog } = useConfirm();

  const [lines, setLines] = useState<ResearchLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('lineName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  const [editingLine, setEditingLine] = useState<ResearchLine | null>(null);

  const fetchLines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await researchService.getLines(false);
      setLines(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('lines.errorLoad'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchLines(); }, [fetchLines]);

  // ── Filtrado / ordenamiento / paginación ────────────────────────────────────

  const filtered = useMemo(() => {
    let r = [...lines];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(l => l.lineName.toLowerCase().includes(q) || (l.lineCode ?? '').toLowerCase().includes(q));
    }
    if (filterStatus === 'active') r = r.filter(l => l.active);
    if (filterStatus === 'inactive') r = r.filter(l => !l.active);
    if (sortDir !== 'none') {
      r.sort((a, b) => {
        let va: string | number = '', vb: string | number = '';
        if (sortField === 'lineName') { va = a.lineName.toLowerCase(); vb = b.lineName.toLowerCase(); }
        else if (sortField === 'lineCode') { va = (a.lineCode ?? '').toLowerCase(); vb = (b.lineCode ?? '').toLowerCase(); }
        else if (sortField === 'active') { va = a.active ? 1 : 0; vb = b.active ? 1 : 0; }
        else if (sortField === 'createdAt') { va = a.createdAt ?? ''; vb = b.createdAt ?? ''; }
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return r;
  }, [lines, search, filterStatus, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, filterStatus, sortField, sortDir]);

  // ── Acciones ────────────────────────────────────────────────────────────────

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(prev => nextSort(prev));
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleToggleStatus = async (line: ResearchLine) => {
    const newStatus = !line.active;
    const confirmed = await confirmDialog({
      title: newStatus ? t('lines.confirm.activateTitle') : t('lines.confirm.deactivateTitle'),
      message: newStatus
        ? t('lines.confirm.activateMessage', { name: line.lineName })
        : t('lines.confirm.deactivateMessage', { name: line.lineName }),
      confirmText: newStatus ? t('lines.confirm.activateConfirm') : t('lines.confirm.deactivateConfirm'),
      danger: !newStatus,
    });
    if (!confirmed) return;
    try {
      await researchService.changeLineStatus(line.id, newStatus);
      toast.success(newStatus ? t('lines.toast.activated') : t('lines.toast.deactivated'));
      fetchLines();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('lines.toast.errorToggle'));
    }
  };

  const handleSaveEdit = async (data: ResearchLineUpdateRequest) => {
    if (!editingLine) return;
    try {
      await researchService.updateLine(editingLine.id, data);
      toast.success(t('lines.toast.updated'));
      setEditingLine(null);
      fetchLines();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('lines.toast.errorSave'));
    }
  };

  // ── Estilos ─────────────────────────────────────────────────────────────────

  const thStyle: React.CSSProperties = { padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', backgroundColor: 'var(--surface-container-low)', borderBottom: '1px solid var(--outline-variant)', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' };
  const tdStyle: React.CSSProperties = { padding: '14px 20px', fontSize: '14px', color: 'var(--on-surface)', borderBottom: '1px solid var(--surface-container-high)', verticalAlign: 'middle' };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown size={13} style={{ opacity: 0.4 }} />;
    if (sortDir === 'asc') return <ChevronUp size={13} />;
    if (sortDir === 'desc') return <ChevronDown size={13} />;
    return <ChevronsUpDown size={13} style={{ opacity: 0.4 }} />;
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in" style={{ padding: '28px' }}>
      {editingLine && (
        <EditModal
          line={editingLine}
          onSave={handleSaveEdit}
          onClose={() => setEditingLine(null)}
        />
      )}

      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '6px' }}>{t('lines.pageTitle')}</h1>
          <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}>{t('lines.pageSubtitle')}</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/lines/new')} icon={<Plus size={17} />}>
          {t('lines.btnNew')}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <AlertTriangle size={20} />
          <span><strong>{t('common.error')}</strong> {error}</span>
          <button type="button" onClick={fetchLines} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <RefreshCcw size={15} /> {t('common.retry')}
          </button>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
          <input
            id="search-lines"
            type="text"
            placeholder={t('lines.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '38px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.target.style.borderColor = 'var(--outline-variant)')}
          />
        </div>
        <select
          id="filter-status-lines"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as FilterStatus)}
          style={{ padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', cursor: 'pointer', outline: 'none' }}
        >
          <option value="all">{t('lines.filterAll')}</option>
          <option value="active">{t('lines.filterActive')}</option>
          <option value="inactive">{t('lines.filterInactive')}</option>
        </select>
        <Button variant="secondary" onClick={fetchLines} icon={<RefreshCcw size={15} />}>{t('lines.btnUpdate')}</Button>
      </div>

      {/* Resumen */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
          {filtered.length} línea{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}><Spinner size="large" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--outline)' }}>
          <BookOpen size={48} style={{ color: 'var(--on-surface-variant)', opacity: 0.4, marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '8px' }}>{t('lines.emptyTitle')}</p>
          <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>
            {search ? t('lines.emptyWithSearch') : t('lines.emptyCreate')}
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--surface-container-lowest)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle} onClick={() => handleSort('lineName')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{t('lines.table.name')} <SortIcon field="lineName" /></span>
                  </th>
                  <th style={thStyle} onClick={() => handleSort('lineCode')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{t('lines.table.code')} <SortIcon field="lineCode" /></span>
                  </th>
                  <th style={thStyle} onClick={() => handleSort('active')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{t('lines.table.status')} <SortIcon field="active" /></span>
                  </th>
                  <th style={thStyle} onClick={() => handleSort('createdAt')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{t('lines.table.created')} <SortIcon field="createdAt" /></span>
                  </th>
                  <th style={{ ...thStyle, textAlign: 'right', cursor: 'default' }}>{t('lines.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(line => (
                  <tr
                    key={line.id}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    style={{ transition: 'background-color 0.15s' }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{line.lineName}</td>
                    <td style={tdStyle}>
                      {line.lineCode ? (
                        <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--secondary-container)', color: 'var(--on-secondary-container)', fontFamily: 'monospace' }}>
                          {line.lineCode}
                        </span>
                      ) : <span style={{ color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>—</span>}
                    </td>
                    <td style={tdStyle}>
                      <Badge variant={line.active ? 'success' : 'neutral'}>{line.active ? t('lines.table.active') : t('lines.table.inactive')}</Badge>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--on-surface-variant)', fontSize: '13px' }}>{formatDate(line.createdAt)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button
                          id={`btn-edit-line-${line.id}`}
                          type="button"
                          title="Editar"
                          onClick={() => setEditingLine(line)}
                          style={{ padding: '7px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}
                        >
                          <Edit2 size={14} /> {t('lines.btnEdit')}
                        </button>
                        <button
                          id={`btn-toggle-line-${line.id}`}
                          type="button"
                          title={line.active ? t('lines.btnDeactivate') : t('lines.btnActivate')}
                          onClick={() => handleToggleStatus(line)}
                          style={{
                            padding: '7px 12px', borderRadius: 'var(--radius-md)',
                            border: `1px solid ${line.active ? 'var(--error-container)' : 'var(--primary-container)'}`,
                            backgroundColor: 'var(--surface)', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '13px', fontWeight: 600,
                            color: line.active ? 'var(--error)' : 'var(--primary)',
                          }}
                        >
                          {line.active ? <><XCircle size={14} /> {t('lines.btnDeactivate')}</> : <><CheckCircle size={14} /> {t('lines.btnActivate')}</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
              {t('lines.pagination.showing', {
                from: (page - 1) * PAGE_SIZE + 1,
                to: Math.min(page * PAGE_SIZE, filtered.length),
                total: filtered.length
              })}
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
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
        </div>
      )}
    </div>
  );
};
