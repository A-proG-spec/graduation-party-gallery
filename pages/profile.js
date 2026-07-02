import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import PhotoCard from '../components/PhotoCard';
import UploadModal from '../components/UploadModal';
import styles from '../styles/Profile.module.css';

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({ photos: 0, wishes: 0 });
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user?.email) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const photoRes = await fetch(`/api/photos?uploaderEmail=${user.email}`, { headers });
      const wishRes = await fetch(`/api/wishes?uploaderEmail=${user.email}`, { headers });

      const photosData = photoRes.ok ? await photoRes.json() : [];
      const wishesData = wishRes.ok ? await wishRes.json() : [];

      setPhotos(photosData);
      setWishes(wishesData);
      setStats({ photos: photosData.length, wishes: wishesData.length });
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setPhotos(prev => prev.filter(p => p._id !== photoId));
        setStats(prev => ({ ...prev, photos: prev.photos - 1 }));
      } else {
        alert('Failed to delete photo');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting photo');
    }
  };

  const handleDeleteWish = async (wishId) => {
    if (!confirm('Are you sure you want to delete this wish?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/wishes?id=${wishId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setWishes(prev => prev.filter(w => w._id !== wishId));
        setStats(prev => ({ ...prev, wishes: prev.wishes - 1 }));
      } else {
        alert('Failed to delete wish');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting wish');
    }
  };

  const handleRefresh = () => fetchUserData();
  const handleUploadSuccess = () => handleRefresh();
  const handleViewGallery = () => router.push('/?view=gallery');

  if (loading || statsLoading) {
    return (
      <>
        <Navbar onUploadClick={() => setShowUploadModal(true)} onViewGallery={handleViewGallery} showGallery={false} />
        <div className={styles.loader}>Loading profile...</div>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar onUploadClick={() => setShowUploadModal(true)} onViewGallery={handleViewGallery} showGallery={false} />
      <div className={styles.container}>
        <div className={styles.profileHeader}>
          <h1>{user.username}</h1>
          <p className={styles.email}>{user.email}</p>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.photos}</span>
              <span className={styles.statLabel}>Photos</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.wishes}</span>
              <span className={styles.statLabel}>Wishes</span>
            </div>
          </div>
        </div>

        <div className={styles.photosSection}>
          <h2>Your Uploaded Memories</h2>
          {photos.length === 0 ? (
            <p className={styles.noContent}>You haven't uploaded any photos yet.</p>
          ) : (
            <div className={styles.gallery}>
              {photos.map(photo => (
                <PhotoCard
                  key={photo._id}
                  photo={photo}
                  isAdminMode={false}
                  onDelete={() => handleDeletePhoto(photo._id)}
                  onRefresh={handleRefresh}
                  onPhotoClick={() => {}}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.wishesSection}>
          <h2>Your Wishes</h2>
          {wishes.length === 0 ? (
            <p className={styles.noContent}>You haven't written any wishes yet.</p>
          ) : (
            <div className={styles.wishesGrid}>
              {wishes.map(wish => (
                <div key={wish._id} className={styles.wishCard}>
                  <div className={styles.wishHeader}>
                    <span className={styles.wishUser}>{wish.userName}</span>
                    <span className={styles.wishDate}>{new Date(wish.createdAt).toLocaleDateString()}</span>
                    <button
                      className={styles.deleteWishBtn}
                      onClick={() => handleDeleteWish(wish._id)}
                      title="Delete wish"
                    >
                      ×
                    </button>
                  </div>
                  <p className={styles.wishMessage}>{wish.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} onUploadSuccess={handleUploadSuccess} />
      )}
    </>
  );
}