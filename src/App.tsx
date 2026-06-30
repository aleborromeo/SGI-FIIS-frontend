import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1>SGI-FIIS Frontend</h1>
              <p>Estructura modular base generada exitosamente.</p>
            </div>
          } />
          {/* Aquí irán las rutas de los diferentes módulos */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
