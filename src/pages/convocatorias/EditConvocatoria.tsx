/**
 * EditConvocatoria.tsx
 * Formulario de edicion de convocatoria (DIRECTOR_INVESTIGACION / ADMIN).
 * Solo permite editar convocatorias en estado ABIERTA.
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save, ArrowLeft, AlertCircle, Calendar, BookOpen,
  Megaphone, FileText, ChevronRight, Check, Loader, Lock,
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { callService } from '../../services/callService';
import { researchService } from '../../services/researchService';
import type { ResearchLine } from '../../services/researchService';

interface FormErrors {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  lines?: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid var(--outline-variant)',
  borderRadius: 'var(--radius-md)',
  fontSize: '14px',
  backgroundColor: 'var(--surface)',
  color: 'var(--on-surface)',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  fontFamily: 'inherit',
};

export const EditConvocatoria: React.FC = () => {
  const { t } = useTranslation('convocatorias');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [selectedLineIds, setSelectedLineIds] = useState<number[]>([]);
  const [lines, setLines] = useState<ResearchLine[]>([]);
  const [loadingLines, setLoadingLines] = useState(true);
  const [loadingCall, setLoadingCall] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [callNotFound, setCallNotFound] = useState(false);
  const [callStatus, setCallStatus] = useState('');

  useEffect(() => {
    if (!id) return;
    const callId = parseInt(id, 10);
    if (isNaN(callId)) { setCallNotFound(true); setLoadingCall(false); return; }

    Promise.all([
      callService.getById(callId),
      researchService.getLines(true),
    ])
      .then(([call, allLines]) => {
        if (!call || !call.id) { setCallNotFound(true); return; }
        setCallStatus(call.status);
        if (call.status !== 'ABIERTA') return;
        setFormData({
          title: call.title || '',
          description: call.description || '',
          startDate: call.startDate || '',
          endDate: call.endDate || '',
        });
        setSelectedLineIds(call.researchLineIds || []);
        setLines(allLines || []);
      })
      .catch(() => setCallNotFound(true))
      .finally(() => { setLoadingCall(false); setLoadingLines(false); });
  }, [id]);

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'title':
        if (!value.trim()) return t('pages.editPage.titleRequired');
        if (value.trim().length < 5) return t('pages.editPage.titleMinChars');
        return undefined;
      case 'description':
        if (!value.trim()) return t('pages.editPage.descriptionRequired');
        if (value.trim().length < 20) return t('pages.editPage.descriptionMinChars');
        return undefined;
      case 'startDate':
        if (!value) return t('pages.editPage.startDateRequired');
        return undefined;
      case 'endDate':
        if (!value) return t('pages.editPage.endDateRequired');
        if (formData.startDate && value < formData.startDate) return t('pages.editPage.endDateAfterStart');
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const toggleLine = (lineId: number) => {
    setSelectedLineIds(prev =>
      prev.includes(lineId) ? prev.filter(x => x !== lineId) : [...prev, lineId]
    );
    setErrors(prev => ({ ...prev, lines: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    const titleErr = validateField('title', formData.title);
    const descErr = validateField('description', formData.description);
    const startErr = validateField('startDate', formData.startDate);
    const endErr = validateField('endDate', formData.endDate);
    if (titleErr) e.title = titleErr;
    if (descErr) e.description = descErr;
    if (startErr) e.startDate = startErr;
    if (endErr) e.endDate = endErr;
    if (selectedLineIds.length === 0) e.lines = t('pages.editPage.linesRequired');
    setErrors(e);
    setTouched({ title: true, description: true, startDate: true, endDate: true });
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !id) {
      toast.error(t('pages.editPage.validationError'));
      return;
    }
    setLoading(true);
    try {
      await callService.update(parseInt(id, 10), {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        researchLineIds: selectedLineIds,
      });
      toast.success(t('pages.editPage.updateSuccess'));
      navigate('/convocatorias');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('pages.editPage.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const charCount = formData.description.length;
  const completionScore = [
    formData.title.trim().length >= 5,
    formData.description.trim().length >= 20,
    !!formData.startDate,
    !!formData.endDate,
    selectedLineIds.length > 0,
  ].filter(Boolean).length;

  if (loadingCall) {
    return (
      <div className="animate-fade-in" style={{ padding: '28px', display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <Spinner size="large" />
      </div>
    );
  }

  if (callNotFound) {
    return (
      <div className="animate-fade-in" style={{ padding: '28px', textAlign: 'center', paddingTop: '80px' }}>
        <AlertCircle size={48} style={{ color: 'var(--error)', opacity: 0.5, margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{t('pages.editPage.notFound')}</h2>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '24px' }}>{t('pages.editPage.notFoundDesc')}</p>
        <Button variant="primary" icon={<ArrowLeft size={16} />} onClick={() => navigate('/convocatorias')}>
          {t('pages.editPage.back')}
        </Button>
      </div>
    );
  }

  if (callStatus !== 'ABIERTA') {
    return (
      <div className="animate-fade-in" style={{ padding: '28px', textAlign: 'center', paddingTop: '80px' }}>
        <Lock size={48} style={{ color: 'var(--on-surface-variant)', opacity: 0.3, margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{t('pages.editPage.notEditable')}</h2>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '24px' }}
           dangerouslySetInnerHTML={{ __html: t('pages.editPage.notEditableDesc', { status: callStatus }) }}
        />
        <Button variant="primary" icon={<ArrowLeft size={16} />} onClick={() => navigate('/convocatorias')}>
          {t('pages.editPage.back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '28px', maxWidth: '860px' }}>
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate('/convocatorias')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', fontWeight: 600, marginBottom: '24px', fontSize: '14px' }}
      >
        <ArrowLeft size={18} /> {t('pages.editPage.backToCalls')}
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Megaphone size={24} style={{ color: 'white' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '6px' }}>
            {t('pages.editPage.title')}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>
            {t('pages.editPage.subtitle')}
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', textAlign: 'center', minWidth: '110px' }}>
          <div style={{ fontSize: '22px', fontWeight: 900, color: completionScore === 5 ? '#059669' : 'var(--primary)', lineHeight: 1 }}>
            {completionScore}/5
          </div>
          <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>{t('pages.editPage.fieldsCompleted')}</div>
          <div style={{ height: '4px', backgroundColor: 'var(--surface-container-high)', borderRadius: 'var(--radius-full)', marginTop: '8px' }}>
            <div style={{ height: '100%', borderRadius: 'var(--radius-full)', width: `${(completionScore / 5) * 100}%`, backgroundColor: completionScore === 5 ? '#059669' : 'var(--primary)', transition: 'width 0.4s' }} />
          </div>
        </div>
      </div>

      {/* Seccion 1: Datos generales */}
      <div style={{ backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-xl)', padding: '28px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <span style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={16} style={{ color: 'var(--primary)' }} />
          </span>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>
            {t('pages.editPage.callData')}
          </h2>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
            Titulo <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            id="conv-title"
            type="text"
            placeholder={t('pages.editPage.titlePlaceholder')}
            value={formData.title}
            onChange={e => handleChange('title', e.target.value)}
            onBlur={e => handleBlur('title', e.target.value)}
            style={{ ...inputStyle, borderColor: errors.title ? 'var(--error)' : 'var(--outline-variant)' }}
            onFocus={e => { if (!errors.title) e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-fixed)'; }}
            onBlurCapture={e => { e.target.style.borderColor = errors.title ? 'var(--error)' : 'var(--outline-variant)'; e.target.style.boxShadow = 'none'; }}
          />
          {errors.title && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> {errors.title}</p>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
            <span>Descripcion <span style={{ color: 'var(--error)' }}>*</span></span>
            <span style={{ fontWeight: 400, color: charCount < 20 ? 'var(--error)' : 'var(--on-surface-variant)' }}>
              {charCount} {t('pages.editPage.minChars')}
            </span>
          </label>
          <textarea
            id="conv-description"
            placeholder={t('pages.editPage.descriptionPlaceholder')}
            rows={5}
            value={formData.description}
            onChange={e => handleChange('description', e.target.value)}
            onBlur={e => handleBlur('description', e.target.value)}
            style={{ ...inputStyle, resize: 'vertical', borderColor: errors.description ? 'var(--error)' : 'var(--outline-variant)' }}
            onFocus={e => { if (!errors.description) e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-fixed)'; }}
            onBlurCapture={e => { e.target.style.borderColor = errors.description ? 'var(--error)' : 'var(--outline-variant)'; e.target.style.boxShadow = 'none'; }}
          />
          {errors.description && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> {errors.description}</p>}
        </div>

        <div className="form-row" style={{ gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
              <Calendar size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
              {t('pages.editPage.startDateLabel')}
            </label>
            <input
              id="conv-start-date"
              type="date"
              value={formData.startDate}
              onChange={e => handleChange('startDate', e.target.value)}
              onBlur={e => handleBlur('startDate', e.target.value)}
              style={{ ...inputStyle, borderColor: errors.startDate ? 'var(--error)' : 'var(--outline-variant)' }}
              onFocus={e => { if (!errors.startDate) e.target.style.borderColor = 'var(--primary)'; }}
              onBlurCapture={e => { e.target.style.borderColor = errors.startDate ? 'var(--error)' : 'var(--outline-variant)'; }}
            />
            {errors.startDate && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '5px' }}><AlertCircle size={12} style={{ display: 'inline' }} /> {errors.startDate}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
              <Calendar size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
              {t('pages.editPage.endDateLabel')}
            </label>
            <input
              id="conv-end-date"
              type="date"
              value={formData.endDate}
              min={formData.startDate || undefined}
              onChange={e => handleChange('endDate', e.target.value)}
              onBlur={e => handleBlur('endDate', e.target.value)}
              style={{ ...inputStyle, borderColor: errors.endDate ? 'var(--error)' : 'var(--outline-variant)' }}
              onFocus={e => { if (!errors.endDate) e.target.style.borderColor = 'var(--primary)'; }}
              onBlurCapture={e => { e.target.style.borderColor = errors.endDate ? 'var(--error)' : 'var(--outline-variant)'; }}
            />
            {errors.endDate && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '5px' }}><AlertCircle size={12} style={{ display: 'inline' }} /> {errors.endDate}</p>}
          </div>
        </div>
      </div>

      {/* Seccion 2: Lineas de investigacion */}
      <div style={{ backgroundColor: 'var(--surface-container-lowest)', border: `1px solid ${errors.lines ? 'var(--error)' : 'var(--outline-variant)'}`, borderRadius: 'var(--radius-xl)', padding: '28px', marginBottom: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'var(--secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookOpen size={16} style={{ color: 'var(--on-secondary-container)' }} />
            </span>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>
                Lineas de Investigacion <span style={{ color: 'var(--error)' }}>*</span>
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', margin: 0 }}>
                {t('pages.editPage.researchLinesHint')}
              </p>
            </div>
          </div>
          {selectedLineIds.length > 0 && (
            <span style={{ padding: '5px 14px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)', fontSize: '13px', fontWeight: 700 }}>
              {t('pages.editPage.selectedCount', { count: selectedLineIds.length })}
            </span>
          )}
        </div>

        {loadingLines ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}><Spinner size="medium" /></div>
        ) : lines.length === 0 ? (
          <div style={{ padding: '24px', backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '14px' }}>
            {t('pages.editPage.noActiveLines')}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
            {lines.map(line => {
              const selected = selectedLineIds.includes(line.id);
              return (
                <button
                  key={line.id}
                  id={`line-${line.id}`}
                  type="button"
                  onClick={() => toggleLine(line.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px',
                    border: `2px solid ${selected ? 'var(--primary)' : 'var(--outline-variant)'}`,
                    borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s ease',
                    backgroundColor: selected ? 'var(--primary-container)' : 'var(--surface)',
                    color: selected ? 'var(--on-primary-container)' : 'var(--on-surface)',
                    boxShadow: selected ? '0 0 0 3px var(--primary-fixed)' : 'none',
                  }}
                >
                  <span style={{ width: '20px', height: '20px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', backgroundColor: selected ? 'var(--primary)' : 'transparent', border: `2px solid ${selected ? 'var(--primary)' : 'var(--outline-variant)'}`, transition: 'all 0.15s' }}>
                    {selected && <Check size={12} style={{ color: 'white', strokeWidth: 3 }} />}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: selected ? 700 : 500, lineHeight: 1.3 }}>
                    {line.lineName}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {errors.lines && (
          <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <AlertCircle size={13} /> {errors.lines}
          </p>
        )}
      </div>

      {/* Footer de acciones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', flexWrap: 'wrap', gap: '12px' }}>
        <button
          type="button"
          onClick={() => navigate('/convocatorias')}
          style={{ background: 'none', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '10px 20px', fontSize: '14px', fontWeight: 600, color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={15} /> {t('pages.editPage.cancel')}
        </button>
        <button
          id="btn-update-convocatoria"
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px',
            borderRadius: 'var(--radius-md)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 700, fontSize: '15px', transition: 'all 0.2s',
            backgroundColor: 'var(--primary)',
            color: 'white', boxShadow: '0 4px 14px rgba(0, 32, 69, 0.3)', opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t('pages.editPage.saving')}</>
            : <><Save size={16} /> {t('pages.editPage.saveChanges')} <ChevronRight size={15} /></>
          }
        </button>
      </div>
    </div>
  );
};

export default EditConvocatoria;
