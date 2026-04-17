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

  // 🛡️ LÓGICA DE ROLES
  const rolNet = usuario?.role || usuario?.Role || usuario?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  const esAnfitrion = usuario?.esHost || usuario?.EsHost || rolNet === 'Host' || rolNet === 'Anfitrion';
  const esInvitado = estaAutenticado && !esAnfitrion;

  return (
    <div className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        
        {/* LOGO */}
        <div className={styles.logo} onClick={() => navigate('/')}>
          <span role="img" aria-label="tent">⛺</span> Apex
        </div>

        {/* ENLACES CENTRALES - Solo Home */}
        <div className={styles.links}>
          <span className={styles.linkActive} onClick={() => navigate('/')}>Home</span>
        </div>

        {/* ACCIONES Y PERFIL */}
        <div className={styles.actions}>
          
          {estaAutenticado && (
            <>
              {/* Opción para Huéspedes */}
              {esInvitado && (
                <span 
                  className={styles.navAction} 
                  onClick={() => navigate('/mis-viajes')}
                >
                  Mis Viajes
                </span>
              )}

              {/* Opción para Anfitriones */}
              {esAnfitrion && (
                <>
                  <span 
                    className={styles.navAction}
                    onClick={() => navigate('/mis-propiedades')}
                  >
                    Mis Propiedades
                  </span>
                  <span 
                    className={styles.publishAction} 
                    onClick={() => navigate('/crear-propiedad')}
                  >
                    Publish Property
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