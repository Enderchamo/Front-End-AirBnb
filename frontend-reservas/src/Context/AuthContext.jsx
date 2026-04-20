import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  
  // 🛠️ Estado para controlar la vista (Anfitrión o Viajero)
  const [modoApp, setModoApp] = useState('anfitrion'); 

  // Simulación de carga de usuario (asegúrate de que tu lógica real esté aquí)
  useEffect(() => {
    const userStorage = localStorage.getItem('usuario');
    if (userStorage) {
      setUsuario(JSON.parse(userStorage));
      setEstaAutenticado(true);
    }
    setCargandoAuth(false);
  }, []);

  const login = (userData) => {
    setUsuario(userData);
    setEstaAutenticado(true);
    localStorage.setItem('usuario', JSON.stringify(userData));
  };

  const logout = () => {
    setUsuario(null);
    setEstaAutenticado(false);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  };

  // 🛠️ Función para alternar el modo
  const alternarModoApp = () => {
    setModoApp(prev => prev === 'anfitrion' ? 'viajero' : 'anfitrion');
  };

  return (
    <AuthContext.Provider value={{ 
      usuario, 
      estaAutenticado, 
      cargandoAuth, 
      login, 
      logout,
      modoApp, 
      alternarModoApp 
    }}>
      {children}
    </AuthContext.Provider>
  );
};