import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConfirmarCuenta from './Paginas/ConfirmarCuenta';
import Login from './Paginas/Login';
import Inicio from './Paginas/Inicio/Inicio.jsx';
import DetallePropiedad from './Paginas/DetallePropiedad/DetallePropiedad.jsx';
import Registro from './Paginas/Registro.jsx';
import MisViajes from './Paginas/MisViajes/MisViajes.jsx';
import MisPropiedades from './Paginas/MisPropiedades/MisPropiedad.jsx';
import EditarPropiedad from './Paginas/EditarPropiedad/EditarPropiedad.jsx';
import CrearPropiedad from './Paginas/CrearPropiedad/CrearPropiedad.jsx';
import { Toaster } from 'react-hot-toast';
import Navbar from './Components/NavBar.jsx';

function App() {
  return (
    <BrowserRouter>

    <Navbar />

    <Toaster position="bottom-right" reverseOrder={false} />
    
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/confirmar-cuenta" element={<ConfirmarCuenta />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/propiedad/:id" element={<DetallePropiedad />} />
        <Route path="/mis-viajes" element={<MisViajes />} />
        <Route path="/mis-propiedades" element={<MisPropiedades />} />
        
        {/* 2. Registramos la ruta para crear propiedades */}
        <Route path="/crear-propiedad" element={<CrearPropiedad />} />
        <Route path="/editar-propiedad/:id" element={<EditarPropiedad />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;