import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { researchService, type ResearchLine } from '../../services/researchService';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

export const ResearchLines: React.FC = () => {
  const navigate = useNavigate();
  const [lines, setLines] = useState<ResearchLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchLines = async () => {
    try {
      setLoading(true);
      const data = await researchService.getLines(false);
      setLines(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las líneas de investigación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLines();
  }, []);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await researchService.changeLineStatus(id, !currentStatus);
      fetchLines(); // Reload
      toast.success(currentStatus ? 'Línea desactivada con éxito' : 'Línea activada con éxito');
    } catch (err: any) {
      toast.error(`Error al cambiar estado: ${err.message}`);
    }
  };

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
            Líneas de Investigación
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
            Administra las líneas de investigación disponibles en la facultad.
          </p>
        </div>
        <Button 
          variant="primary"
          onClick={() => navigate('/lines/new')}
          icon={<Plus size={18} />}
        >
          Nueva Línea
        </Button>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {lines.length === 0 && !error ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--on-surface-variant)', backgroundColor: 'var(--surface-container)', borderRadius: 'var(--radius-lg)' }}>
            No hay líneas de investigación registradas.
          </div>
        ) : (
          lines.map(line => (
            <div 
              key={line.id} 
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
                  <BookOpen size={20} />
                </div>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  fontWeight: 600,
                  backgroundColor: line.active ? 'var(--primary-container)' : 'var(--error-container)',
                  color: line.active ? 'var(--on-primary-container)' : 'var(--on-error-container)'
                }}>
                  {line.active ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
              
              <div>
                <h3 className="text-title-md" style={{ color: 'var(--on-surface)', fontWeight: 700, marginBottom: '8px' }}>
                  {line.lineName}
                </h3>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--outline-variant)', display: 'flex', gap: '8px' }}>
                <Button 
                  onClick={() => handleToggleStatus(line.id, line.active)}
                  variant={line.active ? "danger" : "primary"}
                  style={{ flex: 1 }}
                >
                  {line.active ? (
                    <><XCircle size={18} style={{ marginRight: '8px' }} /> Desactivar</>
                  ) : (
                    <><CheckCircle size={18} style={{ marginRight: '8px' }} /> Activar</>
                  )}
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => navigate(`/lines/${line.id}`)}
                  style={{ flex: 1 }}
                >
                  Ver Detalles
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
