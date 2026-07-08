import { useContext, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart2,
  BookOpen,
  Building,
  Building2,
  Calendar,
  CheckCircle,
  ClipboardList,
  FileText,
  FolderOpen,
  GraduationCap,
  Megaphone,
  Microscope,
  PenTool,
  RefreshCw,
  Scale,
  ScrollText,
  Users,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

import { AuthContext } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Spinner } from '../../components/common/Spinner';
import './RoleDashboards.css';

import type {
  AlertItem,
  DashboardAdminResponse,
  DashboardStudentResponse,
  DashboardCoordinatorResponse,
  DashboardTeacherResponse,
  DashboardDirectorResponse,
  DashboardDeanResponse,
  DashboardEvaluatorResponse,
} from '../../types/auth';

type DashboardResponse =
  | DashboardAdminResponse
  | DashboardStudentResponse
  | DashboardCoordinatorResponse
  | DashboardTeacherResponse
  | DashboardDirectorResponse
  | DashboardDeanResponse
  | DashboardEvaluatorResponse;

type MetricTone = 'blue' | 'green' | 'purple' | 'orange' | 'gray';

interface MetricCardProps {
  icon: LucideIcon;
  value: number | string | null | undefined;
  label: string;
  sublabel: ReactNode;
  tone: MetricTone;
}

interface ProgressItem {
  label: string;
  value: number | null | undefined;
  total?: number;
  tone: MetricTone;
}

interface DashboardLayoutProps {
  viewClassName: string;
  title: string;
  subtitle: ReactNode;
  metrics: MetricCardProps[];
  leftTitle: string;
  leftContent: ReactNode;
  alertsTitle: string;
  alerts?: AlertItem[];
}

interface QuickAction {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: MetricTone;
}

function getQuickActions(role: string | null): QuickAction[] {
  switch (role) {
    case 'ADMIN':
      return [
        {
          to: '/projects',
          label: 'Gestionar proyectos',
          description: 'Consultar proyectos registrados y su estado actual.',
          icon: FileText,
          tone: 'blue',
        },
        {
          to: '/projects/assign',
          label: 'Asignar revisores',
          description: 'Derivar proyectos o trámites para evaluación.',
          icon: ClipboardList,
          tone: 'purple',
        },
        {
          to: '/progressreports/review',
          label: 'Revisar informes',
          description: 'Supervisar informes de avance pendientes.',
          icon: BarChart2,
          tone: 'orange',
        },
        {
          to: '/projects/audit',
          label: 'Auditoría de proyectos',
          description: 'Revisar trazabilidad y cambios del proceso.',
          icon: Scale,
          tone: 'green',
        },
      ];

    case 'EVALUADOR':
      return [
        {
          to: '/evaluations/my-evaluations',
          label: 'Mis evaluaciones',
          description: 'Revisar evaluaciones asignadas y pendientes.',
          icon: ClipboardList,
          tone: 'blue',
        },
        {
          to: '/projects/evaluate',
          label: 'Evaluar proyecto',
          description: 'Registrar resultado, puntaje u observaciones.',
          icon: CheckCircle,
          tone: 'green',
        },
        {
          to: '/observations/panel',
          label: 'Observaciones',
          description: 'Consultar observaciones realizadas o recibidas.',
          icon: AlertTriangle,
          tone: 'orange',
        },
      ];

    case 'DOCENTE_INVESTIGADOR':
      return [
        {
          to: '/projects',
          label: 'Mis proyectos',
          description: 'Consultar proyectos donde participa como responsable o integrante.',
          icon: Microscope,
          tone: 'blue',
        },
        {
          to: '/projects/new',
          label: 'Nueva propuesta',
          description: 'Registrar una nueva propuesta de investigación.',
          icon: FileText,
          tone: 'green',
        },
        {
          to: '/observations/panel',
          label: 'Mis observaciones',
          description: 'Revisar observaciones asociadas a sus trámites.',
          icon: AlertTriangle,
          tone: 'orange',
        },
      ];

    case 'COORDINADOR_GRUPO':
      return [
        {
          to: '/projects',
          label: 'Proyectos del grupo',
          description: 'Supervisar proyectos vinculados al grupo de investigación.',
          icon: Building,
          tone: 'blue',
        },
        {
          to: '/progressreports/review',
          label: 'Informes del grupo',
          description: 'Revisar avances e información enviada por integrantes.',
          icon: BookOpen,
          tone: 'purple',
        },
        {
          to: '/observations/panel',
          label: 'Observaciones',
          description: 'Atender observaciones de trámites del grupo.',
          icon: AlertTriangle,
          tone: 'orange',
        },
      ];

    case 'DIRECTOR_INVESTIGACION':
    case 'DECANO':
      return [
        {
          to: '/projects',
          label: 'Proyectos institucionales',
          description: 'Revisar proyectos registrados en la facultad.',
          icon: Building2,
          tone: 'blue',
        },
        {
          to: '/progressreports/review',
          label: 'Informes pendientes',
          description: 'Consultar informes que requieren revisión jerárquica.',
          icon: BarChart2,
          tone: 'orange',
        },
        {
          to: '/projects/audit',
          label: 'Trazabilidad',
          description: 'Ver seguimiento y auditoría de procesos.',
          icon: Scale,
          tone: 'green',
        },
      ];

    case 'ESTUDIANTE':
      return [
        {
          to: '/projects/new',
          label: 'Nueva propuesta',
          description: 'Iniciar el registro de una propuesta o trámite académico.',
          icon: GraduationCap,
          tone: 'blue',
        },
        {
          to: '/observations/panel',
          label: 'Mis observaciones',
          description: 'Consultar observaciones pendientes de atención.',
          icon: AlertTriangle,
          tone: 'orange',
        },
      ];

    default:
      return [
        {
          to: '/projects',
          label: 'Ver proyectos',
          description: 'Consultar información disponible del sistema.',
          icon: FolderOpen,
          tone: 'blue',
        },
      ];
  }
}

