// src/Paginas/DetallePropiedad/DetallePropiedad.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios'; 
import { useAuth } from '../../Context/AuthContext';
import { mostrarErrorApi } from '../src/utils/manejarErrorApi'; // Ruta corregida
import Navbar from '../../Components/NavBar';
import SeccionResenas from '../../Components/SeccionResenas';
import styles from './DetallePropiedad.module.css';
import toast from 'react-hot-toast';

export default function DetallePropiedad() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { usuario, estaAutenticado, cargandoAuth } = useAuth();
  
  const [propiedad, setPropiedad] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [procesandoReserva, setProcesandoReserva] = useState(false);

  // Fecha mínima: Mañana (Evita el error 400 de "fecha mayor a hoy")
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const minFecha = manana.toISOString().split('T')[0];

  const obtenerUrlImagen = (ruta) => {
    if (!ruta) return 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2';
    if (ruta.startsWith('http')) return ruta;
    let rutaLimpia = ruta.replace(/\\/g, '/').replace('wwwroot/', '').replace('~', '');
    if (!rutaLimpia.startsWith('/')) rutaLimpia = '/' + rutaLimpia;
    return `http://localhost:5085${rutaLimpia}`;
  };

  useEffect(() => {
    api.get(`/Propiedad/${id}`)
      .then(res => {
        setPropiedad(res.data);
        setCargando(false);
      })
      .catch(err => {
        mostrarErrorApi(err, 'cargar-detalle-error');
        setCargando(false);
      });
  }, [id]);

  const manejarReserva = async () => {
    if (!estaAutenticado) {
      toast.error("Inicia sesión para reservar.");
      return navigate('/login');
    }

    if (!fechaEntrada || !fechaSalida) {
      return toast.error("Selecciona las fechas de tu estancia.");
    }

    setProcesandoReserva(true);

    try {
      const guestIdRaw = usuario?.id || 
                         usuario?.nameid || 
                         usuario?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

      const guestId = parseInt(guestIdRaw);

      if (isNaN(guestId)) {
        toast.error("Error: Sesión no válida. Intenta loguearte de nuevo.");
        setProcesandoReserva(false);
        return;
      }

      const payload = {
        propiedadId: parseInt(id),
        fechaEntrada: fechaEntrada,
        fechaSalida: fechaSalida,
        usuarioInvitadoId: guestId
      };

      await api.post('/Reservas', payload);
      
      toast.success("¡Reserva confirmada! 🎉");
      navigate('/mis-viajes');

    } catch (err) {
      console.error("ERROR 400:", err.response?.data);
      const errorData = err.response?.data?.error;
      
      if (errorData?.validationErrors) {
        const primerError = Object.values(errorData.validationErrors).flat()[0];
        toast.error(primerError);
      } else {
        mostrarErrorApi(err, 'reserva-error');
      }
    } finally {
      setProcesandoReserva(false);
    }
  };

  if (cargando || cargandoAuth) return <div className={styles.loader}>Cargando...</div>;
  if (!propiedad) return <div className={styles.errorMsg}>No se encontró la propiedad.</div>;

  const titulo = propiedad.titulo || propiedad.Titulo;
  const ubicacion = propiedad.ubicacion || propiedad.Ubicacion;
  const capacidad = propiedad.capacidad || propiedad.Capacidad;
  const precio = propiedad.precioPorNoche || propiedad.PrecioPorNoche;
  const descripcion = propiedad.descripcion || propiedad.Descripcion;
  const nombreAnfitrion = propiedad.host?.nombre || propiedad.Host?.Nombre || "Anfitrión Certificado";

  return (
    <div className={styles.pagina}>
      <Navbar />
      <main className={styles.contenedorDetalle}>
        <header className={styles.cabecera}>
          <h1 className={styles.tituloPropiedad}>{titulo}</h1>
          <div className={styles.metaInfo}>
            <span>★ 5.0 · </span>
            <span className={styles.enlaceUbicacion}>{ubicacion}</span>
          </div>
        </header>

        <section className={styles.galeriaUnica}>
          <img 
            src={obtenerUrlImagen(propiedad.imagenUrl || propiedad.ImagenUrl)} 
            alt={titulo} 
            className={styles.imagenHero} 
          />
        </section>

        <div className={styles.contenidoGrid}>
          <div className={styles.infoLado}>
            <div className={styles.perfilAnfitrion}>
              <div>
                <h2 className={styles.nombreHost}>Anfitrión: {nombreAnfitrion}</h2>
                <p className={styles.detallesCorta}>Capacidad: {capacidad} huéspedes</p>
              </div>
              <div className={styles.avatarHost}>
                {nombreAnfitrion.charAt(0).toUpperCase()}
              </div>
            </div>

            <hr className={styles.separador} />
            <p className={styles.descripcionLarga}>{descripcion}</p>
            <hr className={styles.separador} />
            
            <SeccionResenas propiedadId={id} />
          </div>

          <aside className={styles.reservaLado}>
            <div className={styles.tarjetaReserva}>
              <div className={styles.precioNoche}>
                <strong>${precio}</strong> <span>noche</span>
              </div>

              <div className={styles.contenedorFechas}>
                <div className={styles.cajaFecha}>
                  <label>LLEGADA</label>
                  <input 
                    type="date" 
                    min={minFecha}
                    value={fechaEntrada} 
                    onChange={(e) => setFechaEntrada(e.target.value)} 
                  />
                </div>
                <div className={styles.cajaFecha}>
                  <label>SALIDA</label>
                  <input 
                    type="date" 
                    min={fechaEntrada || minFecha}
                    value={fechaSalida} 
                    onChange={(e) => setFechaSalida(e.target.value)} 
                  />
                </div>
              </div>

              <button 
                className={styles.botonPrincipal} 
                onClick={manejarReserva}
                disabled={procesandoReserva}
              >
                {procesandoReserva ? 'Procesando...' : 'Reservar'}
              </button>
              
              <p className={styles.avisoNoCobro}>No se te cobrará nada todavía</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}