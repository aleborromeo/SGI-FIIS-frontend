import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, UserPlus, Users, ArrowLeft, Trash2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { userService, type User } from '../../services/userService';
import { evaluacionService } from '../../services/evaluacionService';
import { useToast } from '../../context/ToastContext';

export const AssignReviewers: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get project ID from query params or state. For now, defaulting to '1' if none provided for testing.
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get('projectId') || '1';

  const [availableReviewers, setAvailableReviewers] = useState<User[]>([]);
  const [assignedReviewers, setAssignedReviewers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  useEffect(() => {
    userService.getAll()
      .then(users => {
        // Assume reviewers are those with a 'REVIEWER' or 'JURADO' role, or just use all for testing
        setAvailableReviewers(users);
      })
      .catch(err => console.error('Error fetching users:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleAssign = (user: User) => {
    if (!assignedReviewers.find(r => r.id === user.id)) {
      setAssignedReviewers([...assignedReviewers, user]);
    }
  };

  const handleRemove = (userId: number) => {
    setAssignedReviewers(assignedReviewers.filter(r => r.id !== userId));
  };

  const handleConfirm = async () => {
    if (assignedReviewers.length === 0) {
      toast.warning('Debe asignar al menos un jurado.');
      return;
    }
    
    try {
      const reviewerIds = assignedReviewers.map(r => r.id);
      await evaluacionService.assignReviewers(Number(projectId), reviewerIds);
      toast.success('Jurados asignados exitosamente');
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error(err);
      toast.error('Error al asignar jurados');
    }
  };

  const filteredReviewers = availableReviewers.filter(u => 
    `${u.firstNames} ${u.lastNames}`.toLowerCase().includes(search.toLowerCase()) ||
    u.institutionalEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px', maxWidth: '900px', margin: '0 auto' }}>
      <Link to={`/projects/${projectId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', textDecoration: 'none', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Volver al Proyecto
      </Link>

      <div style={{ marginBottom: '32px' }}>
        <h1 className="text-headline-lg">Asignación de Jurados / Revisores</h1>
        <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
          Proyecto: <strong>FIIS-2026-001</strong>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        {/* Left Column - Search and Add */}
        <div>
          <Card style={{ marginBottom: '24px' }}>
            <CardHeader>
              <h2 className="text-title-lg">Buscar Docentes</h2>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <Input 
                    placeholder="Buscar por nombre..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button variant="secondary" icon={<Search size={18} />}>Buscar</Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loading ? (
                  <p>Cargando docentes...</p>
                ) : filteredReviewers.map((rev) => (
                  <div key={rev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <h3 className="text-title-md" style={{ fontWeight: 600 }}>{rev.firstNames} {rev.lastNames}</h3>
                      <div className="text-caption" style={{ color: 'var(--on-surface-variant)' }}>{rev.institutionalEmail}</div>
                    </div>
                    <Button 
                      variant="secondary" 
                      icon={<UserPlus size={16} />} 
                      style={{ padding: '6px 12px' }}
                      onClick={() => handleAssign(rev)}
                      disabled={assignedReviewers.some(r => r.id === rev.id)}
                    >
                      Asignar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Assigned Reviewers */}
        <div>
          <Card>
            <CardHeader style={{ backgroundColor: 'var(--surface-container-low)' }}>
              <h2 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} /> Jurados Asignados
              </h2>
            </CardHeader>
            <CardContent>
              {assignedReviewers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--on-surface-variant)' }}>
                  No hay jurados asignados aún.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                  {assignedReviewers.map(rev => (
                    <div key={rev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)' }}>
                       <span style={{ fontSize: '14px', fontWeight: 500 }}>{rev.firstNames} {rev.lastNames}</span>
                       <button onClick={() => handleRemove(rev.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}>
                         <Trash2 size={16} />
                       </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div style={{ borderTop: '1px solid var(--outline-variant)', marginTop: '16px', paddingTop: '16px' }}>
                <Button variant="primary" style={{ width: '100%' }} onClick={handleConfirm} disabled={assignedReviewers.length === 0}>
                  Confirmar Asignación
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
