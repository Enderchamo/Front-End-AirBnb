// src/Paginas/EditarPropiedad/EditarPropiedad.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../Context/AuthContext';
import Navbar from '../../Components/NavBar';
import toast from 'react-hot-toast';
import styles from '../CrearPropiedad/CrearPropiedad.module.css';

export default function EditarPropiedad() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { usuario, estaAutenticado, cargandoAuth } = useAuth();
  
  const [cargando, setCargando] = useState(true);
  
  // 🛠️ AQUÍ ESTÁ LA SOLUCIÓN AL ERROR: Declaramos el estado 'enviando'
  const [enviando, setEnviando] = useState(false); 
  
  const [imagen, setImagen] = useState(null); 
  const [previsualizacion, setPrevisualizacion] = useState(null); 
  
  const [formData, setFormData] = useState({
    titulo: '',
    ubicacion: '',
    descripcion: '',
    capacidad: 1,
    precioPorNoche: 0
  });

  const obtenerUrlImagen = (ruta) => {
    if (!ruta) return 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c';
    if (ruta.startsWith('http')) return ruta;
    let rutaLimpia = ruta.replace(/\\/g, '/').replace('wwwroot/', '').replace('~', '');
    if (!rutaLimpia.startsWith('/')) rutaLimpia = '/' + rutaLimpia;
    return `http://localhost:5085${rutaLimpia}`;
  };

  useEffect(() => {
    if (!cargandoAuth && (!estaAutenticado || !usuario?.esHost)) {
      navigate('/');
    }
  }, [estaAutenticado, usuario, cargandoAuth, navigate]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const respuesta = await api.get(`/Propiedad/${id}`);
        const p = respuesta.data;
        setFormData({
          titulo: p.titulo || p.Titulo,
          ubicacion: p.ubicacion || p.Ubicacion,
          descripcion: p.descripcion || p.Descripcion,
          capacidad: p.capacidad || p.Capacidad,
          precioPorNoche: p.precioPorNoche || p.PrecioPorNoche
        });
        
        if (p.imagenUrl || p.ImagenUrl) {
            setPrevisualizacion(obtenerUrlImagen(p.imagenUrl || p.ImagenUrl));
        }
      } catch (error) {
        toast.error("No se pudo cargar la propiedad.");
        navigate('/mis-propiedades');
      } finally {
        setCargando(false);
      }
    };
    if (!cargandoAuth && estaAutenticado) cargarDatos();
  }, [id, cargandoAuth, estaAutenticado]);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setEnviando(true); // Ya no lanzará el ReferenceError
    
    try {
      // 🛠️ Enviamos los datos sin el HostId para evitar el error 400/500 de .NET
      await api.put(`/Propiedad/${id}`, {
        Titulo: formData.titulo,
        Ubicacion: formData.ubicacion,
        Descripcion: formData.descripcion,
        Capacidad: parseInt(formData.capacidad),
        PrecioPorNoche: parseFloat(formData.precioPorNoche)
      });

      if (imagen) {
        const imageData = new FormData();
        imageData.append('imagen', imagen);
        await api.post(`/Propiedad/${id}/imagen`, imageData);
      }
      
      toast.success("¡Cabaña actualizada!");
      navigate('/mis-propiedades');
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la propiedad.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando || cargandoAuth) return <p style={{ textAlign: 'center', marginTop: '5rem' }}>Cargando datos...</p>;

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.formCard}>
        <h2 className={styles.title}>Editar Cabaña</h2>
        <form onSubmit={manejarEnvio} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Título</label>
            <input name="titulo" value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} required className={styles.input} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Ubicación</label>
            <input name="ubicacion" value={formData.ubicacion} onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} required className={styles.input} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Descripción</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} required className={`${styles.input} ${styles.textarea}`} />
          </div>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Capacidad</label>
              <input name="capacidad" type="number" value={formData.capacidad} onChange={(e) => setFormData({...formData, capacidad: e.target.value})} required className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Precio / Noche</label>
              <input name="precioPorNoche" type="number" value={formData.precioPorNoche} onChange={(e) => setFormData({...formData, precioPorNoche: e.target.value})} required className={styles.input} />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Imagen Principal</label>
            <div className={styles.uploadArea} onClick={() => fileInputRef.current.click()}>
              <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={(e) => {
                const file = e.target.files[0];
                if (file) { setImagen(file); setPrevisualizacion(URL.createObjectURL(file)); }
              }} />
              {previsualizacion ? (
                 <img src={previsualizacion} alt="Previa" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }} />
              ) : (
                 <p className={styles.uploadText}>Haz clic para subir una imagen</p>
              )}
            </div>
          </div>
          <button type="submit" disabled={enviando} className={styles.submitBtn}>
            {enviando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}