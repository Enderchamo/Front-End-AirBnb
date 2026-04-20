// src/Components/NavBar.jsx
import { useState, useEffect } from 'react'; // 🛠️ Añadimos useEffect
import styles from './NavBar.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx'; 
import api from '../api/axios'; 
import toast from 'react-hot-toast'; 

export default function Navbar() {
  const navigate = useNavigate();
  const { usuario, estaAutenticado, logout, actualizarUsuario } = useAuth();
  
  // 🛠️ ESTADOS PARA NOTIFICACIONES
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarNotis, setMostrarNotis] = useState(false);
  const [noleidas, setNoLeidas] = useState(0);

  // 🛠️ CARGAR NOTIFICACIONES
  useEffect(() => {
    if (estaAutenticado) {
      obtenerNotificaciones();
      // Opcional: Polling cada 30 segundos para nuevas notis
      const interval = setInterval(obtenerNotificaciones, 30000);
      return () => clearInterval(interval);
    }
  }, [estaAutenticado]);

  const obtenerNotificaciones = async () => {
    try {
      const res = await api.get('/Notificacion');
      setNotificaciones(res.data);
      setNoLeidas(res.data.filter(n => !n.leida && !n.Leida).length);
    } catch (error) {
      console.error("Error al obtener notificaciones", error);
    }
  };

  const marcarComoLeida = async (id) => {
    try {
      await api.patch(`/Notificacion/${id}/leer`);
      setNotificaciones(prev => 
        prev.map(n => (n.id === id || n.Id === id) ? { ...n, leida: true } : n)
      );
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error al marcar leída", error);
    }
  };

  const manejarCerrarSesion = () => {
    logout();
    navigate('/');
  };

  const manejarConvertirseEnHost = async () => {
    try {
      const loadingToast = toast.loading("Actualizando permisos...");
      await api.put('/Usuarios/roles', { esHost: true, esGuest: true });
      actualizarUsuario({ esHost: true });
      toast.success("¡Ya eres anfitrión!", { id: loadingToast });
      setTimeout(() => { logout(); navigate('/login'); }, 2000);
    } catch (error) { toast.error("Error al cambiar de rol."); }
  };

  const rolNet = usuario?.role || usuario?.Role || usuario?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  const esAnfitrion = usuario?.esHost || usuario?.EsHost || rolNet === 'Host' || rolNet === 'Anfitrion';

  return (
    <div className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        <div className={styles.leftSection}>
          <span className={styles.linkActive} onClick={() => navigate('/')}>Home</span>
        </div>

        <div className={styles.actions}>
          {estaAutenticado && (
            <>
              {/* 🔔 ICONO DE CAMPANA */}
              <div className={styles.notiWrapper}>
                <button 
                  className={styles.notiBtn} 
                  onClick={() => setMostrarNotis(!mostrarNotis)}
                >
                  <span className={styles.bellIcon}>🔔</span>
                  {noleidas > 0 && <span className={styles.badge}>{noleidas}</span>}
                </button>

                {/* 📂 PANEL DESPLEGABLE DE NOTIFICACIONES */}
                {mostrarNotis && (
                  <div className={styles.notiDropdown}>
                    <div className={styles.notiHeader}>Notificaciones</div>
                    <div className={styles.notiList}>
                      {notificaciones.length === 0 ? (
                        <p className={styles.notiEmpty}>No tienes notificaciones</p>
                      ) : (
                        notificaciones.map((n) => (
                          <div 
                            key={n.id || n.Id} 
                            className={`${styles.notiItem} ${!(n.leida || n.Leida) ? styles.noLeida : ''}`}
                            onClick={() => marcarComoLeida(n.id || n.Id)}
                          >
                            <p className={styles.notiTexto}>{n.mensaje || n.Mensaje}</p>
                            <span className={styles.notiFecha}>
                              {new Date(n.fechaCreacion || n.FechaCreacion).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <span className={styles.link} onClick={() => navigate('/mis-viajes')}>Mis Viajes</span>

              {!esAnfitrion && (
                <span className={styles.link} onClick={manejarConvertirseEnHost} style={{ color: '#ff385c', fontWeight: 'bold' }}>
                  Hazte Anfitrión
                </span>
              )}

              {esAnfitrion && (
                <>
                  <span className={styles.link} onClick={() => navigate('/mis-propiedades')}>Mis Propiedades</span>
                  <span className={styles.link} onClick={() => navigate('/reservas-recibidas')}>Reservas Recibidas</span>
                  <span className={styles.publishAction} onClick={() => navigate('/crear-propiedad')}>Publicar</span>
                </>
              )}
            </>
          )}

          {!estaAutenticado ? (
            <button className={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
          ) : (
            <button className={styles.logoutBtn} onClick={manejarCerrarSesion}>Log Out</button>
          )}
        </div>
      </nav>
    </div>
  );
}