import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/common/Spinner';
import { researchService } from '../../services/researchService';
import { useToast } from '../../context/ToastContext';

export const EditResearchGroup: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    groupCode: '',
    groupName: '',
  });

  useEffect(() => {
    if (!id) return;
    researchService.getGroupById(Number(id))
      .then(group => {
        setFormData({ groupCode: group.groupCode, groupName: group.groupName });
        setLoading(false);
      })
      .catch(() => {
        setErrorMsg(t('editGroup.errorLoad', { defaultValue: 'No se pudo cargar el grupo.' }));
        setLoading(false);
      });
  }, [id, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setErrorMsg(null);
    setSaving(true);
    try {
      await researchService.updateGroup(Number(id), formData);
      toast.success(t('editGroup.toastSuccess', { defaultValue: 'Grupo actualizado correctamente.' }));
      navigate(`/groups/${id}`);
    } catch (err: any) {
      setErrorMsg(err.message || t('editGroup.errorSave', { defaultValue: 'Error al guardar.' }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={() => navigate(`/groups/${id}`)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          color: 'var(--on-surface-variant)', fontWeight: 600, marginBottom: '24px',
        }}
      >
        <ArrowLeft size={20} />
        {t('editGroup.backToDetail', { defaultValue: 'Volver al detalle' })}
      </button>

      <div style={{ backgroundColor: 'var(--surface)', padding: '32px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--outline-variant)' }}>
        <h1 className="text-display-sm" style={{ color: 'var(--on-surface)', marginBottom: '8px', fontWeight: 700 }}>
          {t('editGroup.title', { defaultValue: 'Editar Grupo de Investigación' })}
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)', marginBottom: '32px' }}>
          {t('editGroup.subtitle', { defaultValue: 'Modifique los datos del grupo.' })}
        </p>

        {errorMsg && (
          <div style={{ padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <strong>{t('common.error')}</strong> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-row" style={{ gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                {t('createGroup.form.codeLabel')}
              </label>
              <input
                type="text"
                name="groupCode"
                value={formData.groupCode}
                onChange={handleChange}
                required
                placeholder={t('createGroup.form.codePlaceholder')}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', fontSize: '16px' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                {t('createGroup.form.nameLabel')}
              </label>
              <input
                type="text"
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                required
                placeholder={t('createGroup.form.namePlaceholder')}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', fontSize: '16px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button type="button" variant="secondary" icon={<X size={18} />} onClick={() => navigate(`/groups/${id}`)}>
              {t('createGroup.form.btnCancel')}
            </Button>
            <Button type="submit" variant="primary" icon={<Save size={18} />} disabled={saving}>
              {saving ? t('createGroup.form.saving') : t('createGroup.form.btnSave')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
