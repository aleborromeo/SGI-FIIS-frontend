import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { researchService } from '../../services/researchService';

export const NewResearchLine: React.FC = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    lineName: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await researchService.createLine(formData);
      navigate('/lines');
    } catch (err: any) {
      setErrorMsg(err.message || t('createLine.errorCreate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        type="button"
        onClick={() => navigate('/lines')}
        style={{ 
          background: 'none', border: 'none', cursor: 'pointer', 
          display: 'flex', alignItems: 'center', gap: '8px', 
          color: 'var(--on-surface-variant)', fontWeight: 600, marginBottom: '24px' 
        }}
      >
        <ArrowLeft size={20} />
        {t('createLine.backToLines')}
      </button>

      <div style={{ backgroundColor: 'var(--surface)', padding: '32px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--outline-variant)' }}>
        <h1 className="text-display-sm" style={{ color: 'var(--on-surface)', marginBottom: '8px', fontWeight: 700 }}>
          {t('createLine.title')}
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)', marginBottom: '32px' }}>
          {t('createLine.subtitle')}
        </p>

        {errorMsg && (
          <div style={{ padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <strong>{t('common.error')}</strong> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('createLine.form.nameLabel')}</label>
            <input 
              type="text" 
              name="lineName"
              value={formData.lineName}
              onChange={handleChange}
              required
              placeholder={t('createLine.form.namePlaceholder')}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', fontSize: '16px' }} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button 
              type="button"
              variant="secondary"
              icon={<X size={18} />}
              onClick={() => navigate('/lines')}
            >
              {t('createLine.form.btnCancel')}
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              icon={<Save size={18} />}
              disabled={loading}
            >
              {loading ? t('createLine.form.saving') : t('createLine.form.btnSave')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
