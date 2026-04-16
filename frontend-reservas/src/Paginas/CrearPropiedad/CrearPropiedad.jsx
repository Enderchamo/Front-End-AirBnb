import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../Components/Navbar/Navbar';

export default function CrearPropiedad() {
  const navigate = useNavigate();
  const { usuario, estaAutenticado, cargandoAuth } = useAuth();
  const [cargando, setCargando] = useState(false);
  
  // Estado para el formulario (igual al DTO de tu C#)
  const [formData, setFormData] = useState({
    titulo: '',
    ubicacion: '',
    descripcion: '',
    capacidad: 1,
    precioPorNoche: 0
  });

  // PROTECCIÓN DE RUTA: Si no es host, lo pateamos al inicio
  useEffect(() => {
    if (!cargandoAuth) {
      if (!estaAutenticado || !usuario?.esHost) {
        alert("Área restringida solo para Anfitriones (Hosts).");
        navigate('/');
      }
    }
  }, [estaAutenticado, usuario, cargandoAuth, navigate]);

  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      // Armamos el paquete. Ya no nos preocupamos por el Token, axios.js lo hace
      const payload = {
        Titulo: formData.titulo,
        Ubicacion: formData.ubicacion,
        Descripcion: formData.descripcion,
        Capacidad: parseInt(formData.capacidad),
        PrecioPorNoche: parseFloat(formData.precioPorNoche),
        HostId: parseInt(usuario.id) // Lo sacamos directo del Cerebro
      };

      await api.post('/Propiedad', payload);

      alert("¡Propiedad publicada con éxito! 🏠");
      navigate('/');
    } catch (error) {
      const data = error.response?.data;
      if (data?.errores) alert("Revisa: \n" + data.errores.join("\n"));
      else if (data?.error) alert("Error: " + data.error);
      else alert("Ocurrió un error al crear la propiedad.");
    } finally {
      setCargando(false);
    }
  };

  // Evitar parpadeos mientras carga la autenticación
  if (cargandoAuth) return <p>Cargando...</p>;

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Publica tu Cabaña</h2>
        <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Título de la propiedad</label>
            <input name="titulo" onChange={manejarCambio} required style={estiloInput} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Ubicación</label>
            <input name="ubicacion" onChange={manejarCambio} required style={estiloInput} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Descripción</label>
            <textarea name="descripcion" onChange={manejarCambio} required style={{ ...estiloInput, height: '100px' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Capacidad (Huéspedes)</label>
              <input name="capacidad" type="number" min="1" onChange={manejarCambio} required style={estiloInput} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Precio por Noche ($)</label>
              <input name="precioPorNoche" type="number" step="1" onChange={manejarCambio} required style={estiloInput} />
            </div>
          </div>

          <button type="submit" disabled={cargando} style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#FF5A5F', color: 'white', border: 'none', borderRadius: '8px', cursor: cargando ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
            {cargando ? 'Publicando...' : 'Publicar Propiedad'}
          </button>
        </form>
      </div>
    </div>
  );
}

const estiloInput = { padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', marginTop: '0.3rem' };