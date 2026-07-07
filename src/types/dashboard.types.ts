export type DashboardMetric = {
  id: string;
  title: string;
  value: string;
  detail: string;
  icon: string;
  tone: 'primary' | 'danger';
};

export type ResearchGroupStatus = {
  id: string;
  name: string;
  description: string;
  totalProjects: number;
  postulated: number;
  approved: number;
  execution: number;
  observed: number;
};

export type ApprovalStep = {
  id: string;
  title: string;
  description: string;
  value: string;
  tone: 'active' | 'normal' | 'warning' | 'success';
};

export type PendingProcedure = {
  id: string;
  code: string;
  applicant: string;
  type: 'postulacion' | 'informe' | 'tesis';
  typeLabel: string;
  title: string;
  category: string;
  status: string;
  time: string;
  priority: 'alta' | 'media';
};

export type DashboardData = {
  period: string;
  metrics: DashboardMetric[];
  groups: ResearchGroupStatus[];
  approvalSteps: ApprovalStep[];
  pendingProcedures: PendingProcedure[];
};

export type AnalyticsMetric = {
  id: string;
  title: string;
  value: string;
  detail: string;
  tone: 'primary' | 'danger';
};

export type AnalyticsBarItem = {
  id: string;
  label: string;
  value: number;
  detail: string;
  percentage: number;
};

export type AnalyticsTrendItem = {
  month: string;
  projects: number;
  procedures: number;
  evaluations: number;
};

export type AnalyticsData = {
  period: string;
  metrics: AnalyticsMetric[];
  projectStatus: AnalyticsBarItem[];
  groupPerformance: AnalyticsBarItem[];
  monthlyTrend: AnalyticsTrendItem[];
  insights: string[];
};

export type ReportMetric = {
  id: string;
  title: string;
  value: string;
  detail: string;
  tone: 'primary' | 'danger';
};

export type ReportItem = {
  id: string;
  title: string;
  description: string;
  format: 'PDF' | 'Excel';
  status: 'disponible' | 'pendiente';
  updatedAt: string;
};

export type ReportsData = {
  period: string;
  metrics: ReportMetric[];
  reports: ReportItem[];
  summary: string;
};

export type PublicationMetric = {
  id: string;
  title: string;
  value: string;
  detail: string;
  tone: 'primary' | 'danger';
};

export type PublicationStatus = 'publicada' | 'revision' | 'borrador';

export type PublicationItem = {
  id: string;
  title: string;
  authors: string;
  journal: string;
  group: string;
  indexation: 'Scopus' | 'IEEE' | 'SciELO' | 'Latindex';
  status: PublicationStatus;
  year: number;
  updatedAt: string;
};

export type PublicationChannel = {
  id: string;
  label: string;
  value: number;
  percentage: number;
};

export type PublicationsData = {
  period: string;
  metrics: PublicationMetric[];
  channels: PublicationChannel[];
  publications: PublicationItem[];
  summary: string[];
};

export type FinancingMetric = {
  id: string;
  title: string;
  value: string;
  detail: string;
  tone: 'primary' | 'danger';
};

export type FundingSource = {
  id: string;
  name: string;
  amount: string;
  description: string;
  percentage: number;
};

export type FundingCall = {
  id: string;
  title: string;
  code: string;
  budget: string;
  applicants: number;
  status: 'abierta' | 'evaluacion' | 'cerrada';
  deadline: string;
};

export type FinancingData = {
  period: string;
  metrics: FinancingMetric[];
  sources: FundingSource[];
  calls: FundingCall[];
  summary: string[];
};

export type RankingMetric = {
  id: string;
  title: string;
  value: string;
  detail: string;
  tone: 'primary' | 'danger';
};

export type ResearcherRankingItem = {
  id: string;
  position: number;
  name: string;
  group: string;
  score: number;
  projects: number;
  publications: number;
  status: 'destacado' | 'activo' | 'seguimiento';
};

export type GroupRankingItem = {
  id: string;
  position: number;
  name: string;
  score: number;
  projects: number;
  publications: number;
  participation: number;
};

export type RankingCriterion = {
  id: string;
  title: string;
  description: string;
  weight: string;
};

export type RankingData = {
  period: string;
  metrics: RankingMetric[];
  researchers: ResearcherRankingItem[];
  groups: GroupRankingItem[];
  criteria: RankingCriterion[];
};

export type ResearcherMetric = {
  id: string;
  title: string;
  value: string;
  detail: string;
  tone: 'primary' | 'danger';
};

export type ResearcherItem = {
  id: string;
  name: string;
  role: string;
  group: string;
  email: string;
  projects: number;
  publications: number;
  score: number;
  status: 'activo' | 'destacado' | 'seguimiento';
};

export type ResearcherGroupDistribution = {
  id: string;
  group: string;
  total: number;
  percentage: number;
};

export type ResearchersData = {
  period: string;
  metrics: ResearcherMetric[];
  researchers: ResearcherItem[];
  distribution: ResearcherGroupDistribution[];
  summary: string[];
};

export interface BackendDashboardAlert {
  title: string;
  description: string;
  type: string;
}

export interface BackendDashboardMe {
  activeProjects: number;
  alerts: BackendDashboardAlert[];
  approvedProcedures: number;
  issuedResolutions: number;
  pendingProcedures: number;
  proceduresUnderReview: number;
  rejectedProcedures: number;
  totalActiveGroups: number;
  totalActiveUsers: number;
  totalGroups: number;
  totalProjects: number;
  totalUsers: number;
}