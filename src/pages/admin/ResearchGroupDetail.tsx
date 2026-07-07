import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Shield, BookOpen, UserPlus, Trash2 } from 'lucide-react';
import { researchService, type ResearchGroup, type ResearchLine } from '../../services/researchService';
import { userService, type User } from '../../services/userService';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/common/Spinner';

export const ResearchGroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState<ResearchGroup | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [lines, setLines] = useState<ResearchLine[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for tabs
  const [activeTab, setActiveTab] = useState<'summary' | 'members' | 'lines'>('summary');
  
  // States for forms
  const [selectedCoordinator, setSelectedCoordinator] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const groupId = Number(id);
      
      const [groupData, membersData, linesData, allUsers] = await Promise.all([
        researchService.getGroupById(groupId),
        researchService.getMembers(groupId),
        researchService.getGroupLines(groupId),
        userService.getAll()
      ]);
      
      setGroup(groupData);
      setMembers(membersData);
      setLines(linesData);
      setUsers(allUsers);
      
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
      alert('Coordinador asignado con éxito');
      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedMember) return;
    try {
      setSubmitting(true);
      await researchService.addMember(Number(id), Number(selectedMember));
      alert('Miembro agregado con éxito');
      setSelectedMember('');
      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm('¿Estás seguro de remover a este miembro del grupo?')) return;
    try {
      await researchService.removeMember(Number(id), userId);
      alert('Miembro removido con éxito');
      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
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
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
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
            borderBottom: activeTab === 'summary' ? '3px solid var(--primary)' : '3px solid transparent'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={18} /> Resumen y Coordinación</div>
        </button>
        <button 
          onClick={() => setActiveTab('members')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            color: activeTab === 'members' ? 'var(--primary)' : 'var(--on-surface-variant)',
            borderBottom: activeTab === 'members' ? '3px solid var(--primary)' : '3px solid transparent'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Miembros ({members.length})</div>
        </button>
        <button 
          onClick={() => setActiveTab('lines')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            color: activeTab === 'lines' ? 'var(--primary)' : 'var(--on-surface-variant)',
            borderBottom: activeTab === 'lines' ? '3px solid var(--primary)' : '3px solid transparent'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BookOpen size={18} /> Líneas de Inv. ({lines.length})</div>
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)' }}>
        
        {activeTab === 'summary' && (
          <div>
            <h3 className="text-title-md" style={{ marginBottom: '16px' }}>Descripción del Grupo</h3>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '32px' }}>
              Este grupo de investigación está enfocado en generar aportes significativos a la comunidad científica a través de proyectos especializados.
            </p>

            <h3 className="text-title-md" style={{ marginBottom: '16px', borderTop: '1px solid var(--outline-variant)', paddingTop: '24px' }}>
              Coordinador del Grupo
            </h3>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', maxWidth: '600px' }}>
              <div style={{ flex: 1 }}>
                <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Seleccionar Coordinador</label>
                <select 
                  value={selectedCoordinator}
                  onChange={(e) => setSelectedCoordinator(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', fontSize: '15px' }}
                >
                  <option value="">Seleccione un usuario...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                  ))}
                </select>
              </div>
              <Button 
                variant="primary" 
                onClick={handleAssignCoordinator} 
                disabled={!selectedCoordinator || submitting || (group.currentCoordinatorId?.toString() === selectedCoordinator)}
              >
                Asignar
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 className="text-title-md" style={{ margin: 0 }}>Investigadores Miembros</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select 
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  style={{ width: '250px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', fontSize: '14px' }}
                >
                  <option value="">Seleccione para agregar...</option>
                  {users
                    .filter(u => !members.some(m => m.user.id === u.id))
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
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

            {members.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>
                No hay miembros registrados en este grupo.
              </div>
            ) : (
              <div style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: 'var(--surface-container)' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>Nombre</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>Email</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>Rol en Grupo</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(m => (
                      <tr key={m.id}>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>
                          {m.user.firstNames || m.user.firstName} {m.user.lastNames || m.user.lastName}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>
                          {m.user.institutionalEmail || m.user.email}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                            backgroundColor: m.roleInGroup === 'COORDINATOR' ? 'var(--primary-container)' : 'var(--secondary-container)',
                            color: m.roleInGroup === 'COORDINATOR' ? 'var(--on-primary-container)' : 'var(--on-secondary-container)'
                          }}>
                            {m.roleInGroup}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)', textAlign: 'right' }}>
                          <Button 
                            variant="danger" 
                            onClick={() => handleRemoveMember(m.user.id)}
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                            icon={<Trash2 size={14} />}
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
          <div>
            <h3 className="text-title-md" style={{ marginBottom: '24px' }}>Líneas de Investigación Asociadas</h3>
            {lines.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>
                No hay líneas vinculadas a este grupo todavía.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {lines.map(line => (
                  <div key={line.id} style={{ padding: '16px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="text-label-sm" style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>{line.code}</div>
                      <div className="text-title-sm" style={{ fontWeight: 600 }}>{line.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
