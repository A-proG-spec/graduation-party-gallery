import { useState } from 'react';
import PhotoCard from './PhotoCard';
import LightboxModal from './LightboxModal';
import styles from './PhotoGallery.module.css';

export default function PhotoGallery({
  photos = [],
  isAdminMode,
  onDelete,
  onRefresh,
}) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const safePhotos = Array.isArray(photos) ? photos : [];

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
    if (selectedPhotoIndex < safePhotos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const handleDelete = async (photoId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to delete.');
      return;
    }

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        handleCloseLightbox();
        onRefresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete photo');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting photo');
    }
  };

  if (!safePhotos.length) {
    return (
      <div className={styles.emptyState}>
        <p>
          No photos uploaded yet. Be the first to share your graduation memories!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.gallery}>
        {safePhotos.map((photo, index) => (
          <PhotoCard
            key={photo._id}
            photo={photo}
            isAdminMode={isAdminMode}
            onDelete={() => handleDelete(photo._id)}
            onRefresh={onRefresh}
            onPhotoClick={() => handlePhotoClick(index)}
          />
        ))}
      </div>

      {selectedPhotoIndex !== null && (
        <LightboxModal
          photo={safePhotos[selectedPhotoIndex]}
          onClose={handleCloseLightbox}
          onRefresh={onRefresh}
          onPrev={selectedPhotoIndex > 0 ? handlePrevPhoto : null}
          onNext={selectedPhotoIndex < safePhotos.length - 1 ? handleNextPhoto : null}
          isAdminMode={isAdminMode}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}