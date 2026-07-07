import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardData } from '../../services/dashboardService';
import type { DashboardData } from '../../types/dashboard.types';
import '../../styles/dashboards.css';

function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    getDashboardData().then(setDashboard);
  }, []);

  if (!dashboard) {
    return (
      <main className="dashboard-loading">
        Cargando dashboard institucional...
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
          <Link to="/dashboards" className="dashboard-nav-active">
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
            <Link to="/dashboards" className="topbar-active">
              Dashboard
            </Link>
            <Link to="/dashboards">Facultades</Link>
            <Link to="/dashboards/investigadores">Investigadores</Link>
            <Link to="/dashboards">Proyectos</Link>
            <Link to="/dashboards/tramites">Trámites</Link>
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
              <h1>Dashboard Institucional de Investigación - FIIS</h1>
              <p>Vista ejecutiva para la toma de decisiones estratégicas.</p>
            </div>

            <div className="dashboard-header-actions">
              <button type="button" className="dashboard-period-button">
                <span>▣</span>
                {dashboard.period}
                <span>⌄</span>
              </button>

              <button type="button" className="dashboard-primary-button">
                ⌁ Crear Convocatoria
              </button>
            </div>
          </div>

          <section className="dashboard-metrics-grid">
            {dashboard.metrics.map((metric) => (
              <article
                key={metric.id}
                className={`dashboard-metric-card metric-${metric.tone}`}
              >
                <div className="metric-card-top">
                  <div className="metric-card-icon">{metric.icon}</div>

                  {metric.detail && (
                    <span className="metric-card-detail">{metric.detail}</span>
                  )}
                </div>

                <div>
                  <p>{metric.title}</p>
                  <strong>{metric.value}</strong>
                </div>
              </article>
            ))}
          </section>

          <section className="dashboard-main-grid">
            <section className="dashboard-panel projects-panel">
              <div className="dashboard-panel-header">
                <h2>Estado de Proyectos por Grupo de Investigación</h2>
                <button type="button" aria-label="Más opciones">
                  ⋮
                </button>
              </div>

              <div className="research-group-list">
                {dashboard.groups.map((group) => (
                  <article key={group.id} className="research-group-card">
                    <div className="research-group-header">
                      <div>
                        <strong>{group.name}</strong>
                        <p>{group.description}</p>
                      </div>

                      <span>{group.totalProjects} Proyectos</span>
                    </div>

                    <div className="research-progress-bar">
                      <span
                        className="progress-postulated"
                        style={{ width: `${group.postulated}%` }}
                      />
                      <span
                        className="progress-approved"
                        style={{ width: `${group.approved}%` }}
                      />
                      <span
                        className="progress-execution"
                        style={{ width: `${group.execution}%` }}
                      />
                      <span
                        className="progress-observed"
                        style={{ width: `${group.observed}%` }}
                      />
                    </div>
                  </article>
                ))}
              </div>

              <div className="research-legend">
                <span>
                  <b className="legend-postulated" />
                  Postulado
                </span>
                <span>
                  <b className="legend-approved" />
                  Aprobado
                </span>
                <span>
                  <b className="legend-execution" />
                  Ejecución
                </span>
                <span>
                  <b className="legend-observed" />
                  Observado
                </span>
              </div>
            </section>

            <section className="dashboard-panel approval-panel">
              <div className="dashboard-panel-header">
                <h2>Flujo de Aprobación Global - 2026</h2>
              </div>

              <div className="approval-flow-list">
                {dashboard.approvalSteps.map((step, index) => (
                  <article
                    key={step.id}
                    className={`approval-flow-step approval-${step.tone}`}
                  >
                    <div className="approval-flow-box">
                      <span>{step.value}</span>

                      <div>
                        <strong>{step.title}</strong>
                        <p>{step.description}</p>
                      </div>

                      <b>
                        {step.tone === 'warning'
                          ? '!'
                          : step.tone === 'success'
                            ? '✓'
                            : '›'}
                      </b>
                    </div>

                    {index < dashboard.approvalSteps.length - 1 && (
                      <div className="approval-flow-arrow">⌄</div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </section>

          <section className="dashboard-panel pending-panel">
            <div className="pending-panel-header">
              <h2>Trámites Pendientes de Resolución</h2>

              <div>
                <span>Filtrar por:</span>
                <button type="button">
                  Más recientes
                  <span>⌄</span>
                </button>
              </div>
            </div>

            <div className="pending-table-wrapper">
              <table className="pending-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Proyecto</th>
                    <th>Solicitante</th>
                    <th>Revisión previa</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboard.pendingProcedures.map((procedure) => (
                    <tr key={procedure.id}>
                      <td>
                        <strong>{procedure.code}</strong>
                        {procedure.priority === 'alta' && (
                          <span className="priority-dot" />
                        )}
                      </td>

                      <td>
                        <strong>{procedure.title}</strong>
                        <p>{procedure.category}</p>
                      </td>

                      <td>
                        <div className="applicant-cell">
                          <span />
                          {procedure.applicant}
                        </div>
                      </td>

                      <td>
                        <span className="approved-badge">
                          ✓ Director aprobado
                        </span>
                      </td>

                      <td>
                        <button type="button" className="rd-button">
                          Emitir RD
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Link to="/dashboards/tramites" className="view-all-link">
              Ver todos los trámites pendientes
            </Link>
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

export default DashboardPage;