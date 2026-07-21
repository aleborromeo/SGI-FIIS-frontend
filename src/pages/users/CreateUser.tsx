import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, User, Phone, Mail, Shield, CheckCircle, Copy, RefreshCw, Key, Search, Edit2, KeyRound, UserCheck, UserX, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import {
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../../components/ui/Table';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { AuthContext } from '../../context/AuthContext';
import { userService, type User as UserType } from '../../services/userService';
import { researchService } from '../../services/researchService';
import type { ResearchGroup } from '../../services/researchService';
import { UserDetailsModal } from '../../components/users/UserDetailsModal';
import './CreateUser.css';

export const CreateUser: React.FC = () => {
  const { t } = useTranslation('admin');
  // Pestañas
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  // Contextos
  const { user: loggedInUser } = useContext(AuthContext);
  const toast = useToast();
  const confirm = useConfirm();

  // --- ESTADOS PARA FORMULARIO DE AGREGAR ---
  const [dni, setDni] = useState('');
  const [firstNames, setFirstNames] = useState('');
  const [lastNames, setLastNames] = useState('');
  const [institutionalEmail, setInstitutionalEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleCode, setRoleCode] = useState('ESTUDIANTE');
  const [groups, setGroups] = useState<ResearchGroup[]>([]);
  const [groupId, setGroupId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar grupos de investigación para el dropdown
  useEffect(() => {
    researchService.getGroups()
      .then((data) => {
        // Filtrar solo grupos activos
        setGroups(data.filter(g => g.active));
      })
      .catch((err) => console.error('Error al cargar grupos:', err));
  }, []);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEmailManuallyEdited, setIsEmailManuallyEdited] = useState(false);

  const [createdUser, setCreatedUser] = useState<{
    institutionalEmail: string;
    temporaryPassword?: string;
    firstNames: string;
    lastNames: string;
    roleDescription?: string;
  } | null>(null);

  // --- ESTADOS PARA VER USUARIOS ---
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- ESTADOS PARA MODAL DE EDICIÓN ---
  const [editFirstNames, setEditFirstNames] = useState('');
  const [editLastNames, setEditLastNames] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRoleCode, setEditRoleCode] = useState('');
  const [editGroupId, setEditGroupId] = useState<number | ''>('');
  const [initialGroupId, setInitialGroupId] = useState<number | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Cargar usuarios al cambiar a la pestaña 'list'
  useEffect(() => {
    if (activeTab === 'list') {
      loadUsers();
    }
  }, [activeTab]);

  // Resetear a la página 1 cuando se realiza una búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Autocompletar dinámico de correo mientras se escribe en el formulario de agregar
  useEffect(() => {
    if (!isEmailManuallyEdited && activeTab === 'create') {
      setInstitutionalEmail(getSuggestedEmail());
    }
  }, [firstNames, lastNames]);

  const loadUsers = async () => {
    try {
      setLoadingList(true);
      const data = await userService.getAll();
      setUsersList(data);
    } catch (err: any) {
      console.error(err);
      toast.error(t('createUser.toast.loadUsersError'));
    } finally {
      setLoadingList(false);
    }
  };

  const handleResetForm = () => {
    setDni('');
    setFirstNames('');
    setLastNames('');
    setInstitutionalEmail('');
    setPhone('');
    setRoleCode('ESTUDIANTE');
    setGroupId('');
    setCreatedUser(null);
    setErrorMsg(null);
    setIsEmailManuallyEdited(false);
  };

  const handleCopyPassword = () => {
    if (createdUser?.temporaryPassword) {
      navigator.clipboard.writeText(createdUser.temporaryPassword);
      toast.success(t('common:copiedToClipboard'));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!dni || dni.length !== 8) {
      setErrorMsg(t('createUser.validation.dniLength'));
      return;
    }
    if (!firstNames.trim() || !lastNames.trim()) {
      setErrorMsg(t('createUser.validation.namesRequired'));
      return;
    }
    if (institutionalEmail && !institutionalEmail.toLowerCase().endsWith('.edu.pe')) {
      setErrorMsg(t('createUser.validation.emailDomain'));
      return;
    }

    if (roleCode !== 'ADMIN' && !groupId) {
      setErrorMsg('Debe seleccionar un grupo de investigación para este usuario.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await userService.createUser({
        dni,
        firstNames,
        lastNames,
        institutionalEmail: institutionalEmail.trim() || undefined,
        phone: phone.trim() || undefined,
        roleCode
      });

      // Si no es admin y se seleccionó grupo, asociar al grupo en la BD
      if (roleCode !== 'ADMIN' && groupId) {
        try {
          await researchService.addMember(Number(groupId), response.id);
        } catch (err: any) {
          console.error('Error al asociar al grupo de investigación:', err);
          toast.warning('Usuario creado, pero no se pudo asociar al grupo de investigación.');
        }
      }

      setCreatedUser({
        institutionalEmail: response.institutionalEmail,
        temporaryPassword: response.temporaryPassword,
        firstNames: response.firstNames,
        lastNames: response.lastNames,
        roleDescription: response.roleDescription
      });
      toast.success(t('createUser.toast.createSuccess'));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ocurrió un error al intentar crear el usuario.');
      toast.error(t('createUser.toast.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lógica para autogenerar correo
  const getSuggestedEmail = () => {
    if (!firstNames.trim() && !lastNames.trim()) return '';
    const namePart = firstNames.trim().split(' ')[0].toLowerCase();
    const lastNamePart = lastNames.trim().split(' ')[0].toLowerCase();
    const normalize = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ñ/g, "n");

    if (namePart && lastNamePart) {
      return `${normalize(namePart)}.${normalize(lastNamePart)}@unas.edu.pe`;
    } else if (namePart) {
      return `${normalize(namePart)}@unas.edu.pe`;
    } else if (lastNamePart) {
      return `${normalize(lastNamePart)}@unas.edu.pe`;
    }
    return '';
  };

  // --- LÓGICA DE GESTIÓN (LISTA DE USUARIOS) ---

  const handleToggleStatus = async (userRow: UserType) => {
    const isCurrentlyActive = userRow.status !== 'REJECTED' && userRow.status !== 'INACTIVE' && userRow.active !== false;

    // Evitar que el admin se desactive a sí mismo (RF-13)
    if (loggedInUser && (loggedInUser.id === userRow.id || loggedInUser.email === userRow.institutionalEmail) && isCurrentlyActive) {
      toast.error(t('createUser.toast.selfDeactivateError'));
      return;
    }

    const title = isCurrentlyActive ? t('createUser.confirm.deactivateTitle') : t('createUser.confirm.activateTitle');
    const message = isCurrentlyActive
      ? t('createUser.confirm.deactivateMessage', { name: `${userRow.firstNames} ${userRow.lastNames}` })
      : t('createUser.confirm.activateMessage', { name: `${userRow.firstNames} ${userRow.lastNames}` });

    const accepted = await confirm.confirmDialog({
      title,
      message,
      confirmText: isCurrentlyActive ? t('common:deactivate') : t('common:activate'),
      danger: isCurrentlyActive,
    });

    if (!accepted) return;

    try {
      if (isCurrentlyActive) {
        await userService.rejectUser(userRow.id);
        toast.success(t('createUser.toast.deactivateSuccess'));
      } else {
        await userService.activateUser(userRow.id);
        toast.success(t('createUser.toast.activateSuccess'));
      }
      loadUsers();
    } catch (err: any) {
      console.error(err);
      toast.error(t('createUser.toast.toggleStatusError'));
    }
  };

  const handleResetUserPassword = async (userRow: UserType) => {
    const accepted = await confirm.confirmDialog({
      title: t('createUser.confirm.resetPasswordTitle'),
      message: t('createUser.confirm.resetPasswordMessage', { name: `${userRow.firstNames} ${userRow.lastNames}` }),
      confirmText: t('createUser.confirm.resetPasswordConfirm'),
      danger: false,
    });

    if (!accepted) return;

    try {
      await userService.resetPassword(userRow.id);
      toast.success(t('createUser.toast.resetPasswordSuccess'));
    } catch (err: any) {
      console.error(err);
      toast.error(t('createUser.toast.resetPasswordError'));
    }
  };

  const handleStartEdit = async (userRow: UserType) => {
    setEditingUser(userRow);
    setEditFirstNames(userRow.firstNames);
    setEditLastNames(userRow.lastNames);
    setEditEmail(userRow.institutionalEmail);
    setEditPhone(userRow.phone || '');
    setEditRoleCode(userRow.roleCode);
    setEditGroupId('');
    setInitialGroupId('');

    try {
      const userGroup = await researchService.getGroupByUser(userRow.id);
      if (userGroup && userGroup.id !== undefined && userGroup.id !== null) {
        setEditGroupId(userGroup.id);
        setInitialGroupId(userGroup.id);
      } else {
        setEditGroupId('');
        setInitialGroupId('');
      }
    } catch (err) {
      console.error('Error fetching user group:', err);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editFirstNames.trim() || !editLastNames.trim() || !editEmail.trim()) {
      toast.error(t('createUser.toast.requiredFields'));
      return;
    }

    if (editRoleCode !== 'ADMIN' && !editGroupId) {
      toast.error('Debe seleccionar un grupo de investigación para este usuario.');
      return;
    }

    setIsUpdating(true);
    try {
      // 1. Actualizar datos del usuario
      await userService.updateUser(editingUser.id, {
        firstNames: editFirstNames,
        lastNames: editLastNames,
        institutionalEmail: editEmail,
        phone: editPhone || undefined,
        roleCode: editRoleCode
      });

      // 2. Gestionar cambios de membresía de grupo
      if (editRoleCode === 'ADMIN') {
        // Si el rol es admin y tenía un grupo, removerlo del grupo
        if (initialGroupId !== '' && initialGroupId !== undefined && initialGroupId !== null && !isNaN(Number(initialGroupId))) {
          await researchService.removeMember(Number(initialGroupId), editingUser.id);
        }
      } else {
        // Si cambió de grupo
        if (editGroupId !== initialGroupId) {
          // Desasociar del grupo original si existía
          if (initialGroupId !== '' && initialGroupId !== undefined && initialGroupId !== null && !isNaN(Number(initialGroupId))) {
            await researchService.removeMember(Number(initialGroupId), editingUser.id);
          }
          // Asociar al nuevo grupo
          if (editGroupId !== '' && editGroupId !== undefined && editGroupId !== null && !isNaN(Number(editGroupId))) {
            await researchService.addMember(Number(editGroupId), editingUser.id);
          }
        }
      }

      toast.success(t('createUser.toast.updateSuccess'));
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t('createUser.toast.updateError'));
    } finally {
      setIsUpdating(false);
    }
  };

  // Filtrado de búsqueda
  const filteredUsers = usersList.filter(u => {
    const q = searchQuery.toLowerCase();
    const fullName = `${u.firstNames} ${u.lastNames}`.toLowerCase();
    const email = (u.institutionalEmail || '').toLowerCase();
    const dniVal = (u.dni || '').toLowerCase();
    const roleDesc = (u.roleDescription || '').toLowerCase();
    const roleCd = (u.roleCode || '').toLowerCase();
    const statusVal = (u.status || 'ACTIVE').toLowerCase();

    return fullName.includes(q) || email.includes(q) || dniVal.includes(q) || roleDesc.includes(q) || roleCd.includes(q) || statusVal.includes(q);
  });

  const getRoleBadge = (roleCode: string) => {
    switch (roleCode) {
      case 'ADMIN':
        return <Badge variant="error">{t('users.roles.ADMIN')}</Badge>;
      case 'ESTUDIANTE':
        return <Badge variant="info">{t('users.roles.ESTUDIANTE')}</Badge>;
      case 'DOCENTE_INVESTIGADOR':
        return <Badge variant="success">{t('users.roles.DOCENTE_INVESTIGADOR')}</Badge>;
      case 'COORDINADOR_GRUPO':
        return <Badge variant="warning">{t('users.roles.COORDINADOR_GRUPO')}</Badge>;
      case 'DIRECTOR_INVESTIGACION':
        return <Badge variant="info">{t('users.roles.DIRECTOR_INVESTIGACION')}</Badge>;
      case 'DECANO':
        return <Badge variant="neutral">{t('users.roles.DECANO')}</Badge>;
      case 'EVALUADOR':
        return <Badge variant="neutral">{t('users.roles.EVALUADOR')}</Badge>;
      default:
        return <Badge variant="neutral">{roleCode}</Badge>;
    }
  };

  const getStatusBadge = (userRow: UserType) => {
    const isActive = userRow.status !== 'REJECTED' && userRow.status !== 'INACTIVE' && userRow.active !== false;
    return isActive ? (
      <Badge variant="success">{t('users.statusKey.active')}</Badge>
    ) : (
      <Badge variant="error">{t('users.statusKey.inactive')}</Badge>
    );
  };

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="create-user-view animate-fade-in full-screen-width">
      <div className="create-user-header-section">
        <div className="create-user-header-left">
          <div className="header-icon-badge">
            <UserPlus size={28} />
          </div>
          <div>
            <h1 className="create-user-title">{t('createUser.management.title')}</h1>
            <p className="create-user-subtitle">
              {t('createUser.management.subtitle')}
            </p>
          </div>
        </div>

        {/* Botones de navegación (Azul Oscuro) */}
        <div className="navigation-buttons-bar">
          <button
            onClick={() => setActiveTab('create')}
            className={`nav-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          >
            <UserPlus size={16} />
            {t('createUser.management.tabCreate')}
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`nav-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          >
            <Search size={16} />
            {t('createUser.management.tabList')}
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="create-user-form-container">
          {createdUser ? (
            <div className="success-card-wrapper animate-fade-in">
              <Card className="credentials-card">
                <CardContent>
                  <div className="credentials-header">
                    <Shield className="credentials-shield-icon" size={24} />
                    <h3>{t('createUser.management.credentialsTitle')}</h3>
                  </div>

                  <div className="credentials-info-list">
                    <div className="credentials-item">
                      <span className="label">{t('createUser.management.fullName')}</span>
                      <span className="value">{createdUser.firstNames} {createdUser.lastNames}</span>
                    </div>
                    <div className="credentials-item">
                      <span className="label">{t('createUser.management.emailUser')}</span>
                      <span className="value email-value">{createdUser.institutionalEmail}</span>
                    </div>
                    {createdUser.temporaryPassword && (
                      <div className="credentials-item password-item">
                        <span className="label">{t('createUser.management.tempPassword')}</span>
                        <div className="password-display-box">
                          <code className="password-code">{createdUser.temporaryPassword}</code>
                          <button
                            type="button"
                            onClick={handleCopyPassword}
                            className="copy-password-btn"
                            title={t('createUser.management.copyPassword')}
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="credentials-footer-alert">
                    <Mail size={18} className="alert-icon" />
                    <p dangerouslySetInnerHTML={{ __html: t('createUser.management.credentialsNotice', { email: createdUser.institutionalEmail }) }} />
                  </div>
                </CardContent>
              </Card>

              <div className="success-actions">
                <Button onClick={handleResetForm} variant="secondary" className="new-user-btn">
                  <UserPlus size={18} className="mr-2" />
                  {t('createUser.management.registerAnother')}
                </Button>
              </div>
            </div>
          ) : (
            <Card className="form-card">
              <CardContent>
                {errorMsg && (
                  <div className="login-error-alert animate-fade-in" style={{ marginBottom: '1.5rem' }} role="alert">
                    <div className="error-alert-icon-container">
                      <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                        <path d="M12 2L1 21h22L12 2z" />
                        <path d="M12 15.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm0-7.5a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1z" fill="#fbebeb" />
                      </svg>
                    </div>
                    <div className="error-alert-content">
                      <div className="error-alert-title">error</div>
                      <div className="error-alert-message">{errorMsg}</div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleCreateSubmit} className="premium-form-layout">
                  <div className="form-grid-two-columns">
                    {/* DNI */}
                    <div className="form-group-custom">
                      <label htmlFor="dni" className="field-label">{t('users.form.dniLabel')}</label>
                      <div className="field-input-wrapper">
                        <span className="field-icon"><Shield size={18} /></span>
                        <input
                          type="text"
                          id="dni"
                          maxLength={8}
                          className="field-input"
                          placeholder={t('users.form.dniPlaceholder')}
                          value={dni}
                          onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    {/* Rol */}
                    <div className="form-group-custom">
                      <label htmlFor="roleCode" className="field-label">{t('users.form.roleLabel')}</label>
                      <div className="field-input-wrapper">
                        <span className="field-icon"><Shield size={18} /></span>
                        <select
                          id="roleCode"
                          className="field-input select-input"
                          value={roleCode}
                          onChange={(e) => setRoleCode(e.target.value)}
                          disabled={isSubmitting}
                          required
                        >
                          <option value="ESTUDIANTE">{t('users.roles.ESTUDIANTE')}</option>
                          <option value="DOCENTE_INVESTIGADOR">{t('users.roles.DOCENTE_INVESTIGADOR')}</option>
                          <option value="COORDINADOR_GRUPO">{t('users.roles.COORDINADOR_GRUPO')}</option>
                          <option value="DIRECTOR_INVESTIGACION">{t('users.roles.DIRECTOR_INVESTIGACION')}</option>
                          <option value="DECANO">{t('users.roles.DECANO')}</option>
                          <option value="EVALUADOR">{t('users.roles.EVALUADOR')}</option>
                          <option value="ADMIN">{t('users.roles.ADMIN')}</option>
                        </select>
                      </div>
                    </div>

                    {/* Nombres */}
                    <div className="form-group-custom">
                      <label htmlFor="firstNames" className="field-label">{t('users.form.namesLabel')}</label>
                      <div className="field-input-wrapper">
                        <span className="field-icon"><User size={18} /></span>
                        <input
                          type="text"
                          id="firstNames"
                          className="field-input"
                          placeholder={t('users.form.namesPlaceholder')}
                          value={firstNames}
                          onChange={(e) => setFirstNames(e.target.value)}
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    {/* Apellidos */}
                    <div className="form-group-custom">
                      <label htmlFor="lastNames" className="field-label">{t('users.form.lastNamesLabel')}</label>
                      <div className="field-input-wrapper">
                        <span className="field-icon"><User size={18} /></span>
                        <input
                          type="text"
                          id="lastNames"
                          className="field-input"
                          placeholder={t('users.form.lastNamesPlaceholder')}
                          value={lastNames}
                          onChange={(e) => setLastNames(e.target.value)}
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    {/* Correo institucional */}
                    <div className="form-group-custom">
                      <label htmlFor="institutionalEmail" className="field-label">
                        {t('users.form.emailLabel')}
                      </label>
                      <div className="field-input-wrapper">
                        <span className="field-icon"><Mail size={18} /></span>
                        <input
                          type="email"
                          id="institutionalEmail"
                          className="field-input"
                          placeholder="ejemplo@unas.edu.pe"
                          value={institutionalEmail}
                          onChange={(e) => {
                            setInstitutionalEmail(e.target.value);
                            setIsEmailManuallyEdited(true);
                          }}
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                      <p className="field-hint">
                        {t('users.form.emailHelp')}
                      </p>
                    </div>

                    {/* Teléfono */}
                    <div className="form-group-custom">
                      <label htmlFor="phone" className="field-label">
                        {t('users.form.phoneLabel')} <span className="optional-tag">(Optional)</span>
                      </label>
                      <div className="field-input-wrapper">
                        <span className="field-icon"><Phone size={18} /></span>
                        <input
                          type="tel"
                          id="phone"
                          className="field-input"
                          placeholder="Ej. +51 987654321"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* Grupo de investigación */}
                    {roleCode !== 'ADMIN' && (
                      <div className="form-group-custom">
                        <label htmlFor="groupId" className="field-label">
                          Grupo de Investigación
                        </label>
                        <div className="field-input-wrapper">
                          <span className="field-icon"><Shield size={18} /></span>
                          <select
                            id="groupId"
                            className="field-input select-input"
                            value={groupId}
                            onChange={(e) => setGroupId(e.target.value ? Number(e.target.value) : '')}
                            disabled={isSubmitting}
                            required
                          >
                            <option value="">Seleccione un grupo...</option>
                            {groups.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.groupName} ({g.groupCode})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Advertencia sobre la Contraseña */}
                  <div className="form-password-disclaimer">
                    <Key className="disclaimer-icon" size={20} />
                    <div>
                      <h4>{t('createUser.management.passwordDisclaimer')}</h4>
                      <p>
                        {t('createUser.management.passwordDisclaimerText')}
                      </p>
                    </div>
                  </div>

                  <div className="form-actions-wrapper">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="register-submit-btn"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" size={16} />
                          {t('createUser.management.registering')}
                        </>
                      ) : (
                        <>
                          <UserPlus size={18} className="mr-2" />
                          {t('createUser.management.registerUser')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* --- VISTA TABLA DE USUARIOS --- */
        <div className="users-list-container animate-fade-in">
          <Card className="form-card">
            <CardContent>
              {/* Barra de Búsqueda */}
              <div className="search-filter-bar">
                <div className="search-input-wrapper">
                  <Search className="search-icon-field" size={18} />
                  <input
                    type="text"
                    className="search-input-field"
                    placeholder={t('createUser.management.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={loadUsers} variant="secondary" className="refresh-list-btn">
                  <RefreshCw size={16} className={loadingList ? 'animate-spin' : ''} />
                  Actualizar
                </Button>
              </div>

              {loadingList ? (
                <div className="list-loading-spinner-box">
                  <RefreshCw className="animate-spin text-blue-600" size={32} />
                  <p>{t('createUser.management.loadingDirectory')}</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive-wrapper">
                    <TableContainer>
                      <TableHead>
                        <TableRow>
                          <TableHeader>{t('users.table.dni')}</TableHeader>
                          <TableHeader>{t('users.table.nameAndLastname')}</TableHeader>
                          <TableHeader>{t('users.table.email')}</TableHeader>
                          <TableHeader>{t('users.table.role')}</TableHeader>
                          <TableHeader>{t('users.table.status')}</TableHeader>
                          <TableHeader style={{ textAlign: 'center' }}>{t('users.table.actions')}</TableHeader>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                              <div className="empty-state-message">
                                <Shield size={36} className="text-gray-300" />
                                <p>{t('createUser.management.emptyResults')}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedUsers.map((u) => (
                            <TableRow
                              key={u.id}
                              className="clickable-user-row"
                              onClick={() => setSelectedUser(u)}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setSelectedUser(u);
                                }
                              }}
                            >
                              <TableCell style={{ fontWeight: '500' }}>{u.dni}</TableCell>
                              <TableCell style={{ fontWeight: '600' }}>{u.firstNames} {u.lastNames}</TableCell>
                              <TableCell className="email-cell">{u.institutionalEmail}</TableCell>
                              <TableCell>{getRoleBadge(u.roleCode)}</TableCell>
                              <TableCell>{getStatusBadge(u)}</TableCell>
                              <TableCell>
                                <div className="actions-button-group">
                                  {/* Editar */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartEdit(u);
                                    }}
                                    className="action-btn edit-action"
                                    title={t('users.btnEdit')}
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  {/* Reiniciar Contraseña */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleResetUserPassword(u);
                                    }}
                                    className="action-btn reset-action"
                                    title={t('users.btnResetPass')}
                                  >
                                    <KeyRound size={16} />
                                  </button>
                                  {/* Activar / Desactivar */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleStatus(u);
                                    }}
                                    className={`action-btn toggle-action ${u.status !== 'REJECTED' && u.status !== 'INACTIVE' && u.active !== false ? 'active-user' : 'inactive-user'
                                      }`}
                                    title={u.active !== false ? t('users.btnDeactivate') : t('users.btnActivate')}
                                    disabled={loggedInUser && (loggedInUser.id === u.id || loggedInUser.email === u.institutionalEmail)}
                                  >
                                    {u.active !== false ? <UserX size={16} /> : <UserCheck size={16} />}
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </TableContainer>
                  </div>

                  {/* Controles de Paginación */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredUsers.length}
                      pageSize={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <UserDetailsModal
        user={selectedUser}
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
      />

      {/* --- MODAL EDITAR USUARIO --- */}
      {editingUser && (
        <div className="edit-user-modal-overlay">
          <div className="edit-user-modal-container animate-fade-in">
            <div className="modal-header-custom">
              <div className="modal-title-box">
                <Edit2 size={20} className="modal-title-icon" />
                <h3>{t('createUser.management.editTitle')}</h3>
              </div>
              <button onClick={() => setEditingUser(null)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="modal-form">
              <div className="modal-fields-grid">
                <div className="form-group-custom">
                  <label className="field-label">{t('createUser.management.dniReadonly')}</label>
                  <input
                    type="text"
                    className="field-input readonly-input"
                    value={editingUser.dni}
                    readOnly
                  />
                </div>

                <div className="form-group-custom">
                  <label htmlFor="editRoleCode" className="field-label">{t('users.form.roleLabel')}</label>
                  <select
                    id="editRoleCode"
                    className="field-input select-input"
                    value={editRoleCode}
                    onChange={(e) => setEditRoleCode(e.target.value)}
                    disabled={isUpdating}
                    required
                  >
                    <option value="ESTUDIANTE">{t('users.roles.ESTUDIANTE')}</option>
                    <option value="DOCENTE_INVESTIGADOR">{t('users.roles.DOCENTE_INVESTIGADOR')}</option>
                    <option value="COORDINADOR_GRUPO">{t('users.roles.COORDINADOR_GRUPO')}</option>
                    <option value="DIRECTOR_INVESTIGACION">{t('users.roles.DIRECTOR_INVESTIGACION')}</option>
                    <option value="DECANO">{t('users.roles.DECANO')}</option>
                    <option value="EVALUADOR">{t('users.roles.EVALUADOR')}</option>
                    <option value="ADMIN">{t('users.roles.ADMIN')}</option>
                  </select>
                </div>

                <div className="form-group-custom">
                  <label htmlFor="editFirstNames" className="field-label">{t('users.form.namesLabel')}</label>
                  <input
                    type="text"
                    id="editFirstNames"
                    className="field-input"
                    value={editFirstNames}
                    onChange={(e) => setEditFirstNames(e.target.value)}
                    disabled={isUpdating}
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <label htmlFor="editLastNames" className="field-label">{t('users.form.lastNamesLabel')}</label>
                  <input
                    type="text"
                    id="editLastNames"
                    className="field-input"
                    value={editLastNames}
                    onChange={(e) => setEditLastNames(e.target.value)}
                    disabled={isUpdating}
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <label htmlFor="editEmail" className="field-label">{t('users.form.emailLabel')}</label>
                  <input
                    type="email"
                    id="editEmail"
                    className="field-input"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    disabled={isUpdating}
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <label htmlFor="editPhone" className="field-label">{t('users.form.phoneLabel')}</label>
                  <input
                    type="text"
                    id="editPhone"
                    className="field-input"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    disabled={isUpdating}
                  />
                </div>

                {/* Grupo de investigación */}
                {editRoleCode !== 'ADMIN' && (
                  <div className="form-group-custom">
                    <label htmlFor="editGroupId" className="field-label">
                      Grupo de Investigación
                    </label>
                    <div className="field-input-wrapper">
                      <span className="field-icon"><Shield size={18} /></span>
                      <select
                        id="editGroupId"
                        className="field-input select-input"
                        value={editGroupId}
                        onChange={(e) => setEditGroupId(e.target.value ? Number(e.target.value) : '')}
                        disabled={isUpdating}
                        required
                      >
                        <option value="">Seleccione un grupo...</option>
                        {groups.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.groupName} ({g.groupCode})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions-wrapper">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingUser(null)}
                  disabled={isUpdating}
                >
                  {t('common:cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="modal-save-btn"
                >
                  {isUpdating ? t('createUser.management.saving') : t('createUser.management.saveChanges')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
