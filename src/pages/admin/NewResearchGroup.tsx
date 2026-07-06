import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { researchService } from '../../services/researchService';

export const NewResearchGroup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    acronym: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await researchService.createGroup(formData);
      navigate('/groups');
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al registrar el grupo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
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

      <div style={{ backgroundColor: 'var(--surface)', padding: '32px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--outline-variant)' }}>
        <h1 className="text-display-sm" style={{ color: 'var(--on-surface)', marginBottom: '8px', fontWeight: 700 }}>
          Nuevo Grupo de Investigación
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)', marginBottom: '32px' }}>
          Registra un nuevo grupo de investigación en la facultad.
        </p>

        {errorMsg && (
          <div style={{ padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Código</label>
              <input 
                type="text" 
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="Ej: GI-01"
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', fontSize: '16px' }} 
              />
            </div>

            <div style={{ flex: 1 }}>
              <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Acrónimo</label>
              <input 
                type="text" 
                name="acronym"
                value={formData.acronym}
                onChange={handleChange}
                required
                placeholder="Ej: GIA"
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', fontSize: '16px' }} 
              />
            </div>
          </div>

          <div>
            <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Nombre del Grupo</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ej: Grupo de Inteligencia Artificial"
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', fontSize: '16px' }} 
            />
          </div>

          <div>
            <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Descripción</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Descripción detallada del grupo de investigación..."
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', fontSize: '16px', resize: 'vertical' }} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button 
              type="button"
              onClick={() => navigate('/groups')}
              className="sgi-btn"
              style={{ backgroundColor: 'transparent', color: 'var(--on-surface-variant)', border: '1px solid var(--outline)' }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="sgi-btn sgi-btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
            >
              <Save size={20} />
              {loading ? 'Guardando...' : 'Guardar Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
