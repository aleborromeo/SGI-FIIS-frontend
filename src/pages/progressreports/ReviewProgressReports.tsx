import React, { useMemo, useState } from 'react';
import {
  Check,
  Clock,
  Download,
  Eye,
  FileText,
  RefreshCcw,
  X,
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

interface ProgressReport {
  id: string;
  project: string;
  author: string;
  period: string;
  status: 'PENDIENTE' | 'REVISADO' | 'OBSERVADO' | 'APROBADO';
  dateSubmitted: string;
}

function getStatusLabel(status: ProgressReport['status']): string {
  const labels: Record<ProgressReport['status'], string> = {
    PENDIENTE: 'Pendiente',
    REVISADO: 'Revisado',
    OBSERVADO: 'Observado',
    APROBADO: 'Aprobado',
  };

  return labels[status];
}

function getBadgeVariant(
  status: ProgressReport['status']
): 'warning' | 'success' | 'info' | 'neutral' {
  if (status === 'PENDIENTE') return 'warning';
  if (status === 'APROBADO') return 'success';
  if (status === 'OBSERVADO') return 'info';

  return 'neutral';
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

const initialReports: ProgressReport[] = [
  {
    id: '1',
    project: 'Sistema de Riego Automatizado',
    author: 'Juan Pérez',
    period: 'Trimestre 1',
    status: 'PENDIENTE',
    dateSubmitted: '2026-06-25',
  },
  {
    id: '2',
    project: 'Impacto de la IA en la cadena de suministro',
    author: 'Ana Gómez',
    period: 'Trimestre 2',
    status: 'REVISADO',
    dateSubmitted: '2026-05-10',
  },
];

export const ReviewProgressReports: React.FC = () => {
  const [reports, setReports] = useState<ProgressReport[]>(initialReports);
  const [message, setMessage] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => reports.filter((report) => report.status === 'PENDIENTE').length,
    [reports]
  );

  const approvedCount = useMemo(
    () => reports.filter((report) => report.status === 'APROBADO').length,
    [reports]
  );

  const observedCount = useMemo(
    () => reports.filter((report) => report.status === 'OBSERVADO').length,
    [reports]
  );

  function updateReportStatus(id: string, status: ProgressReport['status']) {
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === id ? { ...report, status } : report
      )
    );

    setMessage(
      status === 'APROBADO'
        ? 'Informe marcado como aprobado en la vista. La integración real con backend queda pendiente.'
        : 'Informe marcado como observado en la vista. La integración real con backend queda pendiente.'
    );
  }

  function resetReports() {
    setReports(initialReports);
    setMessage('La vista fue restaurada con los datos de demostración.');
  }

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '24px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 className="text-headline-lg">Revisión de Informes Trimestrales</h1>

          <p
            className="text-body-md"
            style={{
              color: 'var(--on-surface-variant)',
              marginTop: '8px',
              maxWidth: '760px',
            }}
          >
            Aprobación y revisión de los informes de avance de proyectos en ejecución.
          </p>
        </div>

        <Button
          variant="secondary"
          icon={<RefreshCcw size={16} />}
          onClick={resetReports}
        >
          Restaurar vista
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <Card>
          <CardContent>
            <strong style={{ display: 'block', fontSize: '28px' }}>
              {reports.length}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>
              Total recibidos
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <strong style={{ display: 'block', fontSize: '28px' }}>
              {pendingCount}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>
              Pendientes
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <strong style={{ display: 'block', fontSize: '28px' }}>
              {approvedCount}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>
              Aprobados
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <strong style={{ display: 'block', fontSize: '28px' }}>
              {observedCount}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>
              Observados
            </span>
          </CardContent>
        </Card>
      </div>

      {message && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title="Acción registrada en la vista">{message}</Alert>
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    backgroundColor: 'var(--surface-container-high)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileText size={24} color="var(--primary)" />
                </div>

                <div>
                  <h3
                    className="text-title-md"
                    style={{ marginBottom: '6px' }}
                  >
                    {report.project}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      className="text-body-sm"
                      style={{ color: 'var(--on-surface-variant)' }}
                    >
                      <strong>Autor:</strong> {report.author}
                    </span>

                    <span
                      className="text-body-sm"
                      style={{ color: 'var(--on-surface-variant)' }}
                    >
                      <strong>Período:</strong> {report.period}
                    </span>

                    <span
                      className="text-body-sm"
                      style={{
                        color: 'var(--on-surface-variant)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Clock size={14} />
                      <strong>Enviado:</strong> {formatDate(report.dateSubmitted)}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexShrink: 0,
                }}
              >
                <Badge variant={getBadgeVariant(report.status)}>
                  {getStatusLabel(report.status)}
                </Badge>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="secondary"
                    style={{ padding: '8px' }}
                    title="Ver detalle del informe"
                    icon={<Eye size={18} />}
                  />

                  <Button
                    variant="secondary"
                    style={{ padding: '8px' }}
                    title="Descargar informe adjunto"
                    icon={<Download size={18} />}
                  />

                  {report.status === 'PENDIENTE' && (
                    <>
                      <Button
                        variant="primary"
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'var(--success)',
                        }}
                        icon={<Check size={18} />}
                        onClick={() => updateReportStatus(report.id, 'APROBADO')}
                      >
                        Aprobar
                      </Button>

                      <Button
                        variant="secondary"
                        style={{
                          padding: '8px 16px',
                          color: 'var(--error)',
                          borderColor: 'var(--error)',
                        }}
                        icon={<X size={18} />}
                        onClick={() => updateReportStatus(report.id, 'OBSERVADO')}
                      >
                        Observar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewProgressReports;