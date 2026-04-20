import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../Context/AuthContext';
import Navbar from '../../Components/NavBar';
import toast from 'react-hot-toast';
import styles from './CrearPropiedad.module.css';
import { mostrarErrorApi } from '../src/utils/manejarErrorApi';

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
      // Extraemos el ID del usuario logueado
      const hostIdRaw = usuario?.id || usuario?.Id;
      
      if (!hostIdRaw) {
        toast.error("Error de sesión. Por favor reingresa.");
        setCargando(false);
        return;
      }

      // ✅ PAYLOAD CORREGIDO: Coincide exactamente con Swagger (camelCase)
      const payload = {
        titulo: formData.titulo,
        ubicacion: formData.ubicacion,
        descripcion: formData.descripcion,
        capacidad: parseInt(formData.capacidad),
        precioPorNoche: parseFloat(formData.precioPorNoche),
        hostId: parseInt(hostIdRaw) 
      };

      // 1. Crear la propiedad
      const respuestaPropiedad = await api.post('/Propiedad', payload);
      const nuevaPropiedadId = respuestaPropiedad.data.id || respuestaPropiedad.data.Id; 

      // 2. Subir la imagen
      const imageData = new FormData();
      imageData.append('imagen', imagen); 

      await api.post(`/Propiedad/${nuevaPropiedadId}/imagen`, imageData, {
        headers: { 'Content-Type': 'multipart/form-data' } 
      });

      toast.success("¡Propiedad publicada con éxito! 🏕️");
      navigate('/mis-propiedades');

    } catch (error) {
      console.error("Error 400 Detalle:", error.response?.data);
      mostrarErrorApi(error, 'crear-propiedad-error');
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
            <label className={styles.label}>Título</label>
            <input name="titulo" onChange={manejarCambio} required className={styles.input} />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Ubicación</label>
            <input name="ubicacion" onChange={manejarCambio} required className={styles.input} />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Descripción</label>
            <textarea name="descripcion" onChange={manejarCambio} required className={`${styles.input} ${styles.textarea}`} />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Capacidad</label>
              <input name="capacidad" type="number" min="1" onChange={manejarCambio} required className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Precio/Noche ($)</label>
              <input name="precioPorNoche" type="number" onChange={manejarCambio} required className={styles.input} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Imagen de la propiedad</label>
            {!previsualizacion ? (
              <div className={styles.uploadArea} onClick={() => fileInputRef.current.click()}>
                <span>📸 Clic para subir foto</span>
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={manejarImagen} />
              </div>
            ) : (
              <div className={styles.previewContainer}>
                <img src={previsualizacion} alt="Previa" className={styles.previewImage} />
                <button type="button" onClick={quitarImagen} className={styles.removeBtn}>✕ Eliminar</button>
              </div>
            )}
          </div>

          <button type="submit" disabled={cargando} className={styles.submitBtn}>
            {cargando ? 'Publicando...' : 'Publicar Propiedad'}
          </button>
        </form>
      </div>
    </div>
  );
}