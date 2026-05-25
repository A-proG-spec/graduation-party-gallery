import { useState } from 'react';
import styles from './UploadModal.module.css';

export default function UploadModal({ onClose, onUploadSuccess }) {
  const [uploaderName, setUploaderName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleUpload = async () => {
    if (!uploaderName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!selectedFile) {
      setError('Please select a photo');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('uploaderName', uploaderName);
    formData.append('image', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        onUploadSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Upload Your Graduation Photo</h2>

        <div className={styles.formGroup}>
          <label>Your Name:</label>

          <input
            type="text"
            value={uploaderName}
            onChange={(e) => setUploaderName(e.target.value)}
            placeholder="Enter your name"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Select Photo:</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className={styles.fileInput}
          />
        </div>

        {preview && (
          <div className={styles.preview}>
            <img
              src={preview}
              alt="Preview"
              className={styles.previewImage}
            />
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.modalButtons}>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={styles.uploadBtn}
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </button>

          <button
            onClick={onClose}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}