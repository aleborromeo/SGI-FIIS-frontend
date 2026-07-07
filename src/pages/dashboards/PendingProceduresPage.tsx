import { DashboardPlaceholderPage } from './DashboardPlaceholderPage';

export default function PendingProceduresPage() {
  return (
    <DashboardPlaceholderPage
      title="Bandeja de trámites"
      description="Vista destinada al seguimiento de trámites, revisiones y estados administrativos."
      expectedEndpoint="GET /api/v1/procedures"
    />
  );
}