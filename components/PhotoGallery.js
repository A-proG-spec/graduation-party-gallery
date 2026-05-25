import { useState } from 'react';
import PhotoCard from './PhotoCard';
import LightboxModal from './LightboxModal';
import styles from './PhotoGallery.module.css';

export default function PhotoGallery({ photos, isAdminMode, onDelete, onRefresh }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const handlePhotoClick = (index) => {
    setSelectedPhotoIndex(index);
  };

  const handleCloseLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const handleDelete = async (photoId) => {
    const username = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (response.ok) {
        onRefresh();
      } else {
        alert('Failed to delete photo');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting photo');
    }
  };

  if (photos.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No photos uploaded yet. Be the first to share your graduation memories! 🎓</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.gallery}>
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo._id}
            photo={photo}
            isAdminMode={isAdminMode}
            onDelete={() => handleDelete(photo._id)}
            onClick={() => handlePhotoClick(index)}
          />
        ))}
      </div>
      
      {selectedPhotoIndex !== null && (
        <LightboxModal
          photo={photos[selectedPhotoIndex]}
          onClose={handleCloseLightbox}
          onPrev={selectedPhotoIndex > 0 ? handlePrevPhoto : null}
          onNext={selectedPhotoIndex < photos.length - 1 ? handleNextPhoto : null}
          isAdminMode={isAdminMode}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}