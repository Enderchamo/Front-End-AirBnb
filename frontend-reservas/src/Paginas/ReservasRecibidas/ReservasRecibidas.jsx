// src/Paginas/ReservasRecibidas/ReservasRecibidas.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../Context/AuthContext';
import { mostrarErrorApi } from '../src/utils/manejarErrorApi';
import Navbar from '../../Components/NavBar';
import styles from './ReservasRecibidas.module.css';
import toast from 'react-hot-toast';

export default function ReservasRecibidas() {
  const { estaAutenticado, usuario, cargandoAuth } = useAuth();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!cargandoAuth && (!estaAutenticado || !usuario?.esHost)) {
      navigate('/');
      return;
    }

    cargarReservas();
  }, [estaAutenticado, cargandoAuth, usuario, navigate]);

  const cargarReservas = async () => {
    try {
      const respuesta = await api.get('/Reservas/recibidas');
      setReservas(respuesta.data);
    } catch (error) {
      mostrarErrorApi(error, 'Cargar Reservas Recibidas');
    } finally {
      setCargando(false);
    }
  };

  const manejarAccion = async (id, accion) => {
    const confirmacion = window.confirm(`¿Estás seguro de que deseas ${accion} esta reserva?`);
    if (!confirmacion) return;

    try {
      toast.loading(`Procesando...`, { id: 'accionReserva' });
      
      // Llama a tu endpoint HttpPatch de cancelar o completar
      await api.patch(`/Reservas/${id}/${accion}`);
      
      toast.success(`Reserva ${accion}ada con éxito`, { id: 'accionReserva' });
      cargarReservas(); // Recargamos la lista
    } catch (error) {
      mostrarErrorApi(error, `${accion} reserva`);
    }
  };

  const formatearFecha = (fechaString) => {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
  };

  if (cargando || cargandoAuth) return <div className={styles.cargando}>Cargando reservas...</div>;

  return (
    <div className={styles.contenedor}>
      <Navbar />
      <div className={styles.contenido}>
        <h1 className={styles.titulo}>Reservas de mis huéspedes</h1>
        
        {reservas.length === 0 ? (
          <p className={styles.sinReservas}>Aún no tienes reservas en tus propiedades.</p>
        ) : (
          <div className={styles.gridReservas}>
            {reservas.map(reserva => (
              <div key={reserva.id || reserva.Id} className={styles.tarjeta}>
                <div className={styles.cabeceraTarjeta}>
                  <h3>{reserva.propiedadTitulo || 'Tu Propiedad'}</h3>
                  <span className={`${styles.estado} ${styles[reserva.estado?.toLowerCase() || 'pendiente']}`}>
                    {reserva.estado || 'Pendiente'}
                  </span>
                </div>
                
                <div className={styles.detalles}>
                  <p><strong>Huésped:</strong> {reserva.nombreHuesped || reserva.usuarioInvitado?.nombre || 'Usuario'}</p>
                  <p><strong>Llegada:</strong> {formatearFecha(reserva.fechaEntrada || reserva.FechaEntrada)}</p>
                  <p><strong>Salida:</strong> {formatearFecha(reserva.fechaSalida || reserva.FechaSalida)}</p>
                  <p><strong>Total:</strong> ${reserva.precioTotal || reserva.PrecioTotal}</p>
                </div>

                {/* Botones de acción según el estado */}
                <div className={styles.acciones}>
                  {(reserva.estado === 'Pendiente' || reserva.estado === 'Confirmada') && (
                    <>
                      <button 
                        className={styles.btnCompletar} 
                        onClick={() => manejarAccion(reserva.id || reserva.Id, 'completar')}
                      >
                        Marcar Completada
                      </button>
                      <button 
                        className={styles.btnCancelar} 
                        onClick={() => manejarAccion(reserva.id || reserva.Id, 'cancelar')}
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}