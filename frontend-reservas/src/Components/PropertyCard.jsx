import styles from './PropertyCard.module.css';
import { useNavigate } from 'react-router-dom';


export default function PropertyCard({ id, image, title, details, rating }) { 
  const navigate = useNavigate(); 

  return (
  
    <div className={styles.card} onClick={() => navigate(`/propiedad/${id}`)}>
      <img src={image} alt={title} className={styles.image} />
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.details}>{details}</p>
      <div className={styles.rating}>★ {rating}</div>
      <button className={styles.button}>→</button>
    </div>
  );

}