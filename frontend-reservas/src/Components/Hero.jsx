import { useState } from 'react';
import styles from './Hero.module.css';

// Agregamos la "prop" onSearch para avisarle a la página principal cuándo buscar
export default function Hero({ onSearch }) {
  // Estados para guardar lo que escribe el usuario
  const [ubicacion, setUbicacion] = useState('');
  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [capacidad, setCapacidad] = useState('');

  // Función que se ejecuta al darle clic a la lupa
  const manejarBusqueda = () => {
    // Empaquetamos los datos exactamente como los pide tu Swagger
    const filtros = {
      ubicacion: ubicacion,
      fechaEntrada: fechaEntrada,
      fechaSalida: fechaSalida,
      capacidadMinimas: capacidad
    };
    
    // Le enviamos los filtros al Inicio.jsx
    onSearch(filtros);
  };

  return (
    <div className={styles.hero}>
      <div className={styles.overlay}>
        
        <p className={styles.subtitle}>Find Your Dream Place</p>
        <h1 className={styles.title}>For Better Experience</h1>

        <div className={styles.searchBar}>
          
          <div className={styles.inputGroup}>
            <label>Where</label>
            <input 
              type="text" 
              placeholder="Search destinations" 
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
            />
          </div>
          
          <div className={styles.divider}></div>
          
          <div className={styles.inputGroup}>
            <label>Check in</label>
            {/* Cambiamos a type="date" para que .NET lo lea sin problemas */}
            <input 
              type="date" 
              value={fechaEntrada}
              onChange={(e) => setFechaEntrada(e.target.value)}
            />
          </div>

          <div className={styles.divider}></div>
          
          <div className={styles.inputGroup}>
            <label>Check out</label>
            <input 
              type="date" 
              value={fechaSalida}
              onChange={(e) => setFechaSalida(e.target.value)}
            />
          </div>

          <div className={styles.divider}></div>
          
          <div className={styles.inputGroup}>
            <label>Who</label>
            {/* Cambiamos a type="number" porque tu backend pide un integer */}
            <input 
              type="number" 
              min="1" 
              placeholder="Add guests" 
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
            />
          </div>

          {/* Le agregamos el evento onClick al botón de la lupa */}
          <button className={styles.searchBtn} onClick={manejarBusqueda}>
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{display: 'block', fill: 'none', height: '16px', width: '16px', stroke: 'currentcolor', strokeWidth: '4', overflow: 'visible'}}><g fill="none"><path d="m13 24c6.0751322 0 11-4.9248678 11-11 0-6.07513225-4.9248678-11-11-11-6.07513225 0-11 4.92486775-11 11 0 6.0751322 4.92486775 11 11 11zm8-3 9 9"></path></g></svg>
          </button>
          
        </div>
      </div>
    </div>
  );
}