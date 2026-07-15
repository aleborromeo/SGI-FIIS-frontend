import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PrivacyPolicyPage.css';
import universityIcon from '../assets/images/icon-sgi-fiis.png';

type LegalSection = 
  | 'terminos'
  | 'privacidad'
  | 'derechos-autor'
  | 'cookies'
  | 'cambios'
  | 'eventos';

export const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LegalSection>('privacidad');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="privacy-page-wrapper">
      {/* Header formal y minimalista */}
      <header className="privacy-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="privacy-logo-container" onClick={() => navigate('/')}>
          <img src={universityIcon} alt="SGI Logo" className="privacy-logo-img" />
          <span className="privacy-logo-text">SGI FIIS</span>
        </div>
      </header>

      {/* Layout de dos columnas */}
      <main className="privacy-main-layout">
        
        {/* Columna Izquierda: Sidebar Estática */}
        <aside className="privacy-sidebar">
          <ul className="privacy-sidebar-list">
            <li>
              <button
                className={`privacy-sidebar-item ${activeTab === 'terminos' ? 'active' : ''}`}
                onClick={() => setActiveTab('terminos')}
              >
                Términos y condiciones
              </button>
            </li>
            <li>
              <button
                className={`privacy-sidebar-item ${activeTab === 'privacidad' ? 'active' : ''}`}
                onClick={() => setActiveTab('privacidad')}
              >
                política de privacidad
              </button>
            </li>
            <li>
              <button
                className={`privacy-sidebar-item ${activeTab === 'derechos-autor' ? 'active' : ''}`}
                onClick={() => setActiveTab('derechos-autor')}
              >
                Declaración de derechos de autor
              </button>
            </li>
            <li>
              <button
                className={`privacy-sidebar-item ${activeTab === 'cookies' ? 'active' : ''}`}
                onClick={() => setActiveTab('cookies')}
              >
                Política de cookies
              </button>
            </li>
            <li>
              <button
                className={`privacy-sidebar-item ${activeTab === 'cambios' ? 'active' : ''}`}
                onClick={() => setActiveTab('cambios')}
              >
                Resumen de cambios
              </button>
            </li>
            <li>
              <button
                className={`privacy-sidebar-item ${activeTab === 'eventos' ? 'active' : ''}`}
                onClick={() => setActiveTab('eventos')}
              >
                Términos y condiciones de los eventos
              </button>
            </li>
          </ul>
        </aside>

        {/* Columna Derecha: Contenido Dinámico */}
        <section className="privacy-content-area">
          
          {activeTab === 'terminos' && (
            <div>
              <h1 className="privacy-title">Términos y condiciones de uso</h1>
              <p className="privacy-subtitle">Última actualización: 15 de julio de 2026</p>
              
              <div className="privacy-paragraph-list">
                <div className="privacy-paragraph-item">
                  <span className="privacy-paragraph-letter">a.</span>
                  <p className="privacy-paragraph-body">
                    <strong>Aceptación de los términos.</strong> Al acceder y utilizar la plataforma del Sistema de Gestión de Investigación (SGI-FIIS), usted acepta estar sujeto a los presentes términos y condiciones en su totalidad. Si no está de acuerdo, le instamos a abstenerse de usar el sistema.
                  </p>
                </div>
                <div className="privacy-paragraph-item">
                  <span className="privacy-paragraph-letter">b.</span>
                  <p className="privacy-paragraph-body">
                    <strong>Uso de la plataforma.</strong> El SGI-FIIS está destinado de forma exclusiva para el registro, revisión, aprobación y seguimiento de proyectos de investigación científica, planes de tesis e informes académicos de la Facultad de Ingeniería en Informática y Sistemas de la UNAS.
                  </p>
                </div>
                <div className="privacy-paragraph-item">
                  <span className="privacy-paragraph-letter">c.</span>
                  <p className="privacy-paragraph-body">
                    <strong>Responsabilidad de la cuenta.</strong> Cada usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades realizadas bajo su cuenta. Las credenciales de acceso son de carácter personal e intransferible.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacidad' && (
            <div>
              <h1 className="privacy-title">Política de privacidad</h1>
              <p className="privacy-subtitle">Última actualización: 15 de julio de 2026</p>
              
              <p className="privacy-intro-text">
                La Facultad de Ingeniería en Informática y Sistemas (FIIS) de la Universidad Nacional Agraria de la Selva se compromete con la protección y el tratamiento seguro de los datos de todos los usuarios de la plataforma SGI-FIIS. A continuación, detallamos la base formal de recopilación y procesamiento de información:
              </p>

              <div className="privacy-paragraph-list">
                <div className="privacy-paragraph-item">
                  <span className="privacy-paragraph-letter">a.</span>
                  <p className="privacy-paragraph-body">
                    <strong>Datos recopilados por el sistema.</strong> Recopilamos información de identificación básica como nombres, apellidos, Documento Nacional de Identidad (DNI), dirección de correo institucional (@unas.edu.pe) y credenciales de acceso cifradas. Adicionalmente, se procesa información de avance académico, asignaciones de líneas de investigación, registros de proyectos de tesis y observaciones de evaluación.
                  </p>
                </div>

                <div className="privacy-paragraph-item">
                  <span className="privacy-paragraph-letter">b.</span>
                  <p className="privacy-paragraph-body">
                    <strong>Finalidad del uso de datos.</strong> La información obtenida se destina exclusivamente para la administración y validación de las investigaciones, la asignación automática de docentes evaluadores basada en líneas de investigación específicas, el control de flujo de trámites y el envío de notificaciones automáticas tales como códigos de verificación y restablecimiento de claves.
                  </p>
                </div>

                <div className="privacy-paragraph-item">
                  <span className="privacy-paragraph-letter">c.</span>
                  <p className="privacy-paragraph-body">
                    <strong>Destinatarios y acceso a la información.</strong> El acceso está limitado al personal autorizado según el control de accesos por roles (RBAC) del sistema, que incluye administradores de TI, la Unidad de Investigación de la FIIS, decanatura, docentes asesores y jurados evaluadores asignados. Bajo ninguna circunstancia compartimos o vendemos datos personales a entidades externas.
                  </p>
                </div>

                <div className="privacy-paragraph-item">
                  <span className="privacy-paragraph-letter">d.</span>
                  <p className="privacy-paragraph-body">
                    <strong>Medidas de seguridad de la información.</strong> Las contraseñas de usuario se almacenan de manera irreversible mediante cifrado fuerte BCrypt con sal (salt) aleatoria. Las transacciones de datos entre el cliente y el servidor backend se realizan cifradas mediante el protocolo HTTPS. Adicionalmente, el almacenamiento de datos está aislado de redes públicas directas.
                  </p>
                </div>

                <div className="privacy-paragraph-item">
                  <span className="privacy-paragraph-letter">e.</span>
                  <p className="privacy-paragraph-body">
                    <strong>Derechos ARCO y contacto del responsable.</strong> Los usuarios tienen derecho a acceder, rectificar, cancelar u oponerse al tratamiento de su información. Para cualquier consulta sobre la privacidad de sus datos, puede comunicarse directamente con la Unidad de Investigación de la FIIS a través del correo institucional: <a href="mailto:sgifiisunas@gmail.com" className="privacy-contact-link">sgifiisunas@gmail.com</a>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'derechos-autor' && (
            <div>
              <h1 className="privacy-title">Declaración de derechos de autor</h1>
              <p className="privacy-subtitle">Última actualización: 15 de julio de 2026</p>
              
              <div className="privacy-paragraph-list">
                <div className="privacy-paragraph-item">
                  <span className="privacy-paragraph-letter">a.</span>
                  <p className="privacy-paragraph-body">
                    <strong>Propiedad intelectual de las tesis.</strong> Los derechos de autor morales e intelectuales sobre los proyectos y trabajos finales de investigación registrados en el SGI-FIIS pertenecen de forma exclusiva a los autores firmantes (estudiantes y egresados de la UNAS), conforme a las normativas vigentes en la legislación peruana.
                  </p>
                </div>
                <div className="privacy-paragraph-item">
                  <span className="privacy-paragraph-letter">b.</span>
                  <p className="privacy-paragraph-body">
                    <strong>Uso con fines académicos.</strong> La Facultad de Ingeniería en Informática y Sistemas se reserva el derecho de conservar copia digital de los proyectos aprobados en su repositorio institucional con el único fin de divulgación científica y consulta académica sin fines de lucro.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div>
              <h1 className="privacy-title">Política de cookies</h1>
              <p className="privacy-subtitle">Última actualización: 15 de julio de 2026</p>
              
              <div className="privacy-paragraph-list">
                <div className="privacy-paragraph-item">
                  <span className="privacy-paragraph-letter">a.</span>
                  <p className="privacy-paragraph-body">
                    <strong>Uso de tecnologías de almacenamiento.</strong> La plataforma SGI-FIIS utiliza cookies de sesión y almacenamiento en el navegador (localStorage) para mantener la sesión del usuario activa de forma segura una vez que se realiza la autenticación exitosa mediante tokens JWT.
                  </p>
                </div>
                <div className="privacy-paragraph-item">
                  <span className="privacy-paragraph-letter">b.</span>
                  <p className="privacy-paragraph-body">
                    <strong>Cookies técnicas obligatorias.</strong> No empleamos cookies para rastreo comercial ni publicidad dirigida. Todas las cookies y datos almacenados localmente son estrictamente técnicos y necesarios para asegurar el correcto flujo de autorización y seguridad del sistema.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cambios' && (
            <div>
              <h1 className="privacy-title">Resumen de cambios legales</h1>
              <p className="privacy-subtitle">Última actualización: 15 de julio de 2026</p>
              
              <div className="privacy-paragraph-list">
                <div className="privacy-paragraph-item">
                  <span className="privacy-paragraph-letter">a.</span>
                  <p className="privacy-paragraph-body">
                    <strong>Versión 1.0 (Julio 2026).</strong> Se publica la primera versión oficial del pliego normativo y políticas de protección de datos para la plataforma SGI-FIIS de la UNAS. Se define el flujo de autenticación mediante roles académicos y se integran los canales de contacto de la Unidad de Investigación de la Facultad.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'eventos' && (
            <div>
              <h1 className="privacy-title">Términos y condiciones de eventos</h1>
              <p className="privacy-subtitle">Última actualización: 15 de julio de 2026</p>
              
              <div className="privacy-paragraph-list">
                <div className="privacy-paragraph-item">
                  <span className="privacy-paragraph-letter">a.</span>
                  <p className="privacy-paragraph-body">
                    <strong>Participación en eventos científicos.</strong> Los términos contenidos en esta sección aplican para las ponencias, congresos y webinars organizados por los grupos de investigación de la FIIS a través del sistema. Los participantes aceptan que el material didáctico expuesto es de uso académico.
                  </p>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>

      {/* Pie de página formal */}
      <footer className="privacy-footer">
        <div className="privacy-footer-content">
          <span>© 2026 SGI - Facultad de Ingeniería en Informática y Sistemas - UNAS. Todos los derechos reservados.</span>
          <div className="privacy-footer-links">
            <span className="privacy-footer-link" onClick={() => setActiveTab('privacidad')}>Política de privacidad</span>
            <span>|</span>
            <span className="privacy-footer-link" onClick={() => setActiveTab('terminos')}>Términos y condiciones</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
