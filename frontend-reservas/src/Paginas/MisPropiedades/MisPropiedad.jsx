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
  
  // 🛠️ NUEVOS ESTADOS PARA BLOQUEO (Sin tocar los anteriores)
  const [bloqueoActivo, setBloqueoActivo] = useState(null); 
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
        // Mantenemos tu ruta original /Buscar
        const respuesta = await api.get('/Propiedad/Buscar');
        const userId = usuario?.id || usuario?.nameid;
        
        // Mantenemos tu lógica de filtrado exacta
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

  // 🛠️ NUEVA FUNCIÓN PARA BLOQUEAR (Conecta con tu backend)
  const manejarConfirmarBloqueo = async (e) => {
    e.preventDefault();
    if (!fechasBloqueo.inicio || !fechasBloqueo.fin) {
      return toast.error("Selecciona ambas fechas.");
    }

    try {
      await api.post('/FechaBloqueada', {
        propiedadId: bloqueoActivo.id,
        fechaInicio: fechasBloqueo.inicio,
        fechaFin: fechasBloqueo.fin
      });
      toast.success(`Fechas bloqueadas para: ${bloqueoActivo.titulo}`);
      setBloqueoActivo(null);
      setFechasBloqueo({ inicio: '', fin: '' });
    } catch (err) {
      mostrarErrorApi(err);
    }
  };

  const abrirPanelBloqueo = (id, titulo) => {
    setBloqueoActivo({ id, titulo });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Mantenemos tu Helper de imagen intacto
  const obtenerUrlImagen = (ruta) => {
    if (!ruta) return 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c';
    if (ruta.startsWith('http')) return ruta;
    const rutaLimpia = ruta.replace(/\\/g, '/').replace('wwwroot/', '').replace('~', '');
    return `http://localhost:5085${rutaLimpia.startsWith('/') ? rutaLimpia : '/' + rutaLimpia}`;
  };

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

        {/* 🛠️ PANEL DE BLOQUEO (Se inserta aquí) */}
        {bloqueoActivo && (
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '2px solid #ff385c', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0 }}>Bloquear fechas: {bloqueoActivo.titulo}</h3>
            <form onSubmit={manejarConfirmarBloqueo} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>Desde:</label>
                <input type="date" value={fechasBloqueo.inicio} onChange={(e) => setFechasBloqueo({...fechasBloqueo, inicio: e.target.value})} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>Hasta:</label>
                <input type="date" value={fechasBloqueo.fin} onChange={(e) => setFechasBloqueo({...fechasBloqueo, fin: e.target.value})} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ backgroundColor: '#ff385c', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Confirmar Bloqueo</button>
                <button type="button" onClick={() => setBloqueoActivo(null)} style={{ background: 'none', border: 'none', color: '#717171', cursor: 'pointer', textDecoration: 'underline' }}>Cancelar</button>
              </div>
            </form>
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
              onBlock={abrirPanelBloqueo} // 🛠️ Pasamos la función a la tarjeta
            />
          ))}
        </div>
      </div>
    </div>
  );
}