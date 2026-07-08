import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Textarea';
import { TableContainer, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Save, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { evaluacionService } from '../../services/evaluacionService';
import { useToast } from '../../context/ToastContext';

const criteriaList = [
  { id: 'c1', name: 'Planteamiento del Problema', weight: 20 },
  { id: 'c2', name: 'Marco Teórico y Antecedentes', weight: 20 },
  { id: 'c3', name: 'Metodología Propuesta', weight: 30 },
  { id: 'c4', name: 'Cronograma y Presupuesto', weight: 15 },
  { id: 'c5', name: 'Formato y Redacción', weight: 15 },
];

export const EvaluationForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const evaluacionId = queryParams.get('evaluacionId') || '1';
  
  const [scores, setScores] = useState<Record<string, number>>({});
  const [obs, setObs] = useState<Record<string, string>>({});
  const [generalComments, setGeneralComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const calculateTotal = () => {
    let total = 0;
    criteriaList.forEach(c => {
      const score = scores[c.id] || 0;
      total += (score * c.weight) / 100;
    });
    return total.toFixed(2);
  };

  const handleScoreChange = (id: string, value: string) => {
    const num = Math.min(20, Math.max(0, Number(value) || 0));
    setScores(prev => ({ ...prev, [id]: num }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const userStr = localStorage.getItem('sgi_user');
      const user = userStr ? JSON.parse(userStr) : { id: 1 };
      await evaluacionService.submitResult(evaluacionId, {
        idEvaluador: user.id,
        resultado: Number(calculateTotal()) >= 13 ? 'APROBADO' : 'RECHAZADO',
        puntaje: Math.round(Number(calculateTotal())),
        observaciones: generalComments
      });
      toast.success('Evaluación enviada con éxito');
      navigate('/evaluations/my-evaluations');
    } catch (err) {
      console.error(err);
      toast.error('Error al enviar evaluación');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/evaluations/my-evaluations" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', textDecoration: 'none', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Volver a mis evaluaciones
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="text-headline-lg">Evaluación de Propuesta</h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>
            Evaluación ID: <strong>{evaluacionId}</strong>
          </p>
        </div>
        <Badge variant="warning">Estado: En Evaluación</Badge>
      </div>

      <Card style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2 className="text-title-lg">Rúbrica de Calificación (Escala vigesimal 0-20)</h2>
        </CardHeader>
        <CardContent>
          <TableContainer>
            <TableHead>
              <TableRow>
                <TableHeader>Criterio</TableHeader>
                <TableHeader>Peso</TableHeader>
                <TableHeader style={{ width: '120px' }}>Puntaje (0-20)</TableHeader>
                <TableHeader>Observaciones Específicas</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {criteriaList.map((crit) => (
                <TableRow key={crit.id}>
                  <TableCell style={{ fontWeight: 500 }}>{crit.name}</TableCell>
                  <TableCell>{crit.weight}%</TableCell>
                  <TableCell>
                    <input 
                      type="number" 
                      min="0" 
                      max="20" 
                      className="input" 
                      style={{ padding: '8px', textAlign: 'center' }}
                      value={scores[crit.id] || ''}
                      onChange={(e) => handleScoreChange(crit.id, e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Comentarios breves..." 
                      style={{ padding: '8px' }}
                      value={obs[crit.id] || ''}
                      onChange={(e) => setObs(prev => ({ ...prev, [crit.id]: e.target.value }))}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableContainer>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', alignItems: 'center', gap: '16px' }}>
            <span className="text-title-md">Puntaje Total Calculado:</span>
            <span className="text-headline-md" style={{ color: 'var(--primary)', fontWeight: 700 }}>{calculateTotal()}</span>
          </div>
        </CardContent>
      </Card>

      <Card style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2 className="text-title-lg">Dictamen General</h2>
        </CardHeader>
        <CardContent>
          <Textarea 
            label="Observaciones Generales y Recomendaciones" 
            placeholder="Ingrese el sustento final de su evaluación..." 
            rows={6} 
            value={generalComments}
            onChange={(e) => setGeneralComments(e.target.value)}
          />
        </CardContent>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
        <Button variant="secondary" icon={<Save size={18} />}>Guardar Avance</Button>
        <Button variant="primary" icon={<CheckCircle size={18} />} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Enviando...' : 'Firmar y Emitir Dictamen'}
        </Button>
      </div>
    </div>
  );
};
