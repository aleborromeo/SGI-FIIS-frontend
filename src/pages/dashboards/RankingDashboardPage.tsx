import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRankingData } from '../../services/dashboardService';
import type { RankingData } from '../../types/dashboard.types';
import '../../styles/dashboards.css';

function RankingDashboardPage() {
  const [rankingData, setRankingData] = useState<RankingData | null>(null);

  useEffect(() => {
    getRankingData().then(setRankingData);
  }, []);

  if (!rankingData) {
    return (
      <main className="dashboard-loading">
        Cargando ranking institucional...
      </main>
    );
  }

  const podium = rankingData.researchers.slice(0, 3);
  const remainingResearchers = rankingData.researchers.slice(3);

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

          <Link to="/dashboards/ranking" className="dashboard-nav-active">
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
            <Link to="/dashboards/ranking" className="topbar-active">
              Ranking
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
              <h1>Ranking Institucional de Investigación - FIIS</h1>
              <p>
                Clasificación de investigadores y grupos según producción,
                participación y desempeño investigativo.
              </p>
            </div>

            <div className="dashboard-header-actions">
              <button type="button" className="dashboard-period-button">
                <span>▣</span>
                {rankingData.period}
                <span>⌄</span>
              </button>

              <button type="button" className="dashboard-primary-button">
                ⌁ Actualizar ranking
              </button>
            </div>
          </div>

          <section className="dashboard-metrics-grid">
            {rankingData.metrics.map((metric) => (
              <article
                key={metric.id}
                className={`dashboard-metric-card metric-${metric.tone}`}
              >
                <div className="metric-card-top">
                  <div className="metric-card-icon">★</div>
                </div>

                <div>
                  <p>{metric.title}</p>
                  <strong>{metric.value}</strong>
                  <small className="ranking-detail">{metric.detail}</small>
                </div>
              </article>
            ))}
          </section>

          <section className="ranking-grid">
            <section className="dashboard-panel ranking-podium-panel">
              <div className="dashboard-panel-header">
                <h2>Top investigadores del periodo</h2>
                <button type="button" aria-label="Más opciones">
                  ⋮
                </button>
              </div>

              <div className="ranking-podium-list">
                {podium.map((researcher) => (
                  <article
                    key={researcher.id}
                    className={`ranking-podium-card podium-${researcher.position}`}
                  >
                    <div className="ranking-position">
                      #{researcher.position}
                    </div>

                    <div className="ranking-avatar">
                      {researcher.name
                        .split(' ')
                        .slice(0, 2)
                        .map((word) => word.charAt(0))
                        .join('')}
                    </div>

                    <h3>{researcher.name}</h3>
                    <p>{researcher.group}</p>

                    <strong>{researcher.score} pts</strong>

                    <div className="ranking-podium-meta">
                      <span>{researcher.projects} proyectos</span>
                      <span>{researcher.publications} publicaciones</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-panel ranking-criteria-panel">
              <div className="dashboard-panel-header">
                <h2>Criterios de evaluación</h2>
                <button type="button" aria-label="Más opciones">
                  ⋮
                </button>
              </div>

              <div className="ranking-criteria-list">
                {rankingData.criteria.map((criterion) => (
                  <article key={criterion.id}>
                    <div>
                      <h3>{criterion.title}</h3>
                      <p>{criterion.description}</p>
                    </div>

                    <strong>{criterion.weight}</strong>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <section className="dashboard-panel ranking-table-panel">
            <div className="ranking-panel-header">
              <div>
                <h2>Ranking de investigadores</h2>
                <p>Detalle de puntaje, proyectos y publicaciones registradas.</p>
              </div>

              <div className="ranking-filter-group">
                <button type="button" className="filter-active">
                  General
                </button>

                <button type="button">Docentes</button>
                <button type="button">Grupos</button>
              </div>
            </div>

            <div className="ranking-table-wrapper">
              <table className="ranking-table">
                <thead>
                  <tr>
                    <th>Posición</th>
                    <th>Investigador</th>
                    <th>Grupo</th>
                    <th>Proyectos</th>
                    <th>Publicaciones</th>
                    <th>Puntaje</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {rankingData.researchers.map((researcher) => (
                    <tr key={researcher.id}>
                      <td>
                        <strong>#{researcher.position}</strong>
                      </td>

                      <td>
                        <strong>{researcher.name}</strong>
                        <p>Investigador FIIS</p>
                      </td>

                      <td>{researcher.group}</td>
                      <td>{researcher.projects}</td>
                      <td>{researcher.publications}</td>

                      <td>
                        <span className="ranking-score">
                          {researcher.score}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`ranking-status ranking-status-${researcher.status}`}
                        >
                          {researcher.status === 'destacado'
                            ? 'Destacado'
                            : researcher.status === 'activo'
                              ? 'Activo'
                              : 'Seguimiento'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="ranking-bottom-grid">
            <section className="dashboard-panel ranking-groups-panel">
              <div className="dashboard-panel-header">
                <h2>Ranking por grupo de investigación</h2>
                <button type="button" aria-label="Más opciones">
                  ⋮
                </button>
              </div>

              <div className="ranking-group-list">
                {rankingData.groups.map((group) => (
                  <article key={group.id} className="ranking-group-card">
                    <div className="ranking-group-header">
                      <div>
                        <strong>
                          #{group.position} {group.name}
                        </strong>
                        <p>
                          {group.projects} proyectos · {group.publications}{' '}
                          publicaciones
                        </p>
                      </div>

                      <b>{group.score} pts</b>
                    </div>

                    <div className="ranking-group-track">
                      <span style={{ width: `${group.participation}%` }} />
                    </div>

                    <div className="ranking-group-footer">
                      <span>Participación institucional</span>
                      <strong>{group.participation}%</strong>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-panel ranking-follow-panel">
              <div className="dashboard-panel-header">
                <h2>Seguimiento académico</h2>
                <button type="button" aria-label="Más opciones">
                  ⋮
                </button>
              </div>

              <div className="ranking-follow-list">
                {remainingResearchers.map((researcher) => (
                  <article key={researcher.id}>
                    <span>#{researcher.position}</span>

                    <div>
                      <h3>{researcher.name}</h3>
                      <p>
                        {researcher.group} · {researcher.score} pts
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
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

export default RankingDashboardPage;