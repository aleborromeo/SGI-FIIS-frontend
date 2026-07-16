import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  BarChart2,
  Download,
  FileText,
  FolderOpen,
  Printer,
  RefreshCw,
  Scale,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';

import { AuthContext } from '../../context/AuthContext';
import { auditService } from '../../services/auditService';
import { researchService } from '../../services/researchService';
import { Spinner } from '../../components/common/Spinner';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import './MetricsReportsPage.css';

type DashboardRecord = Record<string, unknown>;

interface MetricDefinition {
  key: string;
  label: string;
  description: string;
  category: 'Usuarios' | 'Proyectos' | 'Trámites' | 'Resoluciones' | 'Otros';
}

interface ProjectReportItem {
  id: number;
  title: string;
  status: string;
  group?: string;
  groupName?: string;
  createdAt?: string;
}

interface ProcedureReportItem {
  id: number;
  code: string;
  type: string;
  status: string;
  applicantName?: string;
  updatedAt?: string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'REGISTRADO', label: 'Registrado' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_PROCESO', label: 'En Proceso' },
  { value: 'APROBADO', label: 'Aprobado' },
  { value: 'OBSERVADO', label: 'Observado' },
  { value: 'RECHAZADO', label: 'Rechazado' },
  { value: 'FINALIZADO', label: 'Finalizado' },
];

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-PE').format(value);
}

function getNumericValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return null;
}

const metricPriority = [
  'totalActiveUsers',
  'totalActiveGroups',
  'totalProjects',
  'pendingProcedures',
  'proceduresUnderReview',
  'approvedProcedures',
  'rejectedProcedures',
  'issuedResolutions',
  'activeProjects',
  'totalUsers',
  'totalGroups',
];

const metricCategoryMap: Record<string, MetricDefinition['category']> = {
  totalUsers: 'Usuarios',
  totalActiveUsers: 'Usuarios',
  totalGroups: 'Usuarios',
  totalActiveGroups: 'Usuarios',
  totalProjects: 'Proyectos',
  activeProjects: 'Proyectos',
  pendingProcedures: 'Trámites',
  proceduresUnderReview: 'Trámites',
  approvedProcedures: 'Trámites',
  rejectedProcedures: 'Trámites',
  issuedResolutions: 'Resoluciones',
};

function getMetricDefinitions(data: DashboardRecord, t: (key: string, options?: Record<string, unknown>) => string): MetricDefinition[] {
  return Object.entries(data)
    .filter(([key, value]) => key !== 'alerts' && getNumericValue(value) !== null)
    .map(([key]) => ({
      key,
      label: t(`dashboard:metricsPage.metricDefs.${key}.label`, { defaultValue: key }),
      description: t(`dashboard:metricsPage.metricDefs.${key}.description`, { defaultValue: t('dashboard:metricsPage.metricDefs.fallback.description') }),
      category: metricCategoryMap[key] ?? 'Otros',
    }))
    .sort((a, b) => {
      const indexA = metricPriority.indexOf(a.key);
      const indexB = metricPriority.indexOf(b.key);
      return (indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA) - (indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB);
    });
}

function getCategoryIcon(category: MetricDefinition['category']) {
  switch (category) {
    case 'Usuarios': return Users;
    case 'Proyectos': return FolderOpen;
    case 'Trámites': return RefreshCw;
    case 'Resoluciones': return Scale;
    default: return BarChart2;
  }
}

function getMaxValue(metrics: MetricDefinition[], data: DashboardRecord): number {
  const values = metrics.map((m) => getNumericValue(data[m.key]) ?? 0).filter((v) => v > 0);
  return values.length > 0 ? Math.max(...values) : 1;
}

