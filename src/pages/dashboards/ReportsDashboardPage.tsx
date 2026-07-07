import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getReportsData } from '../../services/dashboardService';
import type { ReportsData } from '../../types/dashboard.types';
import '../../styles/dashboards.css';

function ReportsDashboardPage() {
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);

  useEffect(() => {
    getReportsData().then(setReportsData);
  }, []);

  if (!reportsData) {
    return (
      <main className="dashboard-loading">
        Cargando reportes institucionales...
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

          <Link to="/dashboards/analisis">
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

          <Link to="/dashboards/reportes" className="dashboard-nav-active">
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
            <Link to="/dashboards/reportes" className="topbar-active">
              Reportes
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
              <h1>Reportes Institucionales de Investigación - FIIS</h1>
              <p>
                Consulta, consolida y exporta reportes de proyectos,
                evaluaciones y trámites institucionales.
              </p>
            </div>

            <div className="dashboard-header-actions">
              <button type="button" className="dashboard-period-button">
                <span>▣</span>
                {reportsData.period}
                <span>⌄</span>
              </button>

              <button type="button" className="dashboard-primary-button">
                ⌁ Generar reporte
              </button>
            </div>
          </div>

          <section className="dashboard-metrics-grid">
            {reportsData.metrics.map((metric) => (
              <article
                key={metric.id}
                className={`dashboard-metric-card metric-${metric.tone}`}
              >
                <div className="metric-card-top">
                  <div className="metric-card-icon">▧</div>
                </div>

                <div>
                  <p>{metric.title}</p>
                  <strong>{metric.value}</strong>
                  <small className="reports-detail">{metric.detail}</small>
                </div>
              </article>
            ))}
          </section>

          <section className="dashboard-panel reports-panel">
            <div className="reports-panel-header">
              <div>
                <h2>Reportes disponibles</h2>
                <p>
                  Selecciona un reporte para revisar su información o preparar
                  una exportación.
                </p>
              </div>

              <div className="reports-filter-group">
                <button type="button" className="filter-active">
                  Todos
                </button>

                <button type="button">PDF</button>
                <button type="button">Excel</button>
              </div>
            </div>

            <div className="reports-list">
              {reportsData.reports.map((report) => (
                <article key={report.id} className="report-card">
                  <div className="report-format">{report.format}</div>

                  <div className="report-content">
                    <h3>{report.title}</h3>
                    <p>{report.description}</p>

                    <div className="report-meta">
                      <span>{report.updatedAt}</span>

                      <span
                        className={
                          report.status === 'disponible'
                            ? 'report-status status-ready'
                            : 'report-status status-pending'
                        }
                      >
                        {report.status === 'disponible'
                          ? 'Disponible'
                          : 'Pendiente'}
                      </span>
                    </div>
                  </div>

                  <div className="report-actions">
                    <button type="button" className="report-secondary-button">
                      Ver detalle
                    </button>

                    <button
                      type="button"
                      className="report-primary-button"
                      disabled={report.status === 'pendiente'}
                    >
                      Exportar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-panel reports-summary-panel">
            <div className="reports-panel-header">
              <div>
                <h2>Resumen ejecutivo</h2>
                <p>Lectura rápida del periodo actual.</p>
              </div>
            </div>

            <div className="reports-summary-content">
              <p>{reportsData.summary}</p>
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

export default ReportsDashboardPage;