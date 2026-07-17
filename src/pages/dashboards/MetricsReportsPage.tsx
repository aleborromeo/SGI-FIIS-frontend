import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  BarChart2,
  FileText,
  FolderOpen,
  RefreshCw,
  Scale,
  TrendingUp,
  Users,
} from 'lucide-react';

import { AuthContext } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Spinner } from '../../components/common/Spinner';
import './MetricsReportsPage.css';

type DashboardRecord = Record<string, unknown>;

interface MetricDefinition {
  key: string;
  label: string;
  description: string;
  category: 'Usuarios' | 'Proyectos' | 'Trámites' | 'Resoluciones' | 'Otros';
}

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

      const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
      const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;

      return safeIndexA - safeIndexB;
    });
}

function getCategoryIcon(category: MetricDefinition['category']) {
  switch (category) {
    case 'Usuarios':
      return Users;
    case 'Proyectos':
      return FolderOpen;
    case 'Trámites':
      return RefreshCw;
    case 'Resoluciones':
      return Scale;
    default:
      return BarChart2;
  }
}

function getMaxValue(metrics: MetricDefinition[], data: DashboardRecord): number {
  const values = metrics
    .map((metric) => getNumericValue(data[metric.key]) ?? 0)
    .filter((value) => value > 0);

  return values.length > 0 ? Math.max(...values) : 1;
}

export function MetricsReportsPage() {
  const { currentRole } = useContext(AuthContext);
  const { t } = useTranslation('dashboard');
  const [data, setData] = useState<DashboardRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadMetrics() {
      setLoading(true);
      setErrorMessage('');

      try {
        const response = await authService.getDashboardData<DashboardRecord>();

        if (mounted) {
          setData(response);
        }
      } catch (error) {
        console.error('Error al cargar métricas:', error);

        if (mounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : t('dashboard:error.metricsDefaultMessage')
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMetrics();

    return () => {
      mounted = false;
    };
  }, [currentRole, t]);

  const metrics = useMemo(() => {
    if (!data) return [];
    return getMetricDefinitions(data, t);
  }, [data, t]);

  const groupedMetrics = useMemo(() => {
    const groups = new Map<MetricDefinition['category'], MetricDefinition[]>();

    metrics.forEach((metric) => {
      const current = groups.get(metric.category) ?? [];
      current.push(metric);
      groups.set(metric.category, current);
    });

    return Array.from(groups.entries());
  }, [metrics]);

  const maxValue = useMemo(() => {
    if (!data) return 1;
    return getMaxValue(metrics, data);
  }, [data, metrics]);

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

  if (!data || metrics.length === 0) {
    return (
      <div className="metrics-state">
        <FileText size={42} />
        <h2>{t('dashboard:empty.noMetrics')}</h2>
        <p>{t('dashboard:empty.noMetricsDescription')}</p>
      </div>
    );
  }

  return (
    <div className="metrics-page">
      <header className="metrics-header">
        <div>
          <span className="metrics-eyebrow">{t('dashboard:metricsPage.eyebrow')}</span>
          <h2>{t('dashboard:metricsPage.title')}</h2>
          <p>
            {t('dashboard:metricsPage.description')}
          </p>
        </div>

        <div className="metrics-header-badge">
          <TrendingUp size={20} />
          <span>{t('dashboard:metricsPage.currentRole')} {currentRole ?? t('dashboard:metricsPage.roleUndefined')}</span>
        </div>
      </header>

      <section className="metrics-summary-grid">
        {metrics.slice(0, 4).map((metric) => {
          const Icon = getCategoryIcon(metric.category);
          const value = getNumericValue(data[metric.key]) ?? 0;

          return (
            <article key={metric.key} className="metrics-summary-card">
              <span className="metrics-summary-icon">
                <Icon size={24} />
              </span>
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
              const value = getNumericValue(data[metric.key]) ?? 0;
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
                  <span>
                    <Icon size={22} />
                  </span>
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
                  <td>{formatNumber(getNumericValue(data[metric.key]) ?? 0)}</td>
                  <td>{metric.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default MetricsReportsPage;
