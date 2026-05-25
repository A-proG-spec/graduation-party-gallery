import { useEffect, useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar({
  onAdminLogin,
  onAdminLogout,
  onUploadClick,
}) {
  const [mounted, setMounted] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('adminMode');
    if (stored === 'true') setIsAdminMode(true);
  }, []);

  const handleLogin = () => {
    const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    if (username === adminUsername && password === adminPassword) {
      localStorage.setItem('adminMode', 'true');
      setIsAdminMode(true);
      onAdminLogin?.();
      setShowLoginModal(false);
      setUsername('');
      setPassword('');
    } else {
      alert('Invalid username or password');
    }
  };

  const handleLogout = () => {
    localStorage.setItem('adminMode', 'false');
    setIsAdminMode(false);
    onAdminLogout?.();
  };

  if (!mounted) return null;

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            Graduation Gallery
          </div>

          <div className={styles.navButtons}>
            {/* Upload button always visible for everyone */}
            <button
              onClick={onUploadClick}
              className={styles.uploadBtn}
            >
              Upload Photo
            </button>

            {isAdminMode ? (
              <div className={styles.adminControls}>
                <span className={styles.adminBadge}>
                  Admin Mode
                </span>
                <button
                  onClick={handleLogout}
                  className={styles.logoutBtn}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className={styles.adminBtn}
              >
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
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <div className={styles.modalButtons}>
              <button onClick={handleLogin} className={styles.loginSubmitBtn}>
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