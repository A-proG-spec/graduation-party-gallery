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
        // If the deleted photo is currently open in the lightbox, close it
        handleCloseLightbox();
        onRefresh();
      } else {
        alert('Failed to delete photo');
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
            onRefresh={onRefresh} // Added to track active state updates for likes
            onPhotoClick={() => handlePhotoClick(index)} // Matched to PhotoCard's internal prop name
          />
        ))}
      </div>

      {selectedPhotoIndex !== null && (
        <LightboxModal
          photo={safePhotos[selectedPhotoIndex]}
          onClose={handleCloseLightbox}
          onRefresh={onRefresh} // Passed down so adding comments updates counts on the main page
          onPrev={selectedPhotoIndex > 0 ? handlePrevPhoto : null}
          onNext={
            selectedPhotoIndex < safePhotos.length - 1
              ? handleNextPhoto
              : null
          }
          isAdminMode={isAdminMode}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}