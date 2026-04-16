import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConfirmarCuenta from './Paginas/ConfirmarCuenta';
import Login from './Paginas/Login';
import Inicio from './Paginas/Inicio/Inicio.jsx';
import DetallePropiedad from './Paginas/DetallePropiedad/DetallePropiedad.jsx';
import Registro from './Paginas/Registro.jsx';
import MisViajes from './Paginas/MisViajes/MisViajes.jsx';
import MisPropiedades from './Paginas/MisPropiedades/MisPropiedad.jsx';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>

    <Toaster position="bottom-right" reverseOrder={false} />
    
      <Routes>
        {/* Ruta principal (temporalmente vacía) */}
        <Route path="/" element={<Inicio />} />
        
        {/* Ruta a la que apunta el botón del correo */}
        <Route path="/confirmar-cuenta" element={<ConfirmarCuenta />} />

        <Route path="/registro" element={<Registro />} />
        
        {/*Ruta para e login*/}
        <Route path="/login" element={<Login />} />

        <Route path="/propiedad/:id" element={<DetallePropiedad />} />

        <Route path="/mis-viajes" element={<MisViajes />} />
        <Route path="/mis-propiedades" element={<MisPropiedades />} />

  
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;