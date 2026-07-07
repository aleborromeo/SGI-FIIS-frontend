import { DashboardPlaceholderPage } from './DashboardPlaceholderPage';

export default function ReportsDashboardPage() {
  return (
    <DashboardPlaceholderPage
      title="Reportes"
      description="Vista para generación y consulta de reportes institucionales."
      expectedEndpoint="GET /api/reportes"
    />
  );
}