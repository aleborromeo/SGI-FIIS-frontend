import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, X, FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { thesisService } from '../../services/thesisService';
import { documentService } from '../../services/documentService';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/common/Spinner';

export const NewThesisReport: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation('thesis');

  const [loadingPlan, setLoadingPlan] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [plan, setPlan] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [tituloFinal, setTituloFinal] = useState('');
  const [idDocumentoTesis, setIdDocumentoTesis] = useState<number | null>(null);

  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlan() {
      if (!planId) return;
      try {
        setLoadingPlan(true);
        const data = await thesisService.getPlanById(planId);
        setPlan(data);
        // Pre-poblar el título final con el título del plan aprobado
        const pTitle = data.title || '';
        setTituloFinal(pTitle);
      } catch (err: any) {
        toast.error(err.message || t('thesis:reportForm.errors.loadPlan'));
        setErrorMsg(t('thesis:reportForm.planNotFound'));
      } finally {
        setLoadingPlan(false);
      }
    }
    fetchPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toUpperCase();
    if (extension !== 'PDF' && extension !== 'DOC' && extension !== 'DOCX') {
      toast.error(t('thesis:reportForm.errors.invalidFormat'));
      return;
    }

    try {
      setUploadingFile(true);
      const res = await documentService.upload(file);
      setIdDocumentoTesis(res.id);
      setFileName(file.name);
      toast.success(t('thesis:reportForm.errors.uploadSuccess'));
    } catch (err: any) {
      toast.error(err.message || t('thesis:reportForm.errors.uploadError'));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!planId) return;
    if (!tituloFinal.trim()) {
      toast.error(t('thesis:reportForm.errors.titleRequired'));
      return;
    }
    if (idDocumentoTesis === null) {
      toast.error(t('thesis:reportForm.errors.documentRequired'));
      return;
    }

    try {
      setSubmitting(true);
      await thesisService.createReport({
        idPlanTesis: Number(planId),
        tituloFinal: tituloFinal.trim(),
        idDocumentoTesis: idDocumentoTesis,
      } as any);

      toast.success(t('thesis:reportForm.errors.submitSuccess'));
      navigate(`/thesis/plan/${planId}`);
    } catch (err: any) {
      setErrorMsg(err.message || t('thesis:reportForm.errors.submitError'));
      toast.error(err.message || t('thesis:reportForm.errors.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPlan) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
        <Spinner size="large" />
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>{t('thesis:reportForm.loadingPlan')}</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ padding: '28px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <strong>{t('thesis:reportForm.errorPrefix')}</strong> {errorMsg || t('thesis:reportForm.planNotFound')}
        </div>
        <Button onClick={() => navigate('/thesis/plans')}>{t('thesis:reportForm.backToPlans')}</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '28px', maxWidth: '800px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={() => navigate(`/thesis/plan/${planId}`)}
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
        {t('thesis:reportForm.backToTraceability')}
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
              backgroundColor: 'rgba(26, 54, 93, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <FileText size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>
              {t('thesis:reportForm.title')}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', margin: 0, marginTop: '2px' }}>
              {t('thesis:reportForm.subtitle')}
            </p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--outline-variant)', margin: '24px 0' }} />

        {errorMsg && (
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--error-container)',
              color: 'var(--on-error-container)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={20} />
            <div>
              <strong>{t('thesis:reportForm.errorPrefix')}</strong> {errorMsg}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Fila 1: Título Final de la Tesis */}
          <div>
            <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--on-surface)' }}>
              {t('thesis:reportForm.finalTitle')}
            </label>
            <input
              type="text"
              id="input-thesis-final-title"
              value={tituloFinal}
              onChange={e => setTituloFinal(e.target.value)}
              required
              placeholder={t('thesis:reportForm.finalTitlePlaceholder')}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline)',
                fontSize: '15px',
                backgroundColor: 'var(--surface)',
                color: 'var(--on-surface)',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', display: 'block', marginTop: '4px' }}>
              {t('thesis:reportForm.finalTitleHint')}
            </span>
          </div>

          {/* Fila 2: Carga del Archivo de Tesis */}
          <div>
            <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--on-surface)' }}>
              {t('thesis:reportForm.uploadFile')}
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
                id="attached-thesis-file"
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
                  htmlFor="attached-thesis-file"
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {uploadingFile ? t('thesis:reportForm.uploadingFile') : t('thesis:reportForm.selectFile')}
                </label>
                <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                  {t('thesis:reportForm.allowedFormats')}
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
              onClick={() => navigate(`/thesis/plan/${planId}`)}
              disabled={submitting}
            >
              {t('thesis:reportForm.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<Save size={16} />}
              disabled={submitting || uploadingFile}
            >
              {submitting ? t('thesis:reportForm.sending') : t('thesis:reportForm.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
