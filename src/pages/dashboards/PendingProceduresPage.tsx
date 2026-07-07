import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardData } from '../../services/dashboardService';
import type {
  DashboardData,
  PendingProcedure,
} from '../../types/dashboard.types';
import '../../styles/dashboards.css';

type ProcedureFilter = 'todos' | 'postulacion' | 'informe' | 'tesis';

function PendingProceduresPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [activeFilter, setActiveFilter] = useState<ProcedureFilter>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcedure, setSelectedProcedure] =
    useState<PendingProcedure | null>(null);

  useEffect(() => {
    getDashboardData().then((data) => {
      setDashboard(data);
      setSelectedProcedure(data.pendingProcedures[0] ?? null);
    });
  }, []);

  const filteredProcedures = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return dashboard.pendingProcedures.filter((procedure) => {
      const matchesFilter =
        activeFilter === 'todos' || procedure.type === activeFilter;

      const normalizedSearch = searchTerm.toLowerCase().trim();

      const matchesSearch =
        normalizedSearch.length === 0 ||
        procedure.code.toLowerCase().includes(normalizedSearch) ||
        procedure.title.toLowerCase().includes(normalizedSearch) ||
        procedure.applicant.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [dashboard, activeFilter, searchTerm]);

  if (!dashboard) {
    return (
      <main className="dashboard-loading">
        Cargando bandeja de trámites...
      </main>
    );
  }

  const totalProcedures = dashboard.pendingProcedures.length;

  const postulationCount = dashboard.pendingProcedures.filter(
    (procedure) => procedure.type === 'postulacion',
  ).length;

  const reportCount = dashboard.pendingProcedures.filter(
    (procedure) => procedure.type === 'informe',
  ).length;

  const thesisCount = dashboard.pendingProcedures.filter(
    (procedure) => procedure.type === 'tesis',
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

          <Link to="/dashboards/tramites" className="dashboard-nav-active">
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
            <Link to="/dashboards">Dashboard</Link>
            <Link to="/dashboards">Facultades</Link>
            <Link to="/dashboards/investigadores">Investigadores</Link>
            <Link to="/dashboards">Proyectos</Link>
            <Link to="/dashboards/tramites" className="topbar-active">
              Trámites
            </Link>
          </nav>

          <div className="dashboard-topbar-actions">
            <button type="button" aria-label="Notificaciones">
              ♧
            </button>

            <button type="button" aria-label="Configuración">
              ⚙
            </button>

            <button type="button" className="dashboard-primary-button">
              Crear Expediente
            </button>
          </div>
        </header>

        <section className="dashboard-content">
          <div className="dashboard-page-header">
            <div>
              <h1>Bandeja de Trámites Pendientes</h1>
              <p>
                Revisión, trazabilidad y gestión de expedientes institucionales.
              </p>
            </div>

            <div className="procedure-search-group">
              <div className="procedure-search-box">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Buscar trámite..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />

                <span>≡</span>
              </div>

              <button type="button" className="procedure-alert-button">
                ♧
                <span />
              </button>
            </div>
          </div>

          <section className="procedure-summary-grid">
            <article className="procedure-summary-card">
              <strong>{String(totalProcedures).padStart(2, '0')}</strong>
              <span>Total pendientes</span>
              <p>trámites activos</p>
            </article>

            <article className="procedure-summary-card summary-danger">
              <strong>{String(postulationCount).padStart(2, '0')}</strong>
              <span>Postulaciones</span>
              <p>proyectos nuevos</p>
            </article>

            <article className="procedure-summary-card">
              <strong>{String(reportCount).padStart(2, '0')}</strong>
              <span>Informes de avance</span>
              <p>en revisión</p>
            </article>

            <article className="procedure-summary-card">
              <strong>{String(thesisCount).padStart(2, '0')}</strong>
              <span>Planes de tesis</span>
              <p>por aprobar</p>
            </article>
          </section>

          <section className="procedure-workspace">
            <section className="dashboard-panel procedure-list-panel">
              <div className="procedure-tabs">
                <button
                  type="button"
                  className={activeFilter === 'todos' ? 'tab-active' : ''}
                  onClick={() => setActiveFilter('todos')}
                >
                  Todos ({totalProcedures})
                </button>

                <button
                  type="button"
                  className={activeFilter === 'postulacion' ? 'tab-active' : ''}
                  onClick={() => setActiveFilter('postulacion')}
                >
                  Postulaciones ({postulationCount})
                </button>

                <button
                  type="button"
                  className={activeFilter === 'informe' ? 'tab-active' : ''}
                  onClick={() => setActiveFilter('informe')}
                >
                  Informes ({reportCount})
                </button>

                <button
                  type="button"
                  className={activeFilter === 'tesis' ? 'tab-active' : ''}
                  onClick={() => setActiveFilter('tesis')}
                >
                  Tesis ({thesisCount})
                </button>
              </div>

              <div className="procedure-list">
                {filteredProcedures.map((procedure) => (
                  <article
                    key={procedure.id}
                    className={
                      selectedProcedure?.id === procedure.id
                        ? 'procedure-card procedure-card-active'
                        : 'procedure-card'
                    }
                  >
                    <button
                      type="button"
                      className="procedure-card-main"
                      onClick={() => setSelectedProcedure(procedure)}
                    >
                      <div className="procedure-icon">▤</div>

                      <div>
                        <div className="procedure-card-header">
                          <h2>{procedure.applicant}</h2>

                          <span
                            className={
                              procedure.priority === 'alta'
                                ? 'procedure-status status-danger'
                                : 'procedure-status status-info'
                            }
                          >
                            {procedure.status}
                          </span>
                        </div>

                        <strong>{procedure.typeLabel}</strong>
                        <p>{procedure.title}</p>
                        <small>◷ {procedure.time}</small>
                      </div>
                    </button>

                    <div className="procedure-card-actions">
                      <button
                        type="button"
                        className="procedure-secondary-button"
                        onClick={() => setSelectedProcedure(procedure)}
                      >
                        ↺ Trazabilidad
                      </button>

                      <button type="button" className="procedure-primary-button">
                        Revisar y Decidir
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="dashboard-panel trace-panel">
              {selectedProcedure ? (
                <>
                  <header className="trace-panel-header">
                    <div>
                      <h2>Trazabilidad del Trámite</h2>
                      <p>Expediente: {selectedProcedure.code}</p>
                    </div>

                    <button type="button" aria-label="Cerrar detalle">
                      ×
                    </button>
                  </header>

                  <div className="trace-timeline">
                    <article className="trace-step trace-completed">
                      <span />

                      <div>
                        <h3>Postulación enviada</h3>
                        <p>♙ {selectedProcedure.applicant}</p>
                        <small>▣ Registro inicial del expediente</small>
                      </div>
                    </article>

                    <article className="trace-step trace-current">
                      <span />

                      <div>
                        <h3>Revisión Técnica</h3>
                        <p>▧ Coordinación de investigación</p>
                        <small>⌛ En proceso</small>
                      </div>
                    </article>

                    <article className="trace-step trace-pending">
                      <span />

                      <div>
                        <h3>Aprobación Final</h3>
                        <p>Pendiente de resolución técnica</p>
                      </div>
                    </article>
                  </div>

                  <button type="button" className="trace-close-button">
                    Cerrar Detalle
                  </button>
                </>
              ) : (
                <div className="trace-empty-state">
                  <h2>Detalle del trámite</h2>
                  <p>Selecciona un trámite para visualizar su trazabilidad.</p>
                </div>
              )}
            </aside>
          </section>
        </section>

        <footer className="dashboard-footer">
          <span>© 2024 Oficina de Excelencia Académica e Investigación.</span>

          <div>
            <Link to="/">Privacidad</Link>
            <Link to="/">Términos de Uso</Link>
            <Link to="/">Accesibilidad</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default PendingProceduresPage;
