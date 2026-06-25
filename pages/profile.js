// pages/profile.js
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import PhotoCard from '../components/PhotoCard';
import UploadModal from '../components/UploadModal';
import styles from '../styles/Profile.module.css';

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [photos, setPhotos] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ photos: 0, wishes: 0 });
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserPhotos();
      fetchUserWishes();
      fetchUserStats();
    }
  }, [session]);

  const fetchUserPhotos = async () => {
    try {
      const res = await fetch(
        `/api/photos?uploaderEmail=${session.user.email}`
      );
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch (err) {
      console.error('Error fetching user photos:', err);
    }
  };

  const fetchUserWishes = async () => {
    try {
      const res = await fetch(
        `/api/wishes?uploaderEmail=${session.user.email}`
      );
      if (res.ok) {
        const data = await res.json();
        setWishes(data);
      }
    } catch (err) {
      console.error('Error fetching user wishes:', err);
    }
  };

  const fetchUserStats = async () => {
    try {
      const photoRes = await fetch(
        `/api/photos?uploaderEmail=${session.user.email}`
      );
      let photoCount = 0;
      if (photoRes.ok) {
        const data = await photoRes.json();
        photoCount = data.length;
      }

      const wishRes = await fetch(
        `/api/wishes?uploaderEmail=${session.user.email}`
      );
      let wishCount = 0;
      if (wishRes.ok) {
        const data = await wishRes.json();
        wishCount = data.length;
      }

      setStats({
        photos: photoCount,
        wishes: wishCount,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setPhotos((prev) => prev.filter((p) => p._id !== photoId));
        setStats((prev) => ({ ...prev, photos: prev.photos - 1 }));
        alert('Photo deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete photo');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Something went wrong while deleting the photo');
    }
  };

  const handleDeleteWish = async (wishId) => {
    if (!confirm('Are you sure you want to delete this wish?')) return;
    try {
      const response = await fetch(`/api/wishes?id=${wishId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setWishes((prev) => prev.filter((w) => w._id !== wishId));
        setStats((prev) => ({ ...prev, wishes: prev.wishes - 1 }));
        alert('Wish deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete wish');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Something went wrong while deleting the wish');
    }
  };

  const handleRefresh = () => {
    fetchUserPhotos();
    fetchUserWishes();
    fetchUserStats();
  };

  const handleUploadSuccess = () => {
    handleRefresh();
  };

  const handleViewGallery = () => {
    router.push('/?view=gallery');
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar
          onUploadClick={() => setShowUploadModal(true)}
          onViewGallery={handleViewGallery}
          showGallery={false}
        />
        <div className={styles.loader}>Loading profile...</div>
      </>
    );
  }

  if (!session) return null;

  return (
    <>
      <Navbar
        onUploadClick={() => setShowUploadModal(true)}
        onViewGallery={handleViewGallery}
        showGallery={false}
      />

      <div className={styles.container}>
        <div className={styles.profileHeader}>
          <h1>{session.user.username || session.user.name}</h1>
          <p className={styles.email}>{session.user.email}</p>

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

        {/* Photos Section */}
        <div className={styles.photosSection}>
          <h2>Your Uploaded Memories</h2>
          {photos.length === 0 ? (
            <p className={styles.noContent}>
              You haven't uploaded any photos yet. Share your graduation memories!
            </p>
          ) : (
            <div className={styles.gallery}>
              {photos.map((photo) => (
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

        {/* Wishes Section */}
        <div className={styles.wishesSection}>
          <h2>Your Wishes</h2>
          {wishes.length === 0 ? (
            <p className={styles.noContent}>
              You haven't written any wishes yet. Share your thoughts!
            </p>
          ) : (
            <div className={styles.wishesGrid}>
              {wishes.map((wish) => (
                <div key={wish._id} className={styles.wishCard}>
                  <div className={styles.wishHeader}>
                    <span className={styles.wishUser}>{wish.userName}</span>
                    <span className={styles.wishDate}>
                      {new Date(wish.createdAt).toLocaleDateString()}
                    </span>
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
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
}