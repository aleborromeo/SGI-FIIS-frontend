import React, { useEffect, useState, useCallback } from 'react';
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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const toast = useToast();
  const confirm = useConfirm();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAll(searchQuery || undefined);
      setUsers(data);
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err);
      setError('No se pudo cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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
      errors.dni = 'El DNI debe tener exactamente 8 caracteres';
    }
    if (!formData.firstNames.trim()) {
      errors.firstNames = 'Los nombres son obligatorios';
    }
    if (!formData.lastNames.trim()) {
      errors.lastNames = 'Los apellidos son obligatorios';
    }
    if (!formData.roleCode) {
      errors.roleCode = 'Seleccione un rol';
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
        toast.success('Usuario actualizado exitosamente');
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
        toast.success('Usuario creado exitosamente. Se enviara la contrasena temporal al correo.');
      }
      closeForm();
      loadUsers();
    } catch (err: any) {
      const msg = err?.message || 'Error al guardar el usuario';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newActive = !user.active;
    const action = newActive ? 'activar' : 'desactivar';

    const accepted = await confirm.confirmDialog({
      title: `${newActive ? 'Activar' : 'Desactivar'} Usuario`,
      message: `¿Desea ${action} a ${user.firstNames} ${user.lastNames}?`,
      confirmText: newActive ? 'Activar' : 'Desactivar',
      danger: !newActive,
    });

    if (!accepted) return;

    try {
      setProcessingId(user.id);
      await userService.toggleStatus(user.id, newActive);
      toast.success(`Usuario ${newActive ? 'activado' : 'desactivado'} exitosamente`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, active: newActive } : u))
      );
    } catch (err) {
      toast.error(`Error al ${action} el usuario`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleResetPassword = async (user: User) => {
    const accepted = await confirm.confirmDialog({
      title: 'Restablecer Contrasena',
      message: `¿Desea restablecer la contrasena de ${user.firstNames} ${user.lastNames}? Se enviara una contrasena temporal a su correo.`,
      confirmText: 'Restablecer',
      danger: false,
    });

    if (!accepted) return;

    try {
      setProcessingId(user.id);
      await userService.resetPassword(user.id);
      toast.success('Contrasena restablecida. Se envio un correo al usuario.');
    } catch (err) {
      toast.error('Error al restablecer la contrasena');
    } finally {
      setProcessingId(null);
    }
  };

  const getRoleLabel = (code: string): string => {
    return ROLE_OPTIONS.find((r) => r.value === code)?.label || code;
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
            <h1 className="text-headline-lg">Gestion de Usuarios</h1>
          </div>
          <p
            className="text-body-md"
            style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}
          >
            Administre el personal y alumnos del sistema. Cree, edite, active o desactive cuentas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="secondary"
            icon={<RefreshCcw size={16} />}
            onClick={loadUsers}
            disabled={loading}
          >
            Actualizar
          </Button>
          <Button variant="primary" icon={<UserPlus size={16} />} onClick={openCreateForm}>
            Nuevo Usuario
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
            label="Buscar"
            placeholder="DNI, nombre, correo o rol..."
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
          Buscar
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
                <span style={{ color: 'var(--on-surface-variant)' }}>Total</span>
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
                <span style={{ color: 'var(--on-surface-variant)' }}>Activos</span>
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
                <span style={{ color: 'var(--on-surface-variant)' }}>Inactivos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title="Error de conexion">
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
            <TableHeader>DNI</TableHeader>
            <TableHeader>Nombres y Apellidos</TableHeader>
            <TableHeader>Correo Institucional</TableHeader>
            <TableHeader>Telefono</TableHeader>
            <TableHeader>Rol</TableHeader>
            <TableHeader>Estado</TableHeader>
            <TableHeader style={{ textAlign: 'right' }}>Acciones</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>
                Cargando usuarios...
              </td>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--on-surface-variant)' }}>
                <Users size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                No se encontraron usuarios.
              </td>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell style={{ fontWeight: 700 }}>{user.dni}</TableCell>
                <TableCell>
                  <div style={{ fontWeight: 600 }}>
                    {user.firstNames} {user.lastNames}
                  </div>
                </TableCell>
                <TableCell>{user.institutionalEmail || <span style={{ color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>Sin correo</span>}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>
                  <Badge variant={ROLE_BADGE_MAP[user.roleCode] || 'neutral'}>
                    {getRoleLabel(user.roleCode)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.active ? 'success' : 'error'}>
                    {user.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <Button
                  variant="secondary"
                  icon={<Pencil size={14} />}
                  onClick={() => openEditForm(user)}
                >
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  icon={<KeyRound size={14} />}
                  onClick={() => handleResetPassword(user)}
                  disabled={processingId === user.id}
                >
                  Reset Pass
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
                      {user.active ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </TableContainer>

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
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                label="DNI"
                placeholder="8 caracteres"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                error={formErrors.dni}
                disabled={!!editingUser}
                maxLength={8}
              />

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <Input
                  label="Nombres"
                  placeholder="Nombres completos"
                  value={formData.firstNames}
                  onChange={(e) => setFormData({ ...formData, firstNames: e.target.value })}
                  error={formErrors.firstNames}
                />
                <Input
                  label="Apellidos"
                  placeholder="Apellidos completos"
                  value={formData.lastNames}
                  onChange={(e) => setFormData({ ...formData, lastNames: e.target.value })}
                  error={formErrors.lastNames}
                />
              </div>

              <Input
                label="Correo Institucional"
                placeholder="Si se deja vacio, se autogenera: apellido.nombre@unas.edu.pe"
                value={formData.institutionalEmail}
                onChange={(e) => setFormData({ ...formData, institutionalEmail: e.target.value })}
                helpText="Dejar vacio para autogenerar con el dominio @unas.edu.pe"
              />

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <Input
                  label="Telefono"
                  placeholder="Telefono (opcional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Select
                  label="Rol"
                  value={formData.roleCode}
                  onChange={(e) => setFormData({ ...formData, roleCode: e.target.value })}
                  options={ROLE_OPTIONS}
                  error={formErrors.roleCode}
                />
              </div>

              {!editingUser && (
                <Alert title="Contrasena temporal">
                  <span style={{ fontSize: '0.875rem' }}>
                    Se enviara una contrasena temporal al correo del usuario. Debera cambiarla en su primer inicio de sesion.
                  </span>
                </Alert>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <Button variant="secondary" onClick={closeForm}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear Usuario'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
