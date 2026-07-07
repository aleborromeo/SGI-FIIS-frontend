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