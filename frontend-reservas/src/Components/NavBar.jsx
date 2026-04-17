// src/Components/NavBar.jsx
import styles from './NavBar.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx'; 

export default function Navbar() {
  const navigate = useNavigate();
  const { usuario, estaAutenticado, logout } = useAuth();

  const manejarCerrarSesion = () => {
    logout();
    navigate('/');
  };

  const rolNet = usuario?.role || usuario?.Role || usuario?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  const esAnfitrion = usuario?.esHost || usuario?.EsHost || rolNet === 'Host' || rolNet === 'Anfitrion';
  const esInvitado = estaAutenticado && !esAnfitrion;

  return (
    <div className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        
        {/* IZQUIERDA: Botón Home en su nueva posición */}
        <div className={styles.leftSection}>
          <span className={styles.linkActive} onClick={() => navigate('/')}>Home</span>
        </div>

        {/* DERECHA: Acciones y Perfil */}
        <div className={styles.actions}>
          
          {estaAutenticado && (
            <>
              {esInvitado && (
                <span className={styles.link} onClick={() => navigate('/mis-viajes')}>
                  Mis Viajes
                </span>
              )}

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