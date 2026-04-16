import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Inicio.module.css';
import PropertyCard from '../../Components/PropertyCard'; 
import Navbar from '../../Components/NavBar';
import Hero from '../../Components/Hero';
import Categorias from '../../Components/Categorias';

export default function Inicio() {
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);

  const buscarPropiedades = async (filtros = {}) => {
    setCargando(true);
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
    } catch (error) {
      console.error("Error al obtener las propiedades:", error);
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
      <Categorias /> {/* Volvemos a las categorías originales */}

      <div className={styles.cuerpoPadding}>
        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Todas las Cabañas Disponibles</h2>
          </div>

          {cargando ? (
            <p style={{ textAlign: 'center', fontSize: '1.5rem' }}>⏳ Buscando propiedades...</p>
          ) : (
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