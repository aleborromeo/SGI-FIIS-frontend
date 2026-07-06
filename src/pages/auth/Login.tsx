import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';
import { LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor ingrese su correo y contraseña.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await authService.login(email, password);
      // Assuming response has token and user object
      login(response.token, response.user);
      navigate('/');
    } catch (error: any) {
      console.error('Error during login', error);
      setErrorMsg(error.message || 'Credenciales incorrectas o error de servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--surface-container-low)' }}>
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <CardHeader style={{ textAlign: 'center', paddingBottom: 0 }}>
          <div style={{ backgroundColor: 'var(--primary-container)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px' }}>
            <LogIn size={32} color="var(--on-primary-container)" />
          </div>
          <h1 className="text-headline-md" style={{ color: 'var(--primary)' }}>Iniciar Sesión</h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>Ingresa tus credenciales para acceder al SGI-FIIS</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
            {errorMsg && (
              <div style={{ backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
                {errorMsg}
              </div>
            )}
            <Input 
              label="Correo Electrónico"
              type="email" 
              placeholder="usuario@unmsm.edu.pe" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              label="Contraseña"
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button variant="primary" style={{ marginTop: '16px', width: '100%', padding: '12px' }} disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
