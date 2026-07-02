import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar({ onUploadClick, onViewGallery, showGallery }) {
  const { user, loading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user?.email === 'antenehwondwosen@gmail.com') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  if (!mounted) return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logoGroup}>
          <button onClick={onViewGallery} className={styles.logoBtn}>
            <span className={styles.logoText}>Graduation Gallery</span>
          </button>
          <div className={styles.desktopNavLinks}>
            <button onClick={onViewGallery} className={styles.navLinkBtn}>
              {showGallery ? 'Home' : 'Gallery'}
            </button>
            <Link href="/wishes" className={styles.navLinkBtn}>Wishes</Link>
            {user && (
              <Link href="/profile" className={styles.navLinkBtn}>Profile</Link>
            )}
          </div>
        </div>

        <button className={styles.menuButton} onClick={toggleMenu} aria-label="Menu">
          <span className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`}></span>
        </button>

        <div className={styles.desktopButtons}>
          {loading ? (
            <span className={styles.statusText}>Loading...</span>
          ) : user ? (
            <>
              <div className={styles.userInfo}>
                <span className={styles.userName}>Hi, {user.username}</span>
              </div>
              <button onClick={onUploadClick} className={styles.uploadBtn}>Upload</button>
              <button onClick={logout} className={styles.googleLogoutBtn}>Sign Out</button>
              {isAdmin && <div className={styles.adminBadge}>Admin</div>}
            </>
          ) : (
            <Link href="/login" className={styles.googleLoginBtn}>Log In</Link>
          )}
        </div>

        <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <div className={styles.mobileMenuContent}>
            <button onClick={() => { onViewGallery(); closeMenu(); }} className={styles.mobileNavLink}>
              {showGallery ? 'Home' : 'Gallery'}
            </button>
            <Link href="/wishes" className={styles.mobileNavLink} onClick={closeMenu}>Wishes</Link>
            {user && (
              <Link href="/profile" className={styles.mobileNavLink} onClick={closeMenu}>Profile</Link>
            )}
            <div className={styles.mobileDivider}></div>
            {loading ? (
              <span className={styles.statusText}>Loading...</span>
            ) : user ? (
              <>
                <div className={styles.mobileUserInfo}>
                  <div>
                    <div className={styles.mobileUserName}>Hi, {user.username}</div>
                    {isAdmin && <div className={styles.mobileAdminBadge}>Admin</div>}
                  </div>
                </div>
                <button onClick={() => { onUploadClick(); closeMenu(); }} className={styles.mobileUploadBtn}>
                  Upload Photo
                </button>
                <button onClick={() => { logout(); closeMenu(); }} className={styles.mobileLogoutBtn}>
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className={styles.mobileGoogleLoginBtn} onClick={closeMenu}>Log In</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}