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
        
        // 🚨 FIX: Convertimos ambos lados a String para que "1" sea igual a 1
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
               image={prop.fotos && prop.fotos.length > 0 ? prop.fotos[0].url : 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c'} 
             />
          ))}
        </div>
      </div>
    </div>
  );
}