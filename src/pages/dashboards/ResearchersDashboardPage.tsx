import { DashboardPlaceholderPage } from './DashboardPlaceholderPage';

export default function ResearchersDashboardPage() {
  return (
    <DashboardPlaceholderPage
      title="Investigadores"
      description="Vista para seguimiento de usuarios, roles, grupos e investigadores activos."
      expectedEndpoint="GET /api/v1/users"
    />
  );
}