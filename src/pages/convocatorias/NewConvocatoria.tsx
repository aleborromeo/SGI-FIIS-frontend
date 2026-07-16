/**
 * NewConvocatoria.tsx
 * Formulario de creación de convocatoria (DIRECTOR_INVESTIGACION / ADMIN).
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Save, ArrowLeft, AlertCircle, Calendar,
  Megaphone, FileText, ChevronRight,
  Check, Loader, Users, GraduationCap, UserCheck,
} from 'lucide-react';

import { useToast } from '../../context/ToastContext';
import { callService } from '../../services/callService';

// ── Tipos ─────────────────────────────────────────────────────────────────────

type TargetAudience = 'DOCENTES' | 'ESTUDIANTES' | 'AMBOS';

interface FormErrors {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  targetAudience?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const AUDIENCE_OPTIONS: { value: TargetAudience; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'DOCENTES', label: 'Solo Docentes', description: 'Docentes investigadores', icon: <Users size={18} /> },
  { value: 'ESTUDIANTES', label: 'Solo Estudiantes', description: 'Estudiantes / Tesistas', icon: <GraduationCap size={18} /> },
  { value: 'AMBOS', label: 'Docentes y Estudiantes', description: 'Ambos pueden postular', icon: <UserCheck size={18} /> },
];

// ── Componente principal ──────────────────────────────────────────────────────

export const NewConvocatoria: React.FC = () => {
  const { t } = useTranslation('convocatorias');
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('AMBOS');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateTitle = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return t('pages.newPage.titleRequired');
    if (trimmed.length < 5) return t('pages.newPage.titleMinChars');
    return undefined;
  };

  const validateDescription = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return t('pages.newPage.descriptionRequired');
    if (trimmed.length < 20) return t('pages.newPage.descriptionMinChars');
    return undefined;
  };

  const validateEndDate = (value: string, startDate?: string): string | undefined => {
    if (!value) return t('pages.newPage.endDateRequired');
    if (startDate && value < startDate) return t('pages.newPage.endDateAfterStart');
    return undefined;
  };

  const validateField = (field: string, value: string): string | undefined => {
    if (field === 'title') return validateTitle(value);
    if (field === 'description') return validateDescription(value);
    if (field === 'startDate') return !value ? t('pages.newPage.startDateRequired') : undefined;
    if (field === 'endDate') return validateEndDate(value, formData.startDate);
    return undefined;
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
    if (!targetAudience) e.targetAudience = 'Selecciona una opción';
    setErrors(e);
    setTouched({ title: true, description: true, startDate: true, endDate: true });
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error(t('pages.newPage.validationError'));
      return;
    }
    setLoading(true);
    try {
      await callService.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        targetAudience,
        researchLineIds: [],
      });
      toast.success(t('pages.newPage.createSuccess'));
      navigate('/convocatorias');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('pages.newPage.createError'));
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
    !!targetAudience,
  ].filter(Boolean).length;

  return (
    <div className="animate-fade-in" style={{ padding: '28px', maxWidth: '860px' }}>
      <button
        type="button"
        onClick={() => navigate('/convocatorias')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', fontWeight: 600, marginBottom: '24px', fontSize: '14px' }}
      >
        <ArrowLeft size={18} /> {t('pages.newPage.backToCalls')}
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Megaphone size={24} style={{ color: 'white' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '6px' }}>
            {t('pages.newPage.title')}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>
            Se registrará y publicará de inmediato en estado <strong>Abierta</strong>.
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', textAlign: 'center', minWidth: '110px' }}>
          <div style={{ fontSize: '22px', fontWeight: 900, color: completionScore === 5 ? '#059669' : 'var(--primary)', lineHeight: 1 }}>
            {completionScore}/5
          </div>
          <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>{t('pages.newPage.fieldsCompleted')}</div>
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
            {t('pages.newPage.callData')}
          </h2>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="conv-title" style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
            Título <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            id="conv-title"
            type="text"
            placeholder={t('pages.newPage.titlePlaceholder')}
            value={formData.title}
            onChange={e => handleChange('title', e.target.value)}
            onBlur={e => handleBlur('title', e.target.value)}
            style={{ ...inputStyle, borderColor: errors.title ? 'var(--error)' : 'var(--outline-variant)' }}
            onFocus={e => { if (!errors.title) { e.target.style.borderColor = 'var(--primary)'; } e.target.style.boxShadow = '0 0 0 3px var(--primary-fixed)'; }}
            onBlurCapture={e => { e.target.style.borderColor = errors.title ? 'var(--error)' : 'var(--outline-variant)'; e.target.style.boxShadow = 'none'; }}
          />
          {errors.title && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> {errors.title}</p>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="conv-description" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
            <span>Descripción <span style={{ color: 'var(--error)' }}>*</span></span>
            <span style={{ fontWeight: 400, color: charCount < 20 ? 'var(--error)' : 'var(--on-surface-variant)' }}>
              {charCount} {t('pages.newPage.minChars')}
            </span>
          </label>
          <textarea
            id="conv-description"
            placeholder={t('pages.newPage.descriptionPlaceholder')}
            rows={5}
            value={formData.description}
            onChange={e => handleChange('description', e.target.value)}
            onBlur={e => handleBlur('description', e.target.value)}
            style={{ ...inputStyle, resize: 'vertical', borderColor: errors.description ? 'var(--error)' : 'var(--outline-variant)' }}
            onFocus={e => { if (!errors.description) { e.target.style.borderColor = 'var(--primary)'; } e.target.style.boxShadow = '0 0 0 3px var(--primary-fixed)'; }}
            onBlurCapture={e => { e.target.style.borderColor = errors.description ? 'var(--error)' : 'var(--outline-variant)'; e.target.style.boxShadow = 'none'; }}
          />
          {errors.description && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> {errors.description}</p>}
        </div>

        <div className="form-row" style={{ gap: '20px' }}>
          <div>
            <label htmlFor="conv-start-date" style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
              <Calendar size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
              {t('pages.newPage.startDateLabel')}
            </label>
            <input
              id="conv-start-date"
              type="date"
              value={formData.startDate}
              onChange={e => handleChange('startDate', e.target.value)}
              onBlur={e => handleBlur('startDate', e.target.value)}
              style={{ ...inputStyle, borderColor: errors.startDate ? 'var(--error)' : 'var(--outline-variant)' }}
              onFocus={e => { if (!errors.startDate) { e.target.style.borderColor = 'var(--primary)'; } }}
              onBlurCapture={e => { e.target.style.borderColor = errors.startDate ? 'var(--error)' : 'var(--outline-variant)'; }}
            />
            {errors.startDate && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '5px' }}><AlertCircle size={12} style={{ display: 'inline' }} /> {errors.startDate}</p>}
          </div>
          <div>
            <label htmlFor="conv-end-date" style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
              <Calendar size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
              {t('pages.newPage.endDateLabel')}
            </label>
            <input
              id="conv-end-date"
              type="date"
              value={formData.endDate}
              min={formData.startDate || undefined}
              onChange={e => handleChange('endDate', e.target.value)}
              onBlur={e => handleBlur('endDate', e.target.value)}
              style={{ ...inputStyle, borderColor: errors.endDate ? 'var(--error)' : 'var(--outline-variant)' }}
              onFocus={e => { if (!errors.endDate) { e.target.style.borderColor = 'var(--primary)'; } }}
              onBlurCapture={e => { e.target.style.borderColor = errors.endDate ? 'var(--error)' : 'var(--outline-variant)'; }}
            />
            {errors.endDate && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '5px' }}><AlertCircle size={12} style={{ display: 'inline' }} /> {errors.endDate}</p>}
          </div>
        </div>
      </div>

      {/* Seccion 2: Poblacion objetivo */}
      <div style={{ backgroundColor: 'var(--surface-container-lowest)', border: `1px solid ${errors.targetAudience ? 'var(--error)' : 'var(--outline-variant)'}`, borderRadius: 'var(--radius-xl)', padding: '28px', marginBottom: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'var(--secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={16} style={{ color: 'var(--on-secondary-container)' }} />
            </span>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>
                Población Objetivo <span style={{ color: 'var(--error)' }}>*</span>
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', margin: 0 }}>
                Selecciona quiénes pueden postular a esta convocatoria.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
          {AUDIENCE_OPTIONS.map(option => {
            const selected = targetAudience === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTargetAudience(option.value)}
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
                <span style={{ color: selected ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
                  {option.icon}
                </span>
                <span style={{ fontSize: '13px', fontWeight: selected ? 700 : 500, lineHeight: 1.3 }}>
                  <span style={{ display: 'block' }}>{option.label}</span>
                  <span style={{ fontSize: '11px', fontWeight: 400, opacity: 0.7 }}>{option.description}</span>
                </span>
              </button>
            );
          })}
        </div>
        {errors.targetAudience && (
          <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <AlertCircle size={13} /> {errors.targetAudience}
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
          <ArrowLeft size={15} /> {t('pages.newPage.cancel')}
        </button>
        <button
          id="btn-create-convocatoria"
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
            ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t('pages.newPage.creating')}</>
            : <><Save size={16} /> {t('pages.newPage.createCall')} <ChevronRight size={15} /></>
          }
        </button>
      </div>
    </div>
  );
};

export default NewConvocatoria;
