import styles from './Navbar.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx'; 

export default function Navbar() {
  const navigate = useNavigate();
  const { usuario, estaAutenticado, logout } = useAuth();

  const manejarCerrarSesion = () => {
    logout();
    navigate('/');
  };

  // 🛡️ LÓGICA INFALIBLE POR DESCARTE
  const rolNet = usuario?.role || usuario?.Role || usuario?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  const esAnfitrion = usuario?.esHost || usuario?.EsHost || rolNet === 'Host' || rolNet === 'Anfitrion';
  const esInvitado = estaAutenticado && !esAnfitrion;

  return (
    <div className={styles.navbarContainer}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#222', color: 'white', borderRadius: '50px', margin: '1rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span role="img" aria-label="tent">⛺</span> Apex
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', backgroundColor: '#333', padding: '0.5rem 1.5rem', borderRadius: '20px', fontSize: '0.9rem' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
          <span style={{ cursor: 'pointer', color: '#aaa' }}>Experiences</span>
          <span style={{ cursor: 'pointer', color: '#aaa' }}>Services</span>
        </div>

        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', fontSize: '0.9rem' }}>
          
          {estaAutenticado && (
            <>
              {/* 1. Opción para Huéspedes (Guests) */}
              {esInvitado && (
                <span 
                  style={{ cursor: 'pointer', color: '#fff' }} 
                  onClick={() => navigate('/mis-viajes')}
                >
                  Mis Viajes
                </span>
              )}

              {/* 2. Opción para Anfitriones (Hosts) */}
              {esAnfitrion && (
                <>
                  <span 
                    style={{ cursor: 'pointer', color: '#fff' }} 
                    onClick={() => navigate('/mis-propiedades')}
                  >
                    Mis Propiedades
                  </span>
                  <span 
                    style={{ cursor: 'pointer', fontWeight: 'bold', color: '#FF5A5F' }} 
                    onClick={() => navigate('/crear-propiedad')}
                  >
                    Publish Property
                  </span>
                </>
              )}
            </>
          )}

          {!estaAutenticado ? (
            <button onClick={() => navigate('/login')} style={{ backgroundColor: 'white', color: '#222', border: 'none', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>
              Log In / Sign Up
            </button>
          ) : (
            <button onClick={manejarCerrarSesion} style={{ backgroundColor: 'transparent', color: '#ff4d4f', border: '1px solid #ff4d4f', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>
              Log Out
            </button>
          )}

          {estaAutenticado && (
            <div style={{ backgroundColor: '#444', color: 'white', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', border: '1px solid #666' }}>
              {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}