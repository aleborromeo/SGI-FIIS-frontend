import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummary } from '../../services/dashboardService';
import type { BackendDashboardMe } from '../../types/dashboard.types';
import { DashboardModuleNav } from './DashboardModuleNav';
import '../../styles/dashboards.css';

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-PE').format(value);
}

function translateAlertTitle(title: string): string {
  const normalized = title.toLowerCase();

  if (normalized.includes('pending')) return 'Trámites pendientes';
  if (normalized.includes('review')) return 'Revisión pendiente';

  return title;
}

function translateAlertDescription(description: string): string {
  return description
    .replace('procedure(s)', 'trámite(s)')
    .replace('procedures', 'trámites')
    .replace('unresolved', 'sin resolver');
}

export default function DashboardPage() {
  const [data, setData] = useState<BackendDashboardMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setErrorMessage('');

        const response = await getDashboardSummary();

        if (mounted) {
          setData(response);
        }
      } catch (error) {
        console.error('Error al cargar el dashboard:', error);

        if (mounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'No se pudo cargar la información del dashboard.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: 'Proyectos activos',
        value: data.activeProjects,
        detail: `Total registrados: ${formatNumber(data.totalProjects)}`,
        tone: 'primary',
      },
      {
        label: 'Trámites pendientes',
        value: data.pendingProcedures,
        detail: `En revisión: ${formatNumber(data.proceduresUnderReview)}`,
        tone: data.pendingProcedures > 0 ? 'danger' : 'primary',
      },
      {
        label: 'Grupos activos',
        value: data.totalActiveGroups,
        detail: `Total de grupos: ${formatNumber(data.totalGroups)}`,
        tone: 'primary',
      },
      {
        label: 'Usuarios activos',
        value: data.totalActiveUsers,
        detail: `Total usuarios: ${formatNumber(data.totalUsers)}`,
        tone: 'primary',
      },
    ];
  }, [data]);

  return (
    <div className="dash-layout">
      <DashboardModuleNav />

      <main className="dash-main">
        <header className="dash-header">
          <div>
            <p className="dash-eyebrow">Panel institucional</p>
            <h1>Dashboard de investigación FIIS</h1>
            <p>
              Resumen operativo conectado al backend del Sistema de Gestión de Investigación.
            </p>
          </div>

          <div className="dash-header-actions">
            <Link to="/dashboard" className="dash-secondary-button">
              Volver al panel general
            </Link>
            <Link to="/dashboards/tramites" className="dash-primary-button">
              Ver trámites
            </Link>
          </div>
        </header>

        {loading && (
          <section className="dash-state-card">
            <div className="dash-spinner" />
            <p>Cargando información institucional...</p>
          </section>
        )}

        {!loading && errorMessage && (
          <section className="dash-state-card dash-state-error">
            <strong>No se pudo cargar el dashboard</strong>
            <p>{errorMessage}</p>
          </section>
        )}

        {!loading && data && (
          <>
            <section className="dash-metric-grid">
              {metrics.map((metric) => (
                <article
                  key={metric.label}
                  className={`dash-card dash-metric-card dash-tone-${metric.tone}`}
                >
                  <span className="dash-card-label">{metric.label}</span>
                  <strong>{formatNumber(metric.value)}</strong>
                  <p>{metric.detail}</p>
                </article>
              ))}
            </section>

            <section className="dash-content-grid">
              <article className="dash-card">
                <div className="dash-card-header">
                  <div>
                    <span className="dash-card-label">Estado de trámites</span>
                    <h2>Flujo actual</h2>
                  </div>
                </div>

                <div className="dash-process-list">
                  <div>
                    <span>Pendientes</span>
                    <strong>{formatNumber(data.pendingProcedures)}</strong>
                  </div>
                  <div>
                    <span>En revisión</span>
                    <strong>{formatNumber(data.proceduresUnderReview)}</strong>
                  </div>
                  <div>
                    <span>Aprobados</span>
                    <strong>{formatNumber(data.approvedProcedures)}</strong>
                  </div>
                  <div>
                    <span>Rechazados</span>
                    <strong>{formatNumber(data.rejectedProcedures)}</strong>
                  </div>
                  <div>
                    <span>Resoluciones emitidas</span>
                    <strong>{formatNumber(data.issuedResolutions)}</strong>
                  </div>
                </div>
              </article>

              <article className="dash-card">
                <div className="dash-card-header">
                  <div>
                    <span className="dash-card-label">Alertas</span>
                    <h2>Atención requerida</h2>
                  </div>
                </div>

                {data.alerts.length > 0 ? (
                  <div className="dash-alert-list">
                    {data.alerts.map((alert, index) => (
                      <div key={`${alert.type}-${index}`} className="dash-alert-item">
                        <span>{alert.type}</span>
                        <strong>{translateAlertTitle(alert.title)}</strong>
                        <p>{translateAlertDescription(alert.description)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dash-empty">
                    No hay alertas pendientes registradas por el backend.
                  </div>
                )}
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  );
}