import React, { useState, useEffect, useContext } from 'react';
import { UserPlus, User, Phone, Mail, Shield, CheckCircle, Copy, RefreshCw, Key, Search, Edit2, KeyRound, UserCheck, UserX, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
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
import './CreateUser.css';

export const CreateUser: React.FC = () => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      toast.error('No se pudo cargar la lista de usuarios.');
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
    setCreatedUser(null);
    setErrorMsg(null);
    setIsEmailManuallyEdited(false);
  };

  const handleCopyPassword = () => {
    if (createdUser?.temporaryPassword) {
      navigator.clipboard.writeText(createdUser.temporaryPassword);
      toast.success('¡Contraseña copiada al portapapeles!');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!dni || dni.length !== 8) {
      setErrorMsg('El DNI debe tener exactamente 8 dígitos.');
      return;
    }
    if (!firstNames.trim() || !lastNames.trim()) {
      setErrorMsg('Los nombres y apellidos son obligatorios.');
      return;
    }
    if (institutionalEmail && !institutionalEmail.toLowerCase().endsWith('.edu.pe')) {
      setErrorMsg('El correo institucional debe pertenecer al dominio (.edu.pe).');
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

      setCreatedUser({
        institutionalEmail: response.institutionalEmail,
        temporaryPassword: response.temporaryPassword,
        firstNames: response.firstNames,
        lastNames: response.lastNames,
        roleDescription: response.roleDescription
      });
      toast.success('¡Usuario registrado exitosamente!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ocurrió un error al intentar crear el usuario.');
      toast.error('Error al registrar usuario');
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
      toast.error('No puedes desactivar tu propia cuenta de administrador.');
      return;
    }

    const title = isCurrentlyActive ? 'Desactivar Usuario' : 'Activar Usuario';
    const message = `¿Estás seguro de que deseas ${isCurrentlyActive ? 'desactivar' : 'activar'} la cuenta de ${userRow.firstNames} ${userRow.lastNames}?`;

    const accepted = await confirm.confirmDialog({
      title,
      message,
      confirmText: isCurrentlyActive ? 'Desactivar' : 'Activar',
      danger: isCurrentlyActive,
    });

    if (!accepted) return;

    try {
      if (isCurrentlyActive) {
        await userService.rejectUser(userRow.id);
        toast.success('Usuario desactivado correctamente.');
      } else {
        await userService.activateUser(userRow.id);
        toast.success('Usuario activado correctamente.');
      }
      loadUsers();
    } catch (err: any) {
      console.error(err);
      toast.error('Error al cambiar el estado del usuario.');
    }
  };

  const handleResetUserPassword = async (userRow: UserType) => {
    const accepted = await confirm.confirmDialog({
      title: 'Restablecer Contraseña',
      message: `¿Estás seguro de que deseas reiniciar la contraseña de ${userRow.firstNames} ${userRow.lastNames}? Se enviará una nueva contraseña al correo del usuario y se le solicitará cambiarla en su próximo ingreso.`,
      confirmText: 'Restablecer',
      danger: false,
    });

    if (!accepted) return;

    try {
      await userService.resetPassword(userRow.id);
      toast.success('Contraseña restablecida y enviada exitosamente.');
    } catch (err: any) {
      console.error(err);
      toast.error('Error al restablecer la contraseña.');
    }
  };

  const handleStartEdit = (userRow: UserType) => {
    setEditingUser(userRow);
    setEditFirstNames(userRow.firstNames);
    setEditLastNames(userRow.lastNames);
    setEditEmail(userRow.institutionalEmail);
    setEditPhone(userRow.phone || '');
    setEditRoleCode(userRow.roleCode);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editFirstNames.trim() || !editLastNames.trim() || !editEmail.trim()) {
      toast.error('Nombres, apellidos y correo son campos requeridos.');
      return;
    }

    setIsUpdating(true);
    try {
      await userService.updateUser(editingUser.id, {
        firstNames: editFirstNames,
        lastNames: editLastNames,
        institutionalEmail: editEmail,
        phone: editPhone || undefined,
        roleCode: editRoleCode
      });
      toast.success('Datos de usuario actualizados correctamente.');
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al actualizar el usuario.');
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
        return <Badge variant="error">Administrador</Badge>;
      case 'ESTUDIANTE':
        return <Badge variant="info">Estudiante</Badge>;
      case 'DOCENTE_INVESTIGADOR':
        return <Badge variant="success">Docente Inv.</Badge>;
      case 'COORDINADOR_GRUPO':
        return <Badge variant="warning">Coordinador</Badge>;
      case 'DIRECTOR_INVESTIGACION':
        return <Badge variant="info">Director</Badge>;
      case 'DECANO':
        return <Badge variant="neutral">Decano</Badge>;
      case 'EVALUADOR':
        return <Badge variant="neutral">Evaluador</Badge>;
      default:
        return <Badge variant="neutral">{roleCode}</Badge>;
    }
  };

  const getStatusBadge = (userRow: UserType) => {
    const isActive = userRow.status !== 'REJECTED' && userRow.status !== 'INACTIVE' && userRow.active !== false;
    return isActive ? (
      <Badge variant="success">Activo</Badge>
    ) : (
      <Badge variant="error">Inactivo</Badge>
    );
  };

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = 3;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 2;
      }

      if (start > 2) {
        pages.push('ellipsis-start');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }

      pages.push(totalPages);
    }

    return pages.map((page, idx) => {
      if (page === 'ellipsis-start' || page === 'ellipsis-end') {
        return <span key={`ellipsis-${idx}`} className="pagination-ellipsis">...</span>;
      }
      return (
        <button
          key={`page-${page}`}
          onClick={() => setCurrentPage(page as number)}
          className={`pagination-number-btn ${currentPage === page ? 'active' : ''}`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="create-user-view animate-fade-in full-screen-width">
      <div className="create-user-header-section">
        <div className="create-user-header-left">
          <div className="header-icon-badge">
            <UserPlus size={28} />
          </div>
          <div>
            <h1 className="create-user-title">Gestión de Usuarios</h1>
            <p className="create-user-subtitle">
              Administración de cuentas institucionales del sistema, registro de nuevos miembros y configuración de accesos.
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
            Agregar
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`nav-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          >
            <Search size={16} />
            Ver Usuarios
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
                    <h3>Credenciales Temporales de Acceso</h3>
                  </div>

                  <div className="credentials-info-list">
                    <div className="credentials-item">
                      <span className="label">Nombre completo:</span>
                      <span className="value">{createdUser.firstNames} {createdUser.lastNames}</span>
                    </div>
                    <div className="credentials-item">
                      <span className="label">Correo / Usuario:</span>
                      <span className="value email-value">{createdUser.institutionalEmail}</span>
                    </div>
                    {createdUser.temporaryPassword && (
                      <div className="credentials-item password-item">
                        <span className="label">Contraseña temporal:</span>
                        <div className="password-display-box">
                          <code className="password-code">{createdUser.temporaryPassword}</code>
                          <button
                            type="button"
                            onClick={handleCopyPassword}
                            className="copy-password-btn"
                            title="Copiar contraseña"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="credentials-footer-alert">
                    <Mail size={18} className="alert-icon" />
                    <p>
                      Estas credenciales han sido enviadas de forma segura al correo <strong>{createdUser.institutionalEmail}</strong>. El usuario deberá cambiar esta contraseña obligatoriamente en su primer inicio de sesión.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="success-actions">
                <Button onClick={handleResetForm} variant="secondary" className="new-user-btn">
                  <UserPlus size={18} className="mr-2" />
                  Registrar otro usuario
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
                      <label htmlFor="dni" className="field-label">DNI</label>
                      <div className="field-input-wrapper">
                        <span className="field-icon"><Shield size={18} /></span>
                        <input
                          type="text"
                          id="dni"
                          maxLength={8}
                          className="field-input"
                          placeholder="8 dígitos"
                          value={dni}
                          onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    {/* Rol */}
                    <div className="form-group-custom">
                      <label htmlFor="roleCode" className="field-label">Rol del sistema</label>
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
                          <option value="ESTUDIANTE">Estudiante / Tesista</option>
                          <option value="DOCENTE_INVESTIGADOR">Docente Investigador</option>
                          <option value="COORDINADOR_GRUPO">Coordinador de Grupo</option>
                          <option value="DIRECTOR_INVESTIGACION">Director de Investigación</option>
                          <option value="DECANO">Decano</option>
                          <option value="EVALUADOR">Evaluador</option>
                          <option value="ADMIN">Administrador</option>
                        </select>
                      </div>
                    </div>

                    {/* Nombres */}
                    <div className="form-group-custom">
                      <label htmlFor="firstNames" className="field-label">Nombres</label>
                      <div className="field-input-wrapper">
                        <span className="field-icon"><User size={18} /></span>
                        <input
                          type="text"
                          id="firstNames"
                          className="field-input"
                          placeholder="Nombres completos"
                          value={firstNames}
                          onChange={(e) => setFirstNames(e.target.value)}
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    {/* Apellidos */}
                    <div className="form-group-custom">
                      <label htmlFor="lastNames" className="field-label">Apellidos</label>
                      <div className="field-input-wrapper">
                        <span className="field-icon"><User size={18} /></span>
                        <input
                          type="text"
                          id="lastNames"
                          className="field-input"
                          placeholder="Apellidos completos"
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
                        Correo institucional
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
                        Se autocompleta automáticamente según los nombres ingresados. Puedes modificarlo si lo requieres.
                      </p>
                    </div>

                    {/* Teléfono */}
                    <div className="form-group-custom">
                      <label htmlFor="phone" className="field-label">
                        Teléfono celular <span className="optional-tag">(Opcional)</span>
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
                  </div>

                  {/* Advertencia sobre la Contraseña */}
                  <div className="form-password-disclaimer">
                    <Key className="disclaimer-icon" size={20} />
                    <div>
                      <h4>Contraseña Segura Automática</h4>
                      <p>
                        El sistema generará una contraseña aleatoria de alta seguridad (mín. 10 caracteres con mayúsculas, minúsculas, números y símbolos) y la enviará de forma automática al usuario por correo.
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
                          Registrando usuario...
                        </>
                      ) : (
                        <>
                          <UserPlus size={18} className="mr-2" />
                          Registrar Usuario
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
                    placeholder="Buscar usuarios por nombre, correo, DNI, rol o estado..."
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
                  <p>Cargando directorio de usuarios...</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive-wrapper">
                    <TableContainer>
                      <TableHead>
                        <TableRow>
                          <TableHeader>DNI</TableHeader>
                          <TableHeader>Nombres y Apellidos</TableHeader>
                          <TableHeader>Correo Institucional</TableHeader>
                          <TableHeader>Rol Principal</TableHeader>
                          <TableHeader>Estado</TableHeader>
                          <TableHeader style={{ textAlign: 'center' }}>Acciones</TableHeader>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                              <div className="empty-state-message">
                                <Shield size={36} className="text-gray-300" />
                                <p>No se encontraron usuarios coincidentes.</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedUsers.map((u) => (
                            <TableRow key={u.id}>
                              <TableCell style={{ fontWeight: '500' }}>{u.dni}</TableCell>
                              <TableCell style={{ fontWeight: '600' }}>{u.firstNames} {u.lastNames}</TableCell>
                              <TableCell className="email-cell">{u.institutionalEmail}</TableCell>
                              <TableCell>{getRoleBadge(u.roleCode)}</TableCell>
                              <TableCell>{getStatusBadge(u)}</TableCell>
                              <TableCell>
                                <div className="actions-button-group">
                                  {/* Editar */}
                                  <button
                                    onClick={() => handleStartEdit(u)}
                                    className="action-btn edit-action"
                                    title="Editar Datos"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  {/* Reiniciar Contraseña */}
                                  <button
                                    onClick={() => handleResetUserPassword(u)}
                                    className="action-btn reset-action"
                                    title="Reiniciar Contraseña"
                                  >
                                    <KeyRound size={16} />
                                  </button>
                                  {/* Activar / Desactivar */}
                                  <button
                                    onClick={() => handleToggleStatus(u)}
                                    className={`action-btn toggle-action ${u.status !== 'REJECTED' && u.status !== 'INACTIVE' && u.active !== false ? 'active-user' : 'inactive-user'
                                      }`}
                                    title={u.active !== false ? 'Desactivar Cuenta' : 'Activar Cuenta'}
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
                    <div className="pagination-wrapper-box">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="pagination-arrow-btn"
                        title="Página Anterior"
                      >
                        &lt;
                      </button>
                      <div className="pagination-numbers-list">
                        {renderPageNumbers()}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="pagination-arrow-btn"
                        title="Página Siguiente"
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- MODAL EDITAR USUARIO --- */}
      {editingUser && (
        <div className="edit-user-modal-overlay">
          <div className="edit-user-modal-container animate-fade-in">
            <div className="modal-header-custom">
              <div className="modal-title-box">
                <Edit2 size={20} className="modal-title-icon" />
                <h3>Editar Datos Personales</h3>
              </div>
              <button onClick={() => setEditingUser(null)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="modal-form">
              <div className="modal-fields-grid">
                <div className="form-group-custom">
                  <label className="field-label">DNI (No modificable)</label>
                  <input
                    type="text"
                    className="field-input readonly-input"
                    value={editingUser.dni}
                    readOnly
                  />
                </div>

                <div className="form-group-custom">
                  <label htmlFor="editRoleCode" className="field-label">Rol del sistema</label>
                  <select
                    id="editRoleCode"
                    className="field-input select-input"
                    value={editRoleCode}
                    onChange={(e) => setEditRoleCode(e.target.value)}
                    disabled={isUpdating}
                    required
                  >
                    <option value="ESTUDIANTE">Estudiante / Tesista</option>
                    <option value="DOCENTE_INVESTIGADOR">Docente Investigador</option>
                    <option value="COORDINADOR_GRUPO">Coordinador de Grupo</option>
                    <option value="DIRECTOR_INVESTIGACION">Director de Investigación</option>
                    <option value="DECANO">Decano</option>
                    <option value="EVALUADOR">Evaluador</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <div className="form-group-custom">
                  <label htmlFor="editFirstNames" className="field-label">Nombres</label>
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
                  <label htmlFor="editLastNames" className="field-label">Apellidos</label>
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
                  <label htmlFor="editEmail" className="field-label">Correo institucional</label>
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
                  <label htmlFor="editPhone" className="field-label">Teléfono celular</label>
                  <input
                    type="text"
                    id="editPhone"
                    className="field-input"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    disabled={isUpdating}
                  />
                </div>
              </div>

              <div className="modal-actions-wrapper">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingUser(null)}
                  disabled={isUpdating}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="modal-save-btn"
                >
                  {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
