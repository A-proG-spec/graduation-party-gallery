import Image from 'next/image';
import styles from './PhotoCard.module.css';

export default function PhotoCard({ photo, isAdminMode, onDelete, onClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this photo?')) {
      onDelete(photo._id);
    }
  };

  return (
    <div className={styles.photoCard} onClick={onClick}>
      <div className={styles.imageContainer}>
        <Image
          src={photo.cloudinaryUrl}
          alt={`By ${photo.uploaderName}`}
          width={400}
          height={400}
          style={{ objectFit: 'cover' }}
          loading="lazy"
        />
        {isAdminMode && (
          <button 
            onClick={handleDelete}
            className={styles.deleteBtn}
            title="Delete photo"
          >
            🗑️
          </button>
        )}
      </div>
      
      <div className={styles.info}>
        <div className={styles.uploaderName}>📸 {photo.uploaderName}</div>
        <div className={styles.uploadDate}>📅 {formatDate(photo.uploadDate)}</div>
      </div>
    </div>
  );
}