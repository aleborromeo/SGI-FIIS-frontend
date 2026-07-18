import { useContext, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart2,
  BookOpen,
  Building,
  Building2,
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
import { ConvocatoriasDashboard } from '../../modules/convocatorias/pages/ConvocatoriasDashboard';
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
  extraContent?: ReactNode;
}

interface QuickAction {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: MetricTone;
}

function getQuickActions(role: string | null, t: TFunction): QuickAction[] {
  switch (role) {
    case 'ADMIN':
      return [
        {
          to: '/projects',
          label: t('dashboard:quickActions.admin.manageProjects'),
          description: t('dashboard:quickActions.admin.manageProjectsDesc'),
          icon: FileText,
          tone: 'blue',
        },
        {
          to: '/projects/assign',
          label: t('dashboard:quickActions.admin.assignReviewers'),
          description: t('dashboard:quickActions.admin.assignReviewersDesc'),
          icon: ClipboardList,
          tone: 'purple',
        },
        {
          to: '/progressreports/review',
          label: t('dashboard:quickActions.admin.reviewReports'),
          description: t('dashboard:quickActions.admin.reviewReportsDesc'),
          icon: BarChart2,
          tone: 'orange',
        },
        {
          to: '/projects/audit',
          label: t('dashboard:quickActions.admin.projectAudit'),
          description: t('dashboard:quickActions.admin.projectAuditDesc'),
          icon: Scale,
          tone: 'green',
        },
      ];

    case 'EVALUADOR':
      return [
        {
          to: '/evaluations/my-evaluations',
          label: t('dashboard:quickActions.evaluator.myEvaluations'),
          description: t('dashboard:quickActions.evaluator.myEvaluationsDesc'),
          icon: ClipboardList,
          tone: 'blue',
        },
        {
          to: '/projects/evaluate',
          label: t('dashboard:quickActions.evaluator.evaluateProject'),
          description: t('dashboard:quickActions.evaluator.evaluateProjectDesc'),
          icon: CheckCircle,
          tone: 'green',
        },
        {
          to: '/observations/panel',
          label: t('dashboard:quickActions.evaluator.observations'),
          description: t('dashboard:quickActions.evaluator.observationsDesc'),
          icon: AlertTriangle,
          tone: 'orange',
        },
      ];

    case 'DOCENTE_INVESTIGADOR':
      return [
        {
          to: '/projects',
          label: t('dashboard:quickActions.teacher.myProjects'),
          description: t('dashboard:quickActions.teacher.myProjectsDesc'),
          icon: Microscope,
          tone: 'blue',
        },
        {
          to: '/projects/new',
          label: t('dashboard:quickActions.teacher.newProposal'),
          description: t('dashboard:quickActions.teacher.newProposalDesc'),
          icon: FileText,
          tone: 'green',
        },
        {
          to: '/observations/panel',
          label: t('dashboard:quickActions.teacher.myObservations'),
          description: t('dashboard:quickActions.teacher.myObservationsDesc'),
          icon: AlertTriangle,
          tone: 'orange',
        },
      ];

    case 'COORDINADOR_GRUPO':
      return [
        {
          to: '/projects',
          label: t('dashboard:quickActions.coordinator.groupProjects'),
          description: t('dashboard:quickActions.coordinator.groupProjectsDesc'),
          icon: Building,
          tone: 'blue',
        },
        {
          to: '/progressreports/review',
          label: t('dashboard:quickActions.coordinator.groupReports'),
          description: t('dashboard:quickActions.coordinator.groupReportsDesc'),
          icon: BookOpen,
          tone: 'purple',
        },
        {
          to: '/observations/panel',
          label: t('dashboard:quickActions.coordinator.observations'),
          description: t('dashboard:quickActions.coordinator.observationsDesc'),
          icon: AlertTriangle,
          tone: 'orange',
        },
      ];

    case 'DIRECTOR_INVESTIGACION':
    case 'DECANO':
      return [
        {
          to: '/projects',
          label: t('dashboard:quickActions.director.institutionalProjects'),
          description: t('dashboard:quickActions.director.institutionalProjectsDesc'),
          icon: Building2,
          tone: 'blue',
        },
        {
          to: '/progressreports/review',
          label: t('dashboard:quickActions.director.pendingReports'),
          description: t('dashboard:quickActions.director.pendingReportsDesc'),
          icon: BarChart2,
          tone: 'orange',
        },
        {
          to: '/projects/audit',
          label: t('dashboard:quickActions.director.traceability'),
          description: t('dashboard:quickActions.director.traceabilityDesc'),
          icon: Scale,
          tone: 'green',
        },
      ];

    case 'ESTUDIANTE':
      return [
        {
          to: '/thesis/plans',
          label: t('dashboard:quickActions.student.myThesisPlans'),
          description: t('dashboard:quickActions.student.myThesisPlansDesc'),
          icon: GraduationCap,
          tone: 'blue',
        },
        {
          to: '/thesis/new',
          label: t('dashboard:quickActions.student.registerThesisPlan'),
          description: t('dashboard:quickActions.student.registerThesisPlanDesc'),
          icon: PenTool,
          tone: 'green',
        },
        {
          to: '/observations/panel',
          label: t('dashboard:quickActions.student.myObservations'),
          description: t('dashboard:quickActions.student.myObservationsDesc'),
          icon: AlertTriangle,
          tone: 'orange',
        },
      ];

    default:
      return [
        {
          to: '/projects',
          label: t('dashboard:quickActions.default.viewProjects'),
          description: t('dashboard:quickActions.default.viewProjectsDesc'),
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

function translateAlertType(type: string, t: TFunction): string {
  const normalized = type.toUpperCase();

  const dictionary: Record<string, string> = {
    REVIEW: t('dashboard:alertTypes.REVIEW'),
    WARNING: t('dashboard:alertTypes.WARNING'),
    ERROR: t('dashboard:alertTypes.ERROR'),
    INFO: t('dashboard:alertTypes.INFO'),
    SUCCESS: t('dashboard:alertTypes.SUCCESS'),
  };

  return dictionary[normalized] ?? type;
}

function translateAlertTitle(title: string, t: TFunction): string {
  const normalized = title.toLowerCase();

  if (normalized.includes('pending procedures')) return t('dashboard:alertTitles.pendingProcedures');
  if (normalized.includes('pending')) return t('dashboard:alertTitles.pendingAttention');
  if (normalized.includes('review')) return t('dashboard:alertTitles.reviewPending');
  if (normalized.includes('active call for applications') || normalized.includes('active call')) return 'Convocatorias activas';

  return title;
}

function translateAlertDescription(description: string): string {
  const normalized = description.toLowerCase();

  if (normalized.includes('there are') && normalized.includes('open call(s) for applications')) {
    const match = description.match(/\d+/);
    const count = match ? match[0] : '0';
    return `Hay ${count} convocatoria(s) abierta(s).`;
  }
  if (normalized.includes('procedures in progress')) {
    return 'Trámites en progreso';
  }
  if (normalized.includes('under review')) {
    return description.replace(/under review/gi, 'en revisión');
  }

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
  const { t } = useTranslation('dashboard');
  const actions = getQuickActions(currentRole, t);

  return (
    <section className="quick-actions-section">
      <div className="quick-actions-header">
        <div>
          <h3>{t('dashboard:quickActions.sectionTitle')}</h3>
          <p>{t('dashboard:quickActions.sectionSubtitle')}</p>
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

function MetricCard({ icon: Icon, value, label, sublabel, tone }: Readonly<MetricCardProps>) {
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

function ProgressBars({ items }: Readonly<{ items: readonly ProgressItem[] }>) {
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

function AlertsList({ alerts }: Readonly<{ alerts?: readonly AlertItem[] }>) {
  const { t } = useTranslation('dashboard');

  if (!alerts || alerts.length === 0) {
    return (
      <div className="empty-alerts">
        <span className="empty-icon">
          <CheckCircle size={32} color="#15803d" />
        </span>
        <p>{t('dashboard:alerts.noAlerts')}</p>
      </div>
    );
  }

  return (
    <div className="alerts-list">
      {alerts.map((alert, index) => (
        <div key={`${alert.type}-${index}`} className={`alert-card-item alert-type-${alert.type.toLowerCase()}`}>
          <div className="alert-item-header">
            <span className="alert-badge">{translateAlertType(alert.type, t)}</span>
            <h4 className="alert-item-title">{translateAlertTitle(alert.title, t)}</h4>
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
  extraContent,
}: Readonly<DashboardLayoutProps>) {
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

      {extraContent}

      <QuickActionsSection />
    </div>
  );
}

export const RoleDashboards = () => {
  const { currentRole } = useContext(AuthContext);
  const { t } = useTranslation('dashboard');
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
              : t('dashboard:error.defaultMessage')
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
  }, [currentRole, t]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spinner size="large" color="#0b5ed7" />
        <p className="loading-text">{t('dashboard:loading.dashboard')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error-card">
        <span className="error-icon">
          <XCircle size={48} color="#991b1b" />
        </span>
        <h3 className="error-title">{t('dashboard:error.dashboardLoad')}</h3>
        <p className="error-desc">{error}</p>
        <button onClick={() => window.location.reload()} className="error-retry-btn">
          {t('dashboard:error.retry')}
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
        <h3>{t('dashboard:empty.noData')}</h3>
        <p>{t('dashboard:empty.noDataDescription')}</p>
      </div>
    );
  }

    function renderAdmin(adminData: DashboardAdminResponse) {
    const activeProcedures = Number(adminData.pendingProcedures ?? 0)
      + Number(adminData.proceduresUnderReview ?? 0);

    const proceduresTotal = getTotal([
      adminData.proceduresUnderReview,
      adminData.approvedProcedures,
      adminData.pendingProcedures,
      adminData.rejectedProcedures,
    ]);

    return (
      <DashboardLayout
        viewClassName="admin-view"
        title={t('dashboard:admin.title')}
        subtitle={t('dashboard:admin.subtitle')}
        metrics={[
          {
            icon: Users,
            value: adminData.totalUsers,
            label: t('dashboard:admin.metrics.registeredUsers'),
            sublabel: `${formatNumber(adminData.totalActiveUsers)} ${t('dashboard:admin.metrics.activeUsersSuffix')}`,
            tone: 'blue',
          },
          {
            icon: Building,
            value: adminData.totalGroups,
            label: t('dashboard:admin.metrics.researchGroups'),
            sublabel: `${formatNumber(adminData.totalActiveGroups)} ${t('dashboard:admin.metrics.activeGroupsSuffix')}`,
            tone: 'green',
          },
          {
            icon: FileText,
            value: adminData.totalProjects,
            label: t('dashboard:admin.metrics.institutionalProjects'),
            sublabel: `${formatNumber(adminData.activeProjects)} ${t('dashboard:admin.metrics.activeProjectsSuffix')}`,
            tone: 'purple',
          },
          {
            icon: RefreshCw,
            value: activeProcedures,
            label: t('dashboard:admin.metrics.activeProcedures'),
            sublabel: t('dashboard:admin.metrics.activeProceduresSublabel'),
            tone: 'orange',
          },
        ]}
        leftTitle={t('dashboard:admin.sections.procedureIndicators')}
        leftContent={
          <>
            <div className="affiliation-card" style={{ marginBottom: '20px' }}>
              <div className="affiliation-header">
                <span className="affiliation-icon">
                  <Scale size={24} />
                </span>
                <div>
                  <h4>{t('dashboard:admin.sections.macroView')}</h4>
                  <p>
                    {t('dashboard:admin.sections.macroViewDesc')}
                  </p>
                </div>
              </div>
            </div>

            <ProgressBars
              items={[
                {
                  label: t('dashboard:admin.procedures.underReview'),
                  value: adminData.proceduresUnderReview,
                  total: proceduresTotal,
                  tone: 'blue',
                },
                {
                  label: t('dashboard:admin.procedures.approved'),
                  value: adminData.approvedProcedures,
                  total: proceduresTotal,
                  tone: 'green',
                },
                {
                  label: t('dashboard:admin.procedures.pending'),
                  value: adminData.pendingProcedures,
                  total: proceduresTotal,
                  tone: 'orange',
                },
                {
                  label: t('dashboard:admin.procedures.rejected'),
                  value: adminData.rejectedProcedures,
                  total: proceduresTotal,
                  tone: 'gray',
                },
              ]}
            />
          </>
        }
        alertsTitle={t('dashboard:admin.sections.alerts')}
        alerts={adminData.alerts}
      />
    );
  }

  function renderStudent(studentData: DashboardStudentResponse) {
    const extraAlerts: AlertItem[] = [];
    const planStatus = (studentData.currentPlanStatus || '').toUpperCase();
    if (planStatus === 'APROBADO') {
      extraAlerts.push({
        type: 'SUCCESS',
        title: 'dashboard.alert.thesis-plan-approved.title',
        description: t('dashboard:alert.thesisPlanApproved', { defaultValue: 'Tu plan de tesis fue aprobado. Revisa el estado en la bandeja de trámites.' }),
      });
    } else if (planStatus === 'RECHAZADO') {
      extraAlerts.push({
        type: 'ERROR',
        title: 'dashboard.alert.thesis-plan-rejected.title',
        description: t('dashboard:alert.thesisPlanRejected', { defaultValue: 'Tu plan de tesis fue rechazado. Revisa las observaciones y vuelve a presentarlo.' }),
      });
    } else if (planStatus === 'OBSERVADO') {
      extraAlerts.push({
        type: 'WARNING',
        title: 'dashboard.alert.thesis-plan-observed.title',
        description: t('dashboard:alert.thesisPlanObserved', { defaultValue: 'Tu plan de tesis tiene observaciones pendientes. Ingresa a subsanación para corregirlas.' }),
      });
    }
    const allAlerts = [...extraAlerts, ...(studentData.alerts || [])];
    return (
      <DashboardLayout
        viewClassName="student-view"
        title={t('dashboard:student.title')}
        subtitle={t('dashboard:student.subtitle')}
        metrics={[
          {
            icon: GraduationCap,
            value: studentData.submittedThesisPlans,
            label: t('dashboard:student.metrics.thesisPlansSubmitted'),
            sublabel: <>{t('dashboard:student.metrics.currentStatusLabel')} <strong>{studentData.currentPlanStatus || t('dashboard:student.metrics.currentStatusNone')}</strong></>,
            tone: 'blue',
          },
          {
            icon: RefreshCw,
            value: studentData.pendingProcedures,
            label: t('dashboard:student.metrics.proceduresInProgress'),
            sublabel: t('dashboard:student.metrics.realTimeTracking'),
            tone: 'orange',
          },
          {
            icon: FolderOpen,
            value: studentData.uploadedDocuments,
            label: t('dashboard:student.metrics.uploadedDocuments'),
            sublabel: t('dashboard:student.metrics.platformFiles'),
            tone: 'purple',
          },
          {
            icon: Megaphone,
            value: studentData.openCallsForApplication,
            label: t('dashboard:student.metrics.openCalls'),
            sublabel: t('dashboard:student.metrics.activeOpportunities'),
            tone: 'green',
          },
        ]}
        leftTitle={t('dashboard:student.sections.affiliation')}
        leftContent={
          <div className="affiliation-card">
            <div className="affiliation-header">
              <span className="affiliation-icon">
                <Building size={24} />
              </span>
              <div>
                <h4>{studentData.groupName || t('dashboard:student.affiliation.noGroup')}</h4>
                <p>
                  {t('dashboard:student.affiliation.groupCode')} <strong>{studentData.groupCode || 'N/A'}</strong>
                </p>
              </div>
            </div>
            <p className="affiliation-body">
              {t('dashboard:student.affiliation.description')}
            </p>
          </div>
        }
        alertsTitle={t('dashboard:student.sections.notifications')}
        alerts={allAlerts}
      />
    );
  }

      function renderTeacher(teacherData: DashboardTeacherResponse) {
    const myProjectsTotal = Number(teacherData.projectsAsLead ?? 0)
      + Number(teacherData.projectsAsMember ?? 0);

    const projectsTotal = getTotal([
      teacherData.submittedProjects,
      teacherData.approvedProjects,
      teacherData.projectsInExecution,
      teacherData.completedProjects,
    ]);

    return (
      <DashboardLayout
        viewClassName="teacher-view"
        title={t('dashboard:teacher.title')}
        subtitle={
          <>
            {t('dashboard:teacher.subtitlePart1')}
            {' '}
            {t('dashboard:teacher.groupLabel')}{' '}
            <strong>
              {teacherData.groupCode || 'N/A'} - {teacherData.groupName || t('dashboard:teacher.pendingGroup')}
            </strong>
          </>
        }
        metrics={[
          {
            icon: Microscope,
            value: myProjectsTotal,
            label: t('dashboard:teacher.metrics.registeredProjects'),
            sublabel: `${formatNumber(teacherData.projectsAsLead)} ${t('dashboard:teacher.metrics.asLeadAnd')} ${formatNumber(teacherData.projectsAsMember)} ${t('dashboard:teacher.metrics.asMember')}`,
            tone: 'blue',
          },
          {
            icon: FolderOpen,
            value: teacherData.uploadedDocuments,
            label: t('dashboard:teacher.metrics.myDocuments'),
            sublabel: t('dashboard:teacher.metrics.myDocumentsSublabel'),
            tone: 'purple',
          },
          {
            icon: RefreshCw,
            value: teacherData.pendingProcedures,
            label: t('dashboard:teacher.metrics.myProceduresInProgress'),
            sublabel: t('dashboard:teacher.metrics.myProceduresInProgressSublabel'),
            tone: 'orange',
          },
          {
            icon: BarChart2,
            value: teacherData.pendingProgressReports,
            label: t('dashboard:teacher.metrics.myReportsSubmitted'),
            sublabel: t('dashboard:teacher.metrics.myReportsSubmittedSublabel'),
            tone: 'green',
          },
        ]}
        leftTitle={t('dashboard:teacher.sections.groupAndProjects')}
        leftContent={
          <>
            <div className="affiliation-card" style={{ marginBottom: '20px' }}>
              <div className="affiliation-header">
                <span className="affiliation-icon">
                  <Building size={24} />
                </span>
                <div>
                  <h4>{teacherData.groupName || t('dashboard:teacher.pendingGroup')}</h4>
                  <p>
                    {t('dashboard:teacher.groupCode')}{' '}
                    <strong>{teacherData.groupCode || 'N/A'}</strong>
                  </p>
                </div>
              </div>
              <p className="affiliation-body">
                {t('dashboard:teacher.affiliation.description')}
              </p>
            </div>

            <ProgressBars
              items={[
                {
                  label: t('dashboard:teacher.projects.submitted'),
                  value: teacherData.submittedProjects,
                  total: projectsTotal,
                  tone: 'blue',
                },
                {
                  label: t('dashboard:teacher.projects.approved'),
                  value: teacherData.approvedProjects,
                  total: projectsTotal,
                  tone: 'green',
                },
                {
                  label: t('dashboard:teacher.projects.inExecution'),
                  value: teacherData.projectsInExecution,
                  total: projectsTotal,
                  tone: 'purple',
                },
                {
                  label: t('dashboard:teacher.projects.completed'),
                  value: teacherData.completedProjects,
                  total: projectsTotal,
                  tone: 'gray',
                },
              ]}
            />
          </>
        }
        alertsTitle={t('dashboard:teacher.sections.alerts')}
        alerts={teacherData.alerts}
        extraContent={<ConvocatoriasDashboard />}
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
        title={t('dashboard:coordinator.title')}
        subtitle={
          <>
            {t('dashboard:coordinator.subtitlePrefix')} <strong>{coordData.groupName}</strong> ({coordData.groupCode}).
          </>
        }
        metrics={[
          {
            icon: Users,
            value: coordData.totalMembers,
            label: t('dashboard:coordinator.metrics.groupMembers'),
            sublabel: `${formatNumber(coordData.activeMembers)} ${t('dashboard:coordinator.metrics.activeMembersSuffix')}`,
            tone: 'blue',
          },
          {
            icon: FileText,
            value: coordData.totalGroupProjects,
            label: t('dashboard:coordinator.metrics.groupProjects'),
            sublabel: `${formatNumber(coordData.activeGroupProjects)} ${t('dashboard:coordinator.metrics.activeProjectsSuffix')}`,
            tone: 'purple',
          },
          {
            icon: RefreshCw,
            value: coordData.pendingGroupProcedures,
            label: t('dashboard:coordinator.metrics.groupProcedures'),
            sublabel: t('dashboard:coordinator.metrics.groupProceduresSublabel'),
            tone: 'orange',
          },
          {
            icon: BookOpen,
            value: coordData.groupProgressReports,
            label: t('dashboard:coordinator.metrics.groupReports'),
            sublabel: `${formatNumber(coordData.groupThesisPlans)} ${t('dashboard:coordinator.metrics.associatedThesisPlans')}`,
            tone: 'green',
          },
        ]}
        leftTitle={t('dashboard:coordinator.sections.procedureControl')}
        leftContent={
          <>
            <div className="affiliation-card" style={{ marginBottom: '20px' }}>
              <div className="affiliation-header">
                <span className="affiliation-icon">
                  <Building size={24} />
                </span>
                <div>
                  <h4>{coordData.groupName || t('dashboard:coordinator.affiliation.noGroup')}</h4>
                  <p>
                    {t('dashboard:coordinator.groupCode')}{' '}
                    <strong>{coordData.groupCode || 'N/A'}</strong>
                  </p>
                </div>
              </div>
              <p className="affiliation-body">
                {t('dashboard:coordinator.affiliation.description')}
              </p>
            </div>

            <ProgressBars
              items={[
                {
                  label: t('dashboard:coordinator.procedures.submitted'),
                  value: coordData.submittedProcedures,
                  total: proceduresTotal,
                  tone: 'blue',
                },
                {
                  label: t('dashboard:coordinator.procedures.underReview'),
                  value: coordData.proceduresUnderReview,
                  total: proceduresTotal,
                  tone: 'purple',
                },
                {
                  label: t('dashboard:coordinator.procedures.approved'),
                  value: coordData.approvedProcedures,
                  total: proceduresTotal,
                  tone: 'green',
                },
                {
                  label: t('dashboard:coordinator.procedures.observed'),
                  value: coordData.observedProcedures,
                  total: proceduresTotal,
                  tone: 'orange',
                },
              ]}
            />
          </>
        }
        alertsTitle={t('dashboard:coordinator.sections.alerts')}
        alerts={coordData.alerts}
      />
    );
  }

    function renderDirector(directorData: DashboardDirectorResponse) {
    const activeProcedures = Number(directorData.pendingReviewProcedures ?? 0)
      + Number(directorData.proceduresWithCoordinator ?? 0)
      + Number(directorData.proceduresWithDirector ?? 0)
      + Number(directorData.proceduresWithDean ?? 0);

    const proceduresTotal = getTotal([
      directorData.proceduresWithCoordinator,
      directorData.proceduresWithDirector,
      directorData.proceduresWithDean,
      directorData.completedProcedures,
    ]);

    return (
      <DashboardLayout
        viewClassName="director-view"
        title={t('dashboard:director.title')}
        subtitle={t('dashboard:director.subtitle')}
        metrics={[
          {
            icon: Building2,
            value: directorData.totalProjects,
            label: t('dashboard:director.metrics.researchProjects'),
            sublabel: `${formatNumber(directorData.activeProjects)} ${t('dashboard:director.metrics.activeProjectsSuffix')}`,
            tone: 'blue',
          },
          {
            icon: Users,
            value: 'Global',
            label: t('dashboard:director.metrics.researchGroups'),
            sublabel: t('dashboard:director.metrics.researchGroupsSublabel'),
            tone: 'green',
          },
          {
            icon: RefreshCw,
            value: activeProcedures,
            label: t('dashboard:director.metrics.activeProcedures'),
            sublabel: `${formatNumber(directorData.pendingReviewProcedures)} ${t('dashboard:director.metrics.pendingReviewSuffix')}`,
            tone: 'orange',
          },
          {
            icon: Megaphone,
            value: directorData.openCallsForApplication,
            label: t('dashboard:director.metrics.calls'),
            sublabel: t('dashboard:director.metrics.callsSublabel'),
            tone: 'purple',
          },
        ]}
        leftTitle={t('dashboard:director.sections.procedureDistribution')}
        leftContent={
          <>
            <div className="affiliation-card" style={{ marginBottom: '20px' }}>
              <div className="affiliation-header">
                <span className="affiliation-icon">
                  <Building2 size={24} />
                </span>
                <div>
                  <h4>{t('dashboard:director.sections.institutionalView')}</h4>
                  <p>
                    {t('dashboard:director.sections.institutionalViewDesc')}
                  </p>
                </div>
              </div>
            </div>

            <ProgressBars
              items={[
                {
                  label: t('dashboard:director.procedures.withCoordinator'),
                  value: directorData.proceduresWithCoordinator,
                  total: proceduresTotal,
                  tone: 'blue',
                },
                {
                  label: t('dashboard:director.procedures.withDirector'),
                  value: directorData.proceduresWithDirector,
                  total: proceduresTotal,
                  tone: 'purple',
                },
                {
                  label: t('dashboard:director.procedures.withDean'),
                  value: directorData.proceduresWithDean,
                  total: proceduresTotal,
                  tone: 'orange',
                },
                {
                  label: t('dashboard:director.procedures.completed'),
                  value: directorData.completedProcedures,
                  total: proceduresTotal,
                  tone: 'green',
                },
              ]}
            />
          </>
        }
        alertsTitle={t('dashboard:director.sections.notifications')}
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
        title={t('dashboard:dean.title')}
        subtitle={t('dashboard:dean.subtitle')}
        metrics={[
          {
            icon: Scale,
            value: deanData.totalFacultyProjects,
            label: t('dashboard:dean.metrics.facultyProjects'),
            sublabel: `${formatNumber(deanData.activeProjects)} ${t('dashboard:dean.metrics.activeProjectsSuffix')}`,
            tone: 'blue',
          },
          {
            icon: PenTool,
            value: deanData.pendingSignatureProcedures,
            label: t('dashboard:dean.metrics.pendingSignatureProcedures'),
            sublabel: t('dashboard:dean.metrics.pendingSignatureSublabel'),
            tone: 'purple',
          },
          {
            icon: ScrollText,
            value: deanData.issuedResolutions,
            label: t('dashboard:dean.metrics.issuedResolutions'),
            sublabel: t('dashboard:dean.metrics.issuedResolutionsSublabel'),
            tone: 'orange',
          },
          {
            icon: Building,
            value: deanData.totalActiveGroups,
            label: t('dashboard:dean.metrics.activeResearchGroups'),
            sublabel: `${formatNumber(deanData.activeCallsForApplication)} ${t('dashboard:dean.metrics.activeCallsSuffix')}`,
            tone: 'green',
          },
        ]}
        leftTitle={t('dashboard:dean.sections.monthlyStats')}
        leftContent={
          <ProgressBars
            items={[
              {
                label: t('dashboard:dean.procedures.waiting'),
                value: deanData.waitingProcedures,
                total: monthlyTotal,
                tone: 'blue',
              },
              {
                label: t('dashboard:dean.procedures.approvedThisMonth'),
                value: deanData.approvedProceduresThisMonth,
                total: monthlyTotal,
                tone: 'green',
              },
              {
                label: t('dashboard:dean.procedures.rejectedThisMonth'),
                value: deanData.rejectedProceduresThisMonth,
                total: monthlyTotal,
                tone: 'orange',
              },
            ]}
          />
        }
        alertsTitle={t('dashboard:dean.sections.notifications')}
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
        title={t('dashboard:evaluator.title')}
        subtitle={
          <>
            {t('dashboard:evaluator.subtitlePart1')}
            {' '}
            {t('dashboard:evaluator.groupLabel')}{' '}
            <strong>
              {evalData.groupCode || 'N/A'} - {evalData.groupName || t('dashboard:evaluator.pendingGroup')}
            </strong>
          </>
        }
        metrics={[
          {
            icon: Microscope,
            value: evalData.assignedProjects,
            label: t('dashboard:evaluator.metrics.assignedProjects'),
            sublabel: `${formatNumber(evalData.assignedThesisPlans)} ${t('dashboard:evaluator.metrics.assignedThesisPlansSuffix')}`,
            tone: 'blue',
          },
          {
            icon: ClipboardList,
            value: evalData.pendingEvaluations,
            label: t('dashboard:evaluator.metrics.pendingEvaluations'),
            sublabel: t('dashboard:evaluator.metrics.pendingEvaluationsSublabel'),
            tone: 'orange',
          },
          {
            icon: CheckCircle,
            value: evalData.completedEvaluations,
            label: t('dashboard:evaluator.metrics.completedEvaluations'),
            sublabel: t('dashboard:evaluator.metrics.completedEvaluationsSublabel'),
            tone: 'green',
          },
          {
            icon: AlertTriangle,
            value: evalData.evaluationsWithObservations,
            label: t('dashboard:evaluator.metrics.observationsIssued'),
            sublabel: t('dashboard:evaluator.metrics.observationsIssuedSublabel'),
            tone: 'purple',
          },
        ]}
        leftTitle={t('dashboard:evaluator.sections.groupAndEvaluations')}
        leftContent={
          <>
            <div className="affiliation-card" style={{ marginBottom: '20px' }}>
              <div className="affiliation-header">
                <span className="affiliation-icon">
                  <Building size={24} />
                </span>
                <div>
                  <h4>{evalData.groupName || t('dashboard:evaluator.pendingGroup')}</h4>
                  <p>
                    {t('dashboard:evaluator.groupCode')}{' '}
                    <strong>{evalData.groupCode || 'N/A'}</strong>
                  </p>
                </div>
              </div>
              <p className="affiliation-body">
                {t('dashboard:evaluator.affiliation.description')}
              </p>
            </div>

            <ProgressBars
              items={[
                {
                  label: t('dashboard:evaluator.evaluations.approved'),
                  value: evalData.approvedEvaluations,
                  total: evaluationsTotal,
                  tone: 'green',
                },
                {
                  label: t('dashboard:evaluator.evaluations.rejected'),
                  value: evalData.rejectedEvaluations,
                  total: evaluationsTotal,
                  tone: 'orange',
                },
                {
                  label: t('dashboard:evaluator.evaluations.pending'),
                  value: evalData.pendingEvaluations,
                  total: evaluationsTotal,
                  tone: 'blue',
                },
              ]}
            />
          </>
        }
        alertsTitle={t('dashboard:evaluator.sections.notifications')}
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
          <h3>{t('dashboard:unsupportedRole.title')}</h3>
          <p>{t('dashboard:unsupportedRole.message', { role: currentRole })}</p>
        </div>
      );
  }
};

export default RoleDashboards;
