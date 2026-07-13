import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { progressReportService, type ProgressReportDetail } from '../../services/progressReportService';
import { documentService } from '../../services/documentService';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/common/Spinner';

export const AmendProgressReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const rawToast = useToast();
  const toast = useMemo(() => ({
    ...rawToast,
    showError: rawToast.error,
    showSuccess: rawToast.success,
  }), [rawToast]);

  const [loadingReport, setLoadingReport] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<ProgressReportDetail | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [amendmentDocumentId, setAmendmentDocumentId] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      if (!id) return;
      try {
        setLoadingReport(true);
        const data = await progressReportService.getDetail(Number(id));
        setReport(data);
      } catch (err: any) {
        toast.showError(err.message || 'Error al cargar el detalle del informe.');
        setErrorMsg('No se pudo obtener el informe de avance seleccionado.');
      } finally {
        setLoadingReport(false);
      }
    }
    fetchReport();
  }, [id, toast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toUpperCase();
    if (extension !== 'PDF' && extension !== 'DOC' && extension !== 'DOCX') {
      toast.showError('Solo se permiten archivos en formato PDF, DOC o DOCX.');
      return;
    }

    try {
      setUploadingFile(true);
      const res = await documentService.upload(file);
      setAmendmentDocumentId(res.id);
      setFileName(file.name);
      toast.showSuccess('Documento de subsanación cargado exitosamente.');
    } catch (err: any) {
      toast.showError(err.message || 'Error al cargar el archivo.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!id) return;
    if (amendmentDocumentId === null) {
      toast.showError('Es obligatorio cargar el documento corregido para enviar la subsanación.');
      return;
    }

    try {
      setSubmitting(true);
      await progressReportService.amendReport(Number(id), {
        amendmentDocumentId,
      });

      toast.showSuccess('Subsanación enviada exitosamente.');
      navigate('/progressreports/history');
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al enviar la subsanación.');
      toast.showError(err.message || 'Error al subsanar el informe.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingReport) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
        <Spinner size="large" />
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>Cargando datos del informe de avance...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ padding: '28px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <strong>Error:</strong> {errorMsg || 'No se encontró el informe de avance especificado.'}
        </div>
        <Button onClick={() => navigate('/progressreports/history')}>Volver al Historial</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '28px', maxWidth: '800px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={() => navigate('/progressreports/history')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--on-surface-variant)',
          fontWeight: 600,
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={18} />
        Volver al Historial de Informes
      </button>

      <div
        style={{
          backgroundColor: 'var(--surface-container-lowest)',
          padding: '36px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--outline-variant)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(234, 88, 12, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--warning)',
            }}
          >
            <FileText size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>
              Subsanar Informe de Avance #{report.id}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', margin: 0, marginTop: '2px' }}>
              Suba una nueva versión del informe corrigiendo las observaciones señaladas.
            </p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--outline-variant)', margin: '24px 0' }} />

        {/* Panel de Observaciones */}
        {report.comments && report.comments.length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--error-container)',
              color: 'var(--on-error-container)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              marginBottom: '28px',
              border: '1px solid var(--error)',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={18} /> Observación Registrada
            </h3>
            <p style={{ fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
              {report.comments[0].content}
            </p>
          </div>
        )}

        {/* Datos de contexto del informe previo */}
        <div
          style={{
            backgroundColor: 'var(--surface-container-low)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            marginBottom: '28px',
            border: '1px solid var(--outline-variant)',
            fontSize: '14px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}
        >
          <div>
            <span style={{ fontWeight: 600, color: 'var(--on-surface-variant)' }}>Proyecto: </span>
            <span style={{ color: 'var(--on-surface)' }}>{report.projectTitle || `Proyecto #${report.projectId}`}</span>
          </div>
          <div>
            <span style={{ fontWeight: 600, color: 'var(--on-surface-variant)' }}>Período: </span>
            <span style={{ color: 'var(--on-surface)' }}>{report.period}</span>
          </div>
          <div>
            <span style={{ fontWeight: 600, color: 'var(--on-surface-variant)' }}>Porcentaje de Avance Reportado: </span>
            <span style={{ color: 'var(--on-surface)' }}>{report.physicalProgress}%</span>
          </div>
          <div>
            <span style={{ fontWeight: 600, color: 'var(--on-surface-variant)' }}>Estado Actual: </span>
            <span style={{ color: 'var(--on-surface)', fontWeight: 700 }}>{report.status}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Carga del nuevo Archivo */}
          <div>
            <label className="text-label-md" style={{ display: 'block', marginBottom: '12px', fontWeight: 600, color: 'var(--on-surface)' }}>
              Subir Documento Corregido (Firmado) *
            </label>
            <div
              style={{
                border: '1px dashed var(--outline-variant)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px 24px',
                backgroundColor: 'var(--surface-container-low)',
                textAlign: 'center',
              }}
            >
              <input
                type="file"
                id="amendment-file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={uploadingFile || submitting}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--surface-container-high)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--on-surface-variant)',
                  }}
                >
                  <Upload size={22} />
                </div>
                <label
                  htmlFor="amendment-file"
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {uploadingFile ? 'Cargando archivo...' : 'Seleccione el nuevo informe corregido'}
                </label>
                <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                  Formatos permitidos: PDF, DOC, DOCX (Máx. 10MB)
                </span>

                {fileName && (
                  <div
                    style={{
                      marginTop: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'var(--surface-container-lowest)',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #d1fae5',
                      color: '#065f46',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle size={15} />
                    <span>{fileName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '16px',
              borderTop: '1px solid var(--outline-variant)',
              paddingTop: '20px',
            }}
          >
            <Button
              type="button"
              variant="secondary"
              icon={<X size={16} />}
              onClick={() => navigate('/progressreports/history')}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<Save size={16} />}
              disabled={submitting || uploadingFile}
            >
              {submitting ? 'Enviando...' : 'Enviar Correcciones'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
