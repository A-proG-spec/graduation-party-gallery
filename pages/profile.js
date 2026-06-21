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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ photos: 0, wishes: 0, comments: 0 });
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserPhotos();
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
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const res = await fetch(
        `/api/photos?uploaderEmail=${session.user.email}`
      );

      if (res.ok) {
        const data = await res.json();
        setStats((prev) => ({
          ...prev,
          photos: data.length,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this photo?'
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPhotos((prevPhotos) =>
          prevPhotos.filter((photo) => photo._id !== photoId)
        );

        setStats((prev) => ({
          ...prev,
          photos: prev.photos - 1,
        }));

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

  const handleRefresh = () => {
    fetchUserPhotos();
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

  if (!session) {
    return null;
  }

  return (
    <>
      <Navbar
        onUploadClick={() => setShowUploadModal(true)}
        onViewGallery={handleViewGallery}
        showGallery={false}
      />

      <div className={styles.container}>
        <div className={styles.profileHeader}>
          <h1>{session.user.name}</h1>
          <p className={styles.email}>{session.user.email}</p>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.photos}</span>
              <span className={styles.statLabel}>Photos</span>
            </div>
          </div>
        </div>

        <div className={styles.photosSection}>
          <h2>Your Uploaded Memories</h2>

          {photos.length === 0 ? (
            <p className={styles.noPhotos}>
              You haven't uploaded any photos yet. Share your graduation
              memories!
            </p>
          ) : (
            <div className={styles.gallery}>
              {photos.map((photo) => (
                <PhotoCard
                  key={photo._id}
                  photo={photo}
                  isAdminMode={false}
                  canDelete={true}
                  onDelete={() => handleDeletePhoto(photo._id)}
                  onRefresh={handleRefresh}
                  onPhotoClick={() => {}}
                />
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