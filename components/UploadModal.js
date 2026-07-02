import { useState } from 'react';
import styles from './UploadModal.module.css';

export default function UploadModal({ onClose, onUploadSuccess }) {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image to upload.');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', image);
    formData.append('caption', caption);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        onUploadSuccess();
        onClose();
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Share a Memory</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="caption">Caption / Memory Context</label>
            <input
              type="text"
              id="caption"
              placeholder="What's happening in this photo?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className={styles.input}
              disabled={isUploading}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="image" className={styles.fileLabel}>
              {previewUrl ? 'Change Image' : 'Select Image'}
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput}
              disabled={isUploading}
            />
          </div>
          {previewUrl && (
            <div className={styles.previewContainer}>
              <img src={previewUrl} alt="Preview" className={styles.previewImage} />
            </div>
          )}
          <div className={styles.modalButtons}>
            <button type="submit" className={styles.submitBtn} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={isUploading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}