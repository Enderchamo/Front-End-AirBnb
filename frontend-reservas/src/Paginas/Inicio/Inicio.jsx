import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Inicio.module.css';
import PropertyCard from '../../Components/PropertyCard'; 
import Navbar from '../../Components/NavBar';
import Hero from '../../Components/Hero';

export default function Inicio() {
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false); // 1. Nuevo estado de error

  const buscarPropiedades = async (filtros = {}) => {
    setCargando(true);
    setError(false); // Reiniciamos el error al buscar
    try {
      const parametrosLimpios = {};
      if (filtros.ubicacion) parametrosLimpios.ubicacion = filtros.ubicacion;
      if (filtros.fechaEntrada) parametrosLimpios.fechaEntrada = filtros.fechaEntrada;
      if (filtros.fechaSalida) parametrosLimpios.fechaSalida = filtros.fechaSalida;
      if (filtros.capacidadMinimas) parametrosLimpios.capacidadMinimas = filtros.capacidadMinimas;

      const respuesta = await axios.get('http://localhost:5085/api/Propiedad/Buscar', {
        params: parametrosLimpios
      });
      setPropiedades(respuesta.data);
    } catch (err) {
      console.error("Error al obtener las propiedades:", err);
      setError(true); // 2. Activamos el error si la petición falla
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    buscarPropiedades();
  }, []);

  return (
    <div className={styles.contenedorPrincipal}>
      <Navbar />
      <Hero onSearch={buscarPropiedades} />
      
      <div className={styles.cuerpoPadding}>
        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Todas las Cabañas Disponibles</h2>
          </div>

          {/* 3. Lógica de renderizado condicional optimizada */}
          {cargando ? (
            <div className={styles.propertyGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage}></div>
                  <div className={styles.skeletonText}></div>
                  <div className={styles.skeletonTextShort}></div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* INTERFAZ DE ERROR DE CONEXIÓN */
            <div className={styles.errorContainer}>
              <span className={styles.errorIcon}>📡</span>
              <p className={styles.errorText}>No pudimos conectarnos con el servidor.</p>
              <button className={styles.retryBtn} onClick={() => buscarPropiedades()}>
                Reintentar conexión
              </button>
            </div>
          ) : propiedades.length === 0 ? (
            /* CASO: CONEXIÓN OK PERO SIN RESULTADOS */
            <p className={styles.noDataText}>No se encontraron propiedades que coincidan con tu búsqueda.</p>
          ) : (
            /* CASO ÉXITO: MOSTRAR GRILLA */
            <div className={styles.propertyGrid}>
              {propiedades.map(prop => (
                <PropertyCard 
                  key={prop.id} 
                  id={prop.id}
                  title={prop.titulo} 
                  details={`$${prop.precioPorNoche} por noche - ${prop.ubicacion}`} 
                  rating={5.0}
                  image={prop.fotos && prop.fotos.length > 0 ? prop.fotos[0].url : 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c'} 
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}