function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat('es-PE').format(Number(value ?? 0));
}

function safeValue(value: number | string | null | undefined): string {
  if (typeof value === 'number') return formatNumber(value);
  return value ?? '0';
}

function getTotal(values: Array<number | null | undefined>): number {
  const total = values.reduce<number>((sum, value) => {
    return sum + Number(value ?? 0);
  }, 0);

  return total > 0 ? total : 1;
}

function getPercent(value: number | null | undefined, total?: number): number {
  const numericValue = Number(value ?? 0);
  const numericTotal = Number(total ?? 0);

  if (numericValue <= 0 || numericTotal <= 0) return 0;

  return Math.min(100, Math.round((numericValue / numericTotal) * 100));
}

function translateAlertType(type: string): string {
  const normalized = type.toUpperCase();

  const dictionary: Record<string, string> = {
    REVIEW: 'Revisión',
    WARNING: 'Advertencia',
    ERROR: 'Error',
    INFO: 'Información',
    SUCCESS: 'Correcto',
  };

  return dictionary[normalized] ?? type;
}

function translateAlertTitle(title: string): string {
  const normalized = title.toLowerCase();

  if (normalized.includes('pending procedures')) return 'Trámites pendientes';
  if (normalized.includes('pending')) return 'Pendiente de atención';
  if (normalized.includes('review')) return 'Revisión pendiente';

  return title;
}

function translateAlertDescription(description: string): string {
  const translated = description
    .replace(/procedure\(s\)/gi, 'trámites')
    .replace(/procedures/gi, 'trámites')
    .replace(/procedure/gi, 'trámite')
    .replace(/unresolved/gi, 'sin resolver')
    .replace(/pending/gi, 'pendiente');

  return translated.replace(/^1 trámites/i, '1 trámite');
}

