// pages/wishes.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import UploadModal from '../components/UploadModal';
import styles from '../styles/Wishes.module.css';

export default function Wishes() {
  const { data: session } = useSession();
  const router = useRouter();
  const [wishes, setWishes] = useState([]);
  const [newWish, setNewWish] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user?.email === 'antenehwondwosen@gmail.com') {
      setIsAdmin(true);
    }
  }, [session]);

  const fetchWishes = async () => {
    try {
      const response = await fetch('/api/wishes');
      if (response.ok) {
        const data = await response.json();
        setWishes(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
      setWishes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newWish.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newWish }),
      });

      if (response.ok) {
        setNewWish('');
        fetchWishes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWish = async (wishId) => {
    if (!confirm('Are you sure you want to delete this wish?')) return;
    
    try {
      const response = await fetch(`/api/wishes?id=${wishId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchWishes();
      } else {
        alert('Failed to delete wish');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting wish');
    }
  };

  const handleUploadSuccess = () => {
    // Handle if needed
  };

  const handleViewGallery = () => {
    router.push('/');
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Navbar 
        onUploadClick={() => setShowUploadModal(true)}
        onViewGallery={handleViewGallery}
        showGallery={false}
      />
      
      <main className={styles.main}>
        <div className="container">
          <h1 className={styles.title}>🎓 Congratulatory Wishes 🎓</h1>
          <p className={styles.subtitle}>Leave a sweet note or advice for the graduate!</p>

          {session ? (
            <form onSubmit={handleSubmit} className={styles.wishForm}>
              <textarea
                placeholder="Write your wishes here..."
                value={newWish}
                onChange={(e) => setNewWish(e.target.value)}
                disabled={isSubmitting}
                maxLength={500}
                required
              />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post Wish'}
              </button>
            </form>
          ) : (
            <div className={styles.loginPrompt}>
              Please sign in with Google to write a graduation wish!
            </div>
          )}

          {loading ? (
            <div className="loading">Loading wishes...</div>
          ) : wishes.length === 0 ? (
            <div className="loading">No wishes yet. Be the first to leave a wish!</div>
          ) : (
            <div className={styles.wishesGrid}>
              {wishes.map((wish) => (
                <div key={wish._id} className={styles.wishCard}>
                  <div className={styles.cardHeader}>
                    <img src={wish.userImage} alt={wish.userName} className={styles.userAvatar} />
                    <div>
                      <h4>{wish.userName}</h4>
                      <span className={styles.date}>{new Date(wish.createdAt).toLocaleDateString()}</span>
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteWish(wish._id)}
                        className={styles.deleteWishBtn}
                        title="Delete wish"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <p className={styles.message}>{wish.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}