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

  const obtenerUrlImagen = (ruta) => {
    if (!ruta) return 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c';
    if (ruta.startsWith('http')) return ruta;

    let rutaLimpia = ruta.replace(/\\/g, '/');
    if (rutaLimpia.includes('wwwroot/')) {
      rutaLimpia = rutaLimpia.split('wwwroot/')[1];
    }
    rutaLimpia = rutaLimpia.replace('~', '');
    if (!rutaLimpia.startsWith('/')) {
      rutaLimpia = '/' + rutaLimpia;
    }

    return `http://localhost:5085${rutaLimpia}`;
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
        
        {/* 🕵️‍♂️ MODO DETECTIVE: Esto imprimirá los datos puros en pantalla */}
        <div style={{ background: '#ffe6e6', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
            <h4 style={{ color: 'red', margin: '0 0 0.5rem 0' }}>🔍 Datos recibidos de C#:</h4>
            {propiedades.map((p, index) => (
                <p key={index} style={{ fontSize: '0.85rem', margin: '0.2rem 0', fontFamily: 'monospace' }}>
                    <strong>{p.titulo || p.Titulo}:</strong> {p.imagenUrl || p.ImagenUrl ? `Ruta guardada -> ${p.imagenUrl || p.ImagenUrl}` : "⚠️ LA RUTA ES NULL (Vacía)"}
                </p>
            ))}
        </div>

        {cargando && <p style={{ fontSize: '1.2rem' }}>⏳ Cargando tus listados...</p>}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.grid}>
          {propiedades.map(prop => (
             <PropertyCard 
               key={prop.id} 
               id={prop.id}
               title={prop.titulo || prop.Titulo} 
               details={`$${prop.precioPorNoche || prop.PrecioPorNoche} por noche - ${prop.ubicacion || prop.Ubicacion}`} 
               rating={5.0}
               image={obtenerUrlImagen(prop.imagenUrl || prop.ImagenUrl)} 
             />
          ))}
        </div>
      </div>
    </div>
  );
}