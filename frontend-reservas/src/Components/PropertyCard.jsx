import styles from './PropertyCard.module.css';
import { useNavigate } from 'react-router-dom';

export default function PropertyCard({ id, image, title, details, rating, onEdit, onDelete, onBlock }) { 
  const navigate = useNavigate(); 

  return (
    <div className={styles.card} onClick={() => navigate(`/propiedad/${id}`)}>
      <div className={styles.imageWrapper}>
        <img src={image} alt={title} className={styles.image} />
        <div className={styles.ratingBadge}>★ {rating}</div>
      </div>

      <div className={styles.infoContent}>
        <h4 className={styles.title}>{title}</h4>
        <p className={styles.details}>{details}</p>
      </div>

      <div className={styles.footerActions}>
        {(onEdit || onDelete || onBlock) ? (
          <div className={styles.adminActions}>
            {onEdit && (
              <button className={styles.editBtn} onClick={(e) => { e.stopPropagation(); onEdit(id); }}>
                Editar
              </button>
            )}

            {/* Botón de Bloqueo añadido */}
            {onBlock && (
              <button 
                className={styles.blockBtn} 
                onClick={(e) => {
                  e.stopPropagation(); 
                  onBlock(id, title);
                }}
              >
                Bloquear
              </button>
            )}

            {onDelete && (
              <button className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); onDelete(id, title); }}>
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