import React, { useEffect, useState, useMemo } from 'react';
import { ShieldCheck, UserCheck, UserX, AlertCircle, RefreshCcw } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import {
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../../components/ui/Table';
import { userService, type User } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

export const ActivateUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACTIVE'>('PENDING');
  
  const rawToast = useToast();
  const toast = useMemo(() => ({
    ...rawToast,
    showError: rawToast.error,
    showSuccess: rawToast.success,
  }), [rawToast]);

  const confirm = useConfirm();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAll();
      setUsers(data);
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err);
      setError('No se pudo cargar la lista de usuarios. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleActivate = async (user: User) => {
    const accepted = await confirm.confirmDialog({
      title: 'Activar Usuario',
      message: `¿Estás seguro de que deseas activar al usuario ${user.firstNames} ${user.lastNames}?`,
      confirmText: 'Activar',
      danger: false,
    });

    if (!accepted) return;

    try {
      setProcessingId(user.id);
      await userService.toggleStatus(user.id, true);
      toast.showSuccess(`Usuario ${user.firstNames} activado exitosamente`);
      setUsers((prev) => prev.map(u => u.id === user.id ? { ...u, active: true } : u));
    } catch (err) {
      console.error(err);
      toast.showError('Ocurrió un error al intentar activar al usuario.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeactivate = async (user: User) => {
    const accepted = await confirm.confirmDialog({
      title: 'Desactivar Usuario',
      message: `¿Estás seguro de que deseas desactivar al usuario ${user.firstNames} ${user.lastNames}?`,
      confirmText: 'Desactivar',
      danger: true,
    });

    if (!accepted) return;

    try {
      setProcessingId(user.id);
      await userService.toggleStatus(user.id, false);
      toast.showSuccess(`Usuario ${user.firstNames} desactivado exitosamente`);
      setUsers((prev) => prev.map(u => u.id === user.id ? { ...u, active: false } : u));
    } catch (err) {
      console.error(err);
      toast.showError('Ocurrió un error al intentar desactivar al usuario.');
    } finally {
      setProcessingId(null);
    }
  };

  const getRoleBadge = (roleCode: string) => {
    switch (roleCode) {
      case 'ESTUDIANTE':
        return <Badge variant="info">Estudiante</Badge>;
      case 'DOCENTE_INVESTIGADOR':
        return <Badge variant="success">Docente Inv.</Badge>;
      case 'COORDINADOR_GRUPO':
        return <Badge variant="warning">Coord. Grupo</Badge>;
      case 'DIRECTOR_INVESTIGACION':
        return <Badge variant="info">Director Inv.</Badge>;
      case 'ADMIN':
        return <Badge variant="neutral">Admin</Badge>;
      default:
        return <Badge variant="neutral">{roleCode}</Badge>;
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const isPending = !u.active;
      if (activeTab === 'PENDING') return isPending;
      return !isPending;
    });
  }, [users, activeTab]);

  const renderTableBody = () => {
    if (loading) {
      return (
        <TableRow>
          <td
            colSpan={6}
            style={{
              textAlign: 'center',
              padding: '32px',
              color: 'var(--on-surface-variant)',
            }}
          >
            Cargando usuarios...
          </td>
        </TableRow>
      );
    }

    if (filteredUsers.length === 0) {
      return (
        <TableRow>
          <td
            colSpan={6}
            style={{
              textAlign: 'center',
              padding: '48px',
              color: 'var(--on-surface-variant)',
            }}
          >
            <ShieldCheck size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            No hay usuarios en esta categoría.
          </td>
        </TableRow>
      );
    }

    return filteredUsers.map((user) => (
      <TableRow key={user.id}>
        <TableCell style={{ fontWeight: 700 }}>{user.dni}</TableCell>
        <TableCell>
          <div style={{ fontWeight: 600 }}>{user.firstNames} {user.lastNames}</div>
        </TableCell>
        <TableCell>{user.institutionalEmail}</TableCell>
        <TableCell>{getRoleBadge(user.roleCode)}</TableCell>
        <TableCell>
          {user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : 'Desconocida'}
        </TableCell>
        <TableCell style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {!user.active && (
              <Button
                variant="primary"
                icon={<UserCheck size={16} />}
                onClick={() => handleActivate(user)}
                disabled={processingId === user.id}
                style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#15803d', color: '#fff', borderColor: '#15803d' }}
              >
                Activar
              </Button>
            )}
            {user.active && (
              <Button
                variant="danger"
                icon={<UserX size={16} />}
                onClick={() => handleDeactivate(user)}
                disabled={processingId === user.id}
                style={{ padding: '6px 12px', fontSize: '13px' }}
              >
                Desactivar
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '24px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--primary-container)',
              color: 'var(--on-primary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-headline-lg" style={{ fontWeight: 700 }}>Administrar Usuarios</h1>
          </div>

          <p
            className="text-body-md"
            style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}
          >
            Revisa y gestiona las solicitudes de registro de nuevos miembros y el estado de cuentas actuales.
          </p>
        </div>

        <Button
          variant="secondary"
          icon={<RefreshCcw size={16} />}
          onClick={loadUsers}
          disabled={loading}
        >
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <UserX size={22} color="#f59e0b" />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '24px', fontWeight: 800 }}>
                  {users.filter(u => !u.active).length}
                </strong>
                <span style={{ color: 'var(--on-surface-variant)', fontSize: '13px', fontWeight: 500 }}>
                  Pendientes de Activación
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'rgba(21, 128, 61, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <UserCheck size={22} color="#15803d" />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '24px', fontWeight: 800 }}>
                  {users.filter(u => u.active).length}
                </strong>
                <span style={{ color: 'var(--on-surface-variant)', fontSize: '13px', fontWeight: 500 }}>
                  Usuarios Activos
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--outline-variant)' }}>
        {[
          { id: 'PENDING', label: 'Pendientes de Activación' },
          { id: 'ACTIVE', label: 'Usuarios Activos' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--on-surface-variant)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title="Error de conexión">
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
            <TableHeader>Rol Solicitado / Asignado</TableHeader>
            <TableHeader>Fecha Registro</TableHeader>
            <TableHeader style={{ textAlign: 'right' }}>Acciones</TableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          {renderTableBody()}
        </TableBody>
      </TableContainer>
    </div>
  );
};
