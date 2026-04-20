// src/Paginas/DetallePropiedad/DetallePropiedad.jsx
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

  const manejarReserva = async () => {
    if (!estaAutenticado) {
      toast.error("Debes iniciar sesión para realizar una reserva.", { id: 'auth-error' });
      setTimeout(() => navigate('/login'), 2000); 
      return;
    }

    if (!fechaEntrada || !fechaSalida) {
      toast.error("Por favor, selecciona las fechas.", { id: 'fechas-error' });
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
      toast.success(`¡Reserva confirmada! ID: ${respuesta.data.id || respuesta.data.Id}`);
      navigate('/mis-viajes'); 
    } catch (error) {
      mostrarErrorApi(error, 'reserva-error');
    } finally {
      setProcesandoReserva(false);
    }
  };

  // --- LÓGICA DE RESEÑAS ---
  const [comentario, setComentario] = useState('');
  const [calificacion, setCalificacion] = useState(5);

  const enviarResena = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Obtenemos tus viajes usando el endpoint oficial de tu controlador
      const resViajes = await api.get('/Reservas/mis-reservas'); 
      
      // 2. Buscamos la reserva COMPLETADA (Estado 2) para esta propiedad.
      // Ordenamos por ID descendente para tomar siempre la más reciente.
      const reservaCompletada = resViajes.data
        .sort((a, b) => (b.id || b.Id) - (a.id || a.Id))
        .find(r => 
          (parseInt(r.propiedadId || r.PropiedadId) === parseInt(id)) && 
          (r.estado === 2 || r.estado === 'Completada' || r.Estado === 2)
        );

      if (!reservaCompletada) {
        toast.error("No se encontró una reserva completada reciente para esta propiedad.");
        return;
      }

      // 3. Enviamos el ID de la reserva específica al backend
      const payload = {
        reservaId: parseInt(reservaCompletada.id || reservaCompletada.Id),
        calificacion: parseInt(calificacion),
        comentario: comentario
      };

      await api.post('/Resena', payload);

      toast.success("¡Tu opinión ha sido publicada!");
      setComentario('');
      setLlaveResenas(prev => prev + 1);

    } catch (error) {
      // Usamos el manejador global corregido
      mostrarErrorApi(error, 'publicar-resena');
    }
  };

  // ... (Renderizado de cargando y error igual que antes)
  if (cargando) return <div className={styles.paginaContenedor}><Navbar /><h2 style={{ textAlign: 'center', marginTop: '5rem' }}>Cargando detalles... 🏕️</h2></div>;
  if (!propiedad) return <div className={styles.paginaContenedor}><Navbar /><h2 style={{ textAlign: 'center', marginTop: '5rem' }}>No se encontró la propiedad 😢</h2></div>;

  const fotosAMostrar = propiedad.fotos && propiedad.fotos.length >= 1 
    ? propiedad.fotos.map(f => f.url) 
    : ["https://picsum.photos/id/1015/1000/600"];

  return (
    <div className={styles.paginaContenedor}>
      <Navbar />
      <div className={styles.cuerpoPadding}>
        <div className={styles.tituloContenedor}>
          <h1 className={styles.titulo}>{propiedad.titulo || propiedad.Titulo}</h1>
          <span className={styles.subtitulo}>★ 5.0 · {propiedad.ubicacion || propiedad.Ubicacion}</span>
        </div>

        <div className={styles.galeria}>
          {fotosAMostrar.map((foto, index) => (
            <img key={index} src={foto} alt={`Foto ${index}`} className={index === 0 ? styles.fotoPrincipal : styles.fotoSecundaria} />
          ))}
        </div>

        <div className={styles.contenidoDividido}>
          <div className={styles.columnaIzquierda}>
            <h2 className={styles.anfitrion}>Anfitrión: Apex Propiedades</h2>
            <p className={styles.descripcion}>{propiedad.descripcion || propiedad.Descripcion}</p>
            <hr className={styles.separador} />

            {estaAutenticado && (
              <div className={styles.contenedorNuevaResena}>
                <h3>¿Cómo fue tu experiencia?</h3>
                <form onSubmit={enviarResena} className={styles.formResena}>
                  <div className={styles.estrellasInput}>
                    <label>Calificación:</label>
                    <select value={calificacion} onChange={(e) => setCalificacion(e.target.value)}>
                      <option value="5">⭐⭐⭐⭐⭐ (Excelente)</option>
                      <option value="4">⭐⭐⭐⭐ (Muy buena)</option>
                      <option value="3">⭐⭐⭐ (Normal)</option>
                      <option value="2">⭐⭐ (Mala)</option>
                      <option value="1">⭐ (Horrible)</option>
                    </select>
                  </div>
                  <textarea placeholder="Cuéntanos tu experiencia..." value={comentario} onChange={(e) => setComentario(e.target.value)} required />
                  <button type="submit" className={styles.btnPublicarResena}>Publicar opinión</button>
                </form>
              </div>
            )}
            <SeccionResenas key={llaveResenas} propiedadId={id} />
          </div>

          <div className={styles.columnaDerecha}>
            <div className={styles.tarjetaReserva}>
              <div className={styles.precioReserva}>
                ${propiedad.precioPorNoche || propiedad.PrecioPorNoche} <span>por noche</span>
              </div>
              <div className={styles.reservaInputs}>
                <div className={styles.inputField}><label>LLEGADA</label><input type="date" value={fechaEntrada} min={minFechaEntrada} onChange={(e) => setFechaEntrada(e.target.value)} /></div>
                <div className={styles.inputField}><label>SALIDA</label><input type="date" value={fechaSalida} min={minFechaSalida} disabled={!fechaEntrada} onChange={(e) => setFechaSalida(e.target.value)} /></div>
              </div>
              <button className={styles.botonReservar} onClick={manejarReserva} disabled={procesandoReserva}>
                {procesandoReserva ? 'Procesando...' : 'Reservar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}