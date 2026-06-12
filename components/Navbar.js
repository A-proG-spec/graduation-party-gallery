// components/Navbar.js
import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar({ onUploadClick, onViewGallery, showGallery }) {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (session?.user?.email === 'antenehwondwosen@gmail.com') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
    } else {
      setIsAdmin(false);
      localStorage.setItem('isAdmin', 'false');
    }
  }, [session]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
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
          <button onClick={onViewGallery} className={styles.logoBtn} title="Home">
            <span className={styles.logoText}>Graduation Gallery</span>
          </button>

          {/* Single desktop navigation block */}
          <div className={styles.desktopNavLinks}>
            <button onClick={onViewGallery} className={styles.navLinkBtn}>
              {showGallery ? 'Home' : 'Gallery'}
            </button>
            <Link href="/wishes" className={styles.navLinkBtn}>
              Wishes
            </Link>
          </div>
        </div>

        {/* Mobile menu button */}
        <button className={styles.menuButton} onClick={toggleMenu} aria-label="Menu">
          <span className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`}></span>
        </button>

        {/* Desktop buttons (user actions) */}
        <div className={styles.desktopButtons}>
          {status === 'loading' ? (
            <span className={styles.statusText}>Loading...</span>
          ) : session ? (
            <>
              <div className={styles.userInfo}>
                <img src={session.user.image} alt={session.user.name} className={styles.avatar} />
                <span className={styles.userName}>Hi, {session.user.name.split(' ')[0]}</span>
              </div>
              <button onClick={onUploadClick} className={styles.uploadBtn}>Upload</button>
              <button onClick={() => signOut()} className={styles.googleLogoutBtn}>Sign Out</button>
              {isAdmin && <div className={styles.adminBadge}>👑 Admin</div>}
            </>
          ) : (
            <button onClick={() => signIn('google')} className={styles.googleLoginBtn}>
              Sign In with Google
            </button>
          )}
        </div>

        {/* Mobile menu overlay */}
        <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <div className={styles.mobileMenuContent}>
            {/* Mobile navigation links */}
            <button onClick={() => { onViewGallery(); closeMenu(); }} className={styles.mobileNavLink}>
              {showGallery ? '🏠 Home' : '📸 Gallery'}
            </button>
            <Link href="/wishes" className={styles.mobileNavLink} onClick={closeMenu}>
              💌 Wishes
            </Link>

            <div className={styles.mobileDivider}></div>

            {status === 'loading' ? (
              <span className={styles.statusText}>Loading...</span>
            ) : session ? (
              <>
                <div className={styles.mobileUserInfo}>
                  <img src={session.user.image} alt={session.user.name} className={styles.mobileAvatar} />
                  <div>
                    <div className={styles.mobileUserName}>{session.user.name}</div>
                    {isAdmin && <div className={styles.mobileAdminBadge}>👑 Admin</div>}
                  </div>
                </div>
                <button onClick={() => { onUploadClick(); closeMenu(); }} className={styles.mobileUploadBtn}>
                  📸 Upload Photo
                </button>
                <button onClick={() => { signOut(); closeMenu(); }} className={styles.mobileLogoutBtn}>
                  Sign Out
                </button>
              </>
            ) : (
              <button onClick={() => { signIn('google'); closeMenu(); }} className={styles.mobileGoogleLoginBtn}>
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}