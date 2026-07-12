import { fetchApi } from './api';

export interface ThesisPlan {
  id: string;
  title: string;
  status: string;
  resumen?: string;
  idDocumentoActual?: string;
  revisorActual?: string;
  estadoPlan?: string;
}

export interface ThesisReport {
  id: string;
  status: string;
  // ...
}

export const thesisService = {
  // Plans
  createPlan: (data: Partial<ThesisPlan>) => fetchApi<ThesisPlan>('/thesis/plans', { method: 'POST', body: JSON.stringify(data) }),
  getPlanById: (id: string) => fetchApi<ThesisPlan>(`/thesis/plans/${id}`),
  getPlansByStudent: (id: string) => fetchApi<ThesisPlan[]>(`/thesis/plans/student/${id}`),
  getPlansByGroup: (id: string) => fetchApi<ThesisPlan[]>(`/thesis/plans/group/${id}`),
  getPendingPlans: (revisor: string) => fetchApi<ThesisPlan[]>(`/thesis/plans/pending?revisor=${revisor}`),
  
  // Plan Approvals
  approveCoordinator: (id: string) => fetchApi(`/thesis/plans/${id}/coordinator/approve`, { method: 'PATCH' }),
  observeCoordinator: (id: string, notes: string) => fetchApi(`/thesis/plans/${id}/coordinator/observe`, { method: 'PATCH', body: JSON.stringify({ observacion: notes }) }),
  rejectCoordinator: (id: string, reason: string) => fetchApi(`/thesis/plans/${id}/coordinator/reject?motivo=${encodeURIComponent(reason)}`, { method: 'PATCH' }),
  approveDirector: (id: string) => fetchApi(`/thesis/plans/${id}/director/approve`, { method: 'PATCH' }),
  observeDirector: (id: string, notes: string) => fetchApi(`/thesis/plans/${id}/director/observe`, { method: 'PATCH', body: JSON.stringify({ observacion: notes }) }),
  rectifyPlan: (id: string, changes: any) => fetchApi(`/thesis/plans/${id}/rectify`, { method: 'PATCH', body: JSON.stringify(changes) }),
  issueDeanResolution: (id: string, data: any) => fetchApi(`/thesis/plans/${id}/dean/resolution`, { method: 'POST', body: JSON.stringify(data) }),

  // Reports
  createReport: (data: Partial<ThesisReport>) => fetchApi<ThesisReport>('/thesis/reports', { method: 'POST', body: JSON.stringify(data) }),
  getReportById: (id: string) => fetchApi<ThesisReport>(`/thesis/reports/${id}`),
  getReportByPlanId: (planId: string) => fetchApi<ThesisReport>(`/thesis/reports/plan/${planId}`),
  approveReport: (id: string) => fetchApi(`/thesis/reports/${id}/approve`, { method: 'PATCH' }),
  observeReport: (id: string, notes: string) => fetchApi(`/thesis/reports/${id}/observe?observacion=${encodeURIComponent(notes)}`, { method: 'PATCH' }),
};
