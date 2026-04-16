import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './DetallePropiedad.module.css';
import Navbar from '../../Components/NavBar';
import SeccionResenas from '../../Components/SeccionResenas';
import toast from 'react-hot-toast';

export default function DetallePropiedad() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [propiedad, setPropiedad] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [procesandoReserva, setProcesandoReserva] = useState(false);

  useEffect(() => {
    const API_URL = `http://localhost:5085/api/Propiedad/${id}`; 
    axios.get(API_URL)
      .then(response => {
        setPropiedad(response.data);
        setCargando(false);
      })
      .catch(error => {
        console.error("Error al traer la propiedad:", error);
        setCargando(false);
      });
  }, [id]);

  const manejarReserva = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error("Debes iniciar sesión para realizar una reserva.", { 
        id: 'auth-error', // 👈 Evita duplicados
        duration: 2000    // 👈 2 segundos
      });
      setTimeout(() => navigate('/login'), 2000); 
      return;
    }

    if (!fechaEntrada || !fechaSalida) {
      toast.error("Por favor, selecciona las fechas de llegada y salida.", { 
        id: 'fechas-error', // 👈 EVITA LA TORRE DE NOTIFICACIONES
        duration: 2000      // 👈 DESAPARECE RÁPIDO
      });
      return;
    }

    setProcesandoReserva(true);

    try {
      const tokenDecodificado = JSON.parse(atob(token.split('.')[1]));
      const usuarioId = tokenDecodificado.nameid;

      const datosReserva = {
        PropiedadId: parseInt(id),
        UsuarioInvitadoId: parseInt(usuarioId),
        FechaEntrada: fechaEntrada,
        FechaSalida: fechaSalida
      };

      const respuesta = await axios.post('http://localhost:5085/api/Reservas', datosReserva, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const reservaIdCreada = respuesta.data.id; 

      toast.success(
        `¡Reserva confirmada!\nTu ID es: ${reservaIdCreada}`, 
        { 
          id: 'reserva-exito',
          duration: 5000 // Le damos 5 segundos para que pueda leer su ID
        }
      );
      navigate('/'); 
      
    } catch (error) {
      console.log("RESPUESTA DEL BACKEND:", error.response?.data);

      if (error.response && error.response.data) {
        const data = error.response.data;
        
        if (data.errores && Array.isArray(data.errores)) {
          // ✅ Formateo Premium para lista de errores
          toast.error(
            <div>
              <strong>Por favor revisa lo siguiente:</strong>
              <ul style={{ margin: '8px 0 0 15px', padding: 0, fontSize: '0.9rem', textAlign: 'left' }}>
                {data.errores.map((err, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{err}</li>
                ))}
              </ul>
            </div>, 
            { id: 'back-error', duration: 5000 }
          );
        } else if (data.errors) {
          // ✅ Lo mismo para los errores por defecto de .NET
          const mensajes = Object.values(data.errors).flat();
          toast.error(
            <div>
              <strong>Error en el formato:</strong>
              <ul style={{ margin: '8px 0 0 15px', padding: 0, fontSize: '0.9rem', textAlign: 'left' }}>
                {mensajes.map((err, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{err}</li>
                ))}
              </ul>
            </div>, 
            { id: 'back-error', duration: 5000 }
          );
        } else if (data.error) {
          toast.error(data.error, { id: 'back-error', duration: 4000 });
        } else {
          toast.error("Ocurrió un error al procesar tu solicitud.", { id: 'back-error', duration: 3000 });
        }
      } else {
        toast.error("No se pudo conectar con el servidor.", { id: 'net-error', duration: 3000 });
      }
    } finally {
      setProcesandoReserva(false);
    }
  };

  if (cargando) return <div className={styles.paginaContenedor}><Navbar /><h2 style={{ textAlign: 'center', marginTop: '5rem' }}>Cargando detalles... 🏕️</h2></div>;
  if (!propiedad) return <div className={styles.paginaContenedor}><Navbar /><h2 style={{ textAlign: 'center', marginTop: '5rem' }}>No se encontró la propiedad 😢</h2></div>;

  const fotosDePrueba = ["https://picsum.photos/id/1015/1000/600", "https://picsum.photos/id/1018/1000/600", "https://picsum.photos/id/1019/1000/600", "https://picsum.photos/id/1036/1000/600", "https://picsum.photos/id/1043/1000/600"];
  const fotosAMostrar = propiedad.fotos && propiedad.fotos.length >= 5 ? propiedad.fotos.map(f => f.url) : fotosDePrueba;

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
            <img key={index} src={foto} alt={`Foto ${index}`} className={index === 0 ? styles.fotoPrincipal : styles.fotoSecundaria} />
          ))}
        </div>

        <div className={styles.contenidoDividido}>
          <div className={styles.columnaIzquierda}>
            <h2 className={styles.anfitrion}>Anfitrión: Apex Propiedades</h2>
            <p className={styles.descripcion}>{propiedad.Descripcion || propiedad.descripcion || "Hermosa propiedad lista para hospedarte."}</p>
            <SeccionResenas propiedadId={id} />
          </div>

          <div className={styles.columnaDerecha}>
            <div className={styles.tarjetaReserva}>
              <div className={styles.precioReserva}>
                ${propiedad.PrecioPorNoche || propiedad.precioPorNoche} <span>por noche</span>
              </div>
              
              <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block' }}>LLEGADA</label>
                  <input type="date" value={fechaEntrada} onChange={(e) => setFechaEntrada(e.target.value)} style={{ width: '100%', border: 'none' }} />
                </div>
                <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block' }}>SALIDA</label>
                  <input type="date" value={fechaSalida} onChange={(e) => setFechaSalida(e.target.value)} style={{ width: '100%', border: 'none' }} />
                </div>
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