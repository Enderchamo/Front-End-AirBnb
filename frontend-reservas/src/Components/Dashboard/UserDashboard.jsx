import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../Context/AuthContext.jsx';
import styles from './UserDashboard.module.css';

export default function UserDashboard() {
  const { usuario, estaAutenticado } = useAuth();
  const [tabActual, setTabActual] = useState('inicio');
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!estaAutenticado || tabActual === 'inicio') return;

    const cargarDatos = async () => {
      setCargando(true);
      try {
        if (tabActual === 'reservas') {
          const res = await api.get('/Reservas/mis-reservas');
          setDatos(res.data);
        } else if (tabActual === 'propiedades') {
          const res = await api.get('/Propiedad/Buscar'); 
          // Filtramos en el front si el backend no tiene el filtro por hostId aún
          const misPropiedades = res.data.filter(p => p.hostId === usuario?.id || p.HostId === usuario?.id);
          setDatos(misPropiedades);
        }
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [tabActual, estaAutenticado, usuario]);

  if (!estaAutenticado) return null;

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <button 
          className={tabActual === 'inicio' ? styles.tabActive : styles.tab} 
          onClick={() => setTabActual('inicio')}
        >
          🏠 Inicio
        </button>

        {/* Forzamos la vista de opciones según el rol del usuario [cite: 12, 13, 14, 204, 205] */}
        {(usuario?.esGuest || usuario?.EsGuest) && (
          <button 
            className={tabActual === 'reservas' ? styles.tabActive : styles.tab} 
            onClick={() => setTabActual('reservas')}
          >
            🧳 Mis Viajes
          </button>
        )}

        {(usuario?.esHost || usuario?.EsHost) && (
          <button 
            className={tabActual === 'propiedades' ? styles.tabActive : styles.tab} 
            onClick={() => setTabActual('propiedades')}
          >
            🔑 Mis Propiedades
          </button>
        )}
      </nav>

      <div className={styles.content}>
        {tabActual === 'inicio' && (
          <div className={styles.welcome}>
            <h2>¡Bienvenido, {usuario?.nombre || 'Viajero'}! 👋</h2>
            <p>Gestiona tus estancias y propiedades desde este panel.</p>
          </div>
        )}

        {cargando ? (
          <p className={styles.loader}>Cargando información...</p>
        ) : (
          <div className={styles.grid}>
            {tabActual === 'reservas' && datos.map(r => (
              <div key={r.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.badge}>RESERVA #{r.id}</span>
                  <span className={styles.status}>{r.estado}</span>
                </div>
                <p>📅 {new Date(r.fechaEntrada).toLocaleDateString()} - {new Date(r.fechaSalida).toLocaleDateString()} [cite: 9, 10]</p>
                <small>ID necesario para reseña: <strong>{r.id}</strong></small>
              </div>
            ))}

            {tabActual === 'propiedades' && datos.map(p => (
              <div key={p.id} className={styles.card}>
                <h4>{p.titulo || p.Titulo}</h4>
                <p>📍 {p.ubicacion || p.Ubicacion} [cite: 3, 4]</p>
                <p>💰 ${p.precioPorNoche || p.PrecioPorNoche} / noche [cite: 5, 6]</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}