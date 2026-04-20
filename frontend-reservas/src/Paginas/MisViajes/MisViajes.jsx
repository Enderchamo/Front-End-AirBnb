import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../Components/NavBar';
import { useAuth } from '../../Context/AuthContext.jsx';
import styles from './MisViajes.module.css';
import toast from 'react-hot-toast';

export default function MisViajes() {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login');
      return;
    }
    cargarMisViajes();
  }, [estaAutenticado, navigate]);

  // --- FUNCIÓN DE ACCIÓN CON PATCH Y LOGS ---
  const manejarAccion = async (id, accion) => {
    console.log(`%c [DEBUG] Ejecutando PATCH para: ${accion}`, 'background: #222; color: #3498db; padding: 2px 5px;');
    const loadingToast = toast.loading(`Procesando ${accion}...`);
    
    try {
      // Usamos api.patch según la definición de tu backend
      const url = `/Reservas/${id}/${accion}`;
      console.log(`[DEBUG] URL: ${api.defaults.baseURL}${url}`);
      
      const respuesta = await api.patch(url);
      
      console.log("%c [DEBUG] Éxito:", 'color: #2ecc71', respuesta.status);
      toast.success(`Reserva ${accion === 'cancelar' ? 'cancelada' : 'completada'}`, { id: loadingToast });
      cargarMisViajes();
    } catch (err) {
      console.error("%c [DEBUG] Error en PATCH:", 'color: #e74c3c', {
        status: err.response?.status,
        data: err.response?.data
      });
      toast.error(`Error al ${accion}. Revisa la consola.`, { id: loadingToast });
    }
  };

  return (
    <div className={styles.contenedor}>
      <Navbar />
      <div className={styles.contenido}>
        <h1 className={styles.titulo}>Mis Viajes</h1>
        
        {cargando && <p className={styles.textoInfo}>Buscando reservas...</p>}
        {error && <p className={styles.error}>{error}</p>}
        
        {!cargando && !error && reservas.length === 0 && (
          <p className={styles.textoInfo}>No tienes viajes programados actualmente.</p>
        )}

        <div className={styles.grid}>
          {reservas.map(reserva => (
            <div key={reserva.id} className={styles.tarjeta}>
              <div className={styles.tarjetaHeader}>
                <span className={styles.badge}>ID #{reserva.id}</span>
                <span className={`${styles.estado} ${styles[reserva.estado?.toLowerCase()] || ''}`}>
                  {reserva.estado}
                </span>
              </div>
              
              <div className={styles.infoReserva}>
                <p className={styles.propiedadNombre}>Propiedad: {reserva.propiedadId}</p>
                <p className={styles.fechas}>
                    {new Date(reserva.fechaEntrada).toLocaleDateString()} - {new Date(reserva.fechaSalida).toLocaleDateString()}
                </p>
              </div>
              
              {reserva.estado !== 'Completada' && reserva.estado !== 'Cancelada' && (
                <div className={styles.accionesReserva}>
                  <button 
                    onClick={() => manejarAccion(reserva.id, 'completar')} 
                    className={styles.btnCompletar}
                  >
                    Completar
                  </button>
                  <button 
                    onClick={() => manejarAccion(reserva.id, 'cancelar')} 
                    className={styles.btnCancelar}
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {reserva.estado === 'Completada' && (
                 <p className={styles.resenaLink}>Reserva finalizada con éxito</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}