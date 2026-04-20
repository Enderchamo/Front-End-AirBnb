import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './DetallePropiedad.module.css';
import Navbar from '../../Components/NavBar';
import SeccionResenas from '../../Components/SeccionResenas';
import toast from 'react-hot-toast';

// Importaciones del estándar
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

  useEffect(() => {
    api.get(`/Propiedad/${id}`)
      .then(response => {
        setPropiedad(response.data);
        setCargando(false);
      })
      .catch(error => {
        console.error("Error al traer la propiedad:", error);
        mostrarErrorApi(error, 'cargar-propiedad-error');
        setCargando(false);
      });
  }, [id]);

  // --- LÓGICA DE VALIDACIÓN DE FECHAS ---
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
  // ---------------------------------------

  const manejarReserva = async () => {
    if (!estaAutenticado) {
      toast.error("Debes iniciar sesión para realizar una reserva.", { id: 'auth-error', duration: 2000 });
      setTimeout(() => navigate('/login'), 2000); 
      return;
    }

    if (!fechaEntrada || !fechaSalida) {
      toast.error("Por favor, selecciona las fechas de llegada y salida.", { id: 'fechas-error', duration: 2000 });
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

      const respuesta = await api.post('/Reservas', datosReserva);
      const reservaIdCreada = respuesta.data.id || respuesta.data.Id; 

      toast.success(`¡Reserva confirmada!\nID: ${reservaIdCreada}`, { id: 'reserva-exito', duration: 5000 });
      navigate('/mis-viajes'); 
      
    } catch (error) {
      console.error("Error al procesar reserva:", error.response?.data);
      mostrarErrorApi(error, 'reserva-error');
    } finally {
      setProcesandoReserva(false);
    }
  };

  if (cargando) {
    return (
      <div className={styles.paginaContenedor}>
        <Navbar />
        <h2 style={{ textAlign: 'center', marginTop: '5rem' }}>Cargando detalles... 🏕️</h2>
      </div>
    );
  }

  if (!propiedad) {
    return (
      <div className={styles.paginaContenedor}>
        <Navbar />
        <h2 style={{ textAlign: 'center', marginTop: '5rem' }}>No se encontró la propiedad 😢</h2>
      </div>
    );
  }

  const fotosDePrueba = [
    "https://picsum.photos/id/1015/1000/600", 
    "https://picsum.photos/id/1018/1000/600", 
    "https://picsum.photos/id/1019/1000/600", 
    "https://picsum.photos/id/1036/1000/600", 
    "https://picsum.photos/id/1043/1000/600"
  ];
  const fotosAMostrar = propiedad.fotos && propiedad.fotos.length >= 5 
    ? propiedad.fotos.map(f => f.url) 
    : fotosDePrueba;

  return (
    <div className={styles.paginaContenedor}>
      <Navbar />
      <div className={styles.cuerpoPadding}>
        <div className={styles.tituloContenedor}>
          <h1 className={styles.titulo}>{propiedad.Titulo || propiedad.titulo}</h1>
          <span className={styles.subtitulo}>★ 5.0 · {propiedad.Ubicacion || propiedad.ubicacion}</span>
        </div>

        <div className={styles.galeria}>
          {fotosAMostrar.map((foto, index) => (
            <img 
              key={index} 
              src={foto} 
              alt={`Foto ${index}`} 
              className={index === 0 ? styles.fotoPrincipal : styles.fotoSecundaria} 
            />
          ))}
        </div>

        <div className={styles.contenidoDividido}>
          <div className={styles.columnaIzquierda}>
            <h2 className={styles.anfitrion}>Anfitrión: Apex Propiedades</h2>
            <p className={styles.descripcion}>
              {propiedad.Descripcion || propiedad.descripcion || "Hermosa propiedad lista para hospedarte."}
            </p>
            <SeccionResenas propiedadId={id} />
          </div>

          <div className={styles.columnaDerecha}>
            <div className={styles.tarjetaReserva}>
              <div className={styles.precioReserva}>
                ${propiedad.PrecioPorNoche || propiedad.precioPorNoche} <span>por noche</span>
              </div>
              
              <div className={styles.reservaInputs}>
                <div className={styles.inputField}>
                  <label>LLEGADA</label>
                  <input 
                    type="date" 
                    value={fechaEntrada} 
                    min={minFechaEntrada}
                    onChange={(e) => {
                      setFechaEntrada(e.target.value);
                      if (fechaSalida && e.target.value >= fechaSalida) {
                        setFechaSalida('');
                      }
                    }} 
                  />
                </div>
                <div className={styles.inputField}>
                  <label>SALIDA</label>
                  <input 
                    type="date" 
                    value={fechaSalida} 
                    min={minFechaSalida}
                    disabled={!fechaEntrada}
                    onChange={(e) => setFechaSalida(e.target.value)} 
                  />
                </div>
              </div>

              <button 
                className={styles.botonReservar} 
                onClick={manejarReserva} 
                disabled={procesandoReserva}
              >
                {procesandoReserva ? 'Procesando...' : 'Reservar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}