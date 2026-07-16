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
import { useTranslation } from 'react-i18next';
import Pagination from '../../components/ui/Pagination';

// Helper formatting functions
function getStatusLabel(status: string, t: (key: string) => string): string {
  const labels: Record<string, string> = {
    PENDIENTE: t('status.pending'),
    EN_REVISION: t('status.inReview'),
    OBSERVADO: t('status.observed'),
    APROBADO: t('status.approved'),
    RECHAZADO: t('status.rejected'),
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
  const { t } = useTranslation('progressreports');
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
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Obtener informes pendientes o filtrados
      const data = await progressReportService.getPendingReports(filterStatus || undefined);
      setReports(data);
    } catch (err: any) {
      toast.showError(err.message || t('review.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    console.debug('loadingDetailState:', loadingDetail);
  }, [filterStatus, loadingDetail]);

  React.useEffect(() => {
    setPage(1);
  }, [filterStatus]);

  // Contadores basados en el estado actual de los reportes en la bandeja
  const pendingCount = useMemo(() => reports.filter(r => r.status === 'PENDIENTE').length, [reports]);
  const approvedCount = useMemo(() => reports.filter(r => r.status === 'APROBADO').length, [reports]);
  const observedCount = useMemo(() => reports.filter(r => r.status === 'OBSERVADO').length, [reports]);

  const handleAction = async (id: number, action: 'approve' | 'observe' | 'reject') => {
    let comment = '';
    if (action === 'observe') {
      const promptText = window.prompt(t('review.prompt.observeDetail'));
      if (promptText === null) return;
      if (!promptText.trim()) {
        toast.showError(t('review.prompt.commentRequired'));
        return;
      }
      comment = promptText.trim();
    } else if (action === 'reject') {
      if (!window.confirm(t('review.prompt.rejectConfirm'))) {
        return;
      }
    }

    try {
      setLoading(true);
      if (action === 'approve') {
        if (currentRole === 'COORDINADOR_GRUPO') {
          // Coordinador deriva al Director
          await progressReportService.forwardReport(id);
          toast.showSuccess(t('review.toast.forwarded'));
        } else {
          // Director aprueba definitivamente
          await progressReportService.approveReport(id);
          toast.showSuccess(t('review.toast.approved'));
        }
      } else if (action === 'observe') {
        await progressReportService.observeReport(id, comment);
        toast.showSuccess(t('review.toast.observed'));
      } else if (action === 'reject') {
        await progressReportService.rejectReport(id);
        toast.showSuccess(t('review.toast.rejected'));
      }
      fetchReports();
    } catch (err: any) {
      toast.showError(err.message || t('review.toast.actionError'));
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
      toast.showError(err.message || t('review.toast.detailError'));
      setSelectedReportId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDownload = (docId?: number, fileName?: string) => {
    if (!docId) {
      toast.showError(t('review.toast.noDocument'));
      return;
    }
    documentService.downloadFile(docId, fileName);
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
            {t('review.emptyState.title')}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', margin: 0 }}>
            {t('review.emptyState.subtitle')}
          </p>
        </div>
      );
    }

    const totalPages = Math.ceil(reports.length / PAGE_SIZE);
    const pagedReports = reports.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );

    return (
      <>
      <div style={{ display: 'grid', gap: '16px' }}>
        {pagedReports.map(report => (
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
                      <strong>{t('review.card.responsible')}:</strong> {report.responsibleName}
                    </span>

                    <span style={{ color: 'var(--on-surface-variant)' }}>
                      <strong>{t('review.card.progress')}:</strong> {report.physicalProgress}%
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
                      <strong>{t('review.card.sendDate')}:</strong> {formatDate(report.reportDate)}
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
                  {getStatusLabel(report.status, t)}
                </Badge>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="secondary"
                    style={{ padding: '8px' }}
                    title={t('review.card.viewDetail')}
                    icon={<Eye size={18} />}
                    onClick={() => handleViewDetail(report.id)}
                  />

                  {report.attachedDocumentId && (
                    <Button
                      variant="secondary"
                      style={{ padding: '8px' }}
                      title={t('review.card.downloadDoc')}
                      icon={<Download size={18} />}
                      onClick={() => handleDownload(report.attachedDocumentId, report.fileName)}
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
                        {currentRole === 'COORDINADOR_GRUPO' ? t('review.action.forward') : t('review.action.approve')}
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
                        {t('review.action.observe')}
                      </Button>

                      {currentRole === 'DIRECTOR_INVESTIGACION' && (
                        <Button
                          variant="danger"
                          style={{ padding: '8px 16px' }}
                          icon={<X size={18} />}
                          onClick={() => handleAction(report.id, 'reject')}
                        >
                          {t('review.action.reject')}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={reports.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
      </>
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
            {t('review.title')}
          </h1>
          <p
            className="text-body-md"
            style={{
              color: 'var(--on-surface-variant)',
              marginTop: '4px',
              maxWidth: '760px',
            }}
          >
            {t('review.subtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
            {t('review.filterByStatus')}
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
            <option value="PENDIENTE">{t('review.filterOptions.pendingCoordination')}</option>
            <option value="EN_REVISION">{t('review.filterOptions.inReviewDirection')}</option>
            <option value="APROBADO">{t('review.filterOptions.approved')}</option>
            <option value="OBSERVADO">{t('review.filterOptions.observed')}</option>
            <option value="RECHAZADO">{t('review.filterOptions.rejected')}</option>
            <option value="">{t('review.filterOptions.all')}</option>
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
          { label: t('review.stats.totalInTray'), value: reports.length, color: 'var(--primary)' },
          { label: t('review.stats.pending'), value: pendingCount, color: 'var(--warning)' },
          { label: t('review.stats.approved'), value: approvedCount, color: 'var(--success)' },
          { label: t('review.stats.observed'), value: observedCount, color: 'var(--info)' },
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
                    {t('review.detail.reportLabel', { id: reportDetail.id })}
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, marginTop: '4px' }}>{t('review.detail.title')}</h2>
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
                <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px' }}>{t('review.detail.project')}:</strong>
                <span>{reportDetail.projectTitle}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px' }}>{t('review.detail.period')}:</strong>
                  <span>{reportDetail.period}</span>
                </div>
                <div>
                  <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px' }}>{t('review.detail.progress')}:</strong>
                  <span>{reportDetail.physicalProgress}%</span>
                </div>
              </div>

              <div>
                <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px', marginBottom: '4px' }}>{t('review.detail.achievements')}:</strong>
                <p style={{ margin: 0, padding: '12px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', lineHeight: 1.5 }}>
                  {reportDetail.observations?.split('\n')?.[0]?.replace('Logros: ', '') || t('review.detail.noRecords')}
                </p>
              </div>

              <div>
                <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px', marginBottom: '4px' }}>{t('review.detail.difficulties')}:</strong>
                <p style={{ margin: 0, padding: '12px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', lineHeight: 1.5 }}>
                  {reportDetail.observations?.split('\n')?.[1]?.replace('Dificultades: ', '') || t('review.detail.noRecords')}
                </p>
              </div>

              {reportDetail.attachments && reportDetail.attachments.length > 0 && (
                <div>
                  <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px', marginBottom: '6px' }}>{t('review.detail.attachedDoc')}:</strong>
                  <Button
                    variant="secondary"
                    icon={<Download size={15} />}
                    onClick={() => handleDownload(reportDetail.attachments[0].id, reportDetail.attachments[0].fileName)}
                  >
                    {t('review.detail.download')} {reportDetail.attachments[0].fileName}
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