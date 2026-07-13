import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  Users,
  GraduationCap,
  ClipboardCheck,
  AlertCircle,
  FileSearch,
  Inbox,
  X,
  BookOpen,
  Settings,
  LogOut,
  Megaphone,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
};

type NavGroup = {
  title: string;
  roles?: string[];
  items: NavItem[];
};

const navGroups: NavGroup[] = [
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
        label: 'Proyectos de Investigación',
        icon: <FileText size={20} />,
        path: '/projects',
        roles: ['DOCENTE_INVESTIGADOR', 'COORDINADOR_GRUPO', 'DIRECTOR_INVESTIGACION', 'DECANO', 'EVALUADOR'],
      },
      {
        id: 'thesis-plans',
        label: 'Planes de Tesis',
        icon: <GraduationCap size={20} />,
        path: '/thesis/plans',
        roles: ['ESTUDIANTE', 'COORDINADOR_GRUPO', 'DIRECTOR_INVESTIGACION', 'DECANO'],
      },
      {
        id: 'tramites',
        label: 'Trámites',
        icon: <Inbox size={20} />,
        path: '/tramites',
      },
      {
        id: 'observations',
        label: 'Mis Observaciones',
        icon: <AlertCircle size={20} />,
        path: '/observations/panel',
      },
      {
        id: 'decano-review',
        label: 'Consola Decanato',
        icon: <Scale size={20} />,
        path: '/decano/review',
        roles: ['DECANO'],
      },
      {
        id: 'convocatorias',
        label: 'Convocatorias',
        icon: <Megaphone size={20} />,
        path: '/convocatorias',
        roles: ['DIRECTOR_INVESTIGACION', 'ADMIN'],
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
      {
        id: 'director-evaluations',
        label: 'Monitoreo Evaluaciones',
        icon: <ClipboardCheck size={20} />,
        path: '/evaluations/director',
        roles: ['DIRECTOR_INVESTIGACION', 'ADMIN'],
      },
      {
        id: 'audit',
        label: 'Trazabilidad',
        icon: <ShieldCheck size={20} />,
        path: '/audit',
        roles: ['ADMIN', 'DIRECTOR_INVESTIGACION'],
      },
    ],
  },
  {
    title: 'Administración',
    roles: ['ADMIN'],
    items: [
      { id: 'activate', label: 'Activar Usuarios', icon: <Users size={20} />, path: '/admin/activate' },
      { id: 'users', label: 'Gestionar Usuarios', icon: <Users size={20} />, path: '/users' },
      { id: 'documents', label: 'Repositorio Docs', icon: <FileText size={20} />, path: '/documents' },
      { id: 'groups', label: 'Grupos Inv.', icon: <Users size={20} />, path: '/groups' },
      { id: 'lines', label: 'Líneas Inv.', icon: <BookOpen size={20} />, path: '/lines' },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, currentRole, logout } = React.useContext(AuthContext);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

  const isItemActive = (itemId: string, path: string): boolean => {
    if (itemId === 'proposals') {
      return location.pathname === '/projects' || location.pathname.startsWith('/projects/');
    }

    if (itemId === 'thesis-plans') {
      return location.pathname === '/thesis/plans' || location.pathname.startsWith('/thesis/plan/');
    }

    if (itemId === 'traceability') {
      return location.pathname.startsWith('/thesis/plan');
    }

    return location.pathname === path;
  };


  const getRoleLabel = (role: string | null): string => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'ESTUDIANTE':
        return 'Estudiante / Tesista';
      case 'DOCENTE_INVESTIGADOR':
        return 'Docente Investigador';
      case 'COORDINADOR_GRUPO':
        return 'Coordinador de Grupo';
      case 'DIRECTOR_INVESTIGACION':
        return 'Director de Investigación';
      case 'DECANO':
        return 'Decano';
      case 'EVALUADOR':
        return 'Evaluador';
      default:
        return 'Usuario';
    }
  };

  const getUserInitials = (): string => {
    if (!user) return 'US';

    const firstName = user.firstNames?.charAt(0) ?? '';
    const lastName = user.lastNames?.charAt(0) ?? '';
    const initials = `${firstName}${lastName}`.trim();

    return initials || 'US';
  };

  const getUserDisplayName = (): string => {
    if (!user) return 'Cargando...';

    if (user.firstNames) {
      return `${user.firstNames} ${user.lastNames ?? ''}`.trim();
    }

    return user.email || 'Usuario';
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
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
          {navGroups
            .filter((group) => {
              if (group.roles && currentRole) {
                return group.roles.includes(currentRole);
              }
              return true;
            })
            .map((group) => (
              <div key={group.title}>
                <h3 className="sidebar-group-title">
                  {group.title}
                </h3>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  {group.items
                    .filter((item) => {
                      if (item.roles && currentRole) {
                        return item.roles.includes(currentRole);
                      }
                      return true;
                    })
                    .map((item) => {
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

        <div className="sidebar-user-footer">
          {settingsMessage && (
            <div className="sidebar-settings-message">
              {settingsMessage}
            </div>
          )}

          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {getUserInitials()}
            </div>

            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {getUserDisplayName()}
              </div>
              <div className="sidebar-user-role">
                {getRoleLabel(currentRole)}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-action-button"
            onClick={() => {
              setSettingsMessage('Configuración general pendiente de integración.');
              setTimeout(() => setSettingsMessage(null), 3000);
            }}
          >
            <Settings size={19} />
            <span>Configuración</span>
          </button>

          <button
            type="button"
            className="sidebar-action-button danger"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut size={19} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="sgi-logout-overlay"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="sgi-logout-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sgi-logout-icon">
              <LogOut size={26} />
            </div>

            <h2 className="sgi-logout-title">
              ¿Cerrar sesión?
            </h2>

            <p className="sgi-logout-text">
              ¿Estás seguro de que deseas cerrar tu sesión actual?
            </p>

            <div className="sgi-logout-actions">
              <button
                type="button"
                className="sgi-modal-cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="sgi-modal-confirm"
                onClick={confirmLogout}
              >
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};