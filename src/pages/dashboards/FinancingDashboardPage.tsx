import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFinancingData } from '../../services/dashboardService';
import type { FinancingData } from '../../types/dashboard.types';
import '../../styles/dashboards.css';

function FinancingDashboardPage() {
  const [financingData, setFinancingData] =
    useState<FinancingData | null>(null);

  useEffect(() => {
    getFinancingData().then(setFinancingData);
  }, []);

  if (!financingData) {
    return (
      <main className="dashboard-loading">
        Cargando financiamiento institucional...
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

          <Link
            to="/dashboards/financiamiento"
            className="dashboard-nav-active"
          >
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
            <Link to="/dashboards/financiamiento" className="topbar-active">
              Financiamiento
            </Link>
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
              <h1>Financiamiento de Investigación - FIIS</h1>
              <p>
                Seguimiento de fondos, convocatorias, presupuesto asignado y
                solicitudes de financiamiento institucional.
              </p>
            </div>

            <div className="dashboard-header-actions">
              <button type="button" className="dashboard-period-button">
                <span>▣</span>
                {financingData.period}
                <span>⌄</span>
              </button>

              <button type="button" className="dashboard-primary-button">
                ⌁ Nueva convocatoria
              </button>
            </div>
          </div>

          <section className="dashboard-metrics-grid">
            {financingData.metrics.map((metric) => (
              <article
                key={metric.id}
                className={`dashboard-metric-card metric-${metric.tone}`}
              >
                <div className="metric-card-top">
                  <div className="metric-card-icon">◉</div>
                </div>

                <div>
                  <p>{metric.title}</p>
                  <strong>{metric.value}</strong>
                  <small className="financing-detail">{metric.detail}</small>
                </div>
              </article>
            ))}
          </section>

          <section className="financing-grid">
            <section className="dashboard-panel financing-panel">
              <div className="dashboard-panel-header">
                <h2>Distribución de fondos</h2>
                <button type="button" aria-label="Más opciones">
                  ⋮
                </button>
              </div>

              <div className="funding-source-list">
                {financingData.sources.map((source) => (
                  <article key={source.id} className="funding-source-card">
                    <div className="funding-source-header">
                      <div>
                        <h3>{source.name}</h3>
                        <p>{source.description}</p>
                      </div>

                      <strong>{source.amount}</strong>
                    </div>

                    <div className="funding-track">
                      <span style={{ width: `${source.percentage}%` }} />
                    </div>

                    <div className="funding-source-footer">
                      <span>Participación del fondo</span>
                      <b>{source.percentage}%</b>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-panel financing-panel">
              <div className="dashboard-panel-header">
                <h2>Resumen presupuestal</h2>
                <button type="button" aria-label="Más opciones">
                  ⋮
                </button>
              </div>

              <div className="financing-summary-list">
                {financingData.summary.map((item, index) => (
                  <article key={item}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <p>{item}</p>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <section className="dashboard-panel financing-calls-panel">
            <div className="financing-panel-header">
              <div>
                <h2>Convocatorias de financiamiento</h2>
                <p>Estado de fondos concursables y programas activos.</p>
              </div>

              <div className="financing-filter-group">
                <button type="button" className="filter-active">
                  Todas
                </button>

                <button type="button">Abiertas</button>
                <button type="button">En evaluación</button>
              </div>
            </div>

            <div className="funding-call-list">
              {financingData.calls.map((call) => (
                <article key={call.id} className="funding-call-card">
                  <div className="funding-call-content">
                    <span>{call.code}</span>
                    <h3>{call.title}</h3>
                    <p>{call.deadline}</p>
                  </div>

                  <div className="funding-call-meta">
                    <div>
                      <span>Presupuesto</span>
                      <strong>{call.budget}</strong>
                    </div>

                    <div>
                      <span>Postulantes</span>
                      <strong>{call.applicants}</strong>
                    </div>

                    <span className={`funding-status status-${call.status}`}>
                      {call.status === 'abierta'
                        ? 'Abierta'
                        : call.status === 'evaluacion'
                          ? 'En evaluación'
                          : 'Cerrada'}
                    </span>
                  </div>

                  <button type="button" className="funding-detail-button">
                    Ver detalle
                  </button>
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

export default FinancingDashboardPage;