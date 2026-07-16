import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserPlus,
  Search,
  RefreshCcw,
  Pencil,
  KeyRound,
  UserCheck,
  X,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import {
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../../components/ui/Table';
import {
  userService,
  type User,
  type CreateUserPayload,
  type UpdateUserPayload,
} from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { AuthContext } from '../../context/AuthContext';
import Pagination from '../../components/ui/Pagination';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'ESTUDIANTE', label: 'Estudiante / Tesista' },
  { value: 'DOCENTE_INVESTIGADOR', label: 'Docente Investigador' },
  { value: 'COORDINADOR_GRUPO', label: 'Coordinador de Grupo' },
  { value: 'DIRECTOR_INVESTIGACION', label: 'Director de Investigacion' },
  { value: 'DECANO', label: 'Decano' },
  { value: 'EVALUADOR', label: 'Evaluador' },
];

const ROLE_BADGE_MAP: Record<string, 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
  ADMIN: 'error',
  ESTUDIANTE: 'info',
  DOCENTE_INVESTIGADOR: 'success',
  COORDINADOR_GRUPO: 'warning',
  DIRECTOR_INVESTIGACION: 'success',
  DECANO: 'warning',
  EVALUADOR: 'neutral',
};

const PAGE_SIZE = 10;

interface UserFormData {
  dni: string;
  firstNames: string;
  lastNames: string;
  institutionalEmail: string;
  phone: string;
  roleCode: string;
}

const EMPTY_FORM: UserFormData = {
  dni: '',
  firstNames: '',
  lastNames: '',
  institutionalEmail: '',
  phone: '',
  roleCode: 'DOCENTE_INVESTIGADOR',
};

