import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import UploadModal from '../components/UploadModal';
import PhotoGallery from '../components/PhotoGallery';
import styles from '../styles/Home.module.css';

export default function Home() {
  // 1. Fixed: Initialize state directly from localStorage to prevent cascading re-renders
  const [isAdminMode, setIsAdminMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminMode') === 'true';
    }
    return false;
  });

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // 2. Fixed: Moved function above useEffect so it is declared before being accessed
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/photos');
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch photos on component mount
  useEffect(() => {
    fetchPhotos();
  }, []); 

  const handleAdminLogin = () => {
    setIsAdminMode(true);
    localStorage.setItem('adminMode', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminMode(false);
    localStorage.removeItem('adminMode');
  };

  const handleUploadSuccess = () => {
    fetchPhotos(); // Refresh gallery
  };

  return (
    <div className={styles.container}>
      <Navbar
        isAdminMode={isAdminMode}
        onAdminLogin={handleAdminLogin}
        onAdminLogout={handleAdminLogout}
        onUploadClick={() => setShowUploadModal(true)}
      />
      
      <main className={styles.main}>
        <div className="container">
          <h1 className={styles.title}>🎉 Graduation Memories 🎓</h1>
          <p className={styles.subtitle}>
            Share your special moments from the celebration!
          </p>
          
          {loading ? (
            <div className="loading">Loading photos...</div>
          ) : (
            <PhotoGallery
              photos={photos}
              isAdminMode={isAdminMode}
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