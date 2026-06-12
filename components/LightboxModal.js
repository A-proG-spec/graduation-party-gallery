import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import styles from './LightboxModal.module.css';

export default function LightboxModal({ photo, onClose, onRefresh }) {
  const { data: session } = useSession();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const commentsEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Check admin status
  useEffect(() => {
    if (session?.user?.email === 'antenehwondwosen@gmail.com') {
      setIsAdmin(true);
    }
  }, [session]);

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  // Focus textarea on mobile when opening
  useEffect(() => {
    if (session && window.innerWidth <= 768) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
    }
  }, [session]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/photos/comment?photoId=${photo._id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [photo._id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      alert('Please sign in to leave a comment.');
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/photos/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId: photo._id,
          text: commentText,
        }),
      });

      if (response.ok) {
        setCommentText('');
        fetchComments();
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const response = await fetch(`/api/photos/comment?commentId=${commentId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchComments();
      } else {
        alert('Failed to delete comment');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting comment');
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <button className={styles.closeBtn} onClick={onClose}>×</button>
      
      <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
        {/* Left Side: Photo display */}
        <div className={styles.imagePanel}>
          <img src={photo.cloudinaryUrl} alt={photo.caption} className={styles.largeImage} />
        </div>

        {/* Right Side: Interactive Panels */}
        <div className={styles.interactivePanel}>
          <div className={styles.photoHeader}>
            <img src={photo.uploaderImage} alt={photo.uploaderName} className={styles.avatar} />
            <div className={styles.photoHeaderInfo}>
              <h3>{photo.uploaderName}</h3>
              <p className={styles.date}>{new Date(photo.uploadDate).toLocaleDateString()}</p>
            </div>
          </div>

          {photo.caption && <p className={styles.mainCaption}>{photo.caption}</p>}
          
          <hr className={styles.divider} />

          {/* Comments Scroller */}
          <div className={styles.commentsList}>
            {comments.length === 0 ? (
              <div className={styles.noComments}>
                <span>💬</span>
                <p>No comments yet. Start the conversation!</p>
              </div>
            ) : (
              <>
                {comments.map((comment) => (
                  <div key={comment._id} className={styles.commentItem}>
                    <img src={comment.userImage} alt={comment.userName} className={styles.commentAvatar} />
                    <div className={styles.commentBody}>
                      <div className={styles.commentHeader}>
                        <span className={styles.commentUser}>{comment.userName}</span>
                        <span className={styles.commentTime}>
                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={styles.commentText}>{comment.text}</p>
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteComment(comment._id)}
                        className={styles.deleteCommentBtn}
                        title="Delete comment"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <div ref={commentsEndRef} />
              </>
            )}
          </div>

          {/* Comment Form */}
          {session ? (
            <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
              <div className={styles.commentInputWrapper}>
                <textarea
                  ref={textareaRef}
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={isSubmitting}
                  className={styles.commentInput}
                  rows="1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCommentSubmit(e);
                    }
                  }}
                />
                <button 
                  type="submit" 
                  disabled={isSubmitting || !commentText.trim()} 
                  className={styles.commentSubmitBtn}
                >
                  {isSubmitting ? '...' : '→'}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.loginPrompt}>
              <span>🔐</span>
              <p>Sign in to drop a comment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}