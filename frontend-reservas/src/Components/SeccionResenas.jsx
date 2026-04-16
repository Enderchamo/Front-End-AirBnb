import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../Context/AuthContext';

export default function SeccionResenas({ propiedadId }) {
  const { usuario, estaAutenticado } = useAuth();
  const [datosResenas, setDatosResenas] = useState({ promedioCalificacion: 0, totalResenas: 0, resenas: [] });
  
  const [formData, setFormData] = useState({ reservaId: '', calificacion: 5, comentario: '' });
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

  useEffect(() => {
    if (propiedadId) cargarResenas();
  }, [propiedadId]);

  const manejarCambio = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const enviarResena = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      await api.post('/Resena', {
        reservaId: parseInt(formData.reservaId),
        calificacion: parseInt(formData.calificacion),
        comentario: formData.comentario
      });
      
      alert("¡Reseña publicada con éxito! 🌟");
      setFormData({ reservaId: '', calificacion: 5, comentario: '' }); 
      cargarResenas(); 
      
    } catch (err) {
      const data = err.response?.data;
      if (data?.errores) setError(data.errores.join(" | "));
      else if (data?.error) setError(data.error);
      else setError("Ocurrió un error al enviar la reseña.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
      
      <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#FF5A5F' }}>★</span> 
        {datosResenas.promedioCalificacion} · {datosResenas.totalResenas} reseñas
      </h2>

      {/* Formulario solo para Guests logueados */}
      {estaAutenticado && !usuario?.esHost && (
        <div style={{ backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '15px', marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Deja tu reseña</h3>
          {error && <p style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</p>}
          
          <form onSubmit={enviarResena} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold' }}>ID de tu Reserva</label>
                <input type="number" name="reservaId" value={formData.reservaId} onChange={manejarCambio} required placeholder="Ej: 5" style={estiloInput} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold' }}>Calificación</label>
                <select name="calificacion" value={formData.calificacion} onChange={manejarCambio} style={estiloInput}>
                  <option value="5">5 - Excelente 🤩</option>
                  <option value="4">4 - Muy bueno 🙂</option>
                  <option value="3">3 - Normal 😐</option>
                  <option value="2">2 - Malo 😕</option>
                  <option value="1">1 - Pésimo 😠</option>
                </select>
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold' }}>Comentario</label>
              <textarea name="comentario" value={formData.comentario} onChange={manejarCambio} required placeholder="¿Cómo fue tu estancia?" maxLength="200" style={{ ...estiloInput, height: '80px', resize: 'none' }} />
            </div>

            <button type="submit" disabled={cargando} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#222', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-start' }}>
              {cargando ? 'Publicando...' : 'Publicar Reseña'}
            </button>
          </form>
        </div>
      )}

      {/* Lista de Reseñas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        {datosResenas.resenas.length === 0 ? (
          <p style={{ color: '#666' }}>Aún no hay reseñas para esta propiedad.</p>
        ) : (
          datosResenas.resenas.map((resena) => (
            <div key={resena.id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#ddd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>G</div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Huésped</div>
                  <div style={{ color: '#FF5A5F', fontSize: '0.9rem' }}>{'★'.repeat(resena.calificacion)}{'☆'.repeat(5 - resena.calificacion)}</div>
                </div>
              </div>
              <p style={{ color: '#444', lineHeight: '1.5' }}>{resena.comentario}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const estiloInput = { width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', marginTop: '0.3rem', boxSizing: 'border-box' };