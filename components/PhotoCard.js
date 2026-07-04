import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './PhotoCard.module.css';

export default function PhotoCard({ photo, isAdminMode, onDelete, onRefresh, onPhotoClick }) {
  const { user } = useAuth();
  const [commentCount, setCommentCount] = useState(photo.commentCount || 0);
  const likes = photo.likes || [];
  const isLiked = user ? likes.includes(user.email) : false;

  // Sync with prop changes (e.g., after refresh)
  useEffect(() => {
    setCommentCount(photo.commentCount || 0);
  }, [photo.commentCount]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('You must be logged in to like photos.');
      return;
    }
    try {
      const response = await fetch('/api/photos/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ photoId: photo._id }),
      });
      if (response.ok) onRefresh();
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this photo?')) return;
    try {
      const response = await fetch(`/api/photos/${photo._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) onDelete();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    onPhotoClick(photo);
  };

  // This function will be called from LightboxModal after a comment is added
  // to increment the count optimistically.
  const incrementCommentCount = () => {
    setCommentCount(prev => prev + 1);
  };

  return (
    <div className={styles.post}>
      <div className={styles.imageWrapper}>
        <img src={photo.cloudinaryUrl} alt={photo.caption || 'Graduation Memory'} className={styles.image} />
      </div>
      <div className={styles.postInfo}>
        <div className={styles.uploaderMeta}>
          <span className={styles.uploaderName}>{photo.uploaderName}</span>
        </div>
        {photo.caption && <p className={styles.caption}>{photo.caption}</p>}
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
            onClick={handleLike}
          >
            <span className={styles.heartIcon}>♥</span> {likes.length}
          </button>
          <button className={styles.actionBtn} onClick={handleCommentClick}>
            💬 <span className={styles.commentCount}>{commentCount}</span>
          </button>
          {(isAdminMode || user?.email === photo.uploaderEmail) && (
            <button className={styles.deleteBtn} onClick={handleDeleteClick}>Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}