import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Calendar, Mail, Phone, Shield, Users, X } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { researchService, type ResearchGroup, type ResearchLine } from '../../services/researchService';
import type { User } from '../../services/userService';
import '../../pages/users/CreateUser.css';

interface UserDetailsModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, open, onClose }) => {
  const { t } = useTranslation('admin');
  const [group, setGroup] = useState<ResearchGroup | null>(null);
  const [lines, setLines] = useState<ResearchLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) {
      setGroup(null);
      setLines([]);
      setError(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const userGroup = await researchService.getGroupByUser(user.id);
        if (!mounted) return;

        setGroup(userGroup);

        if (userGroup) {
          const groupLines = await researchService.getGroupLines(userGroup.id);
          if (!mounted) return;
          setLines(groupLines);
        } else {
          setLines([]);
        }
      } catch (err: any) {
        if (!mounted) return;
        console.error('Error loading user details:', err);
        setError(err?.message || t('users.toast.errorLoad', { defaultValue: 'Could not load user details.' }));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDetails();

    return () => {
      mounted = false;
    };
  }, [open, user, t]);

  if (!open || !user) return null;

  const isActive = user.status !== 'REJECTED' && user.status !== 'INACTIVE' && user.active !== false;
  const fullName = `${user.firstNames} ${user.lastNames}`.trim();
  const dateFormatter = new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed);
  };

  return (
    <div className="edit-user-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="edit-user-modal-container animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '760px' }}>
        <div className="modal-header-custom">
          <div className="modal-title-box">
            <Users size={20} className="modal-title-icon" />
            <div>
              <h3>{t('users.detailTitle', { defaultValue: 'User Details' })}</h3>
              <div className="field-hint" style={{ marginTop: '2px' }}>{fullName}</div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label={t('common:close', { defaultValue: 'Close' })}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
              {t('common:loading', { defaultValue: 'Loading...' })}
            </div>
          ) : error ? (
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fee2e2', color: '#991b1b' }}>
              {error}
            </div>
          ) : (
            <>
              <div className="modal-fields-grid">
                <div className="form-group-custom">
                  <label className="field-label">{t('users.form.dniLabel')}</label>
                  <input type="text" className="field-input readonly-input" value={user.dni} readOnly />
                </div>

                <div className="form-group-custom">
                  <label className="field-label">{t('users.form.roleLabel')}</label>
                  <input type="text" className="field-input readonly-input" value={user.roleDescription || user.roleCode} readOnly />
                </div>

                <div className="form-group-custom">
                  <label className="field-label">{t('users.form.namesLabel')}</label>
                  <input type="text" className="field-input readonly-input" value={user.firstNames} readOnly />
                </div>

                <div className="form-group-custom">
                  <label className="field-label">{t('users.form.lastNamesLabel')}</label>
                  <input type="text" className="field-input readonly-input" value={user.lastNames} readOnly />
                </div>

                <div className="form-group-custom">
                  <label className="field-label">{t('users.form.emailLabel')}</label>
                  <div className="field-input-wrapper">
                    <span className="field-icon"><Mail size={18} /></span>
                    <input type="text" className="field-input readonly-input" value={user.institutionalEmail || '—'} readOnly />
                  </div>
                </div>

                <div className="form-group-custom">
                  <label className="field-label">{t('users.form.phoneLabel')}</label>
                  <div className="field-input-wrapper">
                    <span className="field-icon"><Phone size={18} /></span>
                    <input type="text" className="field-input readonly-input" value={user.phone || '—'} readOnly />
                  </div>
                </div>

                <div className="form-group-custom">
                  <label className="field-label">{t('users.status.label', { defaultValue: 'Status' })}</label>
                  <div style={{ display: 'flex', alignItems: 'center', minHeight: '44px' }}>
                    <Badge variant={isActive ? 'success' : 'error'}>
                      {isActive ? t('users.status.active') : t('users.status.inactive')}
                    </Badge>
                  </div>
                </div>

                <div className="form-group-custom">
                  <label className="field-label">{t('users.createdAt', { defaultValue: 'Created At' })}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px', color: 'var(--on-surface)' }}>
                    <Calendar size={18} color="var(--on-surface-variant)" />
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>

              <section style={{ padding: '18px', borderRadius: '14px', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--on-surface)' }}>
                    {t('users.detailGroup', { defaultValue: 'Research Group' })}
                  </h4>
                  {group ? <Badge variant="info">{group.groupCode}</Badge> : <Badge variant="neutral">—</Badge>}
                </div>

                {group ? (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface)' }}>
                      <Shield size={18} color="var(--primary)" />
                      <strong>{group.groupName}</strong>
                    </div>
                    <div style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>
                      {t('users.detailGroupCode', { defaultValue: 'Code' })}: {group.groupCode}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--on-surface-variant)' }}>
                        <BookOpen size={18} />
                        <strong>{t('users.detailLines', { defaultValue: 'Research Lines' })}</strong>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {lines.length > 0 ? lines.map((line) => (
                          <Badge key={line.id} variant={line.active ? 'info' : 'neutral'}>
                            {line.lineCode ? `${line.lineCode} · ${line.lineName}` : line.lineName}
                          </Badge>
                        )) : (
                          <span className="field-hint">{t('users.detailNoLines', { defaultValue: 'No research lines assigned.' })}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>
                    {t('users.detailNoGroup', { defaultValue: 'No research group assigned.' })}
                  </div>
                )}
              </section>

              <div className="modal-actions-wrapper">
                <button type="button" onClick={onClose} className="modal-save-btn" style={{ minWidth: '160px' }}>
                  {t('common:close', { defaultValue: 'Close' })}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
