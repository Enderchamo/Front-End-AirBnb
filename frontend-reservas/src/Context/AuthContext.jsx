import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

// Creamos el contexto
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  // Al cargar la app, verificamos si hay un token guardado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        // Verificamos si el rol es Host (puede venir como string o como array en .NET)
        const esHost = decoded.role === "Host" || (Array.isArray(decoded.role) && decoded.role.includes("Host"));
        
        setUsuario({
          id: decoded.nameid || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
          email: decoded.email || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
          esHost: esHost
        });
      } catch (error) {
        console.error("Error al decodificar token inicial:", error);
        localStorage.removeItem('token'); // Si el token es inválido o expiró, lo borramos
      }
    }
    setCargandoAuth(false);
  }, []);

  // Función para iniciar sesión
  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    
    const esHost = decoded.role === "Host" || (Array.isArray(decoded.role) && decoded.role.includes("Host"));
    
    setUsuario({
      id: decoded.nameid || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
      email: decoded.email || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
      esHost: esHost
    });
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
  };

  // 🛠️ NUEVA FUNCIÓN: Permite actualizar los roles en el estado actual
  const actualizarUsuario = (nuevosDatos) => {
    setUsuario(prev => ({
      ...prev,
      ...nuevosDatos
    }));
  };

  return (
    <AuthContext.Provider value={{ 
      usuario, 
      login, 
      logout, 
      actualizarUsuario, // Exportamos la nueva función
      estaAutenticado: !!usuario, 
      cargandoAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("❌ ALERTA: Estás intentando usar useAuth (el Cerebro) en un componente que NO está envuelto por el AuthProvider. Revisa dónde estás llamando a este componente.");
  }
  return context;
};