export const UserManagement: React.FC = () => {
  const { t } = useTranslation('admin');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const toast = useToast();
  const confirm = useConfirm();
  const { user: currentUser } = useContext(AuthContext);

  const roleLabelMap = (code: string): string => {
    const key = `users.roles.${code}`;
    const translated = t(key);
    return translated !== key ? translated : code;
  };

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAll(searchQuery || undefined);
      setUsers(data);
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err);
      setError(t('users.errorLoad'));
    } finally {
      setLoading(false);
    }
  }, [searchQuery, t]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const paginatedUsers = users.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  React.useEffect(() => {
    setPage(1);
  }, [users]);

  const handleSearch = () => {
    loadUsers();
  };

  const openCreateForm = () => {
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowForm(true);
  };

  const openEditForm = (user: User) => {
    setEditingUser(user);
    setFormData({
      dni: user.dni,
      firstNames: user.firstNames,
      lastNames: user.lastNames,
      institutionalEmail: user.institutionalEmail || '',
      phone: user.phone || '',
      roleCode: user.roleCode,
    });
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.dni || formData.dni.length !== 8) {
      errors.dni = t('users.validation.dniLength');
    }
    if (!formData.firstNames.trim()) {
      errors.firstNames = t('users.validation.namesRequired');
    }
    if (!formData.lastNames.trim()) {
      errors.lastNames = t('users.validation.lastNamesRequired');
    }
    if (!formData.roleCode) {
      errors.roleCode = t('users.validation.roleRequired');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      if (editingUser) {
        const payload: UpdateUserPayload = {
          firstNames: formData.firstNames.trim(),
          lastNames: formData.lastNames.trim(),
          phone: formData.phone.trim() || undefined,
          roleCode: formData.roleCode,
        };
        if (formData.institutionalEmail.trim()) {
          payload.institutionalEmail = formData.institutionalEmail.trim();
        }
        await userService.update(editingUser.id, payload);
        toast.success(t('users.toast.updated'));
      } else {
        const payload: CreateUserPayload = {
          dni: formData.dni.trim(),
          firstNames: formData.firstNames.trim(),
          lastNames: formData.lastNames.trim(),
          phone: formData.phone.trim() || undefined,
          roleCode: formData.roleCode,
        };
        if (formData.institutionalEmail.trim()) {
          payload.institutionalEmail = formData.institutionalEmail.trim();
        }
        await userService.create(payload);
        toast.success(t('users.toast.created'));
      }
      closeForm();
      loadUsers();
    } catch (err: any) {
      const msg = err?.message || t('users.toast.errorSave');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newActive = !user.active;

    if (!newActive && currentUser?.id === user.id) {
      toast.error(t('users.toast.cannotDeactivateSelf', { defaultValue: 'No puede desactivar su propio usuario.' }));
      return;
    }

    const userName = `${user.firstNames} ${user.lastNames}`;

    const accepted = await confirm.confirmDialog({
      title: newActive ? t('users.confirm.activateTitle') : t('users.confirm.deactivateTitle'),
      message: newActive
        ? t('users.confirm.activateMessage', { name: userName })
        : t('users.confirm.deactivateMessage', { name: userName }),
      confirmText: newActive ? t('users.confirm.activateConfirm') : t('users.confirm.deactivateConfirm'),
      danger: !newActive,
    });

    if (!accepted) return;

    try {
      setProcessingId(user.id);
      await userService.toggleStatus(user.id, newActive);
      toast.success(newActive ? t('users.toast.activated') : t('users.toast.deactivated'));
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, active: newActive } : u))
      );
    } catch (err) {
      toast.error(newActive ? t('users.toast.errorActivate') : t('users.toast.errorDeactivate'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleResetPassword = async (user: User) => {
    const userName = `${user.firstNames} ${user.lastNames}`;

    const accepted = await confirm.confirmDialog({
      title: t('users.confirm.resetPasswordTitle'),
      message: t('users.confirm.resetPasswordMessage', { name: userName }),
      confirmText: t('users.confirm.resetPasswordConfirm'),
      danger: false,
    });

    if (!accepted) return;

    try {
      setProcessingId(user.id);
      await userService.resetPassword(user.id);
      toast.success(t('users.toast.resetPassword'));
    } catch (err) {
      toast.error(t('users.toast.errorResetPassword'));
    } finally {
      setProcessingId(null);
    }
  };

  const getRoleLabel = (code: string): string => {
    return roleLabelMap(code);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--primary-container)',
                color: 'var(--on-primary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={24} />
            </div>
            <h1 className="text-headline-lg">{t('users.pageTitle')}</h1>
          </div>
          <p
            className="text-body-md"
            style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}
          >
            {t('users.pageSubtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="secondary"
            icon={<RefreshCcw size={16} />}
            onClick={loadUsers}
            disabled={loading}
          >
            {t('users.btnUpdate')}
          </Button>
          <Button variant="primary" icon={<UserPlus size={16} />} onClick={openCreateForm}>
            {t('users.btnNew')}
          </Button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ flex: 1, maxWidth: '400px' }}>
          <Input
            label={t('users.searchLabel')}
            placeholder={t('users.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button
          variant="secondary"
          icon={<Search size={16} />}
          onClick={handleSearch}
        >
          {t('users.btnSearch')}
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={24} color="var(--primary)" />
              <div>
                <strong style={{ display: 'block', fontSize: '24px' }}>
                  {users.length}
                </strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>{t('users.statsTotal')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={24} color="#15803d" />
              <div>
                <strong style={{ display: 'block', fontSize: '24px' }}>
                  {users.filter((u) => u.active).length}
                </strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>{t('users.statsActive')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={24} color="#ba1a1a" />
              <div>
                <strong style={{ display: 'block', fontSize: '24px' }}>
                  {users.filter((u) => !u.active).length}
                </strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>{t('users.statsInactive')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title={t('users.errorTitle')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          </Alert>
        </div>
      )}

      <TableContainer>
        <TableHead>
          <TableRow>
            <TableHeader>{t('users.table.dni')}</TableHeader>
            <TableHeader>{t('users.table.nameAndLastname')}</TableHeader>
            <TableHeader>{t('users.table.email')}</TableHeader>
            <TableHeader>{t('users.table.phone')}</TableHeader>
            <TableHeader>{t('users.table.role')}</TableHeader>
            <TableHeader>{t('users.table.status')}</TableHeader>
            <TableHeader style={{ textAlign: 'right' }}>{t('users.table.actions')}</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>
                {t('users.table.loading')}
              </td>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--on-surface-variant)' }}>
                <Users size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                {t('users.table.empty')}
              </td>
            </TableRow>
          ) : (
            paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell style={{ fontWeight: 700 }}>{user.dni}</TableCell>
                <TableCell>
                  <div style={{ fontWeight: 600 }}>
                    {user.firstNames} {user.lastNames}
                  </div>
                </TableCell>
                <TableCell>{user.institutionalEmail || <span style={{ color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>{t('users.table.noEmail')}</span>}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>
                  <Badge variant={ROLE_BADGE_MAP[user.roleCode] || 'neutral'}>
                    {getRoleLabel(user.roleCode)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.active ? 'success' : 'error'}>
                    {user.active ? t('users.status.active') : t('users.status.inactive')}
                  </Badge>
                </TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <Button
                  variant="secondary"
                  icon={<Pencil size={14} />}
                  onClick={() => openEditForm(user)}
                >
                  {t('users.btnEdit')}
                </Button>
                <Button
                  variant="secondary"
                  icon={<KeyRound size={14} />}
                  onClick={() => handleResetPassword(user)}
                  disabled={processingId === user.id}
                >
                  {t('users.btnResetPass')}
                </Button>
                <Button
                  variant={user.active ? 'primary' : 'secondary'}
                  icon={<UserCheck size={14} />}
                  onClick={() => handleToggleStatus(user)}
                  disabled={processingId === user.id}
                  style={
                    user.active
                      ? { color: '#15803d', borderColor: '#15803d' }
                      : { color: '#ba1a1a', borderColor: '#ba1a1a' }
                  }
                    >
                      {user.active ? t('users.btnDeactivate') : t('users.btnActivate')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </TableContainer>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={users.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {showForm && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
          onClick={closeForm}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              padding: '32px',
              width: '95%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="text-headline-md">
                {editingUser ? t('users.form.editTitle') : t('users.form.newTitle')}
              </h2>
              <button
                onClick={closeForm}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label={t('users.form.dniLabel')}
                placeholder={t('users.form.dniPlaceholder')}
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                error={formErrors.dni}
                disabled={!!editingUser}
                maxLength={8}
              />

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <Input
                  label={t('users.form.namesLabel')}
                  placeholder={t('users.form.namesPlaceholder')}
                  value={formData.firstNames}
                  onChange={(e) => setFormData({ ...formData, firstNames: e.target.value })}
                  error={formErrors.firstNames}
                />
                <Input
                  label={t('users.form.lastNamesLabel')}
                  placeholder={t('users.form.lastNamesPlaceholder')}
                  value={formData.lastNames}
                  onChange={(e) => setFormData({ ...formData, lastNames: e.target.value })}
                  error={formErrors.lastNames}
                />
              </div>

              <Input
                label={t('users.form.emailLabel')}
                placeholder={t('users.form.emailPlaceholder')}
                value={formData.institutionalEmail}
                onChange={(e) => setFormData({ ...formData, institutionalEmail: e.target.value })}
                helpText={t('users.form.emailHelp')}
              />

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <Input
                  label={t('users.form.phoneLabel')}
                  placeholder={t('users.form.phonePlaceholder')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Select
                  label={t('users.form.roleLabel')}
                  value={formData.roleCode}
                  onChange={(e) => setFormData({ ...formData, roleCode: e.target.value })}
                  options={ROLE_OPTIONS}
                  error={formErrors.roleCode}
                />
              </div>

              {!editingUser && (
                <Alert title={t('users.form.tempPasswordTitle')}>
                  <span style={{ fontSize: '0.875rem' }}>
                    {t('users.form.tempPasswordMessage')}
                  </span>
                </Alert>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <Button variant="secondary" onClick={closeForm}>
                  {t('users.form.btnCancel')}
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? t('users.form.saving') : editingUser ? t('users.form.btnUpdate') : t('users.form.btnCreate')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
