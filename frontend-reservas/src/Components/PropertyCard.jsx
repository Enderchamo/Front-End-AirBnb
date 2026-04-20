import styles from './PropertyCard.module.css';
import { useNavigate } from 'react-router-dom';

export default function PropertyCard({ id, image, title, details, rating, onEdit, onDelete }) { 
  const navigate = useNavigate(); 

  return (
    <div className={styles.card} onClick={() => navigate(`/propiedad/${id}`)}>
      <div className={styles.imageWrapper}>
        <img src={image} alt={title} className={styles.image} />
        {/* Calificación flotante sobre la imagen */}
        <div className={styles.ratingBadge}>★ {rating}</div>
      </div>

      <div className={styles.infoContent}>
        <h4 className={styles.title}>{title}</h4>
        <p className={styles.details}>{details}</p>
      </div>

      <div className={styles.footerActions}>
        {onEdit || onDelete ? (
          <div className={styles.adminActions}>
            {onEdit && (
              <button 
                className={styles.editBtn} 
                onClick={(e) => {
                  e.stopPropagation(); 
                  onEdit(id);
                }}
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button 
                className={styles.deleteBtn} 
                onClick={(e) => {
                  e.stopPropagation(); 
                  onDelete(id, title);
                }}
              >
                Eliminar
              </button>
            )}
          </div>
        ) : (
          <button className={styles.viewButton}>Ver detalles →</button>
        )}
      </div>
    </div>
  );
}