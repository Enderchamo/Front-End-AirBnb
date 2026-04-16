import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../Components/NavBar';
import { useAuth } from '../../Context/AuthContext.jsx';
import styles from './MisViajes.module.css'; // Crearemos este archivo de estilos después

export default function MisViajes() {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const { estaAutenticado, usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login');
      return;
    }

    const cargarMisViajes = async () => {
      try {
        const respuesta = await api.get('/Reservas/mis-reservas');
        setReservas(respuesta.data);
      } catch (err) {
        console.error("Error al cargar reservas:", err);
        setError("No se pudieron cargar tus viajes.");
      } finally {
        setCargando(false);
      }
    };

    cargarMisViajes();
  }, [estaAutenticado, navigate]);

  return (
    <div className={styles.contenedor}>
      <Navbar />
      <div className={styles.contenido}>
        <h1 className={styles.titulo}>Mis Viajes 🧳</h1>
        
        {cargando && <p>Cargando tus aventuras...</p>}
        {error && <p className={styles.error}>{error}</p>}
        
        {!cargando && !error && reservas.length === 0 && (
          <p>Aún no tienes viajes programados. ¡Es hora de planear uno!</p>
        )}

        <div className={styles.grid}>
          {reservas.map(reserva => (
            <div key={reserva.id} className={styles.tarjeta}>
              <div className={styles.tarjetaHeader}>
                <span className={styles.badge}>Reserva #{reserva.id}</span>
                <span className={styles.estado}>{reserva.estado}</span>
              </div>
              <p><strong>Propiedad ID:</strong> {reserva.propiedadId}</p>
              <p>📅 {new Date(reserva.fechaEntrada).toLocaleDateString()} - {new Date(reserva.fechaSalida).toLocaleDateString()}</p>
              
              {reserva.estado === 'Completada' && (
                 <p className={styles.hint}>¡Puedes usar el ID #{reserva.id} para dejar una reseña!</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}