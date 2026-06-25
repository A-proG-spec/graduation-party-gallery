import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import styles from './LandingPage.module.css';

export default function LandingPage({ onViewGallery }) {
  const { data: session } = useSession();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  const quotes = [
    {
      text: "Today we celebrate not only a diploma, but years of dedication, courage, and growth.",
      author: "Graduation Celebration"
    },
    {
      text: "Behind every successful graduate is a story of hard work and determination.",
      author: "Family Message"
    },
    {
      text: "The future is bright, and this is only the beginning.",
      author: "Graduation Wish"
    },
    {
      text: "May your dreams be bigger than your fears and your actions louder than your words.",
      author: "Celebration Quote"
    },
    {
      text: "A proud day for family, friends, and a remarkable graduate.",
      author: "Graduation Day"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [quotes.length]);

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

    const elements = ['hero', 'purpose', 'features', 'cta'];
    elements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: "📸",
      title: "Share Party Photos",
      description: "Upload photos from Addis's graduation party at home – capture the joy, the decorations, and her proud smile."
    },
    {
      icon: "💌",
      title: "Leave Wishes",
      description: "Write congratulatory messages and words of encouragement for Addis's bright future."
    },
    {
      icon: "❤️",
      title: "Like & Comment",
      description: "Engage with each memory by liking and commenting on favorite photos from the celebration."
    },
    {
      icon: "📖",
      title: "Guestbook",
      description: "Sign the digital guestbook with your stories, advice, and love for Addis."
    }
  ];

  return (
    <div className={styles.landingPage}>
      {/* Hero Section */}
      <section id="hero" className={`${styles.hero} ${isVisible.hero ? styles.visible : ''}`}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Class of 2026</div>
          <h1 className={styles.heroTitle}>
            Celebrate Addis's Graduation Party <br />at Home
          </h1>
          <p className={styles.heroSubtitle}>
            Addis's family invites you to relive every moment of her special day - a warm, intimate graduation celebration hosted in her home.
          </p>

          <div className={styles.quoteContainer}>
            <div className={styles.quoteIcon}>"</div>
            <p className={styles.quoteText}>{quotes[currentQuoteIndex].text}</p>
            <p className={styles.quoteAuthor}>— {quotes[currentQuoteIndex].author}</p>
          </div>

          <div className={styles.heroButtons}>
            <Link href="#purpose" className={styles.secondaryBtn}>
              Learn More
            </Link>
            {onViewGallery && (
              <button onClick={onViewGallery} className={styles.primaryBtn}>
                View Gallery
              </button>
            )}
          </div>

          <div className={styles.scrollIndicator}>
            <span>Scroll to explore</span>
            <div className={styles.scrollArrow}>↓</div>
          </div>
        </div>
      </section>

      {/* Purpose Section */}
      <section id="purpose" className={`${styles.purpose} ${isVisible.purpose ? styles.visible : ''}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Her Story</span>
            <h2 className={styles.sectionTitle}>A Home Celebration to Remember</h2>
            <p className={styles.sectionSubtitle}>
              Graduating is a milestone, but celebrating at home makes it even sweeter for Addis and her loved ones.
            </p>
          </div>

          <div className={styles.purposeContent}>
            <div className={styles.purposeImage}>
              <img src="/download.jpg" alt="Addis's graduation celebration at home" />
              <div className={styles.imageCaption}>Addis's joy on her graduation day at home</div>
            </div>
            <div className={styles.purposeText}>
              <div className={styles.purposeCard}>
                <h3>Celebrate Addis's Big Day at Home</h3>
                <p>
                  From the proud moment she receives her diploma to cutting the cake with family, every memory of Addis's home graduation party is preserved here.
                </p>
              </div>
              <div className={styles.purposeCard}>
                <h3>Bring Family and Friends Together</h3>
                <p>
                  Even those who couldn't attend her home party can share photos, videos, and heartfelt messages to join the celebration.
                </p>
              </div>
              <div className={styles.purposeCard}>
                <h3>A Legacy of Determination</h3>
                <p>
                  Addis's achievement inspires others to pursue their dreams; this celebration showcases how dedication and family support lead to success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`${styles.features} ${isVisible.features ? styles.visible : ''}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Party Features</span>
            <h2 className={styles.sectionTitle}>Ways to Celebrate Addis</h2>
            <p className={styles.sectionSubtitle}>
              Share your love and memories of her home graduation party.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={styles.featureCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className={`${styles.cta} ${isVisible.cta ? styles.visible : ''}`}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Share Your Wishes for Addis</h2>
            <p className={styles.ctaText}>
              Even if you couldn't attend the party, you can still leave a heartfelt message and celebrate her achievement.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}