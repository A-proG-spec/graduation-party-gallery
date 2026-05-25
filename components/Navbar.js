import { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar({ isAdminMode, onAdminLogin, onAdminLogout, onUploadClick }) {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            🎓 Graduation Party Gallery
          </div>
          
          <div className={styles.navButtons}>
            <button onClick={onUploadClick} className={styles.uploadBtn}>
              📸 Upload Photo
            </button>
            
            {isAdminMode ? (
              <div className={styles.adminControls}>
                <span className={styles.adminBadge}>Admin Mode</span>
                <button onClick={onAdminLogout} className={styles.logoutBtn}>
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className={styles.adminBtn}>
                Admin Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLoginModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Admin Login</h2>
            <input
              type="text"
              id="adminUsername"
              placeholder="Username"
              className={styles.input}
            />
            <input
              type="password"
              id="adminPassword"
              placeholder="Password"
              className={styles.input}
            />
            <div className={styles.modalButtons}>
              <button onClick={() => {
                const username = document.getElementById('adminUsername').value;
                const password = document.getElementById('adminPassword').value;
                
                if (username === process.env.NEXT_PUBLIC_ADMIN_USERNAME && 
                    password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
                  onAdminLogin();
                  setShowLoginModal(false);
                } else {
                  alert('Invalid username or password');
                }
              }} className={styles.loginSubmitBtn}>
                Login
              </button>
              <button onClick={() => setShowLoginModal(false)} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}