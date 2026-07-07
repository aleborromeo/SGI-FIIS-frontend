import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { researchService } from '../../services/researchService';

export const NewResearchLine: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    active: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await researchService.createLine(formData);
      navigate('/lines');
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al registrar la línea.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
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

      <div style={{ backgroundColor: 'var(--surface)', padding: '32px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--outline-variant)' }}>
        <h1 className="text-display-sm" style={{ color: 'var(--on-surface)', marginBottom: '8px', fontWeight: 700 }}>
          Nueva Línea de Investigación
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)', marginBottom: '32px' }}>
          Completa los datos para registrar una nueva línea.
        </p>

        {errorMsg && (
          <div style={{ padding: '16px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Código</label>
            <input 
              type="text" 
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              placeholder="Ej: LI-01"
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', fontSize: '16px' }} 
            />
          </div>

          <div>
            <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Nombre de la Línea</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ej: Inteligencia Artificial"
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
              placeholder="Descripción detallada..."
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', fontSize: '16px', resize: 'vertical' }} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              name="active"
              id="active"
              checked={formData.active}
              onChange={handleChange}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="active" className="text-label-md" style={{ fontWeight: 600 }}>Línea Activa</label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button 
              type="button"
              variant="secondary"
              icon={<X size={18} />}
              onClick={() => navigate('/lines')}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              icon={<Save size={18} />}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Línea'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
