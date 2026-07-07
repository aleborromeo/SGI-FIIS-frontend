import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicationsData } from '../../services/dashboardService';
import type { PublicationsData } from '../../types/dashboard.types';
import '../../styles/dashboards.css';

function PublicationsDashboardPage() {
  const [publicationsData, setPublicationsData] =
    useState<PublicationsData | null>(null);

  useEffect(() => {
    getPublicationsData().then(setPublicationsData);
  }, []);

  if (!publicationsData) {
    return (
      <main className="dashboard-loading">
        Cargando publicaciones institucionales...
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

          <Link to="/dashboards/publicaciones" className="dashboard-nav-active">
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
            <Link to="/dashboards/publicaciones" className="topbar-active">
              Publicaciones
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
              <h1>Publicaciones Científicas - FIIS</h1>
              <p>
                Seguimiento de producción científica, indexación y estado
                editorial de artículos institucionales.
              </p>
            </div>

            <div className="dashboard-header-actions">
              <button type="button" className="dashboard-period-button">
                <span>▣</span>
                {publicationsData.period}
                <span>⌄</span>
              </button>

              <button type="button" className="dashboard-primary-button">
                ⌁ Registrar publicación
              </button>
            </div>
          </div>

          <section className="dashboard-metrics-grid">
            {publicationsData.metrics.map((metric) => (
              <article
                key={metric.id}
                className={`dashboard-metric-card metric-${metric.tone}`}
              >
                <div className="metric-card-top">
                  <div className="metric-card-icon">▣</div>
                </div>

                <div>
                  <p>{metric.title}</p>
                  <strong>{metric.value}</strong>
                  <small className="publications-detail">
                    {metric.detail}
                  </small>
                </div>
              </article>
            ))}
          </section>

          <section className="publications-grid">
            <section className="dashboard-panel publications-panel">
              <div className="dashboard-panel-header">
                <h2>Distribución por indexación</h2>
                <button type="button" aria-label="Más opciones">
                  ⋮
                </button>
              </div>

              <div className="publication-channel-list">
                {publicationsData.channels.map((channel) => (
                  <article key={channel.id} className="publication-channel-row">
                    <div>
                      <strong>{channel.label}</strong>
                      <span>{channel.value} publicaciones</span>
                    </div>

                    <div className="publication-track">
                      <span style={{ width: `${channel.percentage}%` }} />
                    </div>

                    <b>{channel.percentage}%</b>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-panel publications-panel">
              <div className="dashboard-panel-header">
                <h2>Resumen del periodo</h2>
                <button type="button" aria-label="Más opciones">
                  ⋮
                </button>
              </div>

              <div className="publication-summary-list">
                {publicationsData.summary.map((item, index) => (
                  <article key={item}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <p>{item}</p>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <section className="dashboard-panel publications-table-panel">
            <div className="publications-panel-header">
              <div>
                <h2>Publicaciones recientes</h2>
                <p>Listado de artículos registrados en el sistema.</p>
              </div>

              <div className="publications-filter-group">
                <button type="button" className="filter-active">
                  Todas
                </button>

                <button type="button">Publicadas</button>
                <button type="button">En revisión</button>
              </div>
            </div>

            <div className="publications-table-wrapper">
              <table className="publications-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Grupo</th>
                    <th>Indexación</th>
                    <th>Estado</th>
                    <th>Actualización</th>
                  </tr>
                </thead>

                <tbody>
                  {publicationsData.publications.map((publication) => (
                    <tr key={publication.id}>
                      <td>
                        <strong>{publication.title}</strong>
                        <p>
                          {publication.authors} · {publication.journal} ·{' '}
                          {publication.year}
                        </p>
                      </td>

                      <td>{publication.group}</td>

                      <td>
                        <span className="publication-index-badge">
                          {publication.indexation}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`publication-status publication-status-${publication.status}`}
                        >
                          {publication.status === 'publicada'
                            ? 'Publicada'
                            : publication.status === 'revision'
                              ? 'En revisión'
                              : 'Borrador'}
                        </span>
                      </td>

                      <td>{publication.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default PublicationsDashboardPage;