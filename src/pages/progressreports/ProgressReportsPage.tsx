import React, { useState } from 'react';
import { Search, PlusCircle, FileText } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { progressReportService } from '../../services/progressReportService';

export const ProgressReportsPage: React.FC = () => {
  const [projectId, setProjectId] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSearch = async () => {
    if (!projectId) {
      toast.error('Ingrese un ID de proyecto');
      return;
    }

    setLoading(true);
    try {
      const data = await progressReportService.getByProject(projectId);
      setReports(data || []);
      if (!data || data.length === 0) {
        toast.info('No se encontraron informes para este proyecto');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al buscar informes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="text-display-sm" style={{ color: 'var(--on-surface)' }}>
            Informes de Avance
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
            Gestión y seguimiento de entregables de investigación
          </p>
        </div>
        <Button variant="primary" icon={<PlusCircle size={20} />}>
          Nuevo Informe
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={20} />
            <span className="text-title-md">Búsqueda de Informes por Proyecto</span>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <Input
                type="number"
                placeholder="Ingrese ID del Proyecto"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={handleSearch} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>

          <div style={{ border: '1px solid var(--outline-variant)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: 'var(--surface-container-low)' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--outline-variant)' }}>ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--outline-variant)' }}>Tipo</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid var(--outline-variant)' }}>Avance (%)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid var(--outline-variant)' }}>Estado</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--outline-variant)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reports.length > 0 ? (
                  reports.map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>#{r.id}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>{r.type || 'PARCIAL'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid var(--outline-variant)' }}>
                        {r.percentage}%
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid var(--outline-variant)' }}>
                        <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'error' : 'warning'}>
                          {r.status || 'PENDIENTE'}
                        </Badge>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--outline-variant)' }}>
                        <Button variant="secondary" icon={<FileText size={16} />} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Ver Detalle</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                      No hay informes para mostrar. Busque un proyecto o registre uno nuevo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
