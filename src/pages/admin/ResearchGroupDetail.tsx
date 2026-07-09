import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Shield, UserPlus, Trash2, BookOpen, Plus } from 'lucide-react';
import { researchService, type ResearchGroup, type ResearchLine } from '../../services/researchService';
import { userService, type User } from '../../services/userService';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

export const ResearchGroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState<ResearchGroup | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [groupLines, setGroupLines] = useState<ResearchLine[]>([]);
  const [allLines, setAllLines] = useState<ResearchLine[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for tabs
  const [activeTab, setActiveTab] = useState<'summary' | 'members' | 'lines'>('summary');
  
  // States for forms
  const [selectedCoordinator, setSelectedCoordinator] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedLine, setSelectedLine] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const { confirmDialog } = useConfirm();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const groupId = Number(id);
      
      const [groupData, membersData, allUsers, groupLinesData, allLinesData] = await Promise.all([
        researchService.getGroupById(groupId),
        researchService.getMembers(groupId),
        userService.getAll(),
        researchService.getGroupLines(groupId),
        researchService.getLines(true)
      ]);
      
      setGroup(groupData);
      setMembers(membersData);
      setUsers(allUsers);
      setGroupLines(groupLinesData);
      setAllLines(allLinesData);
      
      if (groupData.currentCoordinatorId) {
        setSelectedCoordinator(groupData.currentCoordinatorId.toString());
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar los detalles del grupo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleAssignCoordinator = async () => {
    if (!selectedCoordinator) return;
    try {
      setSubmitting(true);
      await researchService.assignCoordinator(Number(id), Number(selectedCoordinator));
      toast.success('Coordinador asignado con éxito');
      fetchData();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
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
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    const isConfirmed = await confirmDialog({
      title: 'Remover Miembro',
      message: '¿Estás seguro de remover a este miembro del grupo?',
      confirmText: 'Remover',
      danger: true
    });
    if (!isConfirmed) return;
    
    try {
      await researchService.removeMember(Number(id), userId);
      toast.success('Miembro removido con éxito');
      fetchData();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
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
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveLine = async (lineId: number) => {
    const isConfirmed = await confirmDialog({
      title: 'Remover Línea',
      message: '¿Estás seguro de remover esta línea de investigación del grupo?',
      confirmText: 'Remover',
      danger: true
    });
    if (!isConfirmed) return;
    
    try {
      setSubmitting(true);
      await researchService.removeGroupFromLine(lineId, Number(id));
      toast.success('Línea removida con éxito');
      fetchData();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <Spinner size="large" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)' }}>
          <strong>Error:</strong> {error || 'Grupo no encontrado'}
        </div>
        <Button variant="secondary" onClick={() => navigate('/groups')} style={{ marginTop: '16px' }}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <button 
        type="button"
        onClick={() => navigate('/groups')}
        style={{ 
          background: 'none', border: 'none', cursor: 'pointer', 
          display: 'flex', alignItems: 'center', gap: '8px', 
          color: 'var(--on-surface-variant)', fontWeight: 600, marginBottom: '24px' 
        }}
      >
        <ArrowLeft size={20} />
        Volver a Grupos
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 className="text-display-sm" style={{ color: 'var(--on-surface)', margin: 0, fontWeight: 700 }}>
              {group.groupName}
            </h1>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '999px', 
              fontSize: '12px', 
              fontWeight: 600,
              backgroundColor: 'var(--secondary-container)',
              color: 'var(--on-secondary-container)'
            }}>
              {group.groupCode}
            </span>
          </div>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)', margin: 0 }}>
            Código del Grupo
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--outline-variant)', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('summary')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            color: activeTab === 'summary' ? 'var(--primary)' : 'var(--on-surface-variant)',
            borderBottom: activeTab === 'summary' ? '3px solid var(--primary)' : '3px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={18} /> Resumen y Coordinación</div>
        </button>
        <button 
          onClick={() => setActiveTab('members')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            color: activeTab === 'members' ? 'var(--primary)' : 'var(--on-surface-variant)',
            borderBottom: activeTab === 'members' ? '3px solid var(--primary)' : '3px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Miembros ({members.length})</div>
        </button>
        <button 
          onClick={() => setActiveTab('lines')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            color: activeTab === 'lines' ? 'var(--primary)' : 'var(--on-surface-variant)',
            borderBottom: activeTab === 'lines' ? '3px solid var(--primary)' : '3px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BookOpen size={18} /> Líneas de Inv.</div>
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ 
        width: '100%',
        backgroundColor: 'var(--surface)', 
        padding: '32px', 
        borderRadius: 'var(--radius-xl)', 
        border: '1px solid var(--outline-variant)',
        boxShadow: 'var(--shadow-sm)',
        minHeight: '650px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {activeTab === 'summary' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: 1 }}>
            
            <div style={{ backgroundColor: 'var(--surface-container)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <h3 className="text-title-lg" style={{ marginBottom: '20px', fontWeight: 700, color: 'var(--on-surface)' }}>
                Coordinador del Grupo
              </h3>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', width: '100%' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-label-md" style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                    Seleccionar Nuevo Coordinador
                  </label>
                  <select 
                    value={selectedCoordinator}
                    onChange={(e) => setSelectedCoordinator(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--outline)', 
                      fontSize: '15px',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--on-surface)',
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--outline)'}
                  >
                    <option value="">Seleccione un usuario...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.firstNames} {u.lastNames} ({u.institutionalEmail})</option>
                    ))}
                  </select>
                </div>
                <Button 
                  variant="primary" 
                  onClick={handleAssignCoordinator} 
                  disabled={!selectedCoordinator || submitting || (group.currentCoordinatorId?.toString() === selectedCoordinator)}
                  style={{ padding: '14px 24px', height: 'auto' }}
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ backgroundColor: 'var(--surface-container)', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
              <h3 className="text-title-lg" style={{ marginBottom: '20px', fontWeight: 700, color: 'var(--on-surface)' }}>
                Agregar Nuevo Miembro
              </h3>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', width: '100%' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-label-md" style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                    Seleccionar Investigador
                  </label>
                  <select 
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--outline)', 
                      fontSize: '15px',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--on-surface)',
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--outline)'}
                  >
                    <option value="">Seleccione para agregar...</option>
                    {users
                      .filter(u => !members.some(m => m.user?.id === u.id || m.userId === u.id))
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.firstNames} {u.lastNames}</option>
                      ))}
                  </select>
                </div>
                <Button 
                  variant="primary" 
                  icon={<UserPlus size={18} />} 
                  onClick={handleAddMember} 
                  disabled={!selectedMember || submitting}
                  style={{ padding: '14px 24px', height: 'auto' }}
                >
                  Agregar
                </Button>
              </div>
            </div>

            <h3 className="text-title-lg" style={{ marginBottom: '20px', fontWeight: 700, color: 'var(--on-surface)' }}>
              Lista de Miembros
            </h3>

            {members.length === 0 ? (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'var(--surface-container)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--outline)',
                padding: '48px',
                color: 'var(--on-surface-variant)'
              }}>
                No hay miembros registrados en este grupo.
              </div>
            ) : (
              <div style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: 'var(--surface-container-high)' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--outline-variant)', fontWeight: 600, color: 'var(--on-surface)' }}>Nombre</th>
                      <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--outline-variant)', fontWeight: 600, color: 'var(--on-surface)' }}>Email</th>
                      <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--outline-variant)', fontWeight: 600, color: 'var(--on-surface)' }}>Estado</th>
                      <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--outline-variant)', fontWeight: 600, color: 'var(--on-surface)', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(member => (
                      <tr key={member.id} style={{ borderBottom: '1px solid var(--outline-variant)', transition: 'background-color 0.2s ease' }}>
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--on-surface)' }}>
                          {member.userFirstNames} {member.userLastNames}
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--on-surface-variant)' }}>
                          {member.userEmail}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ 
                            padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                            backgroundColor: member.active ? 'var(--primary-container)' : 'var(--error-container)',
                            color: member.active ? 'var(--on-primary-container)' : 'var(--on-error-container)'
                          }}>
                            {member.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <Button 
                            variant="danger" 
                            onClick={() => handleRemoveMember(member.userId)}
                            disabled={submitting}
                            style={{ padding: '8px 16px', fontSize: '14px', borderRadius: 'var(--radius-full)' }}
                            icon={<Trash2 size={16} />}
                          >
                            Remover
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'lines' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ backgroundColor: 'var(--surface-container)', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
              <h3 className="text-title-lg" style={{ marginBottom: '20px', fontWeight: 700, color: 'var(--on-surface)' }}>
                Añadir Línea de Investigación
              </h3>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', width: '100%' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-label-md" style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                    Seleccionar Línea
                  </label>
                  <select 
                    value={selectedLine}
                    onChange={(e) => setSelectedLine(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--outline)', 
                      fontSize: '15px',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--on-surface)',
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--outline)'}
                  >
                    <option value="">Seleccione para añadir...</option>
                    {allLines
                      .filter(l => !groupLines.some(gl => gl.id === l.id))
                      .map(l => (
                        <option key={l.id} value={l.id}>{l.lineName}</option>
                      ))}
                  </select>
                </div>
                <Button 
                  variant="primary" 
                  icon={<Plus size={18} />} 
                  onClick={handleAddLine} 
                  disabled={!selectedLine || submitting}
                  style={{ padding: '14px 24px', height: 'auto' }}
                >
                  Añadir
                </Button>
              </div>
            </div>

            <h3 className="text-title-lg" style={{ marginBottom: '20px', fontWeight: 700, color: 'var(--on-surface)' }}>
              Lista de Líneas de Investigación
            </h3>

            {groupLines.length === 0 ? (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'var(--surface-container)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--outline)',
                padding: '48px',
                color: 'var(--on-surface-variant)'
              }}>
                No hay líneas de investigación asignadas a este grupo.
              </div>
            ) : (
              <div style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: 'var(--surface-container-high)' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--outline-variant)', fontWeight: 600, color: 'var(--on-surface)' }}>Nombre de la Línea</th>
                      <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--outline-variant)', fontWeight: 600, color: 'var(--on-surface)', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupLines.map(line => (
                      <tr key={line.id} style={{ borderBottom: '1px solid var(--outline-variant)', transition: 'background-color 0.2s ease' }}>
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--on-surface)' }}>
                          {line.lineName}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <Button 
                            variant="danger" 
                            onClick={() => handleRemoveLine(line.id)}
                            disabled={submitting}
                            style={{ padding: '8px 16px', fontSize: '14px', borderRadius: 'var(--radius-full)' }}
                            icon={<Trash2 size={16} />}
                          >
                            Remover
                          </Button>
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
