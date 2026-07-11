/**
 * ResearchGroupDetail.tsx
 * Detalle de un Grupo de Investigación (rol: ADMIN).
 * Tabs: Resumen/Coordinación, Miembros (con rol, estado, fecha ingreso), Líneas.
 * Regla de negocio: solo muestra docentes SIN membresía activa en otro grupo.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Users, Shield, UserPlus, Trash2, BookOpen, Plus,
  PowerOff, Calendar, Tag,
} from 'lucide-react';
import {
  researchService,
  type ResearchGroup,
  type ResearchLine,
  type GroupMember,
} from '../../services/researchService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

// ── Tipos locales ─────────────────────────────────────────────────────────────

interface AvailableUser {
  id: number;
  firstNames: string;
  lastNames: string;
  institutionalEmail: string;
}

type ActiveTab = 'summary' | 'members' | 'lines';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

function memberRoleLabel(role?: string): string {
  const map: Record<string, string> = {
    INVESTIGADOR_PRINCIPAL: 'Investigador Principal',
    COINVESTIGADOR: 'Co-investigador',
    COLABORADOR: 'Colaborador',
    ASESOR: 'Asesor',
  };
  return role ? (map[role] ?? role) : '—';
}

// ── Estilos de tabla inline ───────────────────────────────────────────────────

const thS: React.CSSProperties = {
  padding: '13px 18px', textAlign: 'left', fontSize: '12px', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.05em',
  color: 'var(--on-surface-variant)', backgroundColor: 'var(--surface-container-low)',
  borderBottom: '1px solid var(--outline-variant)', whiteSpace: 'nowrap',
};

const tdS: React.CSSProperties = {
  padding: '13px 18px', fontSize: '14px', color: 'var(--on-surface)',
  borderBottom: '1px solid var(--surface-container-high)', verticalAlign: 'middle',
};

// ── Componente principal ──────────────────────────────────────────────────────

export const ResearchGroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [group, setGroup] = useState<ResearchGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [groupLines, setGroupLines] = useState<ResearchLine[]>([]);
  const [allLines, setAllLines] = useState<ResearchLine[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialTab = (searchParams.get('tab') as ActiveTab) ?? 'summary';
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

  const [selectedCoordinator, setSelectedCoordinator] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();
  const { confirmDialog } = useConfirm();

  // ── Carga de datos ──────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const groupId = Number(id);

      const [groupData, membersData, groupLinesData, allLinesData] = await Promise.all([
        researchService.getGroupById(groupId),
        researchService.getMembers(groupId),
        researchService.getGroupLines(groupId),
        researchService.getLines(true),
      ]);

      setGroup(groupData);
      setMembers(membersData);
      setGroupLines(groupLinesData);
      setAllLines(allLinesData);

      if (groupData.currentCoordinatorId) {
        setSelectedCoordinator(groupData.currentCoordinatorId.toString());
      }

      // Cargar usuarios disponibles (sin membresía activa en otro grupo)
      try {
        const available = await researchService.getAvailableUsers();
        setAvailableUsers(available);
      } catch {
        // Fallback: si el endpoint no está disponible, array vacío
        setAvailableUsers([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar los detalles del grupo');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Acciones ────────────────────────────────────────────────────────────────

  const handleAssignCoordinator = async () => {
    if (!selectedCoordinator) return;
    try {
      setSubmitting(true);
      await researchService.assignCoordinator(Number(id), Number(selectedCoordinator));
      toast.success('Coordinador asignado con éxito');
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al asignar coordinador');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedMember) return;
    try {
      setSubmitting(true);
      await researchService.addMember(Number(id), Number(selectedMember));
      toast.success('Miembro agregado con éxito');
      setSelectedMember('');
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al agregar miembro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (member: GroupMember) => {
    const confirmed = await confirmDialog({
      title: 'Retirar Miembro',
      message: `¿Retirar a "${member.userFirstNames} ${member.userLastNames}" del grupo? Se realizará una eliminación lógica.`,
      confirmText: 'Retirar',
      danger: true,
    });
    if (!confirmed) return;
    try {
      await researchService.removeMember(Number(id), member.userId);
      toast.success('Miembro retirado con éxito');
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al retirar miembro');
    }
  };

  const handleAddLine = async () => {
    if (!selectedLine) return;
    try {
      setSubmitting(true);
      await researchService.assignGroupToLine(Number(selectedLine), Number(id));
      toast.success('Línea asignada con éxito');
      setSelectedLine('');
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al asignar línea');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveLine = async (lineId: number) => {
    const confirmed = await confirmDialog({
      title: 'Remover Línea',
      message: '¿Remover esta línea de investigación del grupo?',
      confirmText: 'Remover',
      danger: true,
    });
    if (!confirmed) return;
    try {
      await researchService.removeGroupFromLine(lineId, Number(id));
      toast.success('Línea removida con éxito');
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al remover línea');
    }
  };

  const handleDeactivateGroup = async () => {
    if (!group) return;
    const confirmed = await confirmDialog({
      title: 'Desactivar Grupo',
      message: `¿Desactivar el grupo "${group.groupName}"? Esta acción afectará a todos sus miembros activos.`,
      confirmText: 'Desactivar',
      danger: true,
    });
    if (!confirmed) return;
    try {
      await researchService.deactivateGroup(Number(id));
      toast.success('Grupo desactivado');
      navigate('/groups');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al desactivar el grupo');
    }
  };

  // ── Loading / Error ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <Spinner size="large" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
          <strong>Error:</strong> {error ?? 'Grupo no encontrado'}
        </div>
        <Button variant="secondary" onClick={() => navigate('/groups')}>Volver</Button>
      </div>
    );
  }

  // Usuarios que ya son miembros activos (para excluirlos del select de "agregar")
  const activeMemberIds = new Set(members.filter(m => m.active).map(m => m.userId));

  // Líneas disponibles (no asignadas aún)
  const unassignedLines = allLines.filter(l => !groupLines.some(gl => gl.id === l.id));

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in" style={{ padding: '28px' }}>
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate('/groups')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', fontWeight: 600, marginBottom: '24px', fontSize: '14px' }}
      >
        <ArrowLeft size={18} /> Volver a Grupos
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>{group.groupName}</h1>
            <span style={{ padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--secondary-container)', color: 'var(--on-secondary-container)', fontFamily: 'monospace' }}>
              {group.groupCode}
            </span>
            <Badge variant={group.active !== false ? 'success' : 'neutral'}>
              {group.active !== false ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--on-surface-variant)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Users size={14} /> {members.filter(m => m.active).length} miembro{members.filter(m => m.active).length !== 1 ? 's' : ''} activo{members.filter(m => m.active).length !== 1 ? 's' : ''}
            </span>
            {group.createdAt && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={14} /> Creado: {formatDate(group.createdAt)}
              </span>
            )}
          </div>
        </div>

        {group.active !== false && (
          <Button variant="danger" onClick={handleDeactivateGroup} icon={<PowerOff size={16} />}>
            Desactivar Grupo
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--outline-variant)', marginBottom: '28px' }}>
        {(['summary', 'members', 'lines'] as ActiveTab[]).map(tab => {
          const labels: Record<ActiveTab, React.ReactNode> = {
            summary: <><Shield size={16} /> Coordinación</>,
            members: <><Users size={16} /> Miembros ({members.length})</>,
            lines: <><BookOpen size={16} /> Líneas ({groupLines.length})</>,
          };
          return (
            <button
              key={tab}
              id={`tab-${tab}`}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', padding: '12px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                color: activeTab === tab ? 'var(--primary)' : 'var(--on-surface-variant)',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--primary)' : 'transparent'}`,
                marginBottom: '-2px', transition: 'all 0.2s ease',
              }}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--outline-variant)', boxShadow: 'var(--shadow-sm)', padding: '32px', minHeight: '400px' }}>

        {/* ── Tab Coordinación ── */}
        {activeTab === 'summary' && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '20px' }}>
              Coordinador del Grupo
            </h3>

            {group.currentCoordinatorId ? (
              <div style={{ padding: '16px 20px', backgroundColor: 'var(--primary-container)', borderRadius: 'var(--radius-lg)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Shield size={20} style={{ color: 'var(--on-primary-container)' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--on-primary-container)', fontSize: '15px' }}>
                    {group.coordinatorFirstNames} {group.coordinatorLastNames}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--on-primary-container)', opacity: 0.8 }}>
                    Coordinador actual
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '14px' }}>
                Este grupo no tiene coordinador asignado actualmente.
              </div>
            )}

            <div style={{ backgroundColor: 'var(--surface-container)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '10px' }}>
                Cambiar Coordinador
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <select
                  id="select-coordinator"
                  value={selectedCoordinator}
                  onChange={e => setSelectedCoordinator(e.target.value)}
                  style={{ flex: 1, padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline)', fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', outline: 'none' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--outline)')}
                >
                  <option value="">— Seleccione un usuario —</option>
                  {members.filter(m => m.active).map(m => (
                    <option key={m.userId} value={m.userId}>
                      {m.userFirstNames} {m.userLastNames}
                    </option>
                  ))}
                </select>
                <Button
                  variant="primary"
                  onClick={handleAssignCoordinator}
                  disabled={!selectedCoordinator || submitting || group.currentCoordinatorId?.toString() === selectedCoordinator}
                >
                  Guardar
                </Button>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '8px' }}>
                Solo se pueden seleccionar miembros activos del grupo como coordinador.
              </p>
            </div>
          </div>
        )}

        {/* ── Tab Miembros ── */}
        {activeTab === 'members' && (
          <div className="animate-fade-in">
            {/* Formulario para agregar miembro */}
            <div style={{ backgroundColor: 'var(--surface-container)', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '16px' }}>
                <UserPlus size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Agregar Nuevo Miembro
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginBottom: '14px' }}>
                Solo se muestran docentes <strong>sin membresía activa</strong> en otro grupo (regla de unicidad de membresías).
              </p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  id="select-new-member"
                  value={selectedMember}
                  onChange={e => setSelectedMember(e.target.value)}
                  style={{ flex: '1 1 250px', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline)', fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', outline: 'none' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--outline)')}
                >
                  <option value="">— Seleccione un docente —</option>
                  {availableUsers
                    .filter(u => !activeMemberIds.has(u.id))
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.firstNames} {u.lastNames} ({u.institutionalEmail})
                      </option>
                    ))}
                </select>
                <Button
                  variant="primary"
                  icon={<UserPlus size={16} />}
                  onClick={handleAddMember}
                  disabled={!selectedMember || submitting}
                >
                  Agregar
                </Button>
              </div>
            </div>

            {/* Tabla de miembros */}
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '16px' }}>
              Lista de Miembros
            </h3>

            {members.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--outline)', color: 'var(--on-surface-variant)' }}>
                No hay miembros registrados en este grupo.
              </div>
            ) : (
              <div style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={thS}>Nombre</th>
                        <th style={thS}>Email</th>
                        <th style={thS}><span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Tag size={13} /> Rol</span></th>
                        <th style={thS}>Estado Membresía</th>
                        <th style={thS}><span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={13} /> Fecha Ingreso</span></th>
                        <th style={{ ...thS, textAlign: 'right' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(member => (
                        <tr
                          key={member.id}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-container-lowest)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          style={{ transition: 'background-color 0.15s' }}
                        >
                          <td style={{ ...tdS, fontWeight: 600 }}>
                            {member.userFirstNames} {member.userLastNames}
                          </td>
                          <td style={{ ...tdS, color: 'var(--on-surface-variant)', fontSize: '13px' }}>
                            {member.userEmail}
                          </td>
                          <td style={tdS}>
                            <span style={{
                              padding: '3px 10px', borderRadius: 'var(--radius-full)',
                              fontSize: '12px', fontWeight: 600,
                              backgroundColor: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)'
                            }}>
                              {memberRoleLabel(member.memberRole)}
                            </span>
                          </td>
                          <td style={tdS}>
                            <Badge variant={member.active ? 'success' : 'neutral'}>
                              {member.active ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </td>
                          <td style={{ ...tdS, color: 'var(--on-surface-variant)', fontSize: '13px' }}>
                            {formatDate(member.joinedAt)}
                          </td>
                          <td style={{ ...tdS, textAlign: 'right' }}>
                            {member.active && (
                              <button
                                id={`btn-remove-member-${member.userId}`}
                                type="button"
                                title="Retirar miembro"
                                onClick={() => handleRemoveMember(member)}
                                style={{
                                  padding: '7px 12px', borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--error-container)', backgroundColor: 'var(--surface)',
                                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px',
                                  fontSize: '13px', fontWeight: 600, color: 'var(--error)',
                                }}
                              >
                                <Trash2 size={14} /> Retirar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab Líneas ── */}
        {activeTab === 'lines' && (
          <div className="animate-fade-in">
            <div style={{ backgroundColor: 'var(--surface-container)', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '16px' }}>
                Añadir Línea de Investigación
              </h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  id="select-new-line"
                  value={selectedLine}
                  onChange={e => setSelectedLine(e.target.value)}
                  disabled={unassignedLines.length === 0}
                  style={{ flex: '1 1 250px', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline)', fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', outline: 'none' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--outline)')}
                >
                  <option value="">{unassignedLines.length === 0 ? '— Sin líneas disponibles —' : '— Seleccione una línea —'}</option>
                  {unassignedLines.map(l => (
                    <option key={l.id} value={l.id}>{l.lineName}</option>
                  ))}
                </select>
                <Button
                  variant="primary"
                  icon={<Plus size={16} />}
                  onClick={handleAddLine}
                  disabled={!selectedLine || submitting}
                >
                  Añadir
                </Button>
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '16px' }}>
              Líneas Asignadas ({groupLines.length})
            </h3>

            {groupLines.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--outline)', color: 'var(--on-surface-variant)' }}>
                No hay líneas de investigación asignadas a este grupo.
              </div>
            ) : (
              <div style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thS}>Nombre de la Línea</th>
                      <th style={thS}>Estado</th>
                      <th style={{ ...thS, textAlign: 'right' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupLines.map(line => (
                      <tr key={line.id} style={{ transition: 'background-color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-container-lowest)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={{ ...tdS, fontWeight: 600 }}>{line.lineName}</td>
                        <td style={tdS}>
                          <Badge variant={line.active ? 'success' : 'neutral'}>
                            {line.active ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </td>
                        <td style={{ ...tdS, textAlign: 'right' }}>
                          <button
                            id={`btn-remove-line-${line.id}`}
                            type="button"
                            onClick={() => handleRemoveLine(line.id)}
                            style={{
                              padding: '7px 12px', borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--error-container)', backgroundColor: 'var(--surface)',
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px',
                              fontSize: '13px', fontWeight: 600, color: 'var(--error)',
                            }}
                          >
                            <Trash2 size={14} /> Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
