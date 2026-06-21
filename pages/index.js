// pages/index.js
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import UploadModal from '../components/UploadModal';
import PhotoGallery from '../components/PhotoGallery';
import LandingPage from '../components/LandingPage';
import styles from '../styles/Home.module.css';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration by only rendering after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Read view from URL query parameter
  useEffect(() => {
    if (router.isReady) {
      const { view } = router.query;
      setShowGallery(view === 'gallery');
    }
  }, [router.isReady, router.query]);

  // Check admin status from session
  useEffect(() => {
    if (session?.user?.email === 'antenehwondwosen@gmail.com') {
      setIsAdmin(true);
    }
  }, [session]);

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/photos');
      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }
      const data = await response.json();
      setPhotos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showGallery) {
      fetchPhotos();
    }
  }, [showGallery, fetchPhotos]);

  const handleUploadSuccess = () => {
    fetchPhotos();
  };

  // Navigate to gallery view
  const handleViewGallery = () => {
    router.push('/?view=gallery', undefined, { shallow: true });
  };

  // Navigate to landing view (remove query)
  const handleViewLanding = () => {
    router.push('/', undefined, { shallow: true });
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  // Show landing page if gallery not active
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

  // Show gallery
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
            <p className={styles.subtitle}>
              Share your special moments from the celebration!
            </p>
          </div>
          
          {loading ? (
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