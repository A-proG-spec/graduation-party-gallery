import { useEffect } from 'react';
import Image from 'next/image';
import styles from './LightboxModal.module.css';

export default function LightboxModal({ photo, onClose, onPrev, onNext, isAdminMode, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose, onPrev, onNext]);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this photo?')) {
      onDelete(photo._id);
      onClose();
    }
  };

  return (
    <div className={styles.lightboxOverlay} onClick={onClose}>
      <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        
        {onPrev && (
          <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={onPrev}>
            ❮
          </button>
        )}
        
        {onNext && (
          <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={onNext}>
            ❯
          </button>
        )}
        
        <div className={styles.imageContainer}>
          <Image
            src={photo.cloudinaryUrl}
            alt={`By ${photo.uploaderName}`}
            width={800}
            height={800}
            style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
            priority={true}
          />
        </div>
        
        <div className={styles.photoInfo}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Uploaded by:</span>
            <span className={styles.value}>{photo.uploaderName}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Date:</span>
            <span className={styles.value}>{formatDate(photo.uploadDate)}</span>
          </div>
          {isAdminMode && (
            <button onClick={handleDelete} className={styles.adminDeleteBtn}>
              🗑️ Delete This Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}