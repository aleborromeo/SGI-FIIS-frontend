import { Link } from 'react-router-dom';
import { DashboardModuleNav } from './DashboardModuleNav';
import '../../styles/dashboards.css';

interface DashboardPlaceholderPageProps {
  title: string;
  description: string;
  expectedEndpoint?: string;
}

export function DashboardPlaceholderPage({
  title,
  description,
  expectedEndpoint,
}: DashboardPlaceholderPageProps) {
  return (
    <div className="dash-layout">
      <DashboardModuleNav />

      <main className="dash-main">
        <header className="dash-header">
          <div>
            <p className="dash-eyebrow">Módulo en preparación</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          <div className="dash-header-actions">
            <Link to="/dashboards" className="dash-secondary-button">
              Volver al dashboard
            </Link>
          </div>
        </header>

        <section className="dash-card dash-placeholder-card">
          <span className="dash-placeholder-icon">◇</span>
          <h2>Pendiente de integración con backend</h2>
          <p>
            Esta vista no mostrará datos ficticios. Se conectará cuando el backend tenga
            un endpoint confirmado para este módulo.
          </p>

          {expectedEndpoint && (
            <code className="dash-endpoint-code">{expectedEndpoint}</code>
          )}
        </section>
      </main>
    </div>
  );
}