import React, { useEffect, useState, useRef } from 'react';
import { AlertCircle, CheckCircle, FileUp, MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { observationService, type Observation } from '../../services/observationService';
import { useToast } from '../../context/ToastContext';

export const ObservationsPanel: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const procedureId = queryParams.get('procedureId') || '1'; // Default for testing
  
  const [justification, setJustification] = useState('');
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    observationService.getByProcedureId(procedureId)
      .then(data => {
        setObservations(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error fetching observations', err);
        setObservations([]);
      })
      .finally(() => setLoading(false));
  }, [procedureId]);

  const handleRemedySubmit = async () => {
    if (!justification.trim()) {
      toast.warning('Debe ingresar una justification.');
      return;
    }
    
    // For now we apply the same remedy to all pending observations in this procedure
    const pendingObs = observations.filter(o => o.status !== 'SUBSANADO');
    if (pendingObs.length === 0) {
      toast.info('No hay observaciones pendientes por subsanar.');
      return;
    }

    setSubmitting(true);
    try {
      for (const obs of pendingObs) {
        const userStr = localStorage.getItem('sgi_user');
        const user = userStr ? JSON.parse(userStr) : { id: 1 };
        await observationService.addRemedy(obs.id, {
          applicantId: user.id,
          description: justification
        });
      }
      toast.success('Subsanación registrada correctamente. El estado de la propuesta ha sido actualizado.');
      setJustification('');
      // Reload observations
      const updated = await observationService.getByProcedureId(procedureId);
      setObservations(Array.isArray(updated) ? updated : []);
    } catch (err) {
      console.error('Error al subsanar', err);
      toast.error('Error al registrar la subsanación.');
    } finally {
      setSubmitting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isPending = observations.some(o => o.status !== 'SUBSANADO');

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '4px' }}>
            Observaciones del Jurado
          </h1>
          <p style={{ fontSize: '15px', color: '#6b7280' }}>
            Expediente: <strong style={{ color: '#4b5563' }}>{procedureId}</strong>
          </p>
        </div>
        {isPending ? (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            color: '#b91c1c', 
            padding: '8px 16px', 
            borderRadius: '9999px', 
            fontSize: '13px', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            letterSpacing: '0.05em'
          }}>
            <AlertCircle size={16} strokeWidth={2.5} />
            REQUIERE SUBSANACIÓN
          </div>
        ) : (
          <div style={{ 
            backgroundColor: '#dcfce7', 
            color: '#15803d', 
            padding: '8px 16px', 
            borderRadius: '9999px', 
            fontSize: '13px', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            letterSpacing: '0.05em'
          }}>
            <CheckCircle size={16} strokeWidth={2.5} />
            TODO CONFORME
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Panel Izquierdo: Observaciones */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <MessageSquare size={20} color="#1f2937" />
            Detalle de Observaciones
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              <p>Cargando observaciones...</p>
            ) : observations.length === 0 ? (
              <p>No hay observaciones registradas para este expediente.</p>
            ) : (
              observations.map(obs => (
                <div key={obs.id} style={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px', 
                  padding: '20px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ color: '#1e3a8a', fontWeight: 700, fontSize: '15px' }}>{obs.type || 'General'}</span>
                    <span style={{ 
                      backgroundColor: obs.status === 'SUBSANADO' ? '#dcfce7' : '#fef3c7', 
                      color: obs.status === 'SUBSANADO' ? '#15803d' : '#b45309', 
                      padding: '4px 10px', 
                      borderRadius: '9999px', 
                      fontSize: '11px', 
                      fontWeight: 700,
                      letterSpacing: '0.05em'
                    }}>
                      {obs.status || 'PENDIENTE'}
                    </span>
                  </div>
                  <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.5, margin: 0 }}>{obs.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel Derecho: Subsanación */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0', marginBottom: '16px' }}>
            Enviar Subsanación
          </h3>
          <div style={{ 
            backgroundColor: '#ffffff', 
            border: '1px solid #e5e7eb', 
            borderRadius: '12px', 
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
            opacity: isPending ? 1 : 0.6,
            pointerEvents: isPending ? 'auto' : 'none'
          }}>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
              Sube el documento corregido y proporciona una breve justificación o respuesta a las observaciones.
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                Documento Corregido (PDF)
              </label>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept=".pdf,.doc,.docx"
              />
              <div style={{ 
                border: '2px dashed #d1d5db', 
                borderRadius: '8px', 
                padding: '32px', 
                textAlign: 'center', 
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, background-color 0.2s ease'
              }}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}>
                <FileUp size={24} color="#6b7280" style={{ margin: '0 auto 12px auto' }} />
                <p style={{ color: '#374151', fontWeight: 500, fontSize: '14px', margin: '0 0 4px 0' }}>Haz clic para subir archivo</p>
                <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>Máx 10MB</p>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                Justificación o Respuesta
              </label>
              <textarea 
                rows={4} 
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Detalla cómo has resuelto las observaciones..."
                style={{ 
                  width: '100%', 
                  resize: 'vertical', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  color: '#374151'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1e3a8a'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                backgroundColor: '#0f172a', 
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onClick={handleRemedySubmit}
              disabled={submitting}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}>
                <CheckCircle size={16} />
                {submitting ? 'Registrando...' : 'Registrar Subsanación'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
