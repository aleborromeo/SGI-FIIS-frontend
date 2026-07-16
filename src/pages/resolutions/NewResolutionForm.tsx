import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { resolutionService } from '../../services/resolutionService';

export const NewResolutionForm: React.FC = () => {
  const { t } = useTranslation('resolutions');
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const procedureId = Number(searchParams.get('procedureId'));
  const presetNumber = searchParams.get('number') || '';
  const presetTitle = searchParams.get('title') || '';

  const [resNumber, setResNumber] = useState(presetNumber);
  const [emissionDate, setEmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [resTitle, setResTitle] = useState(presetTitle);
  const [issuer, setIssuer] = useState('Decanato FIIS');
  const [fileSelected, setFileSelected] = useState<File | null>(null);

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState('12');
  const [receivesFif, setReceivesFif] = useState('SI');
  const [fifStatus, setFifStatus] = useState('ACTIVO');
  const [requiresArticle, setRequiresArticle] = useState('SI');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (diffMonths > 0) setDuration(String(diffMonths));
  }, [startDate, endDate]);

  useEffect(() => {
    if (!startDate) return;
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + 12);
    setEndDate(start.toISOString().split('T')[0]);
  }, [startDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedureId) {
      toast.error(t('new.error.saveFailed'));
      return;
    }
    setSubmitting(true);
    try {
      let attachedDocumentId: number | undefined;
      if (fileSelected) {
        attachedDocumentId = await resolutionService.uploadAttachment(fileSelected);
      }
      await resolutionService.create({
        procedureId,
        number: resNumber,
        title: resTitle,
        emissionDate,
        issuer,
        startDate,
        endDate,
        duration: Number(duration),
        receivesFif: receivesFif === 'SI',
        fifStatus,
        requiresArticle: requiresArticle === 'SI',
        attachedDocumentId,
      });
      toast.success(t('new.toast.success'));
      navigate('/decano/review');
    } catch (err: any) {
      toast.error(err.message || t('new.error.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '28px', maxWidth: '900px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/decano/review')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', fontWeight: 600, marginBottom: '20px' }}
      >
        <ArrowLeft size={16} /> {t('new.backToDecanoReview')}
      </button>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} style={{ color: 'white' }} />
          </span>
          {t('new.header.title')}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)', marginLeft: '54px' }}>
          {t('new.header.subtitle')}
        </p>
      </div>

      {procedureId ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px 20px', background: '#eef5ff', borderRadius: '12px', borderLeft: '4px solid var(--primary)', marginBottom: '24px' }}>
          <strong style={{ color: '#1e3a8a', fontSize: '14px' }}>{t('new.referenceProject')}</strong>
          <span style={{ fontSize: '14px', color: '#1e40af' }}>Trámite ID: {procedureId}</span>
        </div>
      ) : (
        <div style={{ padding: '14px 20px', background: '#fef3cd', borderRadius: '12px', borderLeft: '4px solid #f59e0b', marginBottom: '24px' }}>
          <span style={{ fontSize: '14px', color: '#92400e' }}>{t('new.error.saveFailed')}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <CardHeader>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                1. {t('new.section1.title')}
              </h3>
            </CardHeader>
            <CardContent style={{ padding: '20px' }}>
              <div className="form-row" style={{ gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    {t('new.form.resolutionNumber')} *
                  </label>
                  <Input
                    required
                    placeholder={t('new.form.resolutionNumberPlaceholder')}
                    value={resNumber}
                    onChange={(e) => setResNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    {t('new.form.emissionDate')} *
                  </label>
                  <Input
                    required
                    type="date"
                    value={emissionDate}
                    onChange={(e) => setEmissionDate(e.target.value)}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    {t('new.form.resolutionTitle')} *
                  </label>
                  <Input
                    required
                    placeholder={t('new.form.resolutionTitlePlaceholder')}
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    {t('new.form.issuingBody')}
                  </label>
                  <Input
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    {t('new.form.attachPdf')}
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFileSelected(e.target.files ? e.target.files[0] : null)}
                    style={{ display: 'block', width: '100%', padding: '8px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                2. {t('new.section2.title')}
              </h3>
            </CardHeader>
            <CardContent style={{ padding: '20px' }}>
              <div className="form-row-3" style={{ gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    {t('new.form.executionStart')} *
                  </label>
                  <Input
                    required
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    {t('new.form.executionEnd')} *
                  </label>
                  <Input
                    required
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    {t('new.form.estimatedDuration')}
                  </label>
                  <Input disabled value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    {t('new.form.receivesFif')} *
                  </label>
                  <Select
                    value={receivesFif}
                    onChange={(e) => setReceivesFif(e.target.value)}
                    options={[
                      { value: 'SI', label: t('new.form.yes') },
                      { value: 'NO', label: t('new.form.no') },
                    ]}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    {t('new.form.fifStatus')}
                  </label>
                  <Select
                    value={fifStatus}
                    onChange={(e) => setFifStatus(e.target.value)}
                    disabled={receivesFif === 'NO'}
                    options={[
                      { value: 'ACTIVO', label: t('new.form.fifActive') },
                      { value: 'SUSPENDIDO', label: t('new.form.fifSuspended') },
                      { value: 'NO_APLICA', label: t('new.form.fifNotApplicable') },
                    ]}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    {t('new.form.requiresArticle')} *
                  </label>
                  <Select
                    value={requiresArticle}
                    onChange={(e) => setRequiresArticle(e.target.value)}
                    options={[
                      { value: 'SI', label: t('new.form.yesFifRequired') },
                      { value: 'NO', label: t('new.form.no') },
                    ]}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button type="button" variant="secondary" onClick={() => navigate('/decano/review')}>
              {t('new.form.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={submitting || !procedureId} icon={<Save size={16} />}>
              {submitting ? t('new.form.saving') : t('new.form.submit')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewResolutionForm;
