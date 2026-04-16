import styles from './Categorias.module.css';

// Nuestra base de datos de categorías
const listaDeCategorias = [
  { nombre: 'All', icono: '✨' },
  { nombre: 'Lakefront', icono: '🌊' },
  { nombre: 'National Parks', icono: '🌲' },
  { nombre: 'Cabins', icono: '🪵' },
  { nombre: 'Islands', icono: '🏝️' },
  { nombre: 'Beach', icono: '🏖️' },
  { nombre: 'Tiny Homes', icono: '🛖' },
  { nombre: 'Camping', icono: '⛺' }
];

export default function Categorias() {
  return (
    <div className={styles.contenedor}>
      
      {/* Zona izquierda: Lista deslizable de iconos */}
      <div className={styles.listaCategorias}>
        {listaDeCategorias.map((cat, index) => (
          <div 
            key={index} 
            // Si es el primero ("All"), le ponemos la clase activa para que resalte
            className={`${styles.item} ${index === 0 ? styles.itemActivo : ''}`}
          >
            <span className={styles.icono}>{cat.icono}</span>
            <span className={styles.etiqueta}>{cat.nombre}</span>
          </div>
        ))}
      </div>

      {/* Zona derecha: Botón de Filtros */}
      <button className={styles.botonFiltros}>
        {/* Ícono de filtros en SVG */}
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style={{display: 'block', height: '14px', width: '14px', fill: 'currentColor'}}><path d="M5 8c1.306 0 2.418.835 2.83 2H14v2H7.829A3.001 3.001 0 1 1 5 8zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6-8a3 3 0 1 1-2.829 4H2V4h6.17A3.001 3.001 0 0 1 11 2zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path></svg>
        Filters
      </button>

    </div>
  );
}