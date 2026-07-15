/**
 * ResearchGroups.tsx
 * Pantalla de Gestión de Grupos de Investigación (rol: ADMIN).
 * Tabla con búsqueda, filtros, paginación, ordenamiento y acciones completas.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Users,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Eye,
  UserCog,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { researchService, type ResearchGroup } from '../../services/researchService';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

// ── Tipos locales ─────────────────────────────────────────────────────────────

type SortField = 'groupName' | 'groupCode' | 'memberCount' | 'createdAt' | 'active';
type SortDir = 'asc' | 'desc' | 'none';
type FilterStatus = 'all' | 'active' | 'inactive';

const PAGE_SIZE = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

function nextSort(current: SortDir): SortDir {
  if (current === 'none') return 'asc';
  if (current === 'asc') return 'desc';
  return 'none';
}

// ── Componente principal ──────────────────────────────────────────────────────

export const ResearchGroups: React.FC = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const toast = useToast();
  const { confirmDialog } = useConfirm();

  const [groups, setGroups] = useState<ResearchGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros y búsqueda
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Ordenamiento
  const [sortField, setSortField] = useState<SortField>('groupName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Paginación
  const [page, setPage] = useState(1);

  // ── Carga de datos ──────────────────────────────────────────────────────────

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await researchService.getGroups();
      setGroups(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('groups.errorLoad');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // ── Filtrado, ordenamiento, paginación ──────────────────────────────────────

  const filtered = useMemo(() => {
    let result = [...groups];

    // Búsqueda
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        g =>
          g.groupName.toLowerCase().includes(q) ||
          g.groupCode.toLowerCase().includes(q) ||
          `${g.coordinatorFirstNames ?? ''} ${g.coordinatorLastNames ?? ''}`.toLowerCase().includes(q)
      );
    }

    // Filtro estado
    if (filterStatus === 'active') result = result.filter(g => g.active !== false);
    if (filterStatus === 'inactive') result = result.filter(g => g.active === false);

    // Ordenamiento
    if (sortDir !== 'none') {
      result.sort((a, b) => {
        let valA: string | number | boolean = '';
        let valB: string | number | boolean = '';

        switch (sortField) {
          case 'groupName': valA = a.groupName.toLowerCase(); valB = b.groupName.toLowerCase(); break;
          case 'groupCode': valA = a.groupCode.toLowerCase(); valB = b.groupCode.toLowerCase(); break;
          case 'memberCount': valA = a.memberCount ?? 0; valB = b.memberCount ?? 0; break;
          case 'createdAt': valA = a.createdAt ?? ''; valB = b.createdAt ?? ''; break;
          case 'active': valA = a.active ? 1 : 0; valB = b.active ? 1 : 0; break;
        }

        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [groups, search, filterStatus, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Resetear página cuando cambien filtros
  useEffect(() => { setPage(1); }, [search, filterStatus, sortField, sortDir]);

  // ── Acciones ────────────────────────────────────────────────────────────────

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => nextSort(prev));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleDeactivate = async (group: ResearchGroup) => {
    const confirmed = await confirmDialog({
      title: t('groups.confirm.deactivateTitle'),
      message: t('groups.confirm.deactivateMessage', { name: group.groupName }),
      confirmText: t('groups.confirm.deactivateConfirm'),
      danger: true,
    });
    if (!confirmed) return;

    try {
      await researchService.deactivateGroup(group.id);
      toast.success(t('groups.toast.deactivated', { name: group.groupName }));
      fetchGroups();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('groups.toast.errorDeactivate'));
    }
  };

  // ── Componente de columna ordenable ────────────────────────────────────────

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown size={14} style={{ opacity: 0.4 }} />;
    if (sortDir === 'asc') return <ChevronUp size={14} />;
    if (sortDir === 'desc') return <ChevronDown size={14} />;
    return <ChevronsUpDown size={14} style={{ opacity: 0.4 }} />;
  };

  const thStyle: React.CSSProperties = {
    padding: '14px 20px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--on-surface-variant)',
    backgroundColor: 'var(--surface-container-low)',
    borderBottom: '1px solid var(--outline-variant)',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
  };

  const tdStyle: React.CSSProperties = {
    padding: '14px 20px',
    fontSize: '14px',
    color: 'var(--on-surface)',
    borderBottom: '1px solid var(--surface-container-high)',
    verticalAlign: 'middle',
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in" style={{ padding: '28px' }}>
      {/* ── Encabezado ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '6px' }}>
            {t('groups.pageTitle')}
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}>
            {t('groups.pageSubtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/groups/new')}
          icon={<Plus size={17} />}
        >
          {t('groups.btnNew')}
        </Button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '16px', backgroundColor: 'var(--error-container)',
          color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)', marginBottom: '20px'
        }}>
          <AlertTriangle size={20} />
          <span><strong>{t('common.error')}</strong> {error}</span>
          <button
            type="button"
            onClick={fetchGroups}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
          >
            <RefreshCcw size={15} /> {t('common.retry')}
          </button>
        </div>
      )}

      {/* ── Barra de filtros ── */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap',
        backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)',
        borderRadius: 'var(--radius-lg)', padding: '16px'
      }}>
        {/* Búsqueda */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
          <input
            id="search-groups"
            type="text"
            placeholder={t('groups.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: '38px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px',
              border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)',
              fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)',
              outline: 'none', transition: 'border-color 0.2s'
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.target.style.borderColor = 'var(--outline-variant)')}
          />
        </div>

        {/* Filtro estado */}
        <select
          id="filter-status-groups"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as FilterStatus)}
          style={{
            padding: '10px 14px', border: '1px solid var(--outline-variant)',
            borderRadius: 'var(--radius-md)', fontSize: '14px',
            backgroundColor: 'var(--surface)', color: 'var(--on-surface)', cursor: 'pointer', outline: 'none'
          }}
        >
          <option value="all">{t('groups.filterAll')}</option>
          <option value="active">{t('groups.filterActive')}</option>
          <option value="inactive">{t('groups.filterInactive')}</option>
        </select>

        {/* Refresh */}
        <Button variant="secondary" onClick={fetchGroups} icon={<RefreshCcw size={15} />}>
          {t('groups.btnUpdate')}
        </Button>
      </div>

      {/* ── Resumen ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
          {filtered.length} grupo{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </span>
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            style={{ fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            {t('groups.clearSearch')}
          </button>
        )}
      </div>

      {/* ── Tabla ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <Spinner size="large" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 24px', backgroundColor: 'var(--surface-container)',
          borderRadius: 'var(--radius-lg)', border: '1px dashed var(--outline)'
        }}>
          <Users size={48} style={{ color: 'var(--on-surface-variant)', opacity: 0.4, marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '8px' }}>
            {t('groups.emptyTitle')}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>
            {search ? t('groups.emptyWithSearch') : t('groups.emptyCreate')}
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--surface-container-lowest)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle} onClick={() => handleSort('groupName')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {t('groups.table.name')} <SortIcon field="groupName" />
                    </span>
                  </th>
                  <th style={thStyle} onClick={() => handleSort('groupCode')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {t('groups.table.code')} <SortIcon field="groupCode" />
                    </span>
                  </th>
                  <th style={{ ...thStyle, cursor: 'default' }}>{t('groups.table.coordinator')}</th>
                  <th style={thStyle} onClick={() => handleSort('active')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {t('groups.table.status')} <SortIcon field="active" />
                    </span>
                  </th>
                  <th style={thStyle} onClick={() => handleSort('memberCount')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {t('groups.table.members')} <SortIcon field="memberCount" />
                    </span>
                  </th>
                  <th style={thStyle} onClick={() => handleSort('createdAt')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {t('groups.table.created')} <SortIcon field="createdAt" />
                    </span>
                  </th>
                  <th style={{ ...thStyle, textAlign: 'right', cursor: 'default' }}>{t('groups.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(group => (
                  <tr
                    key={group.id}
                    style={{ transition: 'background-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{group.groupName}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 'var(--radius-full)',
                        fontSize: '12px', fontWeight: 700,
                        backgroundColor: 'var(--secondary-container)',
                        color: 'var(--on-secondary-container)', fontFamily: 'monospace'
                      }}>
                        {group.groupCode}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: group.currentCoordinatorId ? 'var(--on-surface)' : 'var(--on-surface-variant)', fontStyle: group.currentCoordinatorId ? 'normal' : 'italic' }}>
                      {group.currentCoordinatorId
                        ? `${group.coordinatorFirstNames ?? ''} ${group.coordinatorLastNames ?? ''}`.trim()
                        : t('groups.table.noCoordinator')}
                    </td>
                    <td style={tdStyle}>
                      <Badge variant={group.active !== false ? 'success' : 'neutral'}>
                        {group.active !== false ? t('groups.table.active') : t('groups.table.inactive')}
                      </Badge>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{ fontWeight: 600 }}>{group.memberCount ?? '—'}</span>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--on-surface-variant)', fontSize: '13px' }}>
                      {formatDate(group.createdAt)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button
                          id={`btn-view-group-${group.id}`}
                          type="button"
                          title="Ver detalle"
                          onClick={() => navigate(`/groups/${group.id}`)}
                          style={{
                            padding: '7px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)',
                            backgroundColor: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                            fontSize: '13px', fontWeight: 600, color: 'var(--primary)', transition: 'all 0.15s'
                          }}
                        >
                          <Eye size={15} /> {t('groups.btnView')}
                        </button>
                        <button
                          id={`btn-members-group-${group.id}`}
                          type="button"
                          title="Administrar integrantes"
                          onClick={() => navigate(`/groups/${group.id}?tab=members`)}
                          style={{
                            padding: '7px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)',
                            backgroundColor: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                            fontSize: '13px', fontWeight: 600, color: 'var(--on-surface)', transition: 'all 0.15s'
                          }}
                        >
                          <Users size={15} /> {t('groups.btnMembers')}
                        </button>
                        <button
                          id={`btn-coordinator-group-${group.id}`}
                          type="button"
                          title="Cambiar coordinador"
                          onClick={() => navigate(`/groups/${group.id}?tab=summary`)}
                          style={{
                            padding: '7px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)',
                            backgroundColor: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                            fontSize: '13px', fontWeight: 600, color: 'var(--on-surface)', transition: 'all 0.15s'
                          }}
                        >
                          <UserCog size={15} /> {t('groups.btnCoordinator')}
                        </button>
                        {group.active !== false && (
                          <button
                            id={`btn-deactivate-group-${group.id}`}
                            type="button"
                            title="Desactivar grupo"
                            onClick={() => handleDeactivate(group)}
                            style={{
                              padding: '7px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--error-container)',
                              backgroundColor: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                              fontSize: '13px', fontWeight: 600, color: 'var(--error)', transition: 'all 0.15s'
                            }}
                          >
                            <UserX size={15} /> {t('groups.btnDeactivate')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Paginación ── */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 20px', borderTop: '1px solid var(--outline-variant)',
            backgroundColor: 'var(--surface-container-low)', flexWrap: 'wrap', gap: '12px'
          }}>
            <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
              {t('groups.pagination.showing', {
                from: (page - 1) * PAGE_SIZE + 1,
                to: Math.min(page * PAGE_SIZE, filtered.length),
                total: filtered.length
              })}
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{
                  padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)',
                  backgroundColor: 'var(--surface)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1
                }}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === 'ellipsis' ? (
                    <span key={`e${idx}`} style={{ padding: '0 4px', color: 'var(--on-surface-variant)' }}>…</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p as number)}
                      style={{
                        padding: '6px 12px', borderRadius: 'var(--radius-md)',
                        border: `1px solid ${page === p ? 'var(--primary)' : 'var(--outline-variant)'}`,
                        backgroundColor: page === p ? 'var(--primary)' : 'var(--surface)',
                        color: page === p ? 'var(--on-primary)' : 'var(--on-surface)',
                        fontWeight: page === p ? 700 : 400, cursor: 'pointer', fontSize: '13px'
                      }}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{
                  padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)',
                  backgroundColor: 'var(--surface)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
