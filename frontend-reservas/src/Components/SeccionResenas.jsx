import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../Context/AuthContext';

export default function SeccionResenas({ propiedadId }) {
  const { usuario, estaAutenticado } = useAuth();
  const [datosResenas, setDatosResenas] = useState({ promedioCalificacion: 0, totalResenas: 0, resenas: [] });
  
  // Reservas que el usuario tiene en esta propiedad y NO ha calificado
  const [reservasPendientes, setReservasPendientes] = useState([]);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [cargandoValidacion, setCargandoValidacion] = useState(true);

  const [formData, setFormData] = useState({ calificacion: 5, comentario: '' });
  const [hoveredStar, setHoveredStar] = useState(0); 
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // 1. Cargamos las reseñas de la propiedad
  const cargarResenas = async () => {
    try {
      const respuesta = await api.get(`/Resena/propiedad/${propiedadId}`);
      setDatosResenas(respuesta.data);
      return respuesta.data.resenas; // Devolvemos la lista para el siguiente paso
    } catch (err) {
      console.error("Error al cargar reseñas:", err);
      return [];
    }
  };

  // 2. Buscamos estadías que no tengan reseña aún
  const verificarEstadias = async (resenasExistentes) => {
    if (!estaAutenticado) {
        setCargandoValidacion(false);
        return;
    }
    
    try {
      const respuesta = await api.get('/Reservas/mis-reservas');
      const misReservas = respuesta.data;
      
      // Filtramos: Solo reservas de esta propiedad que estén COMPLETADAS
      const filtradas = misReservas.filter(r => {
        const idProp = r.propiedadId || r.PropiedadId;
        const estado = r.estado || r.Estado;
        return Number(idProp) === Number(propiedadId) && estado === 'Completada';
      });

      // Cruce de datos: Solo las que NO aparecen en la lista de reseñas
      const pendientes = filtradas.filter(reserva => {
        const idReserva = reserva.id || reserva.Id;
        return !resenasExistentes.some(resena => (resena.reservaId || resena.ReservaId) === idReserva);
      });

      // Ordenamos por fecha (más reciente primero)
      pendientes.sort((a, b) => new Date(b.fechaFin || b.FechaFin) - new Date(a.fechaFin || a.FechaFin));

      setReservasPendientes(pendientes);
      if (pendientes.length > 0) {
        setReservaSeleccionada(pendientes[0]);
      }
    } catch (err) {
      console.error("Error verificando estadias:", err);
    } finally {
      setCargandoValidacion(false);
    }
  };

  // Efecto inicial coordinado
  useEffect(() => {
    const inicializar = async () => {
      if (propiedadId) {
        const resenas = await cargarResenas();
        await verificarEstadias(resenas);
      }
    };
    inicializar();
  }, [propiedadId, estaAutenticado]);

  const enviarResena = async (e) => {
    e.preventDefault();
    if (!reservaSeleccionada) return;

    setCargando(true);
    setError('');

    try {
      const idReserva = reservaSeleccionada.id || reservaSeleccionada.Id;

      await api.post('/Resena', {
        reservaId: parseInt(idReserva),
        calificacion: parseInt(formData.calificacion),
        comentario: formData.comentario
      });
      
      alert("¡Reseña publicada! Gracias por tu opinión. 🌟");
      
      // Limpiamos y refrescamos todo el componente
      setFormData({ calificacion: 5, comentario: '' });
      const nuevasResenas = await cargarResenas();
      await verificarEstadias(nuevasResenas);
      
    } catch (err) {
      const resp = err.response?.data;
      setError(resp?.error?.message || "Error al publicar la reseña.");
    } finally {
      setCargando(false);
    }
  };

  const renderEstrellasEstaticas = (calificacion) => (
    <div style={{ color: '#FF5A5F', letterSpacing: '2px', fontSize: '1rem' }}>
      {'★'.repeat(calificacion)}
      <span style={{ color: '#e4e5e9' }}>{'★'.repeat(5 - calificacion)}</span>
    </div>
  );

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div style={{ marginTop: '3rem', borderTop: '1px solid #ebebeb', paddingTop: '2.5rem', fontFamily: 'Arial, sans-serif' }}>
      
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <span style={{ color: '#FF5A5F' }}>★</span> 
        {datosResenas.promedioCalificacion?.toFixed(1) || '0.0'} · {datosResenas.totalResenas} reseñas
      </h2>

      {/* Formulario Dinámico */}
      {estaAutenticado && !cargandoValidacion && (
        reservasPendientes.length > 0 ? (
          <div style={{ backgroundColor: '#ffffff', padding: '1.8rem', borderRadius: '16px', border: '1px solid #ddd', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '600' }}>Deja tu reseña</h3>
            
            {/* Información de la reserva que se está calificando */}
            <p style={{ fontSize: '0.9rem', color: '#717171', marginBottom: '1.5rem' }}>
                {reservasPendientes.length > 1 
                    ? `Tienes ${reservasPendientes.length} estancias pendientes. Calificando la del ${formatearFecha(reservaSeleccionada.fechaInicio || reservaSeleccionada.FechaInicio)}:` 
                    : `Calificando tu estancia del ${formatearFecha(reservaSeleccionada.fechaInicio || reservaSeleccionada.FechaInicio)}:`}
            </p>
            
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
              
              <textarea name="comentario" value={formData.comentario} onChange={(e) => setFormData({...formData, comentario: e.target.value})} required placeholder="¿Cómo fue tu experiencia?" maxLength="200" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #b0b0b0', fontSize: '1rem', outline: 'none', height: '100px', resize: 'none', boxSizing: 'border-box' }} />

              <button type="submit" disabled={cargando} style={{ padding: '0.8rem 2rem', backgroundColor: '#FF5A5F', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', alignSelf: 'flex-start' }}>
                {cargando ? 'Publicando...' : 'Publicar'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '16px', textAlign: 'center', marginBottom: '2.5rem', border: '1px solid #eee' }}>
            <p style={{ color: '#717171', fontSize: '0.95rem', margin: 0 }}>
                {estaAutenticado && datosResenas.resenas.some(r => r.nombreHuesped === usuario?.nombre) 
                    ? "¡Gracias por tus reseñas! Ya has calificado todas tus estancias en esta propiedad." 
                    : "Debes haber completado una estancia aquí para poder dejar una reseña."}
            </p>
          </div>
        )
      )}

      {/* Lista de reseñas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
        {datosResenas.resenas.length === 0 ? (
          <p style={{ color: '#717171' }}>Sin opiniones aún.</p>
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