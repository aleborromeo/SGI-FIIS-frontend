import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { researchService, type ResearchGroup } from '../../services/researchService';
import { Spinner } from '../../components/common/Spinner';

export const ResearchGroups: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<ResearchGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await researchService.getGroups();
      setGroups(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los grupos de investigación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="text-display-sm" style={{ color: 'var(--on-surface)', marginBottom: '8px', fontWeight: 700 }}>
            Grupos de Investigación
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
            Administra los grupos de investigación de la facultad.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button 
            variant="primary"
            onClick={() => navigate('/groups/new')}
            icon={<Plus size={18} />}
          >
            Nuevo Grupo
          </Button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {groups.length === 0 && !error ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--on-surface-variant)', backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius-lg)' }}>
            No hay grupos de investigación registrados.
          </div>
        ) : (
          groups.map(group => (
            <div 
              key={group.id} 
              style={{ 
                backgroundColor: 'var(--surface)', 
                borderRadius: 'var(--radius-lg)', 
                padding: '24px', 
                border: '1px solid var(--outline-variant)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '40px', height: '40px', 
                  borderRadius: '10px', 
                  backgroundColor: 'var(--primary-container)', 
                  color: 'var(--on-primary-container)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Users size={20} />
                </div>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  fontWeight: 600,
                  backgroundColor: 'var(--secondary-container)',
                  color: 'var(--on-secondary-container)'
                }}>
                  {group.groupCode}
                </span>
              </div>
              
              <div>
                <div className="text-label-sm" style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>
                  {group.groupCode}
                </div>
                <h3 className="text-title-md" style={{ color: 'var(--on-surface)', fontWeight: 700, marginBottom: '8px' }}>
                  {group.groupName}
                </h3>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--outline-variant)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)' }}>
                  <Shield size={16} />
                  <span className="text-body-sm">
                    {group.currentCoordinatorId ? 
                      `${group.coordinatorFirstNames || ''} ${group.coordinatorLastNames || ''}` : 
                      'Sin coordinador asignado'}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--outline-variant)' }}>
                <Button 
                  onClick={() => navigate(`/groups/${group.id}`)}
                  variant="secondary"
                  style={{ width: '100%' }}
                >
                  Administrar Grupo
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
