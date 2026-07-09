import React from 'react';
import { LayoutDashboard, FileText, BarChart2, History, Settings, LogOut, Users, GraduationCap, ClipboardCheck, AlertCircle, FileSearch, X, BookOpen, Megaphone } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';

const navGroups = [
  {
    title: 'Principal',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
      { id: 'metrics', label: 'Métricas y Reportes', icon: <BarChart2 size={20} />, path: '/metrics' },
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
        id: 'observations',
        label: 'Mis Observaciones',
        icon: <AlertCircle size={20} />,
        path: '/observations/panel',
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
    ],
  },
  {
    title: 'Administración',
    roles: ['ADMIN'], // Only for admin
    items: [
      { id: 'activate', label: 'Activar Usuarios', icon: <Users size={20} />, path: '/admin/activate' },
      { id: 'users', label: 'Directorio', icon: <Users size={20} />, path: '/users' },
      { id: 'groups', label: 'Grupos Inv.', icon: <Users size={20} />, path: '/groups' },
      { id: 'lines', label: 'Líneas Inv.', icon: <BookOpen size={20} />, path: '/lines' },
    ]
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, currentRole, logout } = React.useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/');
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

  const isItemActive = (itemId: string, path: string): boolean => {
    if (itemId === 'proposals') {
      return location.pathname === '/projects' || location.pathname.startsWith('/projects/');
    }

    if (itemId === 'thesis-plans') {
      return location.pathname === '/thesis/plans' || location.pathname.startsWith('/thesis/plan/');
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
        <div
          style={{
            padding: '28px 22px 20px',
            borderBottom: '1px solid var(--outline-variant)',
            position: 'relative',
          }}
        >
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X size={24} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 32, 69, 0.15)'
            }}>
              <GraduationCap size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-title-lg" style={{ color: 'var(--on-surface)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                Investigación
              </h1>
              <span className="text-caption" style={{ color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                FIIS - UNAS
              </span>
            </div>
          </div>
        </div>

        <nav
          style={{
            flex: 1,
            padding: '22px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            overflowY: 'auto',
          }}
        >
          {navGroups
            .filter((group) => {
              if (group.roles && currentRole) {
                return group.roles.includes(currentRole);
              }
              return true;
            })
            .map((group) => (
            <div key={group.title}>
              <h3
                className="text-caption"
                style={{
                  paddingLeft: '14px',
                  marginBottom: '8px',
                  color: 'var(--on-surface-variant)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
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
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                        backgroundColor: isActive ? 'var(--primary-fixed)' : 'transparent',
                        textDecoration: 'none',
                        fontWeight: isActive ? 700 : 500,
                        transition: 'all 0.18s ease-in-out',
                      }}
                      onMouseEnter={(event) => {
                        if (!isActive) {
                          event.currentTarget.style.backgroundColor = 'var(--surface-container-low)';
                          event.currentTarget.style.color = 'var(--on-surface)';
                        }
                      }}
                      onMouseLeave={(event) => {
                        if (!isActive) {
                          event.currentTarget.style.backgroundColor = 'transparent';
                          event.currentTarget.style.color = 'var(--on-surface-variant)';
                        }
                      }}
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

        <div
          style={{
            borderTop: '1px solid var(--outline-variant)',
            backgroundColor: 'var(--surface-container-low)',
            padding: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px',
              marginBottom: '14px',
              backgroundColor: 'var(--surface-container-lowest)',
              border: '1px solid var(--outline-variant)',
              borderRadius: '14px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {getUserInitials()}
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div
                className="text-label-md"
                style={{
                  color: 'var(--on-surface)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  fontWeight: 800,
                }}
              >
                {getUserDisplayName()}
              </div>

              <div
                className="text-caption"
                style={{ color: 'var(--on-surface-variant)' }}
              >
                {getRoleLabel(currentRole)}
              </div>
            </div>
          </div>

          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              color: 'var(--on-surface-variant)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '12px',
              width: '100%',
              marginBottom: '4px',
              textAlign: 'left',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = 'var(--surface-container-highest)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Settings size={20} />
            <span className="text-body-md" style={{ fontWeight: 500 }}>
              Configuración
            </span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              color: 'var(--error)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '12px',
              width: '100%',
              textAlign: 'left',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = '#fee2e2';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={20} />
            <span className="text-body-md" style={{ fontWeight: 600 }}>
              Cerrar sesión
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};