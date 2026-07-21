import React, { useState, useRef, useEffect } from 'react';
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
  CheckCircle,
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { AuthContext } from '../context/AuthContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

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

const getNavGroups = (t: (key: string) => string): NavGroup[] => [
  {
    title: t('navigation:groupPrincipal'),
    items: [
      {
        id: 'dashboard',
        label: t('navigation:dashboard'),
        icon: <LayoutDashboard size={20} />,
        path: '/dashboard',
      },
      {
        id: 'notifications',
        label: t('navigation:notifications'),
        icon: <Inbox size={20} />,
        path: '/notifications',
      },
      {
        id: 'metrics',
        label: t('navigation:sidebarMetrics'),
        icon: <BarChart2 size={20} />,
        path: '/metrics',
        roles: ['ADMIN', 'DIRECTOR_INVESTIGACION'],
      },
    ],
  },
  {
    title: t('navigation:groupGestionAcademica'),
    items: [
      {
        id: 'convocatorias-activas',
        label: t('navigation:convocatoriasVigentes'),
        icon: <Megaphone size={20} />,
        path: '/convocatorias/activas',
        roles: ['ESTUDIANTE', 'DOCENTE_INVESTIGADOR'],
      },
      {
        id: 'convocatorias',
        label: t('navigation:convocatorias'),
        icon: <Megaphone size={20} />,
        path: '/convocatorias',
        roles: ['DIRECTOR_INVESTIGACION'],
      },
      {
        id: 'proposals',
        label: t('navigation:projects'),
        icon: <FileText size={20} />,
        path: '/projects',
        roles: ['DOCENTE_INVESTIGADOR', 'COORDINADOR_GRUPO', 'DIRECTOR_INVESTIGACION', 'DECANO', 'EVALUADOR'],
      },
      {
        id: 'thesis-plans',
        label: t('navigation:sidebarThesisPlans'),
        icon: <GraduationCap size={20} />,
        path: '/thesis/plans',
        roles: ['ESTUDIANTE', 'COORDINADOR_GRUPO', 'DIRECTOR_INVESTIGACION', 'DECANO'],
      },
      {
        id: 'tramites',
        label: t('navigation:sidebarTramites'),
        icon: <Inbox size={20} />,
        path: '/tramites',
        roles: ['COORDINADOR_GRUPO', 'DIRECTOR_INVESTIGACION', 'DECANO', 'DOCENTE_INVESTIGADOR', 'ESTUDIANTE'],
      },
      {
        id: 'observations',
        label: t('navigation:sidebarMyObservations'),
        icon: <AlertCircle size={20} />,
        path: '/observations/panel',
        roles: ['ESTUDIANTE', 'DOCENTE_INVESTIGADOR'],
      },
      {
        id: 'progress-reports',
        label: t('navigation:sidebarMyReports'),
        icon: <FileSearch size={20} />,
        path: '/progressreports/history',
        roles: ['DOCENTE_INVESTIGADOR'],
      },
      {
        id: 'decano-review',
        label: t('navigation:sidebarDecanoReview'),
        icon: <Scale size={20} />,
        path: '/decano/review',
        roles: ['DECANO'],
      },
    ],
  },
  {
    title: t('navigation:groupEvaluacionRevision'),
    items: [
      {
        id: 'evaluations',
        label: t('navigation:sidebarMyEvaluations'),
        icon: <ClipboardCheck size={20} />,
        path: '/evaluations/my-evaluations',
        roles: ['EVALUADOR'],
      },
      {
        id: 'progress',
        label: t('navigation:sidebarReviewReports'),
        icon: <FileSearch size={20} />,
        path: '/progressreports/review',
        roles: ['COORDINADOR_GRUPO', 'DIRECTOR_INVESTIGACION'],
      },
      {
        id: 'director-evaluations',
        label: t('navigation:sidebarDirectorEvaluations'),
        icon: <ClipboardCheck size={20} />,
        path: '/evaluations/director',
        roles: ['DIRECTOR_INVESTIGACION'],
      },
      {
        id: 'assign-reviewers',
        label: t('navigation:sidebarAssignReviewers'),
        icon: <Users size={20} />,
        path: '/projects/assign',
        roles: ['DIRECTOR_INVESTIGACION'],
      },
      {
        id: 'audit',
        label: t('navigation:sidebarTraceability'),
        icon: <ShieldCheck size={20} />,
        path: '/audit',
        roles: ['ADMIN', 'DIRECTOR_INVESTIGACION', 'COORDINADOR_GRUPO'],
      },
    ],
  },

  {
    title: t('navigation:groupAdministracion'),
    roles: ['ADMIN'],
    items: [
      { id: 'create-user', label: t('navigation:sidebarAddUsers'), icon: <Users size={20} />, path: '/users/create' },
      { id: 'users', label: t('navigation:sidebarManageUsers'), icon: <Users size={20} />, path: '/users' },
      { id: 'admin-documents', label: t('navigation:sidebarDocumentRepo'), icon: <FileText size={20} />, path: '/admin/documents' },
      { id: 'groups', label: t('navigation:sidebarResearchGroups'), icon: <Users size={20} />, path: '/groups' },
      { id: 'lines', label: t('navigation:sidebarResearchLines'), icon: <BookOpen size={20} />, path: '/lines' },
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
  const { t } = useTranslation('navigation');
  const { user, currentRole, logout } = React.useContext(AuthContext);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement;
    const sidebar = sidebarRef.current;

    const focusableElements = sidebar?.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])',
    );
    const firstFocusable = focusableElements?.[0];
    const lastFocusable = focusableElements?.[focusableElements.length - 1];

    firstFocusable?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  const navGroups = getNavGroups(t);

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

    if (itemId === 'convocatorias-activas') {
      return location.pathname === '/convocatorias/activas';
    }

    return location.pathname === path;
  };


  const getRoleLabel = (role: string | null): string => {
    switch (role) {
      case 'ADMIN':
        return t('navigation:roleAdmin');
      case 'ESTUDIANTE':
        return t('navigation:roleEstudiante');
      case 'DOCENTE_INVESTIGADOR':
        return t('navigation:roleDocente');
      case 'COORDINADOR_GRUPO':
        return t('navigation:roleCoordinador');
      case 'DIRECTOR_INVESTIGACION':
        return t('navigation:roleDirector');
      case 'DECANO':
        return t('navigation:roleDecano');
      case 'EVALUADOR':
        return t('navigation:roleEvaluador');
      default:
        return t('navigation:roleUsuario');
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

      <aside ref={sidebarRef} className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-header">
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label={t('navigation:sidebarCloseMenu')}
          >
            <X size={24} />
          </button>

          <div className="sidebar-brand-content">
            <div className="sidebar-brand-icon">
              <GraduationCap size={28} strokeWidth={2.5} />
            </div>

            <div>
              <h1 className="sidebar-brand-title">
                {t('navigation:sidebarInvestigacion')}
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
            .map((group) => {
              const visibleItems = group.items.filter((item) => {
                if (item.roles && currentRole) {
                  return item.roles.includes(currentRole);
                }
                return true;
              });

              if (visibleItems.length === 0) {
                return null;
              }

              return (
                <div key={group.title}>
                  <h3 className="sidebar-group-title">
                    {group.title}
                  </h3>
                  <div className="sidebar-group-items">
                    {visibleItems.map((item) => {
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
              );
            })}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              className="sidebar-action-button"
              onClick={() => {
                setSettingsMessage(t('navigation:sidebarSettingsPending'));
                setTimeout(() => setSettingsMessage(null), 3000);
              }}
            >
              <Settings size={19} />
              <span>{t('navigation:settings')}</span>
            </button>

            <button
              type="button"
              className="sidebar-action-button danger"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut size={19} />
              <span>{t('navigation:sidebarCloseSession')}</span>
            </button>

            <div className="sidebar-language-row">
              <span className="sidebar-language-row-label">
                Idioma / Language
              </span>
              <LanguageSwitcher variant="button" className="sidebar-language-switcher sidebar-language-switcher--compact" />
            </div>
          </div>
        </div>
      </aside>

      {showLogoutConfirm && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
        <dialog
          open
          className="sgi-logout-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLogoutConfirm(false);
          }}
          onClose={() => setShowLogoutConfirm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            maxWidth: 'none',
            maxHeight: 'none',
            margin: 0,
            padding: 0,
            border: 'none',
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'inherit',
          }}
        >
          <div className="sgi-logout-modal">
            <div className="sgi-logout-icon">
              <LogOut size={26} />
            </div>

            <h2 className="sgi-logout-title">
              {t('navigation:sidebarCloseSession')}?
            </h2>

            <p className="sgi-logout-text">
              {t('navigation:sidebarCloseSessionConfirm')}
            </p>

            <div className="sgi-logout-actions">
              <button
                type="button"
                className="sgi-modal-cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                {t('common:cancel')}
              </button>

              <button
                type="button"
                className="sgi-modal-confirm"
                onClick={confirmLogout}
              >
                {t('navigation:sidebarYesCloseSession')}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
};

