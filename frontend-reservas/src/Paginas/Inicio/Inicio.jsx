// src/Paginas/Inicio/Inicio.jsx
import { useState, useEffect } from 'react';
import api from '../../api/axios'; 
import { mostrarErrorApi } from '../src/utils/manejarErrorApi'; // Ruta corregida
import styles from './Inicio.module.css';
import PropertyCard from '../../Components/PropertyCard'; 
import Hero from '../../Components/Hero';

export default function Inicio() {
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const buscarPropiedades = async (filtros = {}) => {
    setCargando(true);
    setError(false);
    try {
      const parametrosLimpios = {};
      if (filtros.ubicacion) parametrosLimpios.ubicacion = filtros.ubicacion;
      if (filtros.fechaEntrada) parametrosLimpios.fechaEntrada = filtros.fechaEntrada;
      if (filtros.fechaSalida) parametrosLimpios.fechaSalida = filtros.fechaSalida;
      if (filtros.capacidadMinimas) parametrosLimpios.capacidadMinimas = filtros.capacidadMinimas;

      const respuesta = await api.get('/Propiedad/Buscar', {
        params: parametrosLimpios
      });
      setPropiedades(respuesta.data);
    } catch (err) {
      mostrarErrorApi(err, 'error-buscar-propiedades');
      setError(true);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    buscarPropiedades();
  }, []);

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

  return (
    <div className={styles.contenedorPrincipal}>
      {/* 🛑 Navbar eliminado de aquí */}
      <Hero onSearch={buscarPropiedades} />
      
      <div className={styles.cuerpoPadding}>
        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Todas las Cabañas Disponibles</h2>
          </div>

          {cargando ? (
            <div className={styles.propertyGrid}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage}></div>
                  <div className={styles.skeletonText}></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p>No pudimos conectarnos con el servidor.</p>
              <button onClick={() => buscarPropiedades()}>Reintentar</button>
            </div>
          ) : (
            <div className={styles.propertyGrid}>
              {propiedades.map(prop => (
                <PropertyCard 
                  key={prop.id} 
                  id={prop.id}
                  title={prop.titulo || prop.Titulo} 
                  details={`$${prop.precioPorNoche || prop.PrecioPorNoche} por noche`} 
                  image={obtenerUrlImagen(prop.imagenUrl || prop.ImagenUrl)} 
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}