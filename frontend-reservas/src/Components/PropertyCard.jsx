// src/Components/PropertyCard.jsx
import styles from './PropertyCard.module.css';
import { useNavigate } from 'react-router-dom';

export default function PropertyCard({ id, image, title, details, rating, onEdit, onDelete }) { 
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
        {onEdit || onDelete ? (
          <div className={styles.adminActions}>
            {onEdit && (
              <button 
                className={`${styles.actionBtn} ${styles.editBtn}`}
                onClick={(e) => {
                  e.stopPropagation(); 
                  onEdit(id);
                }}
              >
                {/* Icono de Lápiz */}
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>
                Editar
              </button>
            )}
            {onDelete && (
              <button 
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                onClick={(e) => {
                  e.stopPropagation(); 
                  onDelete(id, title);
                }}
              >
                {/* Icono de Basurero */}
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                Borrar
              </button>
            )}
          </div>
        ) : (
          <button className={styles.viewButton}> Ver detalles → </button>
        )}
      </div>
    </div>
  );
}