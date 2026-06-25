import { useSession } from 'next-auth/react';
import styles from './PhotoCard.module.css';

export default function PhotoCard({ photo, isAdminMode, onDelete, onRefresh, onPhotoClick }) {
  const { data: session } = useSession();

  const likes = photo.likes || [];
  const isLiked = session ? likes.includes(session.user.email) : false;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!session) {
      alert('You must be signed in to like photos.');
      return;
    }
    try {
      const response = await fetch('/api/photos/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      });
      if (response.ok) onDelete();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    onPhotoClick(photo); // open lightbox
  };

  return (
    <div className={styles.post}>
      {/* Image */}
      <div className={styles.imageWrapper}>
        <img src={photo.cloudinaryUrl} alt={photo.caption || 'Graduation Memory'} className={styles.image} />
      </div>

      {/* Post info */}
      <div className={styles.postInfo}>
        <div className={styles.uploaderMeta}>
          <img src={photo.uploaderImage} alt={photo.uploaderName} className={styles.uploaderAvatar} />
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
            💬 <span className={styles.commentCount}>{photo.commentCount || 0}</span>
          </button>
          {(isAdminMode || session?.user?.email === photo.uploaderEmail) && (
            <button className={styles.deleteBtn} onClick={handleDeleteClick}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}