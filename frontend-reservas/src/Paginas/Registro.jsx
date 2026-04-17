import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast'; // 1. Importamos la librería de notificaciones

// Estilos actualizados para centrado perfecto
const estilos = {
  contenedorPrincipal: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'url(https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070)', backgroundSize: 'cover', backgroundPosition: 'center', fontFamily: 'sans-serif', color: 'white' },
  tarjetaGlass: { display: 'flex', width: '900px', maxWidth: '90%', minHeight: '500px', backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  ladoIzquierdo: { flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)' },
  ladoDerecho: { flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  label: { display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ddd' },
  input: { width: '100%', padding: '1rem', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', outline: 'none', boxSizing: 'border-box' },
  boton: { width: '100%', padding: '1rem', borderRadius: '30px', border: 'none', backgroundColor: 'white', color: '#333', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }
};

export default function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', rol: '' });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const manejarCambio = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const datosRegistro = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        esHost: formData.rol === 'Host',
        esGuest: formData.rol === 'Guest'
      };

      await api.post('/Usuarios/registro', datosRegistro);
      
      // 2. Reemplazamos el alert feo por un Toast elegante
      toast.success("¡Cuenta creada con éxito! Por favor inicia sesión.", {
        duration: 3000,
        id: 'registro-exito' // Evita que salgan varios si le dan doble click
      });
      
      // 3. Esperamos 1.5 segundos para que vean el mensaje antes de cambiar de página
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      const data = err.response?.data;
      if (data?.errores) setError(data.errores.join(" | "));
      else if (data?.errors) setError(Object.values(data.errors).flat().join(" | "));
      else if (data?.error) setError(data.error);
      else setError("Error de conexión al servidor.");
      
      // También podemos poner un toast para el error si lo deseas
      toast.error("Hubo un problema al crear tu cuenta.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={estilos.contenedorPrincipal}>
      <div style={estilos.tarjetaGlass}>
        
        <div style={estilos.ladoIzquierdo}>
          <h1 style={{ fontSize: '4rem', margin: 0, fontWeight: 'bold', lineHeight: '1.1' }}>Es hora<br/>de viajar</h1>
        </div>

        <div style={estilos.ladoDerecho}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 'normal' }}>Regístrate</h2>
          {error && <p style={{ color: '#ff4d4f', backgroundColor: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '5px' }}>{error}</p>}
          
          <form onSubmit={manejarRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={estilos.label}>Nombre Completo</label>
              <input type="text" name="nombre" placeholder="Tu nombre aquí" onChange={manejarCambio} required style={estilos.input} />
            </div>
            <div>
              <label style={estilos.label}>Correo Electrónico</label>
              <input type="email" name="email" placeholder="tu@correo.com" onChange={manejarCambio} required style={estilos.input} />
            </div>
            <div>
              <label style={estilos.label}>Tipo de Cuenta (Rol)</label>
              <select name="rol" value={formData.rol} onChange={manejarCambio} required style={{...estilos.input, appearance: 'none', cursor: 'pointer'}}>
                <option value="" disabled style={{ color: 'black' }}>Selecciona un rol...</option>
                <option value="Guest" style={{ color: 'black' }}>Huésped (Quiero reservar lugares)</option>
                <option value="Host" style={{ color: 'black' }}>Anfitrión (Quiero alquilar mi lugar)</option>
              </select>
            </div>
            <div>
              <label style={estilos.label}>Contraseña</label>
              <input type="password" name="password" placeholder="••••••••" onChange={manejarCambio} required style={estilos.input} />
            </div>
            <button type="submit" disabled={cargando} style={estilos.boton}>
              {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#ddd' }}>¿Ya tienes una cuenta? </span>
              <Link to="/login" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none' }}>Inicia sesión aquí</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}