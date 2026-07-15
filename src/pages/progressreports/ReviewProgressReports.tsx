import React, { useContext, useEffect, useState, useMemo } from 'react';
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
import { Spinner } from '../../components/common/Spinner';
import { AuthContext } from '../../context/AuthContext';
import { progressReportService, type ProgressReport } from '../../services/progressReportService';
import { documentService } from '../../services/documentService';
import { useToast } from '../../context/ToastContext';

// Helper formatting functions
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    EN_REVISION: 'En revisión',
    OBSERVADO: 'Observado',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado',
  };
  return labels[status.toUpperCase()] ?? status;
}

function getBadgeVariant(status: string): 'warning' | 'success' | 'info' | 'neutral' | 'error' {
  const norm = status.toUpperCase();
  if (norm === 'PENDIENTE') return 'warning';
  if (norm === 'APROBADO') return 'success';
  if (norm === 'OBSERVADO') return 'info';
  if (norm === 'RECHAZADO') return 'error';
  return 'neutral';
}

function formatDate(value?: string): string {
  if (!value) return '—';
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

export const ReviewProgressReports: React.FC = () => {
  const { currentRole } = useContext(AuthContext);
  const rawToast = useToast();
  const toast = useMemo(() => ({
    ...rawToast,
    showError: rawToast.error,
    showSuccess: rawToast.success,
  }), [rawToast]);

  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('PENDIENTE');
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [reportDetail, setReportDetail] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Obtener informes pendientes o filtrados
      const data = await progressReportService.getPendingReports(filterStatus || undefined);
      setReports(data);
    } catch (err: any) {
      toast.showError(err.message || 'Error al obtener los informes de avance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  // Contadores basados en el estado actual de los reportes en la bandeja
  const pendingCount = useMemo(() => reports.filter(r => r.status === 'PENDIENTE').length, [reports]);
  const approvedCount = useMemo(() => reports.filter(r => r.status === 'APROBADO').length, [reports]);
  const observedCount = useMemo(() => reports.filter(r => r.status === 'OBSERVADO').length, [reports]);

  const handleAction = async (id: number, action: 'approve' | 'observe' | 'reject') => {
    let comment = '';
    if (action === 'observe') {
      const promptText = window.prompt('Escriba el detalle de la observación para el docente:');
      if (promptText === null) return;
      if (!promptText.trim()) {
        toast.showError('Debe ingresar un comentario para registrar la observación.');
        return;
      }
      comment = promptText.trim();
    } else if (action === 'reject') {
      if (!window.confirm('¿Está seguro de que desea rechazar definitivamente este informe? Esta acción no se puede deshacer.')) {
        return;
      }
    }

    try {
      setLoading(true);
      if (action === 'approve') {
        if (currentRole === 'COORDINADOR_GRUPO') {
          // Coordinador deriva al Director
          await progressReportService.forwardReport(id);
          toast.showSuccess('Informe de avance derivado exitosamente al Director de Investigación.');
        } else {
          // Director aprueba definitivamente
          await progressReportService.approveReport(id);
          toast.showSuccess('Informe de avance aprobado exitosamente.');
        }
      } else if (action === 'observe') {
        await progressReportService.observeReport(id, comment);
        toast.showSuccess('Informe de avance devuelto con observaciones.');
      } else if (action === 'reject') {
        await progressReportService.rejectReport(id);
        toast.showSuccess('Informe de avance rechazado.');
      }
      fetchReports();
    } catch (err: any) {
      toast.showError(err.message || 'Error al procesar la acción sobre el informe.');
      setLoading(false);
    }
  };

  const handleViewDetail = async (id: number) => {
    setSelectedReportId(id);
    setLoadingDetail(true);
    try {
      const res = await progressReportService.getDetail(id);
      setReportDetail(res);
    } catch (err: any) {
      toast.showError(err.message || 'Error al cargar los detalles del informe.');
      setSelectedReportId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDownload = (docId?: number) => {
    if (!docId) {
      toast.showError('Este informe no cuenta con un documento físico adjunto.');
      return;
    }
    const url = documentService.download(docId);
    window.open(url, '_blank');
  };

  const renderReportsContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <Spinner size="large" />
        </div>
      );
    }

    if (reports.length === 0) {
      return (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            backgroundColor: 'var(--surface-container-low)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--outline)',
          }}
        >
          <FileText size={48} style={{ color: 'var(--on-surface-variant)', opacity: 0.4, marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)' }}>
            No se encontraron informes de avance
          </p>
          <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', margin: 0 }}>
            No hay reportes de avance registrados bajo los filtros seleccionados.
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gap: '16px' }}>
        {reports.map(report => (
          <Card key={report.id}>
            <CardContent
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '24px',
                padding: '20px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'rgba(26, 54, 93, 0.08)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileText size={22} color="var(--primary)" />
                </div>

                <div>
                  <h3 className="text-title-md" style={{ marginBottom: '6px', fontWeight: 700 }}>
                    {report.projectTitle}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      fontSize: '13px',
                    }}
                  >
                    <span style={{ color: 'var(--on-surface-variant)' }}>
                      <strong>Responsable:</strong> {report.responsibleName}
                    </span>

                    <span style={{ color: 'var(--on-surface-variant)' }}>
                      <strong>Avance:</strong> {report.physicalProgress}%
                    </span>

                    <span
                      style={{
                        color: 'var(--on-surface-variant)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Clock size={13} />
                      <strong>Fecha Envío:</strong> {formatDate(report.reportDate)}
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
                    onClick={() => handleViewDetail(report.id)}
                  />

                  {report.attachedDocumentId && (
                    <Button
                      variant="secondary"
                      style={{ padding: '8px' }}
                      title="Descargar informe adjunto"
                      icon={<Download size={18} />}
                      onClick={() => handleDownload(report.attachedDocumentId)}
                    />
                  )}

                  {/* Mostrar acciones de aprobación sólo si está PENDIENTE en Coordinación o EN_REVISION en Dirección */}
                  {((currentRole === 'COORDINADOR_GRUPO' && report.status === 'PENDIENTE') ||
                    (currentRole === 'DIRECTOR_INVESTIGACION' && report.status === 'EN_REVISION')) && (
                    <>
                      <Button
                        variant="primary"
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#059669',
                        }}
                        icon={<Check size={18} />}
                        onClick={() => handleAction(report.id, 'approve')}
                      >
                        {currentRole === 'COORDINADOR_GRUPO' ? 'Derivar' : 'Aprobar'}
                      </Button>

                      <Button
                        variant="secondary"
                        style={{
                          padding: '8px 16px',
                          color: 'var(--error)',
                          borderColor: 'var(--error)',
                        }}
                        icon={<X size={18} />}
                        onClick={() => handleAction(report.id, 'observe')}
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
    );
  };

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '28px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 className="text-headline-lg" style={{ fontWeight: 700 }}>
            Revisión de Informes de Avance
          </h1>
          <p
            className="text-body-md"
            style={{
              color: 'var(--on-surface-variant)',
              marginTop: '4px',
              maxWidth: '760px',
            }}
          >
            Aprobación, derivación y seguimiento de los informes parciales y finales de investigación.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
            Filtrar por Estado:
          </span>
          <select
            id="filter-report-status"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--outline)',
              fontSize: '14px',
              backgroundColor: 'var(--surface)',
              color: 'var(--on-surface)',
              outline: 'none',
            }}
          >
            <option value="PENDIENTE">Pendientes de Coordinación</option>
            <option value="EN_REVISION">En revisión (Dirección)</option>
            <option value="APROBADO">Aprobados</option>
            <option value="OBSERVADO">Observados</option>
            <option value="RECHAZADO">Rechazados</option>
            <option value="">Todos los informes</option>
          </select>
          <Button variant="secondary" icon={<RefreshCcw size={16} />} onClick={fetchReports} />
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {[
          { label: 'Total en Bandeja', value: reports.length, color: 'var(--primary)' },
          { label: 'Pendientes', value: pendingCount, color: 'var(--warning)' },
          { label: 'Aprobados', value: approvedCount, color: 'var(--success)' },
          { label: 'Observados', value: observedCount, color: 'var(--info)' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent style={{ padding: '16px 20px' }}>
              <strong style={{ display: 'block', fontSize: '28px', color: stat.color }}>
                {stat.value}
              </strong>
              <span style={{ color: 'var(--on-surface-variant)', fontSize: '13px' }}>
                {stat.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cuerpo principal de informes */}
      {renderReportsContent()}

      {/* Modal / Sidebar de Detalles */}
      {selectedReportId && reportDetail && (
        /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
          }}
          onClick={() => { setSelectedReportId(null); setReportDetail(null); }}
        >
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
          <div
            style={{
              backgroundColor: 'var(--surface-container-lowest)',
              width: '100%',
              maxWidth: '560px',
              height: '100vh',
              overflowY: 'auto',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
              padding: '32px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Informe de Avance #{reportDetail.id}
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, marginTop: '4px' }}>Detalles del Reporte</h2>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedReportId(null); setReportDetail(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px' }}>
              <div>
                <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px' }}>Proyecto:</strong>
                <span>{reportDetail.projectTitle}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px' }}>Período:</strong>
                  <span>{reportDetail.period}</span>
                </div>
                <div>
                  <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px' }}>Avance:</strong>
                  <span>{reportDetail.physicalProgress}%</span>
                </div>
              </div>

              <div>
                <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px', marginBottom: '4px' }}>Logros:</strong>
                <p style={{ margin: 0, padding: '12px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', lineHeight: 1.5 }}>
                  {reportDetail.observations?.split('\n')?.[0]?.replace('Logros: ', '') || 'Sin registros'}
                </p>
              </div>

              <div>
                <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px', marginBottom: '4px' }}>Dificultades:</strong>
                <p style={{ margin: 0, padding: '12px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', lineHeight: 1.5 }}>
                  {reportDetail.observations?.split('\n')?.[1]?.replace('Dificultades: ', '') || 'Sin registros'}
                </p>
              </div>

              {reportDetail.attachments && reportDetail.attachments.length > 0 && (
                <div>
                  <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px', marginBottom: '6px' }}>Documento adjunto:</strong>
                  <Button
                    variant="secondary"
                    icon={<Download size={15} />}
                    onClick={() => handleDownload(reportDetail.attachments[0].id)}
                  >
                    Descargar {reportDetail.attachments[0].fileName}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewProgressReports;