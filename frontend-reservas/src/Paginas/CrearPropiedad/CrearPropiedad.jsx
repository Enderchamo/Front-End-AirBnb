// src/Paginas/CrearPropiedad/CrearPropiedad.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../Context/AuthContext';
import Navbar from '../../Components/NavBar';
import toast from 'react-hot-toast';
import styles from './CrearPropiedad.module.css';

export default function CrearPropiedad() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { usuario, estaAutenticado, cargandoAuth } = useAuth();
  
  const [cargando, setCargando] = useState(false);
  const [imagen, setImagen] = useState(null); 
  const [previsualizacion, setPrevisualizacion] = useState(null); 
  
  const [formData, setFormData] = useState({
    titulo: '',
    ubicacion: '',
    descripcion: '',
    capacidad: 1,
    precioPorNoche: 0
  });

  useEffect(() => {
    if (!cargandoAuth && (!estaAutenticado || !usuario?.esHost)) {
      toast.error("Área restringida: Solo para Anfitriones.", { id: 'restriccion-host' });
      navigate('/');
    }
  }, [estaAutenticado, usuario, cargandoAuth, navigate]);

  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const manejarImagen = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setImagen(archivo);
    setPrevisualizacion(URL.createObjectURL(archivo));
  };

  const quitarImagen = () => {
    setImagen(null);
    setPrevisualizacion(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!imagen) return toast.error("Por favor, selecciona una imagen principal.");
    
    setCargando(true);

    try {
      const payload = {
        Titulo: formData.titulo,
        Ubicacion: formData.ubicacion,
        Descripcion: formData.descripcion,
        Capacidad: parseInt(formData.capacidad),
        PrecioPorNoche: parseFloat(formData.precioPorNoche),
        HostId: parseInt(usuario.id)
      };

      const respuestaPropiedad = await api.post('/Propiedad', payload);
      const nuevaPropiedadId = respuestaPropiedad.data.id || respuestaPropiedad.data.Id; 

      const imageData = new FormData();
      imageData.append('imagen', imagen); 

      await api.post(`/Propiedad/${nuevaPropiedadId}/imagen`, imageData, {
        headers: { 'Content-Type': 'multipart/form-data' } 
      });

      toast.success("¡Cabaña y foto publicadas con éxito! 🏕️");
      navigate('/mis-propiedades');

    } catch (error) {
      console.error("Error completo:", error);
      const data = error.response?.data;
      if (data?.errores) toast.error("Revisa: \n" + data.errores.join("\n"));
      else if (data?.error) toast.error("Error: " + data.error);
      else toast.error("Error de conexión al servidor.");
    } finally {
      setCargando(false);
    }
  };

  if (cargandoAuth) return <p style={{ textAlign: 'center', marginTop: '3rem' }}>Verificando permisos...</p>;

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.formCard}>
        <h2 className={styles.title}>Publica tu Cabaña</h2>
        
        <form onSubmit={manejarEnvio} className={styles.form}>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Título de la propiedad</label>
            <input name="titulo" onChange={manejarCambio} required placeholder="Ej. Cabaña frente al lago" className={styles.input} />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Ubicación</label>
            <input name="ubicacion" onChange={manejarCambio} required placeholder="Ej. Jarabacoa, República Dominicana" className={styles.input} />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Descripción</label>
            <textarea name="descripcion" onChange={manejarCambio} required placeholder="Describe qué hace especial a tu propiedad..." className={`${styles.input} ${styles.textarea}`} />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Capacidad (Huéspedes)</label>
              <input name="capacidad" type="number" min="1" onChange={manejarCambio} required className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Precio / Noche ($)</label>
              <input name="precioPorNoche" type="number" step="1" onChange={manejarCambio} required className={styles.input} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Foto Principal de la Cabaña</label>
            
            {!previsualizacion ? (
              <div className={styles.uploadArea} onClick={() => fileInputRef.current.click()}>
                <span className={styles.uploadIcon}>📸</span>
                <p className={styles.uploadText}>Haz clic aquí para seleccionar una foto</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  hidden 
                  ref={fileInputRef} 
                  onChange={manejarImagen} 
                />
              </div>
            ) : (
              <div className={styles.previewSingle}>
                <img src={previsualizacion} alt="Previa" className={styles.previewImage} />
                <button type="button" className={styles.removeBtn} onClick={quitarImagen} title="Eliminar foto">✕</button>
              </div>
            )}
          </div>

          <button type="submit" disabled={cargando} className={styles.submitBtn}>
            {cargando ? 'Guardando cabaña...' : 'Publicar Propiedad'}
          </button>
        </form>
      </div>
    </div>
  );
}