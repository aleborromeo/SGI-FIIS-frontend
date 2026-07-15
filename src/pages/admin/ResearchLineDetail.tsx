import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Building, Plus, Trash2 } from 'lucide-react';
import { researchService, type ResearchLine, type ResearchGroup } from '../../services/researchService';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

export const ResearchLineDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [line, setLine] = useState<ResearchLine | null>(null);
  const [groups, setGroups] = useState<ResearchGroup[]>([]);
  const [allGroups, setAllGroups] = useState<ResearchGroup[]>([]);
  const [members, setMembers] = useState<any[]>([]); // Derived from groups
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'groups' | 'users'>('groups');
  
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const { confirmDialog } = useConfirm();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const lineId = Number(id);
      
      const [lineData, groupsData, allGroupsData] = await Promise.all([
        researchService.getLineById(lineId),
        researchService.getGroupsByLine(lineId),
        researchService.getGroups()
      ]);
      
      setLine(lineData);
      setGroups(groupsData);
      setAllGroups(allGroupsData);

      // Fetch members for all associated groups
      const allMembersData = await Promise.all(
        groupsData.map(g => researchService.getMembers(g.id))
      );
      
      // Flatten and deduplicate members by userId
      const flattened = allMembersData.flat();
      const uniqueMembers = Array.from(new Map(flattened.map(item => [item.userId, item])).values());
      setMembers(uniqueMembers);
      
    } catch (err: any) {
      setError(err.message || 'Error al cargar los detalles de la línea de investigación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleAssignGroup = async () => {
    if (!selectedGroup) return;
    try {
      setSubmitting(true);
      await researchService.assignGroupToLine(Number(id), Number(selectedGroup));
      toast.success('Grupo asignado con éxito');
      setSelectedGroup('');
      fetchData();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveGroup = async (groupId: number) => {
    const isConfirmed = await confirmDialog({
      title: 'Desvincular Grupo',
      message: '¿Estás seguro de desvincular este grupo de la línea de investigación?',
      confirmText: 'Desvincular',
      danger: true
    });
    if (!isConfirmed) return;
    
    try {
      await researchService.removeGroupFromLine(Number(id), groupId);
      toast.success('Grupo desvinculado con éxito');
      fetchData();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <Spinner size="large" />
      </div>
    );
  }

  if (error || !line) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)' }}>
          <strong>Error:</strong> {error || 'Línea no encontrada'}
        </div>
        <Button variant="secondary" onClick={() => navigate('/lines')} style={{ marginTop: '16px' }}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <button 
        type="button"
        onClick={() => navigate('/lines')}
        style={{ 
          background: 'none', border: 'none', cursor: 'pointer', 
          display: 'flex', alignItems: 'center', gap: '8px', 
          color: 'var(--on-surface-variant)', fontWeight: 600, marginBottom: '24px' 
        }}
      >
        <ArrowLeft size={20} />
        Volver a Líneas
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 className="text-display-sm" style={{ color: 'var(--on-surface)', margin: 0, fontWeight: 700 }}>
              {line.lineName}
            </h1>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '999px', 
              fontSize: '12px', 
              fontWeight: 600,
              backgroundColor: line.active ? 'var(--primary-container)' : 'var(--error-container)',
              color: line.active ? 'var(--on-primary-container)' : 'var(--on-error-container)'
            }}>
              {line.active ? 'ACTIVA' : 'INACTIVA'}
            </span>
          </div>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)', margin: 0 }}>
            Línea de Investigación
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--outline-variant)', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('groups')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            color: activeTab === 'groups' ? 'var(--primary)' : 'var(--on-surface-variant)',
            borderBottom: activeTab === 'groups' ? '3px solid var(--primary)' : '3px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Building size={18} /> Grupos Asociados ({groups.length})</div>
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          style={{
            background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--on-surface-variant)',
            borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : '3px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Usuarios Vinculados ({members.length})</div>
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
        
        {activeTab === 'groups' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 className="text-title-md" style={{ margin: 0 }}>Grupos que desarrollan esta línea</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <select 
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  style={{ flex: '1 1 220px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', fontSize: '14px' }}
                >
                  <option value="">Seleccione grupo para vincular...</option>
                  {allGroups
                    .filter(g => g.active && !groups.some(ag => ag.id === g.id))
                    .map(g => (
                      <option key={g.id} value={g.id}>{g.groupName} ({g.groupCode})</option>
                    ))}
                </select>
                <Button 
                  variant="primary" 
                  icon={<Plus size={16} />} 
                  onClick={handleAssignGroup} 
                  disabled={!selectedGroup || submitting}
                >
                  Vincular
                </Button>
              </div>
            </div>

            {groups.length === 0 ? (
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
                No hay grupos vinculados a esta línea de investigación.
              </div>
            ) : (
              <div style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: 'var(--surface-container)' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>Código</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>Nombre del Grupo</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>Coordinador</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map(group => (
                      <tr key={group.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                        <td style={{ padding: '16px', fontWeight: 600 }}>{group.groupCode}</td>
                        <td style={{ padding: '16px' }}>{group.groupName}</td>
                        <td style={{ padding: '16px', color: 'var(--on-surface-variant)' }}>
                          {group.coordinatorFirstNames ? `${group.coordinatorFirstNames} ${group.coordinatorLastNames}` : 'Sin asignar'}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <Button 
                            variant="danger" 
                            onClick={() => handleRemoveGroup(group.id)}
                            disabled={submitting}
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                            icon={<Trash2 size={14} />}
                          >
                            Desvincular
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

        {activeTab === 'users' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h3 className="text-title-md" style={{ marginBottom: '24px' }}>Investigadores Vinculados</h3>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '24px' }}>
              Esta lista muestra a todos los miembros de los grupos de investigación asociados a esta línea.
            </p>

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
                No hay usuarios vinculados (los grupos asociados no tienen miembros o no hay grupos).
              </div>
            ) : (
              <div style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: 'var(--surface-container)' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>Nombre</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>Email</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>Rol</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>Fecha Ingreso</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(member => (
                      <tr key={member.userId} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                        <td style={{ padding: '16px', fontWeight: 600 }}>
                          {member.userFirstNames} {member.userLastNames}
                        </td>
                        <td style={{ padding: '16px', color: 'var(--on-surface-variant)' }}>
                          {member.userEmail}
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, backgroundColor: 'var(--secondary-container)', color: 'var(--on-secondary-container)' }}>
                            {member.userRoleCode?.replace(/_/g, ' ') || 'Sin rol'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                          {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                            backgroundColor: member.active ? 'var(--primary-container)' : 'var(--error-container)',
                            color: member.active ? 'var(--on-primary-container)' : 'var(--on-error-container)'
                          }}>
                            {member.active ? 'Activo' : 'Inactivo'}
                          </span>
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
