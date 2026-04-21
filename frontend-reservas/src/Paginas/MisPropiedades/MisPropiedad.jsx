import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../Context/AuthContext';
import { mostrarErrorApi } from '../src/utils/manejarErrorApi'; 
import Navbar from '../../Components/NavBar';
import PropertyCard from '../../Components/PropertyCard';
import styles from './MisPropiedades.module.css';
import toast from 'react-hot-toast';

export default function MisPropiedades() {
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // --- Estados para la gestión de bloqueos ---
  const [bloqueoActivo, setBloqueoActivo] = useState(null); 
  const [bloqueosExistentes, setBloqueosExistentes] = useState([]); 
  const [fechasBloqueo, setFechasBloqueo] = useState({ inicio: '', fin: '' });

  const { usuario, estaAutenticado, cargandoAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!cargandoAuth && (!estaAutenticado || !usuario?.esHost)) {
      navigate('/');
      return;
    }

    const cargarMisPropiedades = async () => {
      try {
        const respuesta = await api.get('/Propiedad/Buscar');
        const userId = usuario?.id || usuario?.nameid;
        const misProps = respuesta.data.filter(p => String(p.hostId || p.HostId) === String(userId));
        setPropiedades(misProps);
      } catch (err) {
        mostrarErrorApi(err);
      } finally {
        setCargando(false);
      }
    };

    if (usuario) cargarMisPropiedades();
  }, [usuario, estaAutenticado, cargandoAuth, navigate]);

  // --- Lógica de Gestión de Bloqueos ---

  const abrirPanelBloqueo = async (id, titulo) => {
    setBloqueoActivo({ id, titulo });
    try {
      const res = await api.get(`/FechaBloqueada/propiedad/${id}`);
      setBloqueosExistentes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar bloqueos", err);
      setBloqueosExistentes([]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const manejarConfirmarBloqueo = async (e) => {
    e.preventDefault();
    if (!fechasBloqueo.inicio || !fechasBloqueo.fin) return toast.error("Selecciona ambas fechas.");

    try {
      await api.post('/FechaBloqueada', {
        propiedadId: bloqueoActivo.id,
        fechaInicio: fechasBloqueo.inicio,
        fechaFin: fechasBloqueo.fin
      });
      toast.success("Fechas bloqueadas correctamente.");
      
      const res = await api.get(`/FechaBloqueada/propiedad/${bloqueoActivo.id}`);
      setBloqueosExistentes(res.data);
      setFechasBloqueo({ inicio: '', fin: '' });
    } catch (err) {
      mostrarErrorApi(err);
    }
  };

  const manejarQuitarBloqueo = async (bloqueoId) => {
    if (!bloqueoId) return toast.error("Error: ID de bloqueo no encontrado");
    if (!window.confirm("¿Estás seguro de que quieres liberar estas fechas?")) return;

    try {
      await api.delete(`/FechaBloqueada/${bloqueoId}`);
      toast.success("Bloqueo eliminado correctamente.");
      setBloqueosExistentes(prev => prev.filter(b => (b.id || b.Id) !== bloqueoId));
    } catch (err) {
      console.error("Error en el borrado:", err);
      mostrarErrorApi(err);
    }
  };

  const manejarBorrar = async (id, titulo) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${titulo}"?`)) return;
    try {
      await api.delete(`/Propiedad/${id}`);
      setPropiedades(propiedades.filter(p => p.id !== id));
      toast.success("Propiedad eliminada correctamente.");
    } catch (err) {
      mostrarErrorApi(err);
    }
  };

  const manejarEditar = (id) => navigate(`/editar-propiedad/${id}`);

  // 🛠️ FUNCIÓN DE IMAGEN BLINDADA
  const obtenerUrlImagen = (ruta) => {
    // Si no hay ruta O si la base de datos guardó un link de unsplash, mostrar el placeholder
    if (!ruta || ruta.includes('unsplash')) {
      return 'https://via.placeholder.com/400x300?text=Sin+Imagen+Disponible';
    }
    
    // Si es otro link de internet válido (cloudinary, amazon, etc), lo dejamos pasar
    if (ruta.startsWith('http')) return ruta;
    
    // Si es una imagen local del servidor C#
    const rutaLimpia = ruta.replace(/\\/g, '/').replace('wwwroot/', '').replace('~', '');
    return `http://localhost:5085${rutaLimpia.startsWith('/') ? rutaLimpia : '/' + rutaLimpia}`;
  };

  if (cargando) return <div className={styles.loading}>Cargando tus propiedades...</div>;

  return (
    <div className={styles.contenedor}>
      <Navbar />
      <div className={styles.contenido}>
        <div className={styles.headerFlex}>
          <h1>Mis Propiedades</h1>
          <button className={styles.btnPublicar} onClick={() => navigate('/crear-propiedad')}>
            Publicar Nueva
          </button>
        </div>

        {bloqueoActivo && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '15px', border: '2px solid #ff385c', marginBottom: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, fontSize: '1.5rem' }}>Disponibilidad: {bloqueoActivo.titulo}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
              
              <div style={{ borderRight: '1px solid #eee', paddingRight: '20px' }}>
                <h4 style={{ color: '#717171', marginBottom: '15px' }}>Bloqueos activos:</h4>
                {bloqueosExistentes.length === 0 ? (
                  <p style={{ color: '#999', fontStyle: 'italic' }}>No hay fechas bloqueadas.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {bloqueosExistentes.map(b => {
                      const idParaBorrar = b.id || b.Id; 
                      return (
                        <div key={idParaBorrar} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '10px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                            📅 {new Date(b.fechaInicio).toLocaleDateString()} - {new Date(b.fechaFin).toLocaleDateString()}
                          </span>
                          <button 
                            onClick={() => manejarQuitarBloqueo(idParaBorrar)}
                            style={{ background: 'none', border: 'none', color: '#ff385c', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Retirar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ color: '#717171', marginBottom: '15px' }}>Añadir nuevo bloqueo:</h4>
                <form onSubmit={manejarConfirmarBloqueo} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '5px' }}>Desde</label>
                      <input type="date" value={fechasBloqueo.inicio} onChange={(e) => setFechasBloqueo({...fechasBloqueo, inicio: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '5px' }}>Hasta</label>
                      <input type="date" value={fechasBloqueo.fin} onChange={(e) => setFechasBloqueo({...fechasBloqueo, fin: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" style={{ flex: 2, backgroundColor: '#222', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Bloquear Fechas</button>
                    <button type="button" onClick={() => setBloqueoActivo(null)} style={{ flex: 1, background: 'none', border: '1px solid #ddd', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>Cerrar</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className={styles.grid}>
          {propiedades.map(prop => (
            <PropertyCard 
              key={prop.id} 
              id={prop.id}
              title={prop.titulo || prop.Titulo} 
              details={`$${prop.precioPorNoche || prop.PrecioPorNoche} por noche`} 
              rating={5.0}
              image={obtenerUrlImagen(prop.imagenUrl || prop.ImagenUrl)}
              onEdit={manejarEditar}
              onDelete={manejarBorrar}
              onBlock={abrirPanelBloqueo} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}