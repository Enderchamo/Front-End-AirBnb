import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../Context/AuthContext';

export default function SeccionResenas({ propiedadId }) {
  const { usuario, estaAutenticado } = useAuth();
  const [datosResenas, setDatosResenas] = useState({ promedioCalificacion: 0, totalResenas: 0, resenas: [] });
  
  // Guardaremos solo la reserva detectada automáticamente
  const [reservaDetectada, setReservaDetectada] = useState(null);
  const [cargandoValidacion, setCargandoValidacion] = useState(false);

  const [formData, setFormData] = useState({ calificacion: 5, comentario: '' });
  const [hoveredStar, setHoveredStar] = useState(0); 
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargarResenas = async () => {
    try {
      const respuesta = await api.get(`/Resena/propiedad/${propiedadId}`);
      setDatosResenas(respuesta.data);
    } catch (err) {
      console.error("Error al cargar reseñas:", err);
    }
  };

  // 🧠 LA MAGIA OCURRE AQUÍ: Auto-detección sin que el usuario haga nada
  const verificarSiSeHospedo = async () => {
    if (!estaAutenticado) return;
    setCargandoValidacion(true);
    try {
      const respuesta = await api.get('/Reservas/mis-reservas');
      const todasMisReservas = respuesta.data;
      
      // 1. Filtramos: ¿Cuáles de mis reservas son en ESTA propiedad?
      const filtradas = todasMisReservas.filter(r => {
        const idProp = r.propiedadId || r.PropiedadId;
        return Number(idProp) === Number(propiedadId);
      });

      if (filtradas.length > 0) {
        // 2. Ordenamos: Si vino varias veces, elegimos la más reciente
        filtradas.sort((a, b) => new Date(b.fechaFin || b.FechaFin) - new Date(a.fechaFin || a.FechaFin));
        
        // 3. Guardamos la ganadora en el estado (Invisible para el usuario)
        setReservaDetectada(filtradas[0]);
      }
    } catch (err) {
      console.error("Error verificando la estancia del usuario:", err);
    } finally {
      setCargandoValidacion(false);
    }
  };

  useEffect(() => {
    if (propiedadId) {
      cargarResenas();
      verificarSiSeHospedo();
    }
  }, [propiedadId, estaAutenticado]);

  const manejarCambio = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const enviarResena = async (e) => {
    e.preventDefault();
    if (!reservaDetectada) return;

    setCargando(true);
    setError('');

    try {
      const reservaIdReal = reservaDetectada.id || reservaDetectada.Id;

      await api.post('/Resena', {
        reservaId: parseInt(reservaIdReal),
        calificacion: parseInt(formData.calificacion),
        comentario: formData.comentario
      });
      
      setFormData(prev => ({ ...prev, comentario: '' })); 
      cargarResenas(); 
      alert("¡Reseña publicada con éxito! 🌟");
      
    } catch (err) {
      const resp = err.response?.data;
      
      // 🛠️ EXPLICACIÓN: Accedemos a resp.error.message porque así lo definiste en C#
      if (resp?.error?.message) {
          setError(resp.error.message); // Guardamos solo el STRING, no el objeto
      } else if (resp?.mensaje) {
          setError(resp.mensaje);
      } else {
          setError("Ocurrió un error al enviar la reseña.");
      }
    } finally {
      setCargando(false);
    }
  };

  const renderEstrellasEstaticas = (calificacion) => {
    return (
      <div style={{ color: '#FF5A5F', letterSpacing: '2px', fontSize: '1rem' }}>
        {'★'.repeat(calificacion)}
        <span style={{ color: '#e4e5e9' }}>{'★'.repeat(5 - calificacion)}</span>
      </div>
    );
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ marginTop: '3rem', borderTop: '1px solid #ebebeb', paddingTop: '2.5rem', fontFamily: 'Arial, sans-serif' }}>
      
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <span style={{ color: '#FF5A5F' }}>★</span> 
        {datosResenas.promedioCalificacion?.toFixed(1) || '0.0'} · {datosResenas.totalResenas} reseñas
      </h2>

      {estaAutenticado && !cargandoValidacion && (
        reservaDetectada ? (
          <div style={{ backgroundColor: '#ffffff', padding: '1.8rem', borderRadius: '16px', border: '1px solid #ddd', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: '600' }}>Comparte tu experiencia</h3>
            
            
            {error && <p style={{ color: '#c13515', backgroundColor: '#fdf1f0', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}
            
            <form onSubmit={enviarResena} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.3rem' }}>Puntuación</label>
                <div style={{ display: 'flex' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} onClick={() => setFormData({ ...formData, calificacion: star })} onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)}
                      style={{ cursor: 'pointer', fontSize: '2.2rem', color: star <= (hoveredStar || formData.calificacion) ? '#FF5A5F' : '#e4e5e9', transition: 'color 0.1s' }}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Tu comentario</label>
                <textarea name="comentario" value={formData.comentario} onChange={manejarCambio} required placeholder="¿Qué fue lo que más te gustó? Cuéntanos detalles..." maxLength="200" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #b0b0b0', fontSize: '1rem', outline: 'none', height: '100px', resize: 'none', boxSizing: 'border-box' }} />
              </div>

              <button type="submit" disabled={cargando} style={{ padding: '0.8rem 2rem', backgroundColor: '#FF5A5F', color: 'white', border: 'none', borderRadius: '8px', cursor: cargando ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '1rem', alignSelf: 'flex-start', opacity: cargando ? 0.7 : 1 }}>
                {cargando ? 'Publicando...' : 'Publicar reseña'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '16px', textAlign: 'center', marginBottom: '2.5rem', border: '1px solid #eee' }}>
            <p style={{ color: '#717171', fontSize: '1rem', margin: 0 }}>Debes haber completado una estancia en esta propiedad para poder dejar una reseña.</p>
          </div>
        )
      )}

      {/* Lista de reseñas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem', marginTop: '1rem' }}>
        {datosResenas.resenas.length === 0 ? (
          <p style={{ color: '#717171' }}>Aún no hay opiniones sobre esta propiedad.</p>
        ) : (
          datosResenas.resenas.map((resena) => (
            <div key={resena.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#222', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {(resena.nombreHuesped || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{resena.nombreHuesped || 'Usuario'}</div>
                  {renderEstrellasEstaticas(resena.calificacion)}
                </div>
              </div>
              <p style={{ color: '#484848', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>{resena.comentario}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}