function toCSV(rows: Record<string, unknown>[], headers: string[]): string {
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function MetricsReportsPage() {
  const { currentRole } = useContext(AuthContext);
  const { t } = useTranslation('dashboard');

  const [data, setData] = useState<DashboardRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [projectReport, setProjectReport] = useState<ProjectReportItem[]>([]);
  const [procedureReport, setProcedureReport] = useState<ProcedureReportItem[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [groups, setGroups] = useState<{ id: number; groupName: string }[]>([]);

  const [projectPage, setProjectPage] = useState(1);
  const [procedurePage, setProcedurePage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [dashRes, groupsRes] = await Promise.all([
          auditService.getProjectReport(),
          researchService.getGroups(),
        ]);
        if (mounted) {
          if (dashRes && typeof dashRes === 'object' && !Array.isArray(dashRes)) {
            setData(dashRes);
          } else {
            setData({});
          }
          setGroups(Array.isArray(groupsRes) ? groupsRes : []);
        }
      } catch (err) {
        if (mounted) setErrorMessage(err instanceof Error ? err.message : t('dashboard:error.metricsDefaultMessage'));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [currentRole, t]);

  const loadReports = async () => {
    setReportLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterGroup) params.groupId = Number(filterGroup);
      if (filterFromDate) params.fromDate = filterFromDate;
      if (filterToDate) params.toDate = filterToDate;

      const [projRes, procRes] = await Promise.all([
        auditService.getProjectReport(params).catch(() => []),
        auditService.getProcedureReport(params).catch(() => []),
      ]);

      setProjectReport(Array.isArray(projRes) ? projRes : projRes?.content ?? []);
      setProcedureReport(Array.isArray(procRes) ? procRes : procRes?.content ?? []);
      setProjectPage(1);
      setProcedurePage(1);
    } catch {
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && data) loadReports();
  }, [filterStatus, filterGroup, filterFromDate, filterToDate]);

  const metrics = useMemo(() => {
    if (!data) return [];
    return getMetricDefinitions(data, t);
  }, [data, t]);

  const groupedMetrics = useMemo(() => {
    const groups = new Map<MetricDefinition['category'], MetricDefinition[]>();
    metrics.forEach((m) => {
      const curr = groups.get(m.category) ?? [];
      curr.push(m);
      groups.set(m.category, curr);
    });
    return Array.from(groups.entries());
  }, [metrics]);

  const maxValue = useMemo(() => {
    if (!data) return 1;
    return getMaxValue(metrics, data);
  }, [data, metrics]);

  const pagedProjects = useMemo(() => {
    const start = (projectPage - 1) * PAGE_SIZE;
    return projectReport.slice(start, start + PAGE_SIZE);
  }, [projectReport, projectPage]);

  const pagedProcedures = useMemo(() => {
    const start = (procedurePage - 1) * PAGE_SIZE;
    return procedureReport.slice(start, start + PAGE_SIZE);
  }, [procedureReport, procedurePage]);

  const handlePrint = () => window.print();

  const handleExportProjects = () => {
    if (projectReport.length === 0) return;
    const csv = toCSV(projectReport, ['id', 'title', 'status', 'group', 'groupName', 'createdAt']);
    downloadCSV(csv, 'reporte_proyectos.csv');
  };

  const handleExportProcedures = () => {
    if (procedureReport.length === 0) return;
    const csv = toCSV(procedureReport, ['id', 'code', 'type', 'status', 'applicantName', 'updatedAt']);
    downloadCSV(csv, 'reporte_tramites.csv');
  };

  if (loading) {
    return (
      <div className="metrics-state">
        <Spinner size="large" color="#0b5ed7" />
        <p>{t('dashboard:loading.metrics')}</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="metrics-state metrics-state-error">
        <AlertTriangle size={42} />
        <h2>{t('dashboard:error.metricsLoad')}</h2>
        <p>{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="metrics-page">
      <header className="metrics-header">
        <div>
          <span className="metrics-eyebrow">{t('dashboard:metricsPage.eyebrow')}</span>
          <h2>{t('dashboard:metricsPage.title')}</h2>
          <p>{t('dashboard:metricsPage.description')}</p>
        </div>
        <div className="metrics-header-badge">
          <TrendingUp size={20} />
          <span>{t('dashboard:metricsPage.currentRole')} {currentRole ?? t('dashboard:metricsPage.roleUndefined')}</span>
        </div>
      </header>

      <section style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
            {t('dashboard:metricsPage.filters.status', { defaultValue: 'Estado' })}
          </label>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} options={STATUS_OPTIONS} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
            {t('dashboard:metricsPage.filters.group', { defaultValue: 'Grupo' })}
          </label>
          <Select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            options={[{ value: '', label: 'Todos' }, ...groups.map((g) => ({ value: String(g.id), label: g.groupName }))]}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
            {t('dashboard:metricsPage.filters.fromDate', { defaultValue: 'Desde' })}
          </label>
          <Input type="date" value={filterFromDate} onChange={(e) => setFilterFromDate(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
            {t('dashboard:metricsPage.filters.toDate', { defaultValue: 'Hasta' })}
          </label>
          <Input type="date" value={filterToDate} onChange={(e) => setFilterToDate(e.target.value)} />
        </div>
        <Button variant="secondary" icon={<Search size={16} />} onClick={loadReports} disabled={reportLoading}>
          {reportLoading ? '...' : t('dashboard:metricsPage.filters.apply', { defaultValue: 'Buscar' })}
        </Button>
      </section>

      <section style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <Button variant="secondary" icon={<Printer size={16} />} onClick={handlePrint}>
          {t('dashboard:metricsPage.export.print', { defaultValue: 'Imprimir' })}
        </Button>
        <Button variant="secondary" icon={<Download size={16} />} onClick={handleExportProjects} disabled={projectReport.length === 0}>
          {t('dashboard:metricsPage.export.projects', { defaultValue: 'Exportar Proyectos' })}
        </Button>
        <Button variant="secondary" icon={<Download size={16} />} onClick={handleExportProcedures} disabled={procedureReport.length === 0}>
          {t('dashboard:metricsPage.export.procedures', { defaultValue: 'Exportar Trámites' })}
        </Button>
      </section>

      <section className="metrics-summary-grid">
        {metrics.slice(0, 4).map((metric) => {
          const Icon = getCategoryIcon(metric.category);
          const value = getNumericValue(data?.[metric.key]) ?? 0;
          return (
            <article key={metric.key} className="metrics-summary-card">
              <span className="metrics-summary-icon"><Icon size={24} /></span>
              <div>
                <strong>{formatNumber(value)}</strong>
                <p>{metric.label}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="metrics-content-grid">
        <article className="metrics-panel">
          <div className="metrics-panel-header">
            <h3>{t('dashboard:metricsPage.distribution.title')}</h3>
            <p>{t('dashboard:metricsPage.distribution.description')}</p>
          </div>
          <div className="metrics-bars">
            {metrics.map((metric) => {
              const value = getNumericValue(data?.[metric.key]) ?? 0;
              const percent = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
              return (
                <div className="metrics-bar-row" key={metric.key}>
                  <div className="metrics-bar-label">
                    <span>{metric.label}</span>
                    <strong>{formatNumber(value)}</strong>
                  </div>
                  <div className="metrics-bar-track">
                    <div className="metrics-bar-fill" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="metrics-panel">
          <div className="metrics-panel-header">
            <h3>{t('dashboard:metricsPage.byCategory.title')}</h3>
            <p>{t('dashboard:metricsPage.byCategory.description')}</p>
          </div>
          <div className="metrics-category-list">
            {groupedMetrics.map(([category, items]) => {
              const Icon = getCategoryIcon(category);
              return (
                <div key={category} className="metrics-category-card">
                  <span><Icon size={22} /></span>
                  <div>
                    <strong>{t(`dashboard:metricsPage.categories.${category}` as never)}</strong>
                    <p>{t('dashboard:metricsPage.byCategory.count', { count: items.length })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="metrics-table-panel">
        <div className="metrics-panel-header">
          <h3>{t('dashboard:metricsPage.table.title')}</h3>
          <p>{t('dashboard:metricsPage.table.description')}</p>
        </div>
        <div className="metrics-table-wrapper">
          <table className="metrics-table">
            <thead>
              <tr>
                <th>{t('dashboard:metricsPage.table.indicator')}</th>
                <th>{t('dashboard:metricsPage.table.category')}</th>
                <th>{t('dashboard:metricsPage.table.value')}</th>
                <th>{t('dashboard:metricsPage.table.descriptionCol')}</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => (
                <tr key={metric.key}>
                  <td>{metric.label}</td>
                  <td>{t(`dashboard:metricsPage.categories.${metric.category}` as never)}</td>
                  <td>{formatNumber(getNumericValue(data?.[metric.key]) ?? 0)}</td>
                  <td>{metric.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {projectReport.length > 0 && (
        <section className="metrics-table-panel" style={{ marginTop: '24px' }}>
          <div className="metrics-panel-header">
            <h3>{t('dashboard:metricsPage.reports.projects', { defaultValue: 'Reporte de Proyectos' })}</h3>
            <p>{t('dashboard:metricsPage.reports.projectsDesc', { defaultValue: `${projectReport.length} proyecto(s) encontrado(s)` })}</p>
          </div>
          <div className="metrics-table-wrapper">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t('dashboard:metricsPage.reports.title', { defaultValue: 'Título' })}</th>
                  <th>{t('dashboard:metricsPage.reports.status', { defaultValue: 'Estado' })}</th>
                  <th>{t('dashboard:metricsPage.reports.group', { defaultValue: 'Grupo' })}</th>
                </tr>
              </thead>
              <tbody>
                {pagedProjects.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.title}</td>
                    <td>{p.status}</td>
                    <td>{p.group || p.groupName || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={projectPage}
            totalPages={Math.ceil(projectReport.length / PAGE_SIZE)}
            totalItems={projectReport.length}
            pageSize={PAGE_SIZE}
            onPageChange={setProjectPage}
          />
        </section>
      )}

      {procedureReport.length > 0 && (
        <section className="metrics-table-panel" style={{ marginTop: '24px' }}>
          <div className="metrics-panel-header">
            <h3>{t('dashboard:metricsPage.reports.procedures', { defaultValue: 'Reporte de Trámites' })}</h3>
            <p>{t('dashboard:metricsPage.reports.proceduresDesc', { defaultValue: `${procedureReport.length} trámite(s) encontrado(s)` })}</p>
          </div>
          <div className="metrics-table-wrapper">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t('dashboard:metricsPage.reports.code', { defaultValue: 'Código' })}</th>
                  <th>{t('dashboard:metricsPage.reports.type', { defaultValue: 'Tipo' })}</th>
                  <th>{t('dashboard:metricsPage.reports.status', { defaultValue: 'Estado' })}</th>
                </tr>
              </thead>
              <tbody>
                {pagedProcedures.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.code}</td>
                    <td>{p.type}</td>
                    <td>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={procedurePage}
            totalPages={Math.ceil(procedureReport.length / PAGE_SIZE)}
            totalItems={procedureReport.length}
            pageSize={PAGE_SIZE}
            onPageChange={setProcedurePage}
          />
        </section>
      )}
    </div>
  );
}

export default MetricsReportsPage;
