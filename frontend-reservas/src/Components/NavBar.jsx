// src/Components/NavBar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import styles from './NavBar.module.css';

export default function Navbar() {
  const { usuario, logout, estaAutenticado, modoApp, alternarModoApp } = useAuth();
  const navigate = useNavigate();

  const manejarLogout = () => {
    logout();
    navigate('/login');
  };

  const nombreAMostrar = (() => {
    if (!usuario?.email) return 'Usuario';
    const parte = usuario.email.split('@')[0];
    return parte.charAt(0).toUpperCase() + parte.slice(1);
  })();

  return (
    <nav className={styles.fullNav}>
      <div className={styles.contentNav}>
        
        {/* BLOQUE IZQUIERDO: LOGO */}
        <div className={styles.sectionLeft}>
          <Link to="/" className={styles.logoLink}>
            <div className={styles.homeBadge}>Home</div>
          </Link>
        </div>

        {/* BLOQUE DERECHO: LINKS Y PERFIL */}
        <div className={styles.sectionRight}>
          {estaAutenticado ? (
            <>
              {/* VISTAS CONDICIONALES SEGÚN EL MODO */}
              {modoApp === 'anfitrion' ? (
                <>
                  <Link to="/mis-propiedades" className={styles.navLink}>Mis Propiedades</Link>
                  <Link to="/crear-propiedad" className={`${styles.navLink} ${styles.publishLink}`}>
                    Publicar Propiedad
                  </Link>
                </>
              ) : (
                <Link to="/mis-viajes" className={styles.navLink}>Mis Viajes</Link>
              )}

              {/* BOTÓN PARA CAMBIAR EL MODO (Solo aparece si el usuario es Host en la BD) */}
              {usuario?.esHost && (
                <button onClick={alternarModoApp} className={styles.switchModeBtn}>
                  Cambiar a modo {modoApp === 'anfitrion' ? 'Viajero' : 'Anfitrión'}
                </button>
              )}

              <button onClick={manejarLogout} className={styles.logoutBtn}>
                Log Out
              </button>

              <div className={styles.userProfile}>
                <span className={styles.userName}>{nombreAMostrar}</span>
                <div className={styles.avatar}>
                  {nombreAMostrar.charAt(0).toUpperCase()}
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>Iniciar Sesión</Link>
              <Link to="/registro" className={styles.navRegisterBtn}>Registrarse</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}