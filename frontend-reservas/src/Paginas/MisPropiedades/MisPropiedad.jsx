import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../Components/NavBar';
import PropertyCard from '../../Components/PropertyCard';
import { useAuth } from '../../Context/AuthContext.jsx';
import styles from './MisPropiedades.module.css';
import toast from 'react-hot-toast';

export default function MisPropiedades() {
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  // 1. Agregamos cargandoAuth para evitar el rebote al Home
  const { estaAutenticado, usuario, cargandoAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 2. Solo actuamos si la autenticación ha terminado de cargar
    if (!cargandoAuth) {
      const rolNet = usuario?.role || usuario?.Role || usuario?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const esAnfitrion = usuario?.esHost || usuario?.EsHost || rolNet === 'Host' || rolNet === 'Anfitrion';

      if (!estaAutenticado || !esAnfitrion) {
        navigate('/');
        return;
      }

      const cargarMisPropiedades = async () => {
        try {
          const respuesta = await api.get('/Propiedad/Buscar');
          const misPropiedades = respuesta.data.filter(p => 
            String(p.hostId) === String(usuario?.id) || 
            String(p.HostId) === String(usuario?.id)
          );
          setPropiedades(misPropiedades);
        } catch (err) {
          console.error("Error al cargar propiedades:", err);
          setError("No se pudieron cargar tus propiedades.");
        } finally {
          setCargando(false);
        }
      };

      cargarMisPropiedades();
    }
  }, [estaAutenticado, usuario, cargandoAuth, navigate]);

  const manejarBorrar = async (id, titulo) => {
    const confirmar = window.confirm(`¿Seguro que quieres borrar "${titulo}"?`);
    if (!confirmar) return;

    try {
      await api.delete(`/Propiedad/${id}`);
      setPropiedades(propiedades.filter(p => p.id !== id));
      toast.success("Propiedad eliminada con éxito");
    } catch (err) {
      console.error("Error al borrar:", err);
      toast.error("Error al intentar borrar la propiedad");
    }
  };

  const obtenerUrlImagen = (ruta) => {
    if (!ruta) return 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c';
    if (ruta.startsWith('http')) return ruta;
    let rutaLimpia = ruta.replace(/\\/g, '/');
    if (rutaLimpia.includes('wwwroot/')) {
      rutaLimpia = rutaLimpia.split('wwwroot/')[1];
    }
    rutaLimpia = rutaLimpia.replace('~', '');
    if (!rutaLimpia.startsWith('/')) rutaLimpia = '/' + rutaLimpia;
    return `http://localhost:5085${rutaLimpia}`;
  };

  // 3. Mientras verifica la sesión, mostramos un estado de carga
  if (cargandoAuth) {
    return <div style={{ textAlign: 'center', marginTop: '5rem' }}>Verificando sesión...</div>;
  }

  return (
    <div className={styles.contenedor}>
      <Navbar />
      <div className={styles.contenido}>
        <div className={styles.headerFlex}>
           <h1 className={styles.titulo}>Mis Propiedades</h1>
           <button className={styles.btnPublicar} onClick={() => navigate('/crear-propiedad')}>
             Publicar Nueva
           </button>
        </div>
        
        {cargando && propiedades.length === 0 && <p style={{ fontSize: '1.2rem' }}>⏳ Cargando tus listados...</p>}
        {error && <p className={styles.error}>{error}</p>}
        
        {!cargando && !error && propiedades.length === 0 && (
          <p className={styles.mensajeVacio}>Aún no has publicado ninguna propiedad.</p>
        )}

        <div className={styles.grid}>
          {propiedades.map(prop => (
             <PropertyCard 
               key={prop.id} 
               id={prop.id}
               title={prop.titulo || prop.Titulo} 
               details={`$${prop.precioPorNoche || prop.PrecioPorNoche} por noche - ${prop.ubicacion || prop.Ubicacion}`} 
               rating={5.0}
               image={obtenerUrlImagen(prop.imagenUrl || prop.ImagenUrl)}
               onDelete={() => manejarBorrar(prop.id, prop.titulo || prop.Titulo)} 
             />
          ))}
        </div>
      </div>
    </div>
  );
}