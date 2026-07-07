import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboards', label: 'Inicio', icon: '▦', end: true },
  { to: '/dashboards/tramites', label: 'Trámites', icon: '▤' },
  { to: '/dashboards/analisis', label: 'Análisis', icon: '▥' },
  { to: '/dashboards/investigadores', label: 'Investigadores', icon: '◎' },
  { to: '/dashboards/publicaciones', label: 'Publicaciones', icon: '▣' },
  { to: '/dashboards/financiamiento', label: 'Financiamiento', icon: '◉' },
  { to: '/dashboards/ranking', label: 'Ranking', icon: '★' },
  { to: '/dashboards/reportes', label: 'Reportes', icon: '▧' },
];

export function DashboardModuleNav() {
  return (
    <aside className="dash-sidebar">
      <div className="dash-brand">
        <div className="dash-brand-mark">SGI</div>
        <div>
          <strong>Panel FIIS</strong>
          <span>Investigación</span>
        </div>
      </div>

      <nav className="dash-nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              isActive ? 'dash-nav-link dash-nav-link-active' : 'dash-nav-link'
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}