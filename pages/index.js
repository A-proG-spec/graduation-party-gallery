import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import UploadModal from '../components/UploadModal';
import PhotoGallery from '../components/PhotoGallery';
import LandingPage from '../components/LandingPage';
import styles from '../styles/Home.module.css';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [photos, setPhotos] = useState([]);
  const [photoLoading, setPhotoLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user?.email === 'antenehwondwosen@gmail.com') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    if (router.isReady) {
      setShowGallery(router.query.view === 'gallery');
    }
  }, [router.isReady, router.query]);

  const fetchPhotos = useCallback(async () => {
    try {
      setPhotoLoading(true);
      const response = await fetch('/api/photos');
      if (!response.ok) throw new Error('Failed to fetch photos');
      const data = await response.json();
      setPhotos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setPhotos([]);
    } finally {
      setPhotoLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showGallery) fetchPhotos();
  }, [showGallery, fetchPhotos]);

  const handleUploadSuccess = () => fetchPhotos();

  const handleViewGallery = () => {
    router.push('/?view=gallery', undefined, { shallow: true });
  };

  const handleViewLanding = () => {
    router.push('/', undefined, { shallow: true });
  };

  if (!isMounted) return null;

  if (!showGallery) {
    return (
      <>
        <Navbar
          onUploadClick={() => setShowUploadModal(true)}
          onViewGallery={handleViewGallery}
          showGallery={showGallery}
        />
        <LandingPage onViewGallery={handleViewGallery} />
        {showUploadModal && (
          <UploadModal
            onClose={() => setShowUploadModal(false)}
            onUploadSuccess={handleUploadSuccess}
          />
        )}
      </>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar
        onUploadClick={() => setShowUploadModal(true)}
        onViewGallery={handleViewLanding}
        showGallery={showGallery}
      />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.galleryHeader}>
            <h1 className={styles.title}>Graduation Memories</h1>
            <p className={styles.subtitle}>Share your special moments from the celebration!</p>
          </div>
          {photoLoading ? (
            <div className="loading">Loading photos...</div>
          ) : photos.length === 0 ? (
            <div className="loading">No photos yet. Be the first to upload!</div>
          ) : (
            <PhotoGallery
              photos={photos}
              isAdminMode={isAdmin}
              onDelete={fetchPhotos}
              onRefresh={fetchPhotos}
            />
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