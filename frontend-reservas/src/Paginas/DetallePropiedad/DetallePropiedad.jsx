// src/Paginas/DetallePropiedad/DetallePropiedad.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './DetallePropiedad.module.css';
import Navbar from '../../Components/NavBar';
import SeccionResenas from '../../Components/SeccionResenas';
import toast from 'react-hot-toast';
import api from '../../api/axios'; 
import { useAuth } from '../../Context/AuthContext';
import { mostrarErrorApi } from '../src/utils/manejarErrorApi';

export default function DetallePropiedad() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { usuario, estaAutenticado } = useAuth(); 
  
  const [propiedad, setPropiedad] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [procesandoReserva, setProcesandoReserva] = useState(false);
  const [llaveResenas, setLlaveResenas] = useState(0);

  useEffect(() => {
    api.get(`/Propiedad/${id}`)
      .then(response => {
        setPropiedad(response.data);
        setCargando(false);
      })
      .catch(error => {
        mostrarErrorApi(error, 'cargar-propiedad-error');
        setCargando(false);
      });
  }, [id]);

  const formatFecha = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1); 
  const minFechaEntrada = formatFecha(manana);

  let minFechaSalida = minFechaEntrada;
  if (fechaEntrada) {
      const [year, month, day] = fechaEntrada.split('-');
      const fechaEntObj = new Date(year, month - 1, day);
      fechaEntObj.setDate(fechaEntObj.getDate() + 1);
      minFechaSalida = formatFecha(fechaEntObj);
  }

  const manejarReserva = async () => {
    if (!estaAutenticado) {
      toast.error("Inicia sesión para reservar.");
      setTimeout(() => navigate('/login'), 2000); 
      return;
    }
    if (!fechaEntrada || !fechaSalida) {
      toast.error("Selecciona las fechas.");
      return;
    }
    setProcesandoReserva(true);
    try {
      const datosReserva = {
        PropiedadId: parseInt(id),
        UsuarioInvitadoId: parseInt(usuario.id),
        FechaEntrada: fechaEntrada,
        FechaSalida: fechaSalida
      };
      await api.post('/Reservas', datosReserva);
      toast.success("¡Reserva confirmada!");
      navigate('/mis-viajes'); 
    } catch (error) {
      mostrarErrorApi(error, 'reserva-error');
    } finally {
      setProcesandoReserva(false);
    }
  };

  if (cargando) return <div className={styles.loader}>Cargando... 🏕️</div>;
  if (!propiedad) return <div className={styles.error}>No se encontró la propiedad 😢</div>;

  // --- LÓGICA DE IMAGEN ---
  const URL_BASE_SERVIDOR = "http://localhost:5085"; 
  const rutaImagen = propiedad.imagenUrl || propiedad.ImagenUrl;
  
  const imagenFinal = rutaImagen 
    ? (rutaImagen.startsWith('http') ? rutaImagen : `${URL_BASE_SERVIDOR}${rutaImagen}`)
    : null; 

  return (
    <div className={styles.pagina}>
      <Navbar />
      
      <main className={styles.contenedor}>
        <header className={styles.header}>
          <h1 className={styles.titulo}>{propiedad.titulo || propiedad.Titulo}</h1>
          <div className={styles.meta}>
            <span className={styles.rating}>★ 5.0</span> · <span className={styles.ubicacionText}>{propiedad.ubicacion || propiedad.Ubicacion}</span>
          </div>
        </header>

        {/* Sección de Imagen Hero con el placeholder visual */}
        <section className={styles.contenedorImagenHero}>
          {imagenFinal ? (
            <img 
              src={imagenFinal} 
              alt={`Vista de ${propiedad.titulo || propiedad.Titulo}`} 
              className={styles.imagenHero} 
            />
          ) : (
            <div className={styles.placeholderVisualCompleto}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 64 64" 
                aria-hidden="true" 
                focusable="false" 
                className={styles.iconoLandscapePlaceholder}
              >
                <path d="M41.58 20a8 8 0 1 0-8-8 8 8 0 0 0 8 8zM5 48.01a6.38 6.38 0 0 0 1.91 4.59c1.51 1.51 3.29 2.4 5.09 2.4H52c3.08 0 5.82-1.48 7.33-4a6.29 6.29 0 0 0 .67-2.99v-2.1l-11.37-11.37a4 4 0 0 0-5.66 0L36 31.51l-7.37-7.37a4 4 0 0 0-5.66 0L5 42.01zm4-2.83l15.17-15.17a2 2 0 0 1 2.83 0l7.37 7.37-6.03 6.03a4 4 0 0 0 0 5.66l6.03 6.03L32.17 53.3a2 2 0 0 1-2.83 0l-15.17-15.17A2 2 0 0 1 9 45.18z"></path>
              </svg>
              <p className={styles.textoPlaceholderVisual}>No hay imagen disponible</p>
            </div>
          )}
        </section>

        <div className={styles.gridContenido}>
          <div className={styles.columnaInformacion}>
            <div className={styles.hostSection}>
              <div className={styles.hostInfo}>
                <h2>Anfitrión: {propiedad.nombreHost || "Apex Propiedades"}</h2>
                <p>Host con excelente reputación en la zona</p>
              </div>
              <img src={`https://ui-avatars.com/api/?name=${propiedad.nombreHost || 'Host'}&background=ff385c&color=fff`} alt="Host" className={styles.avatarHost} />
            </div>

            <hr className={styles.separador} />

            <div className={styles.amenidadesRapidas}>
              <span>🏠 {propiedad.capacidad || propiedad.Capacidad} huéspedes</span>
              <span>🛏️ {propiedad.habitaciones || 2} habitaciones</span>
              <span>🚿 {propiedad.banos || 1} baño</span>
            </div>

            <hr className={styles.separador} />

            <p className={styles.descripcion}>
              {propiedad.descripcion || propiedad.Descripcion}
            </p>

            <hr className={styles.separador} />
            
            <SeccionResenas key={llaveResenas} propiedadId={id} />
          </div>

          <aside className={styles.columnaSidebar}>
            <div className={styles.tarjetaReservaSticky}>
              <div className={styles.precioInfo}>
                <span className={styles.precioBold}>${propiedad.precioPorNoche || propiedad.PrecioPorNoche}</span>
                <span className={styles.nocheTexto}> por noche</span>
              </div>

              <div className={styles.cajaFechas}>
                <div className={styles.fechaBox}>
                  <label>LLEGADA</label>
                  <input type="date" value={fechaEntrada} min={minFechaEntrada} onChange={(e) => setFechaEntrada(e.target.value)} />
                </div>
                <div className={styles.fechaBox}>
                  <label>SALIDA</label>
                  <input type="date" value={fechaSalida} min={minFechaSalida} disabled={!fechaEntrada} onChange={(e) => setFechaSalida(e.target.value)} />
                </div>
              </div>

              <button className={styles.btnConfirmar} onClick={manejarReserva} disabled={procesandoReserva}>
                {procesandoReserva ? 'Procesando...' : 'Reservar'}
              </button>

              <div className={styles.desglosePagos}>
                <div className={styles.itemPago}>
                  <span>${propiedad.precioPorNoche || propiedad.PrecioPorNoche} x 1 noche</span>
                  <span>${propiedad.precioPorNoche || propiedad.PrecioPorNoche}</span>
                </div>
                <div className={styles.itemPago}>
                  <span>Tarifa de servicio</span>
                  <span>$15</span>
                </div>
                <hr />
                <div className={styles.totalPago}>
                  <span>Total</span>
                  <span>${(parseFloat(propiedad.precioPorNoche || propiedad.PrecioPorNoche) || 0) + 15}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}