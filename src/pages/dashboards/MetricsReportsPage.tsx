import { useContext, useEffect, useMemo, useState } from 'react';
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

const metricLabels: Record<string, Omit<MetricDefinition, 'key'>> = {
  totalUsers: {
    label: 'Usuarios registrados',
    description: 'Cantidad total de usuarios registrados en el sistema.',
    category: 'Usuarios',
  },
  totalActiveUsers: {
    label: 'Usuarios activos',
    description: 'Usuarios habilitados o activos actualmente.',
    category: 'Usuarios',
  },
  totalGroups: {
    label: 'Grupos de investigación',
    description: 'Cantidad total de grupos registrados.',
    category: 'Usuarios',
  },
  totalActiveGroups: {
    label: 'Grupos activos',
    description: 'Grupos de investigación activos.',
    category: 'Usuarios',
  },
  totalProjects: {
    label: 'Proyectos registrados',
    description: 'Total de proyectos registrados.',
    category: 'Proyectos',
  },
  activeProjects: {
    label: 'Proyectos activos',
    description: 'Proyectos actualmente en ejecución o seguimiento.',
    category: 'Proyectos',
  },
  pendingProcedures: {
    label: 'Trámites pendientes',
    description: 'Trámites pendientes de atención.',
    category: 'Trámites',
  },
  proceduresUnderReview: {
    label: 'Trámites en revisión',
    description: 'Trámites actualmente en proceso de revisión.',
    category: 'Trámites',
  },
  approvedProcedures: {
    label: 'Trámites aprobados',
    description: 'Trámites aprobados por el flujo correspondiente.',
    category: 'Trámites',
  },
  rejectedProcedures: {
    label: 'Trámites rechazados',
    description: 'Trámites rechazados u observados como no conformes.',
    category: 'Trámites',
  },
  issuedResolutions: {
    label: 'Resoluciones emitidas',
    description: 'Resoluciones administrativas registradas.',
    category: 'Resoluciones',
  },
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

function getMetricDefinitions(data: DashboardRecord): MetricDefinition[] {
  return Object.entries(data)
    .filter(([key, value]) => key !== 'alerts' && getNumericValue(value) !== null)
    .map(([key]) => ({
      key,
      label: metricLabels[key]?.label ?? key,
      description: metricLabels[key]?.description ?? 'Indicador devuelto por el backend.',
      category: metricLabels[key]?.category ?? 'Otros',
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
              : 'No se pudieron cargar las métricas del sistema.'
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
  }, [currentRole]);

  const metrics = useMemo(() => {
    if (!data) return [];
    return getMetricDefinitions(data);
  }, [data]);

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
        <p>Cargando métricas y reportes...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="metrics-state metrics-state-error">
        <AlertTriangle size={42} />
        <h2>No se pudieron cargar las métricas</h2>
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (!data || metrics.length === 0) {
    return (
      <div className="metrics-state">
        <FileText size={42} />
        <h2>Sin métricas disponibles</h2>
        <p>El backend no devolvió indicadores numéricos para este rol.</p>
      </div>
    );
  }

  return (
    <div className="metrics-page">
      <header className="metrics-header">
        <div>
          <span className="metrics-eyebrow">Métricas y reportes</span>
          <h2>Indicadores institucionales</h2>
          <p>
            Vista analítica construida con los indicadores reales devueltos por el backend
            para el rol actual.
          </p>
        </div>

        <div className="metrics-header-badge">
          <TrendingUp size={20} />
          <span>Rol actual: {currentRole ?? 'No definido'}</span>
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
            <h3>Distribución de indicadores</h3>
            <p>Comparación proporcional entre los valores disponibles.</p>
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
            <h3>Indicadores por categoría</h3>
            <p>Agrupación según el tipo de información institucional.</p>
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
                    <strong>{category}</strong>
                    <p>{items.length} indicador(es) disponible(s)</p>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="metrics-table-panel">
        <div className="metrics-panel-header">
          <h3>Detalle de métricas disponibles</h3>
          <p>Campos numéricos recibidos desde el backend para el dashboard del rol actual.</p>
        </div>

        <div className="metrics-table-wrapper">
          <table className="metrics-table">
            <thead>
              <tr>
                <th>Indicador</th>
                <th>Categoría</th>
                <th>Valor</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => (
                <tr key={metric.key}>
                  <td>{metric.label}</td>
                  <td>{metric.category}</td>
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