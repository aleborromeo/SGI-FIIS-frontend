export interface User {
  email: string;
  firstNames: string;
  lastNames: string;
  roleCode: string;
  mustChangePassword?: boolean;
}

export interface LoginResponse {
  token: string;
  type: string;
  email: string;
  firstNames: string;
  lastNames: string;
  roleCode: string;
  mustChangePassword: boolean;
  requiresVerification: boolean;
}

export interface UserProfile {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  correoInstitucional: string;
  telefono: string;
  esActivo: boolean;
  mustChangePassword: boolean;
  rolPrincipal: {
    idRol: number;
    codigoRol: string;
    descripcion: string;
  };
}

export interface AlertItem {
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | string;
  title: string;
  description: string;
}

export interface DashboardAdminResponse {
  totalUsers: number;
  totalActiveUsers: number;
  totalGroups: number;
  totalActiveGroups: number;
  totalProjects: number;
  activeProjects: number;
  pendingProcedures: number;
  issuedResolutions: number;
  proceduresUnderReview: number;
  approvedProcedures: number;
  rejectedProcedures: number;
  alerts: AlertItem[];
}

export interface DashboardStudentResponse {
  submittedThesisPlans: number;
  currentPlanStatus: string;
  pendingProcedures: number;
  uploadedDocuments: number;
  openCallsForApplication: number;
  groupName: string;
  groupCode: string;
  alerts: AlertItem[];
}

export interface DashboardCoordinatorResponse {
  groupId: number;
  groupName: string;
  groupCode: string;
  totalMembers: number;
  activeMembers: number;
  totalGroupProjects: number;
  activeGroupProjects: number;
  pendingGroupProcedures: number;
  groupProgressReports: number;
  groupThesisPlans: number;
  submittedProcedures: number;
  proceduresUnderReview: number;
  approvedProcedures: number;
  observedProcedures: number;
  alerts: AlertItem[];
}

export interface DashboardTeacherResponse {
  projectsAsLead: number;
  projectsAsMember: number;
  pendingProcedures: number;
  pendingProgressReports: number;
  uploadedDocuments: number;
  receivedResolutions: number;
  submittedProjects: number;
  approvedProjects: number;
  projectsInExecution: number;
  completedProjects: number;
  alerts: AlertItem[];
}

export interface DashboardDirectorResponse {
  totalProjects: number;
  activeProjects: number;
  submittedProjects: number;
  observedProjects: number;
  pendingReviewProcedures: number;
  reportsNearingDeadline: number;
  issuedResolutions: number;
  openCallsForApplication: number;
  proceduresWithCoordinator: number;
  proceduresWithDirector: number;
  proceduresWithDean: number;
  completedProcedures: number;
  alerts: AlertItem[];
}

export interface DashboardDeanResponse {
  totalFacultyProjects: number;
  activeProjects: number;
  pendingSignatureProcedures: number;
  issuedResolutions: number;
  activeCallsForApplication: number;
  totalActiveGroups: number;
  waitingProcedures: number;
  approvedProceduresThisMonth: number;
  rejectedProceduresThisMonth: number;
  alerts: AlertItem[];
}

export interface DashboardEvaluatorResponse {
  assignedEvaluations: number;
  pendingEvaluations: number;
  completedEvaluations: number;
  assignedProjects: number;
  assignedThesisPlans: number;
  approvedEvaluations: number;
  rejectedEvaluations: number;
  evaluationsWithObservations: number;
  alerts: AlertItem[];
}
