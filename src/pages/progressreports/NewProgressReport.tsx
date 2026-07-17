import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { progressReportService, type ProjectSummary } from '../../services/progressReportService';
import { documentService } from '../../services/documentService';
import { useToast } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export const NewProgressReport: React.FC = () => {
  const { t } = useTranslation('progressreports');
  const navigate = useNavigate();
  const rawToast = useToast();
  const toast = useMemo(() => ({
    ...rawToast,
    showError: rawToast.error,
    showSuccess: rawToast.success,
  }), [rawToast]);
  useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [projectId, setProjectId] = useState<number | ''>('');
  const [reportType, setReportType] = useState<'PARCIAL' | 'FINAL'>('PARCIAL');
  const [period, setPeriod] = useState('');
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [achievements, setAchievements] = useState('');
  const [difficulties, setDifficulties] = useState('');
  const [recommendations, setRecommendations] = useState('');

  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachedDocumentId, setAttachedDocumentId] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoadingProjects(true);
        const data = await progressReportService.getProjectsByRole();
        setProjects(data);
      } catch (err: any) {
        toast.showError(err.message || t('new.fetchProjectsError'));
      } finally {
        setLoadingProjects(false);
      }
    }
    fetchProjects();
  }, [toast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toUpperCase();
    if (extension !== 'PDF' && extension !== 'DOC' && extension !== 'DOCX') {
      toast.showError(t('new.toast.invalidFileFormat'));
      return;
    }

    try {
      setUploadingFile(true);
      const res = await documentService.upload(file);
      setAttachedDocumentId(res.id);
      setFileName(file.name);
      toast.showSuccess(t('new.toast.fileUploaded'));
    } catch (err: any) {
      toast.showError(err.message || t('new.toast.uploadError'));
    } finally {
      setUploadingFile(false);
    }
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val < 0) setProgressPercentage(0);
    else if (val > 100) setProgressPercentage(100);
    else setProgressPercentage(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!projectId) {
      toast.showError(t('new.toast.projectRequired'));
      return;
    }
    if (!period.trim()) {
      toast.showError(t('new.toast.periodRequired'));
      return;
    }
    if (!achievements.trim() || !difficulties.trim() || !recommendations.trim()) {
      toast.showError(t('new.toast.fieldsRequired'));
      return;
    }
    if (attachedDocumentId === null) {
      toast.showError(t('new.toast.documentRequired'));
      return;
    }

    try {
      setLoading(true);
      await progressReportService.createReport({
        projectId: Number(projectId),
        reportType,
        period,
        progressPercentage,
        achievements,
        difficulties,
        recommendations,
        attachedDocumentId,
      });

      toast.showSuccess(t('new.toast.success'));
      navigate('/progressreports/history');
    } catch (err: any) {
      setErrorMsg(err.message || t('new.toast.saveError'));
      toast.showError(err.message || t('new.toast.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '28px', maxWidth: '900px', margin: '0 auto' }}>
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
        {t('new.backToHistory')}
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
              {t('new.title')}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', margin: 0, marginTop: '2px' }}>
              {t('new.subtitle')}
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
              <strong>{t('new.errorTitle')}:</strong> {errorMsg}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--on-surface)' }}>
              {t('new.form.project')} *
            </label>
            {loadingProjects ? (
              <div style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>{t('new.form.loadingProjects')}</div>
            ) : (
              <select
                id="select-project-new-report"
                value={projectId}
                onChange={e => setProjectId(e.target.value ? Number(e.target.value) : '')}
                required
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
              >
                <option value="">{t('new.form.selectProject')}</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--on-surface)' }}>
                {t('new.form.reportType')} *
              </label>
              <select
                id="select-report-type"
                value={reportType}
                onChange={e => setReportType(e.target.value as 'PARCIAL' | 'FINAL')}
                required
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
              >
                <option value="PARCIAL">{t('new.form.typePartial')}</option>
                <option value="FINAL">{t('new.form.typeFinal')}</option>
              </select>
            </div>

            <div>
              <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--on-surface)' }}>
                {t('new.form.period')} *
              </label>
              <input
                type="text"
                id="input-period"
                value={period}
                onChange={e => setPeriod(e.target.value)}
                required
                placeholder={t('new.form.periodPlaceholder')}
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
            </div>
          </div>

          <div>
            <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--on-surface)' }}>
              {t('new.form.progressPercentage')} *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="number"
                id="input-percentage"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={handlePercentageChange}
                required
                style={{
                  width: '120px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--outline)',
                  fontSize: '15px',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--on-surface)',
                  outline: 'none',
                  textAlign: 'center',
                }}
              />
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--on-surface)' }}>%</span>
              <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--surface-container-high)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercentage}%`,
                    backgroundColor: 'var(--primary)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--on-surface)' }}>
              {t('new.form.achievements')} *
            </label>
            <textarea
              id="input-achievements"
              rows={3}
              value={achievements}
              onChange={e => setAchievements(e.target.value)}
              required
              placeholder={t('new.form.achievementsPlaceholder')}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline)',
                fontSize: '14px',
                backgroundColor: 'var(--surface)',
                color: 'var(--on-surface)',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          </div>

          <div>
            <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--on-surface)' }}>
              {t('new.form.difficulties')} *
            </label>
            <textarea
              id="input-difficulties"
              rows={3}
              value={difficulties}
              onChange={e => setDifficulties(e.target.value)}
              required
              placeholder={t('new.form.difficultiesPlaceholder')}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline)',
                fontSize: '14px',
                backgroundColor: 'var(--surface)',
                color: 'var(--on-surface)',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          </div>

          <div>
            <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--on-surface)' }}>
              {t('new.form.recommendations')} *
            </label>
            <textarea
              id="input-recommendations"
              rows={3}
              value={recommendations}
              onChange={e => setRecommendations(e.target.value)}
              required
              placeholder={t('new.form.recommendationsPlaceholder')}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline)',
                fontSize: '14px',
                backgroundColor: 'var(--surface)',
                color: 'var(--on-surface)',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          </div>

          <div
            style={{
              border: '1px dashed var(--outline-variant)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              backgroundColor: 'var(--surface-container-low)',
              textAlign: 'center',
            }}
          >
            <input
              type="file"
              id="attached-file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={uploadingFile}
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
                htmlFor="attached-file"
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {uploadingFile ? t('new.form.uploadingFile') : t('new.form.selectSignedReport')}
              </label>
              <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                {t('new.form.allowedFormats')}
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
            >
              {t('new.form.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<Save size={16} />}
              disabled={loading || uploadingFile}
            >
              {loading ? t('new.form.saving') : t('new.form.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