function QuickActionsSection() {
  const { currentRole } = useContext(AuthContext);
  const actions = getQuickActions(currentRole);

  return (
    <section className="quick-actions-section">
      <div className="quick-actions-header">
        <div>
          <h3>Accesos rápidos</h3>
          <p>Atajos operativos según tu rol dentro del sistema.</p>
        </div>
      </div>

      <div className="quick-actions-grid">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={`${action.to}-${action.label}`}
              to={action.to}
              className={`quick-action-card quick-action-${action.tone}`}
            >
              <span className="quick-action-icon">
                <Icon size={22} />
              </span>

              <div>
                <strong>{action.label}</strong>
                <p>{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function MetricCard({ icon: Icon, value, label, sublabel, tone }: MetricCardProps) {
  return (
    <div className={`metric-card bg-${tone}`}>
      <span className="metric-icon">
        <Icon size={28} />
      </span>

      <div className="metric-info">
        <span className="metric-value">{safeValue(value)}</span>
        <span className="metric-label">{label}</span>
        <span className="metric-sublabel">{sublabel}</span>
      </div>
    </div>
  );
}

function ProgressBars({ items }: { items: ProgressItem[] }) {
  return (
    <div className="chart-bars-container">
      {items.map((item) => (
        <div className="bar-wrapper" key={item.label}>
          <div className="bar-header">
            <span>{item.label}</span>
            <strong>{formatNumber(item.value)}</strong>
          </div>

          <div className="bar-bg">
            <div
              className={`bar-fill bg-${item.tone}-fill`}
              style={{ width: `${getPercent(item.value, item.total)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function AlertsList({ alerts }: { alerts?: AlertItem[] }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="empty-alerts">
        <span className="empty-icon">
          <CheckCircle size={32} color="#15803d" />
        </span>
        <p>No tiene notificaciones ni alertas pendientes en este momento.</p>
      </div>
    );
  }

  return (
    <div className="alerts-list">
      {alerts.map((alert, index) => (
        <div key={`${alert.type}-${index}`} className={`alert-card-item alert-type-${alert.type.toLowerCase()}`}>
          <div className="alert-item-header">
            <span className="alert-badge">{translateAlertType(alert.type)}</span>
            <h4 className="alert-item-title">{translateAlertTitle(alert.title)}</h4>
          </div>
          <p className="alert-item-desc">{translateAlertDescription(alert.description)}</p>
        </div>
      ))}
    </div>
  );
}

function DashboardLayout({
  viewClassName,
  title,
  subtitle,
  metrics,
  leftTitle,
  leftContent,
  alertsTitle,
  alerts,
}: DashboardLayoutProps) {
  return (
    <div className={`dashboard-view ${viewClassName}`}>
      <div className="view-header">
        <h2 className="view-title">{title}</h2>
        <p className="view-subtitle">{subtitle}</p>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="dashboard-details-split">
        <div className="details-section">
          <h3 className="section-title">{leftTitle}</h3>
          {leftContent}
        </div>

        <div className="alerts-section">
          <h3 className="section-title">{alertsTitle}</h3>
          <AlertsList alerts={alerts} />
        </div>
      </div>

      <QuickActionsSection />
    </div>
  );
}

export const RoleDashboards = () => {
  const { currentRole } = useContext(AuthContext);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchDashboardData() {
      setLoading(true);
      setError(null);

      try {
        const response = await authService.getDashboardData<DashboardResponse>();

        if (mounted) {
          setData(response);
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar la información del panel de control.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, [currentRole]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spinner size="large" color="#0b5ed7" />
        <p className="loading-text">Cargando datos del panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error-card">
        <span className="error-icon">
          <XCircle size={48} color="#991b1b" />
        </span>
        <h3 className="error-title">Error al cargar dashboard</h3>
        <p className="error-desc">{error}</p>
        <button onClick={() => window.location.reload()} className="error-retry-btn">
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="unsupported-role-view">
        <span className="unsupported-icon">
          <AlertTriangle size={48} color="#64748b" />
        </span>
        <h3>Sin información disponible</h3>
        <p>No se encontraron datos para construir el dashboard.</p>
      </div>
    );
  }

  function renderAdmin(adminData: DashboardAdminResponse) {
    const proceduresTotal = getTotal([
      adminData.proceduresUnderReview,
      adminData.approvedProcedures,
      adminData.pendingProcedures,
      adminData.rejectedProcedures,
    ]);

    return (
      <DashboardLayout
        viewClassName="admin-view"
        title="Consola de administración general"
        subtitle="Supervisión institucional global de usuarios, grupos, proyectos y trámites."
        metrics={[
          {
            icon: Users,
            value: adminData.totalUsers,
            label: 'Usuarios registrados',
            sublabel: `${formatNumber(adminData.totalActiveUsers)} activos en el sistema`,
            tone: 'blue',
          },
          {
            icon: Building,
            value: adminData.totalGroups,
            label: 'Grupos de investigación',
            sublabel: `${formatNumber(adminData.totalActiveGroups)} grupos activos`,
            tone: 'green',
          },
          {
            icon: FileText,
            value: adminData.totalProjects,
            label: 'Proyectos registrados',
            sublabel: `${formatNumber(adminData.activeProjects)} en ejecución activa`,
            tone: 'purple',
          },
          {
            icon: Scale,
            value: adminData.issuedResolutions,
            label: 'Resoluciones emitidas',
            sublabel: 'Historial de actos administrativos',
            tone: 'orange',
          },
        ]}
        leftTitle="Resumen de trámites del sistema"
        leftContent={
          <ProgressBars
            items={[
              {
                label: 'Trámites en revisión',
                value: adminData.proceduresUnderReview,
                total: proceduresTotal,
                tone: 'blue',
              },
              {
                label: 'Trámites aprobados',
                value: adminData.approvedProcedures,
                total: proceduresTotal,
                tone: 'green',
              },
              {
                label: 'Trámites pendientes o críticos',
                value: adminData.pendingProcedures,
                total: proceduresTotal,
                tone: 'orange',
              },
              {
                label: 'Trámites rechazados',
                value: adminData.rejectedProcedures,
                total: proceduresTotal,
                tone: 'gray',
              },
            ]}
          />
        }
        alertsTitle="Alertas del sistema"
        alerts={adminData.alerts}
      />
    );
  }

  function renderStudent(studentData: DashboardStudentResponse) {
    return (
      <DashboardLayout
        viewClassName="student-view"
        title="Portal del tesista / estudiante"
        subtitle="Monitoreo de planes de tesis, trámites y convocatorias académicas."
        metrics={[
          {
            icon: GraduationCap,
            value: studentData.submittedThesisPlans,
            label: 'Planes de tesis presentados',
            sublabel: <>Estado actual: <strong>{studentData.currentPlanStatus || 'Ninguno'}</strong></>,
            tone: 'blue',
          },
          {
            icon: RefreshCw,
            value: studentData.pendingProcedures,
            label: 'Trámites en curso',
            sublabel: 'Seguimiento en tiempo real',
            tone: 'orange',
          },
          {
            icon: FolderOpen,
            value: studentData.uploadedDocuments,
            label: 'Documentos subidos',
            sublabel: 'Archivos adjuntos en la plataforma',
            tone: 'purple',
          },
          {
            icon: Megaphone,
            value: studentData.openCallsForApplication,
            label: 'Convocatorias abiertas',
            sublabel: 'Oportunidades de investigación activas',
            tone: 'green',
          },
        ]}
        leftTitle="Información de afiliación"
        leftContent={
          <div className="affiliation-card">
            <div className="affiliation-header">
              <span className="affiliation-icon">
                <Building size={24} />
              </span>
              <div>
                <h4>{studentData.groupName || 'Sin grupo asignado'}</h4>
                <p>
                  Código del grupo: <strong>{studentData.groupCode || 'N/A'}</strong>
                </p>
              </div>
            </div>
            <p className="affiliation-body">
              Los trámites y planes de tesis se derivan al coordinador del grupo de
              investigación para su revisión inicial cuando corresponde.
            </p>
          </div>
        }
        alertsTitle="Mis notificaciones"
        alerts={studentData.alerts}
      />
    );
  }

  function renderTeacher(teacherData: DashboardTeacherResponse) {
    const projectsTotal = getTotal([
      teacherData.projectsAsLead,
      teacherData.projectsAsMember,
    ]);

    return (
      <DashboardLayout
        viewClassName="teacher-view"
        title="Portal del docente investigador"
        subtitle="Gestión de proyectos, informes de avance y resoluciones vinculadas."
        metrics={[
          {
            icon: Microscope,
            value: teacherData.projectsAsLead,
            label: 'Proyectos como responsable',
            sublabel: 'Liderando equipo de investigación',
            tone: 'blue',
          },
          {
            icon: Users,
            value: teacherData.projectsAsMember,
            label: 'Proyectos como integrante',
            sublabel: 'Miembro de equipo científico',
            tone: 'purple',
          },
          {
            icon: BarChart2,
            value: teacherData.pendingProgressReports,
            label: 'Informes de avance pendientes',
            sublabel: 'Requisito para seguimiento académico',
            tone: 'orange',
          },
          {
            icon: Scale,
            value: teacherData.receivedResolutions,
            label: 'Resoluciones recibidas',
            sublabel: 'Documentos oficiales vinculados',
            tone: 'green',
          },
        ]}
        leftTitle="Tus proyectos por estado"
        leftContent={
          <ProgressBars
            items={[
              {
                label: 'Proyectos postulados',
                value: teacherData.submittedProjects,
                total: projectsTotal,
                tone: 'blue',
              },
              {
                label: 'Proyectos aprobados',
                value: teacherData.approvedProjects,
                total: projectsTotal,
                tone: 'green',
              },
              {
                label: 'En ejecución activa',
                value: teacherData.projectsInExecution,
                total: projectsTotal,
                tone: 'purple',
              },
              {
                label: 'Finalizados',
                value: teacherData.completedProjects,
                total: projectsTotal,
                tone: 'gray',
              },
            ]}
          />
        }
        alertsTitle="Alertas de proyectos"
        alerts={teacherData.alerts}
      />
    );
  }

  function renderCoordinator(coordData: DashboardCoordinatorResponse) {
    const proceduresTotal = getTotal([
      coordData.submittedProcedures,
      coordData.proceduresUnderReview,
      coordData.approvedProcedures,
      coordData.observedProcedures,
    ]);

    return (
      <DashboardLayout
        viewClassName="coordinator-view"
        title="Consola del coordinador de grupo"
        subtitle={
          <>
            Grupo: <strong>{coordData.groupName}</strong> ({coordData.groupCode})
          </>
        }
        metrics={[
          {
            icon: Users,
            value: coordData.totalMembers,
            label: 'Investigadores del grupo',
            sublabel: `${formatNumber(coordData.activeMembers)} miembros activos`,
            tone: 'blue',
          },
          {
            icon: FileText,
            value: coordData.totalGroupProjects,
            label: 'Proyectos del grupo',
            sublabel: `${formatNumber(coordData.activeGroupProjects)} proyectos en ejecución`,
            tone: 'purple',
          },
          {
            icon: RefreshCw,
            value: coordData.pendingGroupProcedures,
            label: 'Trámites pendientes de revisión',
            sublabel: 'Requiere aprobación u observación',
            tone: 'orange',
          },
          {
            icon: BookOpen,
            value: coordData.groupThesisPlans,
            label: 'Planes de tesis adscritos',
            sublabel: `${formatNumber(coordData.groupProgressReports)} informes de avance`,
            tone: 'green',
          },
        ]}
        leftTitle="Control de trámites del grupo"
        leftContent={
          <ProgressBars
            items={[
              {
                label: 'Trámites presentados',
                value: coordData.submittedProcedures,
                total: proceduresTotal,
                tone: 'blue',
              },
              {
                label: 'En revisión de coordinación',
                value: coordData.proceduresUnderReview,
                total: proceduresTotal,
                tone: 'purple',
              },
              {
                label: 'Trámites aprobados',
                value: coordData.approvedProcedures,
                total: proceduresTotal,
                tone: 'green',
              },
              {
                label: 'Trámites observados',
                value: coordData.observedProcedures,
                total: proceduresTotal,
                tone: 'orange',
              },
            ]}
          />
        }
        alertsTitle="Alertas del grupo de investigación"
        alerts={coordData.alerts}
      />
    );
  }

  function renderDirector(directorData: DashboardDirectorResponse) {
    const proceduresTotal = getTotal([
      directorData.proceduresWithCoordinator,
      directorData.proceduresWithDirector,
      directorData.proceduresWithDean,
      directorData.completedProcedures,
    ]);

    return (
      <DashboardLayout
        viewClassName="director-view"
        title="Dirección de investigación de la facultad"
        subtitle="Supervisión de convocatorias, proyectos y control del flujo institucional."
        metrics={[
          {
            icon: Building2,
            value: directorData.totalProjects,
            label: 'Proyectos totales FIIS',
            sublabel: `${formatNumber(directorData.activeProjects)} proyectos activos`,
            tone: 'blue',
          },
          {
            icon: RefreshCw,
            value: directorData.pendingReviewProcedures,
            label: 'Trámites pendientes en dirección',
            sublabel: 'Derivados para revisión jerárquica',
            tone: 'purple',
          },
          {
            icon: Calendar,
            value: directorData.reportsNearingDeadline,
            label: 'Informes cerca del vencimiento',
            sublabel: 'Alertas de seguimiento académico',
            tone: 'orange',
          },
          {
            icon: Megaphone,
            value: directorData.openCallsForApplication,
            label: 'Convocatorias de investigación',
            sublabel: `${formatNumber(directorData.issuedResolutions)} resoluciones emitidas`,
            tone: 'green',
          },
        ]}
        leftTitle="Distribución del flujo de trámites"
        leftContent={
          <ProgressBars
            items={[
              {
                label: 'Trámites en coordinación',
                value: directorData.proceduresWithCoordinator,
                total: proceduresTotal,
                tone: 'blue',
              },
              {
                label: 'Trámites en dirección',
                value: directorData.proceduresWithDirector,
                total: proceduresTotal,
                tone: 'purple',
              },
              {
                label: 'Trámites en decanato',
                value: directorData.proceduresWithDean,
                total: proceduresTotal,
                tone: 'orange',
              },
              {
                label: 'Trámites concluidos',
                value: directorData.completedProcedures,
                total: proceduresTotal,
                tone: 'green',
              },
            ]}
          />
        }
        alertsTitle="Notificaciones de dirección"
        alerts={directorData.alerts}
      />
    );
  }

  function renderDean(deanData: DashboardDeanResponse) {
    const monthlyTotal = getTotal([
      deanData.waitingProcedures,
      deanData.approvedProceduresThisMonth,
      deanData.rejectedProceduresThisMonth,
    ]);

    return (
      <DashboardLayout
        viewClassName="dean-view"
        title="Consola del decanato de la facultad"
        subtitle="Supervisión institucional, resoluciones finales e informes de gestión."
        metrics={[
          {
            icon: Scale,
            value: deanData.totalFacultyProjects,
            label: 'Proyectos en la facultad',
            sublabel: `${formatNumber(deanData.activeProjects)} proyectos activos`,
            tone: 'blue',
          },
          {
            icon: PenTool,
            value: deanData.pendingSignatureProcedures,
            label: 'Trámites pendientes de firma',
            sublabel: 'Espera de resolución decanal',
            tone: 'purple',
          },
          {
            icon: ScrollText,
            value: deanData.issuedResolutions,
            label: 'Resoluciones emitidas',
            sublabel: 'Histórico de firmas administrativas',
            tone: 'orange',
          },
          {
            icon: Building,
            value: deanData.totalActiveGroups,
            label: 'Grupos de investigación activos',
            sublabel: `${formatNumber(deanData.activeCallsForApplication)} convocatorias vigentes`,
            tone: 'green',
          },
        ]}
        leftTitle="Estadísticas mensuales del decanato"
        leftContent={
          <ProgressBars
            items={[
              {
                label: 'Trámites en espera',
                value: deanData.waitingProcedures,
                total: monthlyTotal,
                tone: 'blue',
              },
              {
                label: 'Aprobados este mes',
                value: deanData.approvedProceduresThisMonth,
                total: monthlyTotal,
                tone: 'green',
              },
              {
                label: 'Rechazados o devueltos este mes',
                value: deanData.rejectedProceduresThisMonth,
                total: monthlyTotal,
                tone: 'orange',
              },
            ]}
          />
        }
        alertsTitle="Notificaciones del decano"
        alerts={deanData.alerts}
      />
    );
  }

  function renderEvaluator(evalData: DashboardEvaluatorResponse) {
    const evaluationsTotal = getTotal([
      evalData.approvedEvaluations,
      evalData.rejectedEvaluations,
      evalData.pendingEvaluations,
    ]);

    return (
      <DashboardLayout
        viewClassName="evaluator-view"
        title="Portal del evaluador científico"
        subtitle="Revisión de proyectos de investigación y evaluación de planes de tesis."
        metrics={[
          {
            icon: ClipboardList,
            value: evalData.assignedEvaluations,
            label: 'Evaluaciones asignadas',
            sublabel: `${formatNumber(evalData.pendingEvaluations)} evaluaciones pendientes`,
            tone: 'blue',
          },
          {
            icon: CheckCircle,
            value: evalData.completedEvaluations,
            label: 'Evaluaciones completadas',
            sublabel: 'Historial de puntajes y dictámenes',
            tone: 'green',
          },
          {
            icon: Microscope,
            value: evalData.assignedProjects,
            label: 'Proyectos asignados',
            sublabel: `${formatNumber(evalData.assignedThesisPlans)} planes de tesis en cola`,
            tone: 'purple',
          },
          {
            icon: AlertTriangle,
            value: evalData.evaluationsWithObservations,
            label: 'Con observaciones',
            sublabel: 'Retornados a los postulantes',
            tone: 'orange',
          },
        ]}
        leftTitle="Resultados de evaluaciones"
        leftContent={
          <ProgressBars
            items={[
              {
                label: 'Evaluaciones aprobadas',
                value: evalData.approvedEvaluations,
                total: evaluationsTotal,
                tone: 'green',
              },
              {
                label: 'Evaluaciones rechazadas',
                value: evalData.rejectedEvaluations,
                total: evaluationsTotal,
                tone: 'orange',
              },
              {
                label: 'Evaluaciones pendientes',
                value: evalData.pendingEvaluations,
                total: evaluationsTotal,
                tone: 'blue',
              },
            ]}
          />
        }
        alertsTitle="Tareas de evaluación pendientes"
        alerts={evalData.alerts}
      />
    );
  }

  switch (currentRole) {
    case 'ADMIN':
      return renderAdmin(data as DashboardAdminResponse);
    case 'ESTUDIANTE':
      return renderStudent(data as DashboardStudentResponse);
    case 'DOCENTE_INVESTIGADOR':
      return renderTeacher(data as DashboardTeacherResponse);
    case 'COORDINADOR_GRUPO':
      return renderCoordinator(data as DashboardCoordinatorResponse);
    case 'DIRECTOR_INVESTIGACION':
      return renderDirector(data as DashboardDirectorResponse);
    case 'DECANO':
      return renderDean(data as DashboardDeanResponse);
    case 'EVALUADOR':
      return renderEvaluator(data as DashboardEvaluatorResponse);
    default:
      return (
        <div className="unsupported-role-view">
          <span className="unsupported-icon">
            <AlertTriangle size={48} color="#64748b" />
          </span>
          <h3>Rol no soportado</h3>
          <p>El rol "{currentRole}" no tiene una vista de dashboard implementada.</p>
        </div>
      );
  }
};

export default RoleDashboards;