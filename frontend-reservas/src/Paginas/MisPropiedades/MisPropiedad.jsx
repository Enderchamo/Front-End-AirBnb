import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../Components/NavBar';
import PropertyCard from '../../Components/PropertyCard';
import { useAuth } from '../../Context/AuthContext.jsx';
import styles from './MisPropiedades.module.css';

export default function MisPropiedades() {
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const { estaAutenticado, usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!estaAutenticado || (!usuario?.esHost && !usuario?.EsHost)) {
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
  }, [estaAutenticado, usuario, navigate]);

  // 🛠️ FUNCIÓN PARA ARREGLAR LA URL DE LA IMAGEN
  const obtenerUrlImagen = (ruta) => {
    // Si no hay imagen, mostramos una por defecto
    if (!ruta) return 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c';
    // Si ya viene con http (como las de unsplash), la dejamos igual
    if (ruta.startsWith('http')) return ruta;
    // Si es una ruta local del backend, le pegamos el localhost:5085
    return `http://localhost:5085${ruta.startsWith('/') ? '' : '/'}${ruta}`;
  };

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
        
        {cargando && <p style={{ fontSize: '1.2rem' }}>⏳ Cargando tus listados...</p>}
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
               /* 👇 Usamos la nueva función con la propiedad correcta (imagenUrl) */
               image={obtenerUrlImagen(prop.imagenUrl || prop.ImagenUrl)} 
             />
          ))}
        </div>
      </div>
    </div>
  );
}