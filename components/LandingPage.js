import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import styles from './LandingPage.module.css';

export default function LandingPage({ onViewGallery }) {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.2 }
    );

    ['hero', 'details', 'rsvp'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.landingPage}>
      {/* Hero Section */}
      <section id="hero" className={`${styles.hero} ${isVisible.hero ? styles.visible : ''}`}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>You're Invited!</div>
          <h1 className={styles.heroTitle}>
            Celebrate Addis's Graduation Party<br />
            <span style={{ fontSize: '0.7em' }}>at Home</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Join us for a warm and joyful celebration as we honor Addis's incredible achievement.
            Family, friends, and memories – all in one place.
          </p>
          <div className={styles.heroButtons}>
            <Link href="#details" className={styles.secondaryBtn}>Event Details</Link>
            <button onClick={onViewGallery} className={styles.primaryBtn}>View Gallery</button>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section id="details" className={`${styles.details} ${isVisible.details ? styles.visible : ''}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Event Details</span>
            <h2 className={styles.sectionTitle}>Join the Celebration</h2>
          </div>
          <div className={styles.detailsGrid}>
            <div className={styles.detailCard}>
              <h3>Date</h3>
              <p>Sunday, July 5, 2026</p>
            </div>
            <div className={styles.detailCard}>
              <h3>Time</h3>
              <p>1:00AM ( 7:00 Local Time)</p>
            </div>
            <div className={styles.detailCard}>
              <h3>Location</h3>
              <p><a href="https://graduation-party-gallery.vercel.app/" target="_blank">Kotebe<sub>open in maps</sub></a></p>
            </div>
          </div>
          <div className={styles.detailsMessage}>
            <p>We can't wait to celebrate with you! Share your best wishes and photos on this gallery.</p>
          </div>
        </div>
      </section >

      {/* RSVP / CTA */}
      < section id="rsvp" className={`${styles.rsvp} ${isVisible.rsvp ? styles.visible : ''}`
      }>
        <div className={styles.container}>
          <div className={styles.rsvpContent}>
            <h2>Let Us Know You're Coming</h2>
            <p>We'd love to see you there. Please RSVP by July 5.</p>
            {user ? (
              <button onClick={onViewGallery} className={styles.rsvpBtn}>View Gallery & Share</button>
            ) : (
              <Link href="/register" className={styles.rsvpBtn}>Register to RSVP</Link>
            )}
          </div>
        </div>
      </section >
    </div >
  );
}