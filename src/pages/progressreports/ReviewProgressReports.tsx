import React from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileText, Check, X, Download } from 'lucide-react';

export const ReviewProgressReports: React.FC = () => {
  // Mock data for progress reports
  const reports = [
    { id: '1', project: 'Sistema de Riego Automatizado', author: 'Juan Pérez', period: 'Trimestre 1', status: 'Pendiente', dateSubmitted: '2026-06-25' },
    { id: '2', project: 'Impacto de la IA en la cadena de suministro', author: 'Ana Gómez', period: 'Trimestre 2', status: 'Revisado', dateSubmitted: '2026-05-10' },
  ];

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="text-headline-md">Revisión de Informes Trimestrales</h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
            Aprobación y revisión de los informes de avance de proyectos en ejecución.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--surface-container-high)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={24} color="var(--primary)" />
                </div>
                <div>
                  <h3 className="text-title-md" style={{ marginBottom: '4px' }}>{report.project}</h3>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                      <strong>Autor:</strong> {report.author}
                    </span>
                    <span className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                      <strong>Período:</strong> {report.period}
                    </span>
                    <span className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                      <strong>Enviado:</strong> {report.dateSubmitted}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Badge variant={report.status === 'Pendiente' ? 'warning' : 'success'}>
                  {report.status}
                </Badge>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="secondary" style={{ padding: '8px' }} title="Descargar Informe adjunto">
                    <Download size={18} />
                  </Button>
                  {report.status === 'Pendiente' && (
                    <>
                      <Button variant="primary" style={{ padding: '8px 16px', backgroundColor: 'var(--success)' }} icon={<Check size={18} />}>
                        Aprobar
                      </Button>
                      <Button variant="secondary" style={{ padding: '8px 16px', color: 'var(--error)', borderColor: 'var(--error)' }} icon={<X size={18} />}>
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
