// src/Components/NavBar.jsx
import styles from './NavBar.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx'; 
import api from '../api/axios'; 
import toast from 'react-hot-toast'; 

export default function Navbar() {
  const navigate = useNavigate();
  const { usuario, estaAutenticado, logout, actualizarUsuario } = useAuth();

  const manejarCerrarSesion = () => {
    logout();
    navigate('/');
  };

  const manejarConvertirseEnHost = async () => {
    try {
      const loadingToast = toast.loading("Actualizando permisos...");
      await api.put('/Usuarios/roles', {
        esHost: true,
        esGuest: true
      });

      actualizarUsuario({ esHost: true });
      toast.success("¡Felicidades! Ya eres anfitrión 🏠", { id: loadingToast });

      toast("Redirigiendo al login para refrescar tu sesión...", {
        icon: '🔑',
        duration: 3000
      });

      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2500);

    } catch (error) {
      console.error(error);
      toast.error("No se pudo realizar el cambio de rol.");
    }
  };

  // Lógica de detección de roles mejorada
  const rolNet = usuario?.role || usuario?.Role || usuario?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  const esAnfitrion = usuario?.esHost || usuario?.EsHost || rolNet === 'Host' || rolNet === 'Anfitrion';

  return (
    <div className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        
        {/* IZQUIERDA: Botón Home */}
        <div className={styles.leftSection}>
          <span className={styles.linkActive} onClick={() => navigate('/')}>Home</span>
        </div>

        {/* DERECHA: Acciones y Perfil */}
        <div className={styles.actions}>
          
          {estaAutenticado && (
            <>
              {/* ✅ OPCIÓN UNIVERSAL: Cualquier usuario logueado puede ver sus reservas (viajes) */}
              <span className={styles.link} onClick={() => navigate('/mis-viajes')}>
                Mis Viajes
              </span>

              {/* Si NO es anfitrión, botón para convertirse */}
              {!esAnfitrion && (
                <span 
                  className={styles.link} 
                  onClick={manejarConvertirseEnHost}
                  style={{ color: '#ff385c', fontWeight: 'bold' }}
                >
                  Hazte Anfitrión
                </span>
              )}

              {/* Si YA ES Anfitrión, mostramos sus herramientas de gestión */}
              {esAnfitrion && (
                <>
                  <span className={styles.link} onClick={() => navigate('/mis-propiedades')}>
                    Mis Propiedades
                  </span>
                  <span className={styles.publishAction} onClick={() => navigate('/crear-propiedad')}>
                    Publicar Propiedad
                  </span>
                </>
              )}
            </>
          )}

          {!estaAutenticado ? (
            <button className={styles.loginBtn} onClick={() => navigate('/login')}>
              Log In / Sign Up
            </button>
          ) : (
            <button className={styles.logoutBtn} onClick={manejarCerrarSesion}>
              Log Out
            </button>
          )}

          {estaAutenticado && (
            <div className={styles.avatar}>
              {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}