import { apiGet } from './api';
import type { BackendDashboardMe } from '../types/dashboard.types';

export async function getDashboardSummary(): Promise<BackendDashboardMe> {
  return apiGet<BackendDashboardMe>('/dashboard/me');
}