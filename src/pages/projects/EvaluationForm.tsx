import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  ClipboardCheck,
  Save,
} from 'lucide-react';

import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Textarea';
import { TableContainer, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { evaluacionService } from '../../services/evaluacionService';
import { useToast } from '../../context/ToastContext';
import { Alert } from '../../components/ui/Alert';

interface EvaluationCriterion {
  id: string;
  name: string;
  weight: number;
}

const criteriaList: EvaluationCriterion[] = [
  { id: 'problem', name: 'Planteamiento del problema', weight: 20 },
  { id: 'framework', name: 'Marco teórico y antecedentes', weight: 20 },
  { id: 'methodology', name: 'Metodología propuesta', weight: 30 },
  { id: 'schedule', name: 'Cronograma y presupuesto', weight: 15 },
  { id: 'writing', name: 'Formato y redacción', weight: 15 },
];

function getVerdict(total: number): string {
  if (total >= 13) return 'APROBADO';
  if (total >= 10) return 'CON_OBSERVACIONES';
  return 'RECHAZADO';
}

function getVerdictLabel(verdict: string): string {
  const labels: Record<string, string> = {
    APROBADO: 'Aprobado',
    CON_OBSERVACIONES: 'Con observaciones',
    RECHAZADO: 'Rechazado',
  };

  return labels[verdict] ?? verdict;
}

function getVerdictVariant(verdict: string): 'success' | 'warning' | 'error' {
  if (verdict === 'APROBADO') return 'success';
  if (verdict === 'CON_OBSERVACIONES') return 'warning';
  return 'error';
}

export const EvaluationForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const evaluacionId = queryParams.get('evaluationId') || queryParams.get('evaluacionId') || '1';

  const [scores, setScores] = useState<Record<string, number>>({});
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [generalComments, setGeneralComments] = useState('');
  const [, setSubmitting] = useState(false);
  const toast = useToast();
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const totalScore = useMemo(() => {
    const total = criteriaList.reduce((sum, criterion) => {
      const score = scores[criterion.id] ?? 0;
      return sum + (score * criterion.weight) / 100;
    }, 0);

    return Number(total.toFixed(2));
  }, [scores]);
  const completedCriteria = useMemo(() => {
    return criteriaList.filter((criterion) => scores[criterion.id] !== undefined).length;
  }, [scores]);

  const verdict = getVerdict(totalScore);

  function handleScoreChange(id: string, value: string) {
    if (value === '') {
      setScores((previous) => {
        const next = { ...previous };
        delete next[id];
        return next;
      });
      return;
    }

    const numericValue = Math.min(20, Math.max(0, Number(value) || 0));

    setScores((previous) => ({
      ...previous,
      [id]: numericValue,
    }));

    if (errorMsg) setErrorMsg('');
    if (message) setMessage(null);
  }

  function validateForm(): boolean {
    if (completedCriteria < criteriaList.length) {
      setErrorMsg('Complete el puntaje de todos los criterios antes de emitir el dictamen.');
      return false;
    }

    if (generalComments.trim().length < 10) {
      setErrorMsg('Ingrese observaciones generales con al menos 10 caracteres.');
      return false;
    }

    setErrorMsg('');
    return true;
  }

  function handleSaveProgress() {
    setMessage('Avance guardado en la vista. La integración real con backend queda pendiente.');
    setErrorMsg('');
  }

  async function handleSubmit() {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const userStr = localStorage.getItem('sgi_user');
      const user = userStr ? JSON.parse(userStr) : { id: 1 };
      await evaluacionService.submitResult(evaluacionId, {
        idEvaluador: user.id,
        resultado: Number(totalScore) >= 13 ? 'APROBADO' : 'RECHAZADO',
        puntaje: Math.round(Number(totalScore)),
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
  }

  return (
    <div
      style={{
        paddingTop: '32px',
        paddingBottom: '64px',
        maxWidth: '1080px',
        margin: '0 auto',
      }}
    >
      <Link
        to="/evaluations/my-evaluations"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--on-surface-variant)',
          textDecoration: 'none',
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={16} />
        Volver a mis evaluaciones
      </Link>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '24px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 className="text-headline-lg">Evaluación de propuesta</h1>

          <p
            className="text-body-md"
            style={{
              color: 'var(--on-surface-variant)',
              marginTop: '8px',
            }}
          >
            Evaluación ID: <strong>{evaluacionId}</strong>
          </p>
        </div>

        <Badge variant={getVerdictVariant(verdict)}>
          {getVerdictLabel(verdict)}
        </Badge>
      </div>

      {errorMsg && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title="Revisa la evaluación">
            {errorMsg}
          </Alert>
        </div>
      )}

      {message && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title="Acción registrada en la vista">
            {message}
          </Alert>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <Card>
          <CardContent>
            <strong style={{ display: 'block', fontSize: '28px' }}>
              {totalScore}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>
              Puntaje ponderado
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <strong style={{ display: 'block', fontSize: '28px' }}>
              {completedCriteria}/{criteriaList.length}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>
              Criterios completados
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <strong style={{ display: 'block', fontSize: '28px' }}>
              {getVerdictLabel(verdict)}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>
              Dictamen referencial
            </span>
          </CardContent>
        </Card>
      </div>

      <Card style={{ marginBottom: '28px' }}>
        <CardHeader>
          <h2
            className="text-title-lg"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ClipboardCheck size={20} />
            Rúbrica de calificación
          </h2>
        </CardHeader>

        <CardContent>
          <TableContainer>
            <TableHead>
              <TableRow>
                <TableHeader>Criterio</TableHeader>
                <TableHeader>Peso</TableHeader>
                <TableHeader style={{ width: '140px' }}>Puntaje</TableHeader>
                <TableHeader>Observaciones específicas</TableHeader>
              </TableRow>
            </TableHead>

            <TableBody>
              {criteriaList.map((criterion) => (
                <TableRow key={criterion.id}>
                  <TableCell style={{ fontWeight: 600 }}>
                    {criterion.name}
                  </TableCell>

                  <TableCell>{criterion.weight}%</TableCell>

                  <TableCell>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      className="input"
                      placeholder="0 - 20"
                      style={{ padding: '8px', textAlign: 'center' }}
                      value={scores[criterion.id] ?? ''}
                      onChange={(event) =>
                        handleScoreChange(criterion.id, event.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <input
                      type="text"
                      className="input"
                      placeholder="Comentario breve del criterio..."
                      style={{ padding: '8px' }}
                      value={observations[criterion.id] ?? ''}
                      onChange={(event) =>
                        setObservations((previous) => ({
                          ...previous,
                          [criterion.id]: event.target.value,
                        }))
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableContainer>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '24px',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <span className="text-title-md">Puntaje total calculado:</span>

            <span
              className="text-headline-md"
              style={{ color: 'var(--primary)', fontWeight: 800 }}
            >
              {totalScore}/20
            </span>
          </div>
        </CardContent>
      </Card>

      <Card style={{ marginBottom: '28px' }}>
        <CardHeader>
          <h2 className="text-title-lg">Dictamen general</h2>
        </CardHeader>

        <CardContent>
          <Textarea
            label="Observaciones generales y recomendaciones"
            placeholder="Ingrese el sustento final de la evaluación..."
            rows={6}
            value={generalComments}
            onChange={(event) => {
              setGeneralComments(event.target.value);
              if (errorMsg) setErrorMsg('');
              if (message) setMessage(null);
            }}
          />
        </CardContent>
      </Card>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '16px',
        }}
      >
        <Button
          variant="secondary"
          icon={<Save size={18} />}
          onClick={handleSaveProgress}
        >
          Guardar avance
        </Button>

        <Button
          variant="primary"
          icon={<CheckCircle size={18} />}
          onClick={handleSubmit}
        >
          Preparar dictamen
        </Button>
      </div>
    </div>
  );
};

export default EvaluationForm;