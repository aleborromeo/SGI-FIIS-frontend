import React from 'react';
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  History,
  Users,
  GraduationCap,
  ClipboardCheck,
  AlertCircle,
  FileSearch,
  X,
  BookOpen,
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const navGroups = [
  {
    title: 'Principal',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard size={20} />,
        path: '/dashboard',
      },
      {
        id: 'metrics',
        label: 'Métricas y Reportes',
        icon: <BarChart2 size={20} />,
        path: '/metrics',
      },
    ],
  },
  {
    title: 'Gestión Académica',
    items: [
      {
        id: 'proposals',
        label: 'Proyectos y Tesis',
        icon: <FileText size={20} />,
        path: '/projects',
      },
      {
        id: 'traceability',
        label: 'Trazabilidad',
        icon: <History size={20} />,
        path: '/thesis/plan/1',
      },
      {
        id: 'observations',
        label: 'Mis Observaciones',
        icon: <AlertCircle size={20} />,
        path: '/observations/panel',
      },
    ],
  },
  {
    title: 'Evaluación y Revisión',
    items: [
      {
        id: 'evaluations',
        label: 'Mis Evaluaciones',
        icon: <ClipboardCheck size={20} />,
        path: '/evaluations/my-evaluations',
      },
      {
        id: 'progress',
        label: 'Revisión Informes',
        icon: <FileSearch size={20} />,
        path: '/progressreports/review',
      },
    ],
  },
  {
    title: 'Administración',
    items: [
      {
        id: 'groups',
        label: 'Grupos Inv.',
        icon: <Users size={20} />,
        path: '/groups',
      },
      {
        id: 'lines',
        label: 'Líneas Inv.',
        icon: <BookOpen size={20} />,
        path: '/lines',
      },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();

  const isItemActive = (itemId: string, path: string): boolean => {
    if (itemId === 'proposals') {
      return location.pathname === '/projects' || location.pathname.startsWith('/projects/');
    }

    if (itemId === 'traceability') {
      return location.pathname.startsWith('/thesis/plan');
    }

    return location.pathname === path;
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-header">
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X size={24} />
          </button>

          <div className="sidebar-brand-content">
            <div className="sidebar-brand-icon">
              <GraduationCap size={28} strokeWidth={2.5} />
            </div>

            <div>
              <h1 className="sidebar-brand-title">
                Investigación
              </h1>

              <span className="sidebar-brand-subtitle">
                FIIS - UNAS
              </span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="sidebar-group-title">
                {group.title}
              </h3>

              <div className="sidebar-group-items">
                {group.items.map((item) => {
                  const isActive = isItemActive(item.id, item.path);

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={onClose}
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                    >
                      {item.icon}
                      <span className="text-body-md">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};