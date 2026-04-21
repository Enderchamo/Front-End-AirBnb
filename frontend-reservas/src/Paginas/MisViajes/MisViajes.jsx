// src/Paginas/MisViajes/MisViajes.jsx
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
  
  // 🛠️ IMPORTANTE: Extraemos 'cargandoAuth'
  const { estaAutenticado, cargandoAuth } = useAuth(); 
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
    // 🛠️ PASO 1: Si el contexto aún está verificando el token, no hacemos nada
    if (cargandoAuth) return;

    // 🛠️ PASO 2: Si ya terminó de cargar y NO está autenticado, ahí sí redirigimos
    if (!estaAutenticado) {
      navigate('/login');
      return;
    }

    // 🛠️ PASO 3: Si está autenticado, cargamos los datos
    cargarMisViajes();
  }, [estaAutenticado, cargandoAuth, navigate]);

  // 🛠️ PASO 4: Mientras el AuthContext verifica el token, mostramos un estado de espera
  // Esto evita que el componente intente cargar datos sin tener el token listo.
  if (cargandoAuth) {
    return <div className={styles.contenedor}><p className={styles.textoInfo}>Verificando sesión...</p></div>;
  }

  const manejarAccion = async (id, accion) => {
    console.log(`%c [DEBUG] Ejecutando PATCH para: ${accion}`, 'background: #222; color: #3498db; padding: 2px 5px;');
    const loadingToast = toast.loading(`Procesando ${accion}...`);
    
    try {
      const url = `/Reservas/${id}/${accion}`;
      const respuesta = await api.patch(url);
      
      toast.success(`Reserva ${accion === 'cancelar' ? 'cancelada' : 'completada'}`, { id: loadingToast });
      cargarMisViajes();
    } catch (err) {
      toast.error(`Error al ${accion}.`, { id: loadingToast });
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
                <p className={styles.propiedadNombre}>
                  Propiedad: {reserva.propiedadTitulo || reserva.propiedadId}
                </p>
                <p className={styles.fechas}>
                    {new Date(reserva.fechaEntrada).toLocaleDateString()} - {new Date(reserva.fechaSalida).toLocaleDateString()}
                </p>
              </div>
              
              {reserva.estado !== 'Completada' && reserva.estado !== 'Cancelada' && (
                <div className={styles.accionesReserva}>
                  <button onClick={() => manejarAccion(reserva.id, 'completar')} className={styles.btnCompletar}>Completar</button>
                  <button onClick={() => manejarAccion(reserva.id, 'cancelar')} className={styles.btnCancelar}>Cancelar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}