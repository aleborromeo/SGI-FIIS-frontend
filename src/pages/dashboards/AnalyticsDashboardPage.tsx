import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnalyticsData } from '../../services/dashboardService';
import type { AnalyticsData } from '../../types/dashboard.types';
import '../../styles/dashboards.css';

function AnalyticsDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    getAnalyticsData().then(setAnalytics);
  }, []);

  const maxTrendValue = useMemo(() => {
    if (!analytics) {
      return 1;
    }

    return Math.max(
      ...analytics.monthlyTrend.flatMap((item) => [
        item.projects,
        item.procedures,
        item.evaluations,
      ]),
    );
  }, [analytics]);

  if (!analytics) {
    return (
      <main className="dashboard-loading">
        Cargando análisis institucional...
      </main>
    );
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <h2>Decanatura</h2>
          <p>Gestión Estratégica</p>
        </div>

        <nav className="dashboard-sidebar-nav">
          <Link to="/dashboards">
            <span>▦</span>
            Inicio
          </Link>

          <Link to="/dashboards/tramites">
            <span>▤</span>
            Trámites
          </Link>

          <Link to="/dashboards/analisis" className="dashboard-nav-active">
            <span>▥</span>
            Análisis de Datos
          </Link>

          <Link to="/dashboards/investigadores">
            <span>◎</span>
            Investigadores
          </Link>

          <Link to="/dashboards/publicaciones">
            <span>▣</span>
            Publicaciones
          </Link>

          <Link to="/dashboards/financiamiento">
            <span>◉</span>
            Financiamiento
          </Link>

          <Link to="/dashboards/ranking">
            <span>★</span>
            Ranking
          </Link>

          <Link to="/dashboards/reportes">
            <span>▧</span>
            Reportes
          </Link>
        </nav>

        <div className="dashboard-sidebar-footer">
          <button type="button">＋ Nuevo Informe</button>

          <div>
            <Link to="/">
              <span>?</span>
              Ayuda
            </Link>

            <Link to="/">
              <span>↪</span>
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <strong>Portal de Investigación Institucional</strong>

          <nav>
            <Link to="/dashboards">Dashboard</Link>
            <Link to="/dashboards">Facultades</Link>
            <Link to="/dashboards/investigadores">Investigadores</Link>
            <Link to="/dashboards">Proyectos</Link>
            <Link to="/dashboards/analisis" className="topbar-active">
              Métricas
            </Link>
          </nav>

          <div className="dashboard-topbar-actions">
            <button type="button" aria-label="Notificaciones">
              ♧
            </button>

            <button type="button" aria-label="Configuración">
              ⚙
            </button>

            <div className="dashboard-avatar">FIIS</div>
          </div>
        </header>

        <section className="dashboard-content">
          <div className="dashboard-page-header">
            <div>
              <h1>Análisis de Datos de Investigación - FIIS</h1>
              <p>
                Indicadores estratégicos para evaluar proyectos, trámites y
                desempeño institucional.
              </p>
            </div>

            <div className="dashboard-header-actions">
              <button type="button" className="dashboard-period-button">
                <span>▣</span>
                {analytics.period}
                <span>⌄</span>
              </button>

              <button type="button" className="dashboard-primary-button">
                ⌁ Exportar análisis
              </button>
            </div>
          </div>

          <section className="dashboard-metrics-grid">
            {analytics.metrics.map((metric) => (
              <article
                key={metric.id}
                className={`dashboard-metric-card metric-${metric.tone}`}
              >
                <div className="metric-card-top">
                  <div className="metric-card-icon">▥</div>
                </div>

                <div>
                  <p>{metric.title}</p>
                  <strong>{metric.value}</strong>
                  <small className="analytics-detail">{metric.detail}</small>
                </div>
              </article>
            ))}
          </section>

          <section className="analytics-grid">
            <section className="dashboard-panel analytics-panel">
              <div className="dashboard-panel-header">
                <h2>Distribución de proyectos por estado</h2>
                <button type="button" aria-label="Más opciones">
                  ⋮
                </button>
              </div>

              <div className="analytics-bar-list">
                {analytics.projectStatus.map((item) => (
                  <article key={item.id} className="analytics-bar-row">
                    <div>
                      <strong>{item.label}</strong>
                      <span>
                        {item.value} {item.detail}
                      </span>
                    </div>

                    <div className="analytics-track">
                      <span style={{ width: `${item.percentage}%` }} />
                    </div>

                    <b>{item.percentage}%</b>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-panel analytics-panel">
              <div className="dashboard-panel-header">
                <h2>Desempeño por grupo de investigación</h2>
                <button type="button" aria-label="Más opciones">
                  ⋮
                </button>
              </div>

              <div className="analytics-bar-list">
                {analytics.groupPerformance.map((item) => (
                  <article key={item.id} className="analytics-bar-row">
                    <div>
                      <strong>{item.label}</strong>
                      <span>
                        {item.value} {item.detail}
                      </span>
                    </div>

                    <div className="analytics-track">
                      <span style={{ width: `${item.percentage}%` }} />
                    </div>

                    <b>{item.percentage}%</b>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <section className="dashboard-panel analytics-trend-panel">
            <div className="dashboard-panel-header">
              <h2>Tendencia mensual de actividad institucional</h2>
              <button type="button" aria-label="Más opciones">
                ⋮
              </button>
            </div>

            <div className="analytics-trend-chart">
              {analytics.monthlyTrend.map((item) => (
                <article key={item.month} className="analytics-trend-column">
                  <div className="analytics-trend-bars">
                    <span
                      title="Proyectos"
                      style={{
                        height: `${(item.projects / maxTrendValue) * 100}%`,
                      }}
                    />
                    <span
                      title="Trámites"
                      style={{
                        height: `${(item.procedures / maxTrendValue) * 100}%`,
                      }}
                    />
                    <span
                      title="Evaluaciones"
                      style={{
                        height: `${(item.evaluations / maxTrendValue) * 100}%`,
                      }}
                    />
                  </div>

                  <strong>{item.month}</strong>
                </article>
              ))}
            </div>

            <div className="analytics-legend">
              <span>
                <b className="legend-approved" />
                Proyectos
              </span>

              <span>
                <b className="legend-postulated" />
                Trámites
              </span>

              <span>
                <b className="legend-execution" />
                Evaluaciones
              </span>
            </div>
          </section>

          <section className="dashboard-panel analytics-insights-panel">
            <div className="dashboard-panel-header">
              <h2>Hallazgos principales</h2>
              <button type="button" aria-label="Más opciones">
                ⋮
              </button>
            </div>

            <div className="analytics-insights-list">
              {analytics.insights.map((insight, index) => (
                <article key={insight}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p>{insight}</p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <footer className="dashboard-footer">
          <span>
            © 2024 Oficina de Excelencia Académica e Investigación.
          </span>

          <div>
            <Link to="/">Privacidad</Link>
            <Link to="/">Términos de Uso</Link>
            <Link to="/">Contacto</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default AnalyticsDashboardPage;