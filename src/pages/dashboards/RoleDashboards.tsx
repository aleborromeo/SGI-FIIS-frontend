import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Spinner } from '../../components/common/Spinner';
import './RoleDashboards.css';
import type { 
  AlertItem,
  DashboardAdminResponse,
  DashboardStudentResponse,
  DashboardCoordinatorResponse,
  DashboardTeacherResponse,
  DashboardDirectorResponse,
  DashboardDeanResponse,
  DashboardEvaluatorResponse
} from '../../types/auth';

export const RoleDashboards: React.FC = () => {
  const { currentRole } = useContext(AuthContext);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.getDashboardData<any>();
        setData(response);
      } catch (err: any) {
        console.error('Error fetching dashboard:', err);
        setError(err.message || 'No se pudo cargar la información del panel de control.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentRole]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spinner size="large" color="#0b5ed7" />
        <p className="loading-text">Cargando datos del panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error-card">
        <span className="error-icon">❌</span>
        <h3 className="error-title">Error al Cargar Dashboard</h3>
        <p className="error-desc">{error}</p>
        <button onClick={() => window.location.reload()} className="error-retry-btn">
          Reintentar
        </button>
      </div>
    );
  }

  // Renderizador de Alertas Común (Nielsen - Visibilidad de estado / Gestalt - Proximidad)
  const renderAlerts = (alerts: AlertItem[] | undefined) => {
    if (!alerts || alerts.length === 0) {
      return (
        <div className="empty-alerts">
          <span className="empty-icon">✅</span>
          <p>No tiene notificaciones ni alertas pendientes en este momento.</p>
        </div>
      );
    }

    return (
      <div className="alerts-list">
        {alerts.map((alert, idx) => (
          <div key={idx} className={`alert-card-item alert-type-${alert.type.toLowerCase()}`}>
            <div className="alert-item-header">
              <span className="alert-badge">{alert.type}</span>
              <h4 className="alert-item-title">{alert.title}</h4>
            </div>
            <p className="alert-item-desc">{alert.description}</p>
          </div>
        ))}
      </div>
    );
  };

  // 1. Dashboard ADMINISTRADOR
  const renderAdmin = (adminData: DashboardAdminResponse) => {
    return (
      <div className="dashboard-view admin-view">
        <div className="view-header">
          <h2 className="view-title">Consola de Administración General</h2>
          <p className="view-subtitle">Supervisión institucional global de usuarios, grupos y trámites.</p>
        </div>

        <div className="metrics-grid">
          <div className="metric-card bg-blue">
            <span className="metric-icon">👥</span>
            <div className="metric-info">
              <span className="metric-value">{adminData.totalUsers}</span>
              <span className="metric-label">Usuarios Registrados</span>
              <span className="metric-sublabel">{adminData.totalActiveUsers} activos en el sistema</span>
            </div>
          </div>

          <div className="metric-card bg-green">
            <span className="metric-icon">🏫</span>
            <div className="metric-info">
              <span className="metric-value">{adminData.totalGroups}</span>
              <span className="metric-label">Grupos de Investigación</span>
              <span className="metric-sublabel">{adminData.totalActiveGroups} grupos activos</span>
            </div>
          </div>

          <div className="metric-card bg-purple">
            <span className="metric-icon">📄</span>
            <div className="metric-info">
              <span className="metric-value">{adminData.totalProjects}</span>
              <span className="metric-label">Proyectos Registrados</span>
              <span className="metric-sublabel">{adminData.activeProjects} en ejecución activa</span>
            </div>
          </div>

          <div className="metric-card bg-orange">
            <span className="metric-icon">⚖️</span>
            <div className="metric-info">
              <span className="metric-value">{adminData.issuedResolutions}</span>
              <span className="metric-label">Resoluciones Emitidas</span>
              <span className="metric-sublabel">Historial de actos administrativos</span>
            </div>
          </div>
        </div>

        <div className="dashboard-details-split">
          <div className="details-section">
            <h3 className="section-title">Resumen de Trámites del Sistema</h3>
            <div className="chart-bars-container">
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Trámites en Revisión</span>
                  <strong>{adminData.proceduresUnderReview}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-blue-fill" style={{ width: `${(adminData.proceduresUnderReview / (adminData.pendingProcedures || 1)) * 100}%` }}></div>
                </div>
              </div>
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Trámites Aprobados</span>
                  <strong>{adminData.approvedProcedures}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-green-fill" style={{ width: '70%' }}></div>
                </div>
              </div>
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Trámites Pendientes / Críticos</span>
                  <strong>{adminData.pendingProcedures}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-orange-fill" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="alerts-section">
            <h3 className="section-title">Alertas del Sistema</h3>
            {renderAlerts(adminData.alerts)}
          </div>
        </div>
      </div>
    );
  };

  // 2. Dashboard ESTUDIANTE
  const renderStudent = (studentData: DashboardStudentResponse) => {
    return (
      <div className="dashboard-view student-view">
        <div className="view-header">
          <h2 className="view-title">Portal del Tesista / Estudiante</h2>
          <p className="view-subtitle">Monitoreo de tus planes de tesis y convocatorias académicas.</p>
        </div>

        <div className="metrics-grid">
          <div className="metric-card bg-blue">
            <span className="metric-icon">🎓</span>
            <div className="metric-info">
              <span className="metric-value">{studentData.submittedThesisPlans}</span>
              <span className="metric-label">Planes de Tesis Presentados</span>
              <span className="metric-sublabel">Estado actual: <strong>{studentData.currentPlanStatus || 'Ninguno'}</strong></span>
            </div>
          </div>

          <div className="metric-card bg-orange">
            <span className="metric-icon">🔄</span>
            <div className="metric-info">
              <span className="metric-value">{studentData.pendingProcedures}</span>
              <span className="metric-label">Trámites en Curso</span>
              <span className="metric-sublabel">Seguimiento en tiempo real</span>
            </div>
          </div>

          <div className="metric-card bg-purple">
            <span className="metric-icon">📁</span>
            <div className="metric-info">
              <span className="metric-value">{studentData.uploadedDocuments}</span>
              <span className="metric-label">Documentos Subidos</span>
              <span className="metric-sublabel">Archivos adjuntos en la plataforma</span>
            </div>
          </div>

          <div className="metric-card bg-green">
            <span className="metric-icon">📣</span>
            <div className="metric-info">
              <span className="metric-value">{studentData.openCallsForApplication}</span>
              <span className="metric-label">Convocatorias Abiertas</span>
              <span className="metric-sublabel">Oportunidades de investigación activas</span>
            </div>
          </div>
        </div>

        <div className="dashboard-details-split">
          <div className="details-section">
            <h3 className="section-title">Información de Afiliación</h3>
            <div className="affiliation-card">
              <div className="affiliation-header">
                <span className="affiliation-icon">🏫</span>
                <div>
                  <h4>{studentData.groupName || 'Sin Grupo Asignado'}</h4>
                  <p>Código del Grupo: <strong>{studentData.groupCode || 'N/A'}</strong></p>
                </div>
              </div>
              <p className="affiliation-body">
                Los estudiantes pertenecientes a un grupo de investigación cuentan con el respaldo científico de los docentes investigadores del área. Tus trámites y planes de tesis son derivados directamente a tu coordinador de grupo para su revisión inicial.
              </p>
            </div>
          </div>

          <div className="alerts-section">
            <h3 className="section-title">Mis Notificaciones</h3>
            {renderAlerts(studentData.alerts)}
          </div>
        </div>
      </div>
    );
  };

  // 3. Dashboard DOCENTE INVESTIGADOR
  const renderTeacher = (teacherData: DashboardTeacherResponse) => {
    return (
      <div className="dashboard-view teacher-view">
        <div className="view-header">
          <h2 className="view-title">Portal del Docente Investigador</h2>
          <p className="view-subtitle">Gestión de proyectos, informes de avance y resoluciones decanales.</p>
        </div>

        <div className="metrics-grid">
          <div className="metric-card bg-blue">
            <span className="metric-icon">🔬</span>
            <div className="metric-info">
              <span className="metric-value">{teacherData.projectsAsLead}</span>
              <span className="metric-label">Proyectos como Responsable</span>
              <span className="metric-sublabel">Liderando equipo de investigación</span>
            </div>
          </div>

          <div className="metric-card bg-purple">
            <span className="metric-icon">👥</span>
            <div className="metric-info">
              <span className="metric-value">{teacherData.projectsAsMember}</span>
              <span className="metric-label">Proyectos como Integrante</span>
              <span className="metric-sublabel">Miembro de equipo científico</span>
            </div>
          </div>

          <div className="metric-card bg-orange">
            <span className="metric-icon">📊</span>
            <div className="metric-info">
              <span className="metric-value">{teacherData.pendingProgressReports}</span>
              <span className="metric-label">Informes de Avance Pendientes</span>
              <span className="metric-sublabel">Requisito para financiamientos</span>
            </div>
          </div>

          <div className="metric-card bg-green">
            <span className="metric-icon">⚖️</span>
            <div className="metric-info">
              <span className="metric-value">{teacherData.receivedResolutions}</span>
              <span className="metric-label">Resoluciones Recibidas</span>
              <span className="metric-sublabel">Documentos oficiales vinculados</span>
            </div>
          </div>
        </div>

        <div className="dashboard-details-split">
          <div className="details-section">
            <h3 className="section-title">Tus Proyectos por Estado</h3>
            <div className="chart-bars-container">
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Proyectos Postulados</span>
                  <strong>{teacherData.submittedProjects}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-blue-fill" style={{ width: `${(teacherData.submittedProjects / (teacherData.projectsAsLead + teacherData.projectsAsMember || 1)) * 100}%` }}></div>
                </div>
              </div>
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Proyectos Aprobados</span>
                  <strong>{teacherData.approvedProjects}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-green-fill" style={{ width: `${(teacherData.approvedProjects / (teacherData.projectsAsLead + teacherData.projectsAsMember || 1)) * 100}%` }}></div>
                </div>
              </div>
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>En Ejecución Activa</span>
                  <strong>{teacherData.projectsInExecution}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-purple-fill" style={{ width: `${(teacherData.projectsInExecution / (teacherData.projectsAsLead + teacherData.projectsAsMember || 1)) * 100}%` }}></div>
                </div>
              </div>
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Finalizados</span>
                  <strong>{teacherData.completedProjects}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-gray-fill" style={{ width: `${(teacherData.completedProjects / (teacherData.projectsAsLead + teacherData.projectsAsMember || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="alerts-section">
            <h3 className="section-title">Alertas de Proyectos</h3>
            {renderAlerts(teacherData.alerts)}
          </div>
        </div>
      </div>
    );
  };

  // 4. Dashboard COORDINADOR DE GRUPO
  const renderCoordinator = (coordData: DashboardCoordinatorResponse) => {
    return (
      <div className="dashboard-view coordinator-view">
        <div className="view-header">
          <h2 className="view-title">Consola del Coordinador de Grupo</h2>
          <p className="view-subtitle">Grupo: <strong>{coordData.groupName}</strong> ({coordData.groupCode})</p>
        </div>

        <div className="metrics-grid">
          <div className="metric-card bg-blue">
            <span className="metric-icon">👥</span>
            <div className="metric-info">
              <span className="metric-value">{coordData.totalMembers}</span>
              <span className="metric-label">Investigadores del Grupo</span>
              <span className="metric-sublabel">{coordData.activeMembers} miembros con membresía activa</span>
            </div>
          </div>

          <div className="metric-card bg-purple">
            <span className="metric-icon">📄</span>
            <div className="metric-info">
              <span className="metric-value">{coordData.totalGroupProjects}</span>
              <span className="metric-label">Proyectos del Grupo</span>
              <span className="metric-sublabel">{coordData.activeGroupProjects} proyectos en ejecución</span>
            </div>
          </div>

          <div className="metric-card bg-orange">
            <span className="metric-icon">🔄</span>
            <div className="metric-info">
              <span className="metric-value">{coordData.pendingGroupProcedures}</span>
              <span className="metric-label">Trámites Pendientes de Revisión</span>
              <span className="metric-sublabel">Requiere tu aprobación o feedback</span>
            </div>
          </div>

          <div className="metric-card bg-green">
            <span className="metric-icon">📖</span>
            <div className="metric-info">
              <span className="metric-value">{coordData.groupThesisPlans}</span>
              <span className="metric-label">Planes de Tesis Adscritos</span>
              <span className="metric-sublabel">{coordData.groupProgressReports} informes de avance presentados</span>
            </div>
          </div>
        </div>

        <div className="dashboard-details-split">
          <div className="details-section">
            <h3 className="section-title">Control de Trámites en tu Grupo</h3>
            <div className="chart-bars-container">
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Trámites Presentados</span>
                  <strong>{coordData.submittedProcedures}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-blue-fill" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>En Revisión Coordinación</span>
                  <strong>{coordData.proceduresUnderReview}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-purple-fill" style={{ width: '50%' }}></div>
                </div>
              </div>
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Trámites Aprobados</span>
                  <strong>{coordData.approvedProcedures}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-green-fill" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Trámites Observados</span>
                  <strong>{coordData.observedProcedures}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-orange-fill" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="alerts-section">
            <h3 className="section-title">Alertas del Grupo de Investigación</h3>
            {renderAlerts(coordData.alerts)}
          </div>
        </div>
      </div>
    );
  };

  // 5. Dashboard DIRECTOR DE INVESTIGACIÓN
  const renderDirector = (directorData: DashboardDirectorResponse) => {
    return (
      <div className="dashboard-view director-view">
        <div className="view-header">
          <h2 className="view-title">Dirección de Investigación de la Facultad</h2>
          <p className="view-subtitle">Consola de supervisión de convocatorias, proyectos y control de flujo.</p>
        </div>

        <div className="metrics-grid">
          <div className="metric-card bg-blue">
            <span className="metric-icon">🏢</span>
            <div className="metric-info">
              <span className="metric-value">{directorData.totalProjects}</span>
              <span className="metric-label">Proyectos Totales FIIS</span>
              <span className="metric-sublabel">{directorData.activeProjects} proyectos activos en curso</span>
            </div>
          </div>

          <div className="metric-card bg-purple">
            <span className="metric-icon">🔄</span>
            <div className="metric-info">
              <span className="metric-value">{directorData.pendingReviewProcedures}</span>
              <span className="metric-label">Trámites Pendientes en Dirección</span>
              <span className="metric-sublabel">Derivados para revisión jerárquica</span>
            </div>
          </div>

          <div className="metric-card bg-orange">
            <span className="metric-icon">📅</span>
            <div className="metric-info">
              <span className="metric-value">{directorData.reportsNearingDeadline}</span>
              <span className="metric-label">Informes Cerca del Vencimiento</span>
              <span className="metric-sublabel">Alertas de retraso académico</span>
            </div>
          </div>

          <div className="metric-card bg-green">
            <span className="metric-icon">📣</span>
            <div className="metric-info">
              <span className="metric-value">{directorData.openCallsForApplication}</span>
              <span className="metric-label">Convocatorias de Investigación</span>
              <span className="metric-sublabel">{directorData.issuedResolutions} resoluciones emitidas</span>
            </div>
          </div>
        </div>

        <div className="dashboard-details-split">
          <div className="details-section">
            <h3 className="section-title">Distribución del Flujo de Trámites</h3>
            <div className="chart-bars-container">
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Trámites en Coordinación</span>
                  <strong>{directorData.proceduresWithCoordinator}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-blue-fill" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Trámites en Dirección</span>
                  <strong>{directorData.proceduresWithDirector}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-purple-fill" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Trámites en Decanato (Firma)</span>
                  <strong>{directorData.proceduresWithDean}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-orange-fill" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Trámites Concluidos</span>
                  <strong>{directorData.completedProcedures}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-green-fill" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="alerts-section">
            <h3 className="section-title">Notificaciones de Dirección</h3>
            {renderAlerts(directorData.alerts)}
          </div>
        </div>
      </div>
    );
  };

  // 6. Dashboard DECANO
  const renderDean = (deanData: DashboardDeanResponse) => {
    return (
      <div className="dashboard-view dean-view">
        <div className="view-header">
          <h2 className="view-title">Consola del Decanato de la Facultad</h2>
          <p className="view-subtitle">Supervisión política, resoluciones finales e informes institucionales.</p>
        </div>

        <div className="metrics-grid">
          <div className="metric-card bg-blue">
            <span className="metric-icon">⚖️</span>
            <div className="metric-info">
              <span className="metric-value">{deanData.totalFacultyProjects}</span>
              <span className="metric-label">Proyectos en la Facultad</span>
              <span className="metric-sublabel">{deanData.activeProjects} proyectos de investigación activos</span>
            </div>
          </div>

          <div className="metric-card bg-purple">
            <span className="metric-icon">✍️</span>
            <div className="metric-info">
              <span className="metric-value">{deanData.pendingSignatureProcedures}</span>
              <span className="metric-label">Trámites Pendientes de Firma</span>
              <span className="metric-sublabel">Espera de emisión de resolución decanal</span>
            </div>
          </div>

          <div className="metric-card bg-orange">
            <span className="metric-icon">📜</span>
            <div className="metric-info">
              <span className="metric-value">{deanData.issuedResolutions}</span>
              <span className="metric-label">Resoluciones Emitidas</span>
              <span className="metric-sublabel">Histórico de firmas digitales</span>
            </div>
          </div>

          <div className="metric-card bg-green">
            <span className="metric-icon">🏫</span>
            <div className="metric-info">
              <span className="metric-value">{deanData.totalActiveGroups}</span>
              <span className="metric-label">Grupos de Investigación Activos</span>
              <span className="metric-sublabel">{deanData.activeCallsForApplication} convocatorias vigentes</span>
            </div>
          </div>
        </div>

        <div className="dashboard-details-split">
          <div className="details-section">
            <h3 className="section-title">Estadísticas Mensuales del Decanato</h3>
            <div className="chart-bars-container">
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Trámites en Espera</span>
                  <strong>{deanData.waitingProcedures}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-blue-fill" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Aprobados este Mes</span>
                  <strong>{deanData.approvedProceduresThisMonth}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-green-fill" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Rechazados / Devueltos este Mes</span>
                  <strong>{deanData.rejectedProceduresThisMonth}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-orange-fill" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="alerts-section">
            <h3 className="section-title">Notificaciones del Decano</h3>
            {renderAlerts(deanData.alerts)}
          </div>
        </div>
      </div>
    );
  };

  // 7. Dashboard EVALUADOR
  const renderEvaluator = (evalData: DashboardEvaluatorResponse) => {
    return (
      <div className="dashboard-view evaluator-view">
        <div className="view-header">
          <h2 className="view-title">Portal del Evaluador Científico</h2>
          <p className="view-subtitle">Revisión de proyectos de investigación y evaluación de planes de tesis.</p>
        </div>

        <div className="metrics-grid">
          <div className="metric-card bg-blue">
            <span className="metric-icon">📋</span>
            <div className="metric-info">
              <span className="metric-value">{evalData.assignedEvaluations}</span>
              <span className="metric-label">Evaluaciones Asignadas</span>
              <span className="metric-sublabel">{evalData.pendingEvaluations} evaluaciones pendientes</span>
            </div>
          </div>

          <div className="metric-card bg-green">
            <span className="metric-icon">✅</span>
            <div className="metric-info">
              <span className="metric-value">{evalData.completedEvaluations}</span>
              <span className="metric-label">Evaluaciones Completadas</span>
              <span className="metric-sublabel">Historial de puntajes y dictámenes</span>
            </div>
          </div>

          <div className="metric-card bg-purple">
            <span className="metric-icon">🔬</span>
            <div className="metric-info">
              <span className="metric-value">{evalData.assignedProjects}</span>
              <span className="metric-label">Proyectos Asignados</span>
              <span className="metric-sublabel">{evalData.assignedThesisPlans} planes de tesis en cola</span>
            </div>
          </div>

          <div className="metric-card bg-orange">
            <span className="metric-icon">⚠️</span>
            <div className="metric-info">
              <span className="metric-value">{evalData.evaluationsWithObservations}</span>
              <span className="metric-label">Con Observaciones</span>
              <span className="metric-sublabel">Retornados a los postulantes</span>
            </div>
          </div>
        </div>

        <div className="dashboard-details-split">
          <div className="details-section">
            <h3 className="section-title">Resultados de Evaluaciones</h3>
            <div className="chart-bars-container">
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Evaluaciones Aprobadas</span>
                  <strong>{evalData.approvedEvaluations}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-green-fill" style={{ width: `${(evalData.approvedEvaluations / (evalData.assignedEvaluations || 1)) * 100}%` }}></div>
                </div>
              </div>
              <div className="bar-wrapper">
                <div className="bar-header">
                  <span>Evaluaciones Rechazadas</span>
                  <strong>{evalData.rejectedEvaluations}</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill bg-orange-fill" style={{ width: `${(evalData.rejectedEvaluations / (evalData.assignedEvaluations || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="alerts-section">
            <h3 className="section-title">Tareas de Evaluación Pendientes</h3>
            {renderAlerts(evalData.alerts)}
          </div>
        </div>
      </div>
    );
  };

  // Selector de dashboards por código de rol
  switch (currentRole) {
    case 'ADMIN':
      return renderAdmin(data as DashboardAdminResponse);
    case 'ESTUDIANTE':
      return renderStudent(data as DashboardStudentResponse);
    case 'DOCENTE_INVESTIGADOR':
      return renderTeacher(data as DashboardTeacherResponse);
    case 'COORDINADOR_GRUPO':
      return renderCoordinator(data as DashboardCoordinatorResponse);
    case 'DIRECTOR_INVESTIGACION':
      return renderDirector(data as DashboardDirectorResponse);
    case 'DECANO':
      return renderDean(data as DashboardDeanResponse);
    case 'EVALUADOR':
      return renderEvaluator(data as DashboardEvaluatorResponse);
    default:
      return (
        <div className="unsupported-role-view">
          <span className="unsupported-icon">⚠️</span>
          <h3>Rol no Soportado</h3>
          <p>El rol "{currentRole}" no tiene una vista de dashboard implementada.</p>
        </div>
      );
  }
};
export default RoleDashboards;
