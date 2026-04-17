import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../Context/AuthContext';
import Navbar from '../../Components/NavBar';
import toast from 'react-hot-toast';
import styles from './CrearPropiedad.module.css'; // 👈 Importamos los nuevos estilos

export default function CrearPropiedad() {
  const navigate = useNavigate();
  const { usuario, estaAutenticado, cargandoAuth } = useAuth();
  const [cargando, setCargando] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    ubicacion: '',
    descripcion: '',
    capacidad: 1,
    precioPorNoche: 0
  });

  useEffect(() => {
    if (!cargandoAuth) {
      if (!estaAutenticado || !usuario?.esHost) {
        toast.error("Área restringida: Solo para Anfitriones.", { id: 'restriccion-host' });
        navigate('/');
      }
    }
  }, [estaAutenticado, usuario, cargandoAuth, navigate]);

  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
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

      await api.post('/Propiedad', payload);

      toast.success("¡Propiedad publicada con éxito! 🏠", { duration: 3000 });
      navigate('/mis-propiedades');
    } catch (error) {
      const data = error.response?.data;
      if (data?.errores) toast.error("Revisa: \n" + data.errores.join("\n"));
      else if (data?.error) toast.error("Error: " + data.error);
      else toast.error("Ocurrió un error al crear la propiedad.");
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
            <input 
              name="titulo" 
              onChange={manejarCambio} 
              required 
              placeholder="Ej. Cabaña frente al lago" 
              className={styles.input} 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Ubicación</label>
            <input 
              name="ubicacion" 
              onChange={manejarCambio} 
              required 
              placeholder="Ej. Jarabacoa, República Dominicana" 
              className={styles.input} 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Descripción</label>
            <textarea 
              name="descripcion" 
              onChange={manejarCambio} 
              required 
              placeholder="Describe qué hace especial a tu propiedad..." 
              className={`${styles.input} ${styles.textarea}`} 
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Capacidad (Huéspedes)</label>
              <input 
                name="capacidad" 
                type="number" 
                min="1" 
                onChange={manejarCambio} 
                required 
                className={styles.input} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Precio por Noche ($)</label>
              <input 
                name="precioPorNoche" 
                type="number" 
                step="1" 
                onChange={manejarCambio} 
                required 
                className={styles.input} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={cargando} 
            className={styles.submitBtn}
          >
            {cargando ? 'Publicando propiedad...' : 'Publicar Propiedad'}
          </button>
        </form>
      </div>
    </div>
  );
}