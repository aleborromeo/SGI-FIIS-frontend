import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Trash2,
  UserPlus,
  Users,
  ArrowLeft,
  CheckCircle,
  Loader,
} from 'lucide-react';

import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { userService } from '../../services/userService';
import type { User } from '../../services/userService';
import { evaluacionService } from '../../services/evaluacionService';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

interface Reviewer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  EVALUADOR: 'Evaluador',
  DOCENTE_INVESTIGADOR: 'Docente Investigador',
  COORDINADOR_GRUPO: 'Coordinador de Grupo',
};

function mapUserToReviewer(u: User): Reviewer {
  return {
    id: u.id,
    firstName: u.firstNames,
    lastName: u.lastNames,
    email: u.institutionalEmail,
    role: ROLE_LABELS[u.roleCode] ?? u.roleDescription ?? u.roleCode,
  };
}

function getFullName(reviewer: Reviewer): string {
  return `${reviewer.firstName} ${reviewer.lastName}`.trim();
}

export const AssignReviewers: React.FC = () => {
  const { t } = useTranslation('projects');
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get('projectId') || '1';

  const [availableReviewers, setAvailableReviewers] = useState<Reviewer[]>([]);
  const [assignedReviewers, setAssignedReviewers] = useState<Reviewer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const toast = useToast();
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    userService
      .getReviewers(Number(projectId) || undefined)
      .then((users) => {
        setAvailableReviewers(users.map(mapUserToReviewer));
      })
      .catch(() => {
        setFetchError(t('projects:assignReviewers.errorLoadingTeachersDetail'));
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const filteredReviewers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return availableReviewers;
    return availableReviewers.filter((reviewer) => {
      const fullName = getFullName(reviewer).toLowerCase();
      return (
        fullName.includes(normalizedSearch) ||
        reviewer.email.toLowerCase().includes(normalizedSearch) ||
        reviewer.role.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [availableReviewers, search]);

  function handleAssign(reviewer: Reviewer) {
    const alreadyAssigned = assignedReviewers.some((item) => item.id === reviewer.id);
    if (alreadyAssigned) return;
    setAssignedReviewers((current) => [...current, reviewer]);
    setErrorMsg('');
    setMessage(null);
  }

  function handleRemove(userId: number) {
    setAssignedReviewers((current) => current.filter((reviewer) => reviewer.id !== userId));
    setMessage(null);
  }

  async function handleConfirm() {
    if (assignedReviewers.length === 0) {
      toast.warning(t('projects:assignReviewers.mustAssignOne'));
      return;
    }
    try {
      const reviewerIds = assignedReviewers.map((r) => r.id);
      await evaluacionService.assignReviewers(Number(projectId), reviewerIds);
      toast.success(t('projects:assignReviewers.jurorsAssignedSuccess'));
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error(err);
      toast.error(t('projects:assignReviewers.jurorsAssignError'));
    }
  }

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <Link
        to={`/projects/${projectId}`}
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
        {t('projects:assignReviewers.backToProject')}
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
          <h1 className="text-headline-lg">{t('projects:assignReviewers.pageTitle')}</h1>
          <p
            className="text-body-md"
            style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}
          >
            Proyecto: <strong>FIIS-2026-{String(projectId).padStart(3, '0')}</strong>
          </p>
        </div>
        <Badge variant="info">{t('projects:assignReviewers.selectedCount', { count: assignedReviewers.length })}</Badge>
      </div>

      {errorMsg && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title={t('projects:assignReviewers.reviewAssignment')}>{errorMsg}</Alert>
        </div>
      )}

      {message && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title={t('projects:assignReviewers.assignmentRecorded')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} />
              <span>{message}</span>
            </div>
          </Alert>
        </div>
      )}

      {fetchError && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title={t('projects:assignReviewers.errorLoadingTeachers')}>{fetchError}</Alert>
        </div>
      )}

      <div
        className="responsive-grid-split"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '32px',
        }}
      >
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-title-lg">{t('projects:assignReviewers.searchTeachers')}</h2>
            </CardHeader>

            <CardContent>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder={t('projects:assignReviewers.searchPlaceholder')}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <Button variant="secondary" icon={<Search size={18} />}>
                  {t('projects:assignReviewers.search')}
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loading ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '40px 16px',
                      color: 'var(--on-surface-variant)',
                    }}
                  >
                    <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    {t('projects:assignReviewers.loadingTeachers')}
                  </div>
                ) : filteredReviewers.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '32px 16px',
                      color: 'var(--on-surface-variant)',
                    }}
                  >
                    {fetchError
                      ? t('projects:assignReviewers.noTeachersLoaded')
                      : t('projects:assignReviewers.noTeachersFound')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {filteredReviewers.map((reviewer) => {
                      const assigned = assignedReviewers.some((item) => item.id === reviewer.id);
                      return (
                        <div
                          key={reviewer.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '16px',
                            border: '1px solid var(--outline-variant)',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: assigned
                              ? 'var(--surface-container-low)'
                              : 'var(--surface)',
                          }}
                        >
                          <div>
                            <h3
                              className="text-title-md"
                              style={{ fontWeight: 700, marginBottom: '4px' }}
                            >
                              {getFullName(reviewer)}
                            </h3>
                            <div
                              className="text-caption"
                              style={{
                                color: 'var(--on-surface-variant)',
                                marginBottom: '8px',
                              }}
                            >
                              {reviewer.email}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <Badge variant="neutral">{reviewer.role}</Badge>
                            </div>
                          </div>

                          <Button
                            variant="secondary"
                            icon={<UserPlus size={16} />}
                            style={{ padding: '6px 12px' }}
                            onClick={() => handleAssign(reviewer)}
                            disabled={assigned}
                          >
                            {assigned ? t('projects:assignReviewers.assigned') : t('projects:assignReviewers.assign')}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader style={{ backgroundColor: 'var(--surface-container-low)' }}>
              <h2
                className="text-title-lg"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Users size={20} />
                {t('projects:assignReviewers.assignedJurors')}
              </h2>
            </CardHeader>

            <CardContent>
              {assignedReviewers.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px 16px',
                    color: 'var(--on-surface-variant)',
                  }}
                >
                  {t('projects:assignReviewers.noJurorsAssigned')}
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginTop: '8px',
                  }}
                >
                  {assignedReviewers.map((reviewer) => (
                    <div
                      key={reviewer.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: 'var(--surface-container-lowest)',
                        border: '1px solid var(--outline-variant)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: 700,
                          }}
                        >
                          {getFullName(reviewer)}
                        </span>
                        <span
                          className="text-caption"
                          style={{ color: 'var(--on-surface-variant)' }}
                        >
                          {reviewer.role}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(reviewer.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--error)',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title={t('projects:assignReviewers.removeReviewer')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{
                  borderTop: '1px solid var(--outline-variant)',
                  marginTop: '20px',
                  paddingTop: '20px',
                }}
              >
                <Button
                  variant="primary"
                  style={{ width: '100%' }}
                  onClick={handleConfirm}
                  disabled={assignedReviewers.length === 0}
                >
                  {t('projects:assignReviewers.confirmAssignment')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssignReviewers;