import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../Context/AuthContext';

// 1. Estilos actualizados para centrar el mensaje de "Bienvenido"
const estilos = {
  contenedorPrincipal: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'url(https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070)', backgroundSize: 'cover', backgroundPosition: 'center', fontFamily: 'sans-serif', color: 'white' },
  tarjetaGlass: { display: 'flex', width: '900px', maxWidth: '90%', minHeight: '500px', backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  
  // Modificamos justify-content y align-items para el centrado perfecto
  ladoIzquierdo: { flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)' },
  
  ladoDerecho: { flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  label: { display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ddd' },
  input: { width: '100%', padding: '1rem', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', outline: 'none', boxSizing: 'border-box' },
  boton: { width: '100%', padding: '1rem', borderRadius: '30px', border: 'none', backgroundColor: 'white', color: '#333', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const respuesta = await api.post('/Usuarios/login', { email, password });
      login(respuesta.data.token);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errores) setError(data.errores.join(" | "));
      else if (data?.errors) setError(Object.values(data.errors).flat().join(" | "));
      else if (data?.error) setError(data.error);
      else setError("Error al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={estilos.contenedorPrincipal}>
      <div style={estilos.tarjetaGlass}>
        
        {/* Lado Izquierdo - Ahora solo dice "Bienvenido" y está centrado */}
        <div style={estilos.ladoIzquierdo}>
          <h1 style={{ fontSize: '4rem', margin: 0, fontWeight: 'bold' }}>Bienvenido</h1>
        </div>

        {/* Lado Derecho - Formulario en Español */}
        <div style={estilos.ladoDerecho}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 'normal' }}>Iniciar Sesión</h2>
          {error && <p style={{ color: '#ff4d4f', backgroundColor: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '5px' }}>{error}</p>}
          
          <form onSubmit={manejarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={estilos.label}>Correo Electrónico</label>
              <input type="email" value={email} placeholder="tu@correo.com" onChange={(e) => setEmail(e.target.value)} required style={estilos.input} />
            </div>
            <div>
              <label style={estilos.label}>Contraseña</label>
              <input type="password" value={password} placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} required style={estilos.input} />
            </div>
            <button type="submit" disabled={cargando} style={estilos.boton}>
              {cargando ? 'Cargando...' : 'Entrar'}
            </button>
            
            {/* El enlace de registro lo movimos aquí para mantener funcionalidad */}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#ddd' }}>¿No tienes una cuenta? </span>
              <Link to="/registro" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none' }}>Regístrate aquí</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}