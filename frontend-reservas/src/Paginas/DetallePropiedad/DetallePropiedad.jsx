// src/Paginas/DetallePropiedad/DetallePropiedad.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios'; 
import { useAuth } from '../../Context/AuthContext';
import { mostrarErrorApi } from '../src/utils/manejarErrorApi'; // Ruta corregida
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

  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const minFecha = manana.toISOString().split('T')[0];

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
    if (!fechaEntrada || !fechaSalida) return toast.error("Selecciona las fechas.");

    setProcesandoReserva(true);
    try {
      const guestIdRaw = usuario?.id || usuario?.nameid || usuario?.sub;
      const payload = {
        propiedadId: parseInt(id),
        fechaEntrada,
        fechaSalida,
        usuarioInvitadoId: parseInt(guestIdRaw)
      };
      await api.post('/Reservas', payload);
      toast.success("¡Reserva confirmada!");
      navigate('/mis-viajes');
    } catch (err) {
      mostrarErrorApi(err, 'reserva-error');
    } finally {
      setProcesandoReserva(false);
    }
  };

  if (cargando || cargandoAuth) return <div className={styles.loader}>Cargando...</div>;
  if (!propiedad) return <div className={styles.errorMsg}>No se encontró la propiedad.</div>;

  return (
    <div className={styles.pagina}>
      {/* 🛑 Navbar eliminado de aquí */}
      <main className={styles.contenedorDetalle}>
        <header className={styles.cabecera}>
          <h1>{propiedad.titulo || propiedad.Titulo}</h1>
        </header>

        <div className={styles.contenidoGrid}>
          <div className={styles.infoLado}>
            <p>{propiedad.descripcion || propiedad.Descripcion}</p>
            <hr />
            <SeccionResenas propiedadId={id} />
          </div>

          <aside className={styles.reservaLado}>
            <div className={styles.tarjetaReserva}>
              <strong>${propiedad.precioPorNoche || propiedad.PrecioPorNoche}</strong> / noche
              <div className={styles.contenedorFechas}>
                <input type="date" min={minFecha} value={fechaEntrada} onChange={(e) => setFechaEntrada(e.target.value)} />
                <input type="date" min={fechaEntrada || minFecha} value={fechaSalida} onChange={(e) => setFechaSalida(e.target.value)} />
              </div>
              <button className={styles.botonPrincipal} onClick={manejarReserva} disabled={procesandoReserva}>
                {procesandoReserva ? 'Procesando...' : 'Reservar'}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}