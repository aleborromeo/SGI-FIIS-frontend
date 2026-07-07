import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getResearchersData } from '../../services/dashboardService';
import type {
  ResearcherItem,
  ResearchersData,
} from '../../types/dashboard.types';
import '../../styles/dashboards.css';

type ResearcherFilter = 'todos' | 'destacado' | 'activo' | 'seguimiento';

function ResearchersDashboardPage() {
  const [researchersData, setResearchersData] =
    useState<ResearchersData | null>(null);
  const [activeFilter, setActiveFilter] = useState<ResearcherFilter>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResearcher, setSelectedResearcher] =
    useState<ResearcherItem | null>(null);

  useEffect(() => {
    getResearchersData().then((data) => {
      setResearchersData(data);
      setSelectedResearcher(data.researchers[0] ?? null);
    });
  }, []);

  const filteredResearchers = useMemo(() => {
    if (!researchersData) {
      return [];
    }

    return researchersData.researchers.filter((researcher) => {
      const matchesFilter =
        activeFilter === 'todos' || researcher.status === activeFilter;

      const normalizedSearch = searchTerm.toLowerCase().trim();

      const matchesSearch =
        normalizedSearch.length === 0 ||
        researcher.name.toLowerCase().includes(normalizedSearch) ||
        researcher.group.toLowerCase().includes(normalizedSearch) ||
        researcher.email.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [researchersData, activeFilter, searchTerm]);

  if (!researchersData) {
    return (
      <main className="dashboard-loading">
        Cargando investigadores institucionales...
      </main>
    );
  }

  const featuredCount = researchersData.researchers.filter(
    (researcher) => researcher.status === 'destacado',
  ).length;

  const activeCount = researchersData.researchers.filter(
    (researcher) => researcher.status === 'activo',
  ).length;

  const followCount = researchersData.researchers.filter(
    (researcher) => researcher.status === 'seguimiento',
  ).length;

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

          <Link to="/dashboards/investigadores" className="dashboard-nav-active">
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
            <Link to="/dashboards/investigadores" className="topbar-active">
              Investigadores
            </Link>
            <Link to="/dashboards/publicaciones">Publicaciones</Link>
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
              <h1>Investigadores FIIS</h1>
              <p>
                Gestión, seguimiento y consulta de investigadores vinculados a
                grupos, proyectos y producción científica.
              </p>
            </div>

            <div className="dashboard-header-actions">
              <button type="button" className="dashboard-period-button">
                <span>▣</span>
                {researchersData.period}
                <span>⌄</span>
              </button>

              <button type="button" className="dashboard-primary-button">
                ⌁ Registrar investigador
              </button>
            </div>
          </div>

          <section className="dashboard-metrics-grid">
            {researchersData.metrics.map((metric) => (
              <article
                key={metric.id}
                className={`dashboard-metric-card metric-${metric.tone}`}
              >
                <div className="metric-card-top">
                  <div className="metric-card-icon">◎</div>
                </div>

                <div>
                  <p>{metric.title}</p>
                  <strong>{metric.value}</strong>
                  <small className="researchers-detail">
                    {metric.detail}
                  </small>
                </div>
              </article>
            ))}
          </section>

          <section className="researchers-grid">
            <section className="dashboard-panel researchers-list-panel">
              <div className="researchers-panel-header">
                <div>
                  <h2>Directorio de investigadores</h2>
                  <p>Consulta por nombre, grupo o correo institucional.</p>
                </div>

                <div className="researchers-search-box">
                  <span>⌕</span>

                  <input
                    type="text"
                    placeholder="Buscar investigador..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
              </div>

              <div className="researchers-tabs">
                <button
                  type="button"
                  className={activeFilter === 'todos' ? 'tab-active' : ''}
                  onClick={() => setActiveFilter('todos')}
                >
                  Todos ({researchersData.researchers.length})
                </button>

                <button
                  type="button"
                  className={activeFilter === 'destacado' ? 'tab-active' : ''}
                  onClick={() => setActiveFilter('destacado')}
                >
                  Destacados ({featuredCount})
                </button>

                <button
                  type="button"
                  className={activeFilter === 'activo' ? 'tab-active' : ''}
                  onClick={() => setActiveFilter('activo')}
                >
                  Activos ({activeCount})
                </button>

                <button
                  type="button"
                  className={activeFilter === 'seguimiento' ? 'tab-active' : ''}
                  onClick={() => setActiveFilter('seguimiento')}
                >
                  Seguimiento ({followCount})
                </button>
              </div>

              <div className="researchers-list">
                {filteredResearchers.map((researcher) => (
                  <article
                    key={researcher.id}
                    className={
                      selectedResearcher?.id === researcher.id
                        ? 'researcher-card researcher-card-active'
                        : 'researcher-card'
                    }
                  >
                    <button
                      type="button"
                      className="researcher-card-main"
                      onClick={() => setSelectedResearcher(researcher)}
                    >
                      <div className="researcher-avatar">
                        {researcher.name
                          .split(' ')
                          .slice(0, 2)
                          .map((word) => word.charAt(0))
                          .join('')}
                      </div>

                      <div>
                        <div className="researcher-card-header">
                          <h3>{researcher.name}</h3>

                          <span
                            className={`researcher-status researcher-status-${researcher.status}`}
                          >
                            {researcher.status === 'destacado'
                              ? 'Destacado'
                              : researcher.status === 'activo'
                                ? 'Activo'
                                : 'Seguimiento'}
                          </span>
                        </div>

                        <p>{researcher.role}</p>
                        <small>
                          {researcher.group} · {researcher.email}
                        </small>
                      </div>
                    </button>

                    <div className="researcher-card-meta">
                      <span>
                        <strong>{researcher.projects}</strong>
                        Proyectos
                      </span>

                      <span>
                        <strong>{researcher.publications}</strong>
                        Publicaciones
                      </span>

                      <span>
                        <strong>{researcher.score}</strong>
                        Puntaje
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="dashboard-panel researcher-detail-panel">
              {selectedResearcher ? (
                <>
                  <div className="researcher-detail-header">
                    <div className="researcher-detail-avatar">
                      {selectedResearcher.name
                        .split(' ')
                        .slice(0, 2)
                        .map((word) => word.charAt(0))
                        .join('')}
                    </div>

                    <h2>{selectedResearcher.name}</h2>
                    <p>{selectedResearcher.role}</p>

                    <span
                      className={`researcher-status researcher-status-${selectedResearcher.status}`}
                    >
                      {selectedResearcher.status === 'destacado'
                        ? 'Destacado'
                        : selectedResearcher.status === 'activo'
                          ? 'Activo'
                          : 'Seguimiento'}
                    </span>
                  </div>

                  <div className="researcher-detail-stats">
                    <article>
                      <strong>{selectedResearcher.projects}</strong>
                      <span>Proyectos</span>
                    </article>

                    <article>
                      <strong>{selectedResearcher.publications}</strong>
                      <span>Publicaciones</span>
                    </article>

                    <article>
                      <strong>{selectedResearcher.score}</strong>
                      <span>Puntaje</span>
                    </article>
                  </div>

                  <div className="researcher-detail-info">
                    <article>
                      <span>Grupo</span>
                      <strong>{selectedResearcher.group}</strong>
                    </article>

                    <article>
                      <span>Correo</span>
                      <strong>{selectedResearcher.email}</strong>
                    </article>
                  </div>

                  <button type="button" className="researcher-detail-button">
                    Ver perfil completo
                  </button>
                </>
              ) : (
                <div className="trace-empty-state">
                  <h2>Detalle del investigador</h2>
                  <p>Selecciona un investigador para visualizar su perfil.</p>
                </div>
              )}
            </aside>
          </section>

          <section className="researchers-bottom-grid">
            <section className="dashboard-panel researchers-distribution-panel">
              <div className="dashboard-panel-header">
                <h2>Distribución por grupo de investigación</h2>
                <button type="button" aria-label="Más opciones">
                  ⋮
                </button>
              </div>

              <div className="researchers-distribution-list">
                {researchersData.distribution.map((item) => (
                  <article key={item.id} className="researchers-distribution-row">
                    <div>
                      <strong>{item.group}</strong>
                      <span>{item.total} investigadores</span>
                    </div>

                    <div className="researchers-track">
                      <span style={{ width: `${item.percentage}%` }} />
                    </div>

                    <b>{item.percentage}%</b>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-panel researchers-summary-panel">
              <div className="dashboard-panel-header">
                <h2>Resumen institucional</h2>
                <button type="button" aria-label="Más opciones">
                  ⋮
                </button>
              </div>

              <div className="researchers-summary-list">
                {researchersData.summary.map((item, index) => (
                  <article key={item}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <p>{item}</p>
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

export default ResearchersDashboardPage;