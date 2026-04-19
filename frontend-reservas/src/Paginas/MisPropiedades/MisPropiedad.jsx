// src/Paginas/MisPropiedades/MisPropiedad.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../Context/AuthContext';
import { mostrarErrorApi } from '../src/utils/manejarErrorApi'; 
import Navbar from '../../Components/NavBar';
import PropertyCard from '../../Components/PropertyCard';
import styles from './MisPropiedades.module.css';
import toast from 'react-hot-toast';

export default function MisPropiedades() {
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { usuario, estaAutenticado, cargandoAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!cargandoAuth && (!estaAutenticado || !usuario?.esHost)) {
      navigate('/');
      return;
    }

    const cargarMisPropiedades = async () => {
      try {
        const respuesta = await api.get('/Propiedad/Buscar');
        // Filtramos por el ID del usuario logueado (usando nameid que es el estándar de tu token)
        const userId = usuario?.id || usuario?.nameid;
        const misProps = respuesta.data.filter(p => String(p.hostId || p.HostId) === String(userId));
        setPropiedades(misProps);
      } catch (err) {
        mostrarErrorApi(err);
      } finally {
        setCargando(false);
      }
    };

    if (usuario) cargarMisPropiedades();
  }, [usuario, estaAutenticado, cargandoAuth, navigate]);

  const manejarBorrar = async (id, titulo) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${titulo}"?`)) return;

    try {
      await api.delete(`/Propiedad/${id}`);
      setPropiedades(propiedades.filter(p => p.id !== id));
      toast.success("Propiedad eliminada correctamente.");
    } catch (err) {
      mostrarErrorApi(err);
    }
  };

  const manejarEditar = (id) => navigate(`/editar-propiedad/${id}`);

  // Helper para la URL de imagen
  const obtenerUrlImagen = (ruta) => {
    if (!ruta) return 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c';
    if (ruta.startsWith('http')) return ruta;
    const rutaLimpia = ruta.replace(/\\/g, '/').replace('wwwroot/', '').replace('~', '');
    return `http://localhost:5085${rutaLimpia.startsWith('/') ? rutaLimpia : '/' + rutaLimpia}`;
  };

  return (
    <div className={styles.contenedor}>
      <Navbar />
      <div className={styles.contenido}>
        <div className={styles.headerFlex}>
          <h1>Mis Propiedades</h1>
          <button className={styles.btnPublicar} onClick={() => navigate('/crear-propiedad')}>
            Publicar Nueva
          </button>
        </div>
        <div className={styles.grid}>
          {propiedades.map(prop => (
            <PropertyCard 
              key={prop.id} 
              id={prop.id}
              title={prop.titulo || prop.Titulo} 
              details={`$${prop.precioPorNoche || prop.PrecioPorNoche} por noche`} 
              rating={5.0}
              image={obtenerUrlImagen(prop.imagenUrl || prop.ImagenUrl)}
              onEdit={manejarEditar}
              onDelete={manejarBorrar}
            />
          ))}
        </div>
      </div>
    </div>
  );
}