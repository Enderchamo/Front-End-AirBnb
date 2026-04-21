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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    
    if (!imagen) return toast.error("La imagen principal es obligatoria.");
    
    const hostIdRaw = usuario?.id || usuario?.Id;
    if (!hostIdRaw) return toast.error("Sesión inválida. Reingresa.");

    setCargando(true);

    try {
      const payload = {
        titulo: formData.titulo.trim(),
        ubicacion: formData.ubicacion.trim(),
        descripcion: formData.descripcion.trim(),
        capacidad: parseInt(formData.capacidad) || 1,
        precioPorNoche: parseFloat(formData.precioPorNoche) || 0,
        hostId: parseInt(hostIdRaw) 
      };

      // 1. Crear la propiedad
      const respuestaPropiedad = await api.post('/Propiedad', payload);
      
      // ✅ AJUSTE CLAVE: Extraemos el ID desde .data.data (formato ApiResponse)
      const nuevaPropiedadId = respuestaPropiedad.data.data || respuestaPropiedad.data.id || respuestaPropiedad.data.Id; 

      if (!nuevaPropiedadId) {
        throw new Error("No se pudo obtener el ID de la propiedad creada.");
      }

      // 2. Subir la imagen
      const imageData = new FormData();
      imageData.append('imagen', imagen); 

      await api.post(`/Propiedad/${nuevaPropiedadId}/imagen`, imageData, {
        headers: { 'Content-Type': 'multipart/form-data' } 
      });

      toast.success("¡Propiedad publicada con éxito! 🏕️");
      navigate('/mis-propiedades');

    } catch (error) {
      // 🛠️ ¡Mira qué limpio queda esto ahora!
      mostrarErrorApi(error, "No se pudo publicar la propiedad. Revisa los datos.");
    } finally {
      setCargando(false);
    }
  };

  if (cargandoAuth) return <p className={styles.loadingText}>Verificando...</p>;

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.formCard}>
        <header className={styles.formHeader}>
          <h2 className={styles.title}>Publica tu espacio</h2>
          <p className={styles.subtitle}>Asegúrate de cumplir con los requisitos mínimos de caracteres.</p>
        </header>
        
        <form onSubmit={manejarEnvio} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Título del anuncio</label>
            <input 
              name="titulo" 
              placeholder="Ej: Cabaña rústica con vista al río"
              onChange={manejarCambio} 
              required 
              minLength={"10"}
              maxLength="50"
              className={styles.input} 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Ubicación exacta</label>
            <input 
              name="ubicacion" 
              placeholder="Ej: Jarabacoa, La Vega, República Dominicana"
              onChange={manejarCambio} 
              required 
              minLength="10" 
              className={styles.input} 
            />
            <small className={styles.hint}>Mínimo 10 caracteres requeridos por el sistema.</small>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Descripción</label>
            <textarea 
              name="descripcion" 
              placeholder="Describe lo que hace único a tu espacio..."
              onChange={manejarCambio} 
              required 
              minLength="20"
              className={`${styles.input} ${styles.textarea}`} 
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Capacidad</label>
              <input 
                name="capacidad" 
                type="number" 
                min="1" 
                defaultValue="1"
                onChange={manejarCambio} 
                required 
                className={styles.input} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Precio noche ($)</label>
              <input 
                name="precioPorNoche" 
                type="number" 
                min="0"
                step="0.01"
                onChange={manejarCambio} 
                required 
                className={styles.input} 
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Foto principal</label>
            {!previsualizacion ? (
              <div className={styles.uploadArea} onClick={() => fileInputRef.current.click()}>
                <div className={styles.uploadContent}>
                  <span className={styles.uploadIcon}>📸</span>
                  <span>Haz clic para subir una foto</span>
                </div>
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={manejarImagen} />
              </div>
            ) : (
              <div className={styles.previewContainer}>
                <img src={previsualizacion} alt="Vista previa" className={styles.previewImage} />
                <button type="button" onClick={quitarImagen} className={styles.removeBtn}>
                  Cambiar foto
                </button>
              </div>
            )}
          </div>

          <button type="submit" disabled={cargando} className={styles.submitBtn}>
            {cargando ? 'Publicando...' : 'Publicar anuncio'}
          </button>
        </form>
      </div>
    </div>
  );
}