import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Spinner } from '../../components/common/Spinner';
import type { AlertItem } from '../../types/auth';
import '../dashboards/RoleDashboards.css';

function translateAlertType(type: string): string {
  const dict: Record<string, string> = {
    REVIEW: 'Revisión',
    WARNING: 'Advertencia',
    ERROR: 'Error',
    INFO: 'Información',
    SUCCESS: 'Éxito',
  };
  return dict[type.toUpperCase()] ?? type;
}

function translateAlertTitle(title: string): string {
  const n = title.toLowerCase();
  if (n.includes('pending procedures')) return 'Trámites pendientes';
  if (n.includes('pending')) return 'Pendiente de atención';
  if (n.includes('review')) return 'Revisión pendiente';
  if (n.includes('active call')) return 'Convocatorias activas';
  return title;
}

function translateAlertDescription(desc: string): string {
  const n = desc.toLowerCase();
  if (n.includes('open call')) {
    const m = desc.match(/\d+/);
    return `Hay ${m ? m[0] : '0'} convocatoria(s) abierta(s).`;
  }
  return desc
    .replace(/procedure\(s\)/gi, 'trámites')
    .replace(/procedures/gi, 'trámites')
    .replace(/procedure/gi, 'trámite')
    .replace(/unresolved/gi, 'sin resolver')
    .replace(/pending/gi, 'pendiente')
    .replace(/^1 trámites/i, '1 trámite');
}

function AlertsList({ alerts }: { alerts?: AlertItem[] }) {
  const { t } = useTranslation('dashboard');

  if (!alerts || alerts.length === 0) {
    return (
      <div className="empty-alerts">
        <span className="empty-icon"><CheckCircle size={32} color="#15803d" /></span>
        <p>{t('dashboard:alerts.noAlerts', 'No hay notificaciones pendientes')}</p>
      </div>
    );
  }

  return (
    <div className="alerts-list" style={{ maxHeight: 'none' }}>
      {alerts.map((alert, index) => (
        <div key={`${alert.type}-${index}`} className={`alert-card-item alert-type-${alert.type.toLowerCase()}`}>
          <div className="alert-item-header">
            <span className="alert-badge">{translateAlertType(alert.type)}</span>
            <h4 className="alert-item-title">{translateAlertTitle(alert.title)}</h4>
          </div>
          <p className="alert-item-desc">{translateAlertDescription(alert.description)}</p>
        </div>
      ))}
    </div>
  );
}

export const NotificationsPage = () => {
  const { currentRole } = useContext(AuthContext);
  const { t } = useTranslation('dashboard');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data: any = await authService.getDashboardData();
        if (!mounted) return;

        let items: AlertItem[] = [...(data.alerts || [])];

        if (currentRole === 'ESTUDIANTE') {
          const planStatus = (data.currentPlanStatus || '').toUpperCase();
          if (planStatus === 'APROBADO') {
            items.unshift({
              type: 'SUCCESS',
              title: 'Plan de tesis aprobado',
              description: 'Tu plan de tesis fue aprobado. Revisa el estado en la bandeja de trámites.',
            });
          } else if (planStatus === 'RECHAZADO') {
            items.unshift({
              type: 'ERROR',
              title: 'Plan de tesis rechazado',
              description: 'Tu plan de tesis fue rechazado. Revisa las observaciones y vuelve a presentarlo.',
            });
          } else if (planStatus === 'OBSERVADO') {
            items.unshift({
              type: 'WARNING',
              title: 'Plan de tesis observado',
              description: 'Tu plan de tesis tiene observaciones pendientes. Ingresa a subsanación para corregirlas.',
            });
          }
        }

        setAlerts(items);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Error al cargar notificaciones');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [currentRole]);

  return (
    <div className="animate-fade-in" style={{ padding: '28px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <span style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={22} color="white" />
          </span>
          {t('dashboard:student.sections.notifications', 'Notificaciones')}
        </h1>
      </div>

      {error && (
        <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#991b1b', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Spinner size="large" color="#0b5ed7" />
        </div>
      ) : (
        <AlertsList alerts={alerts} />
      )}
    </div>
  );
};

export default NotificationsPage;
