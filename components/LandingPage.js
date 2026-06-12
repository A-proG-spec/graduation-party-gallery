// components/LandingPage.js
import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const { data: session } = useSession();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  const quotes = [
    {
      text: "The tassel was worth the hassle!",
      author: "Graduation Saying"
    },
    {
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela"
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt"
    },
    {
      text: "Your graduation is not the end; it's the beginning of your next chapter.",
      author: "Unknown"
    },
    {
      text: "Dream big, work hard, stay focused, and surround yourself with good people.",
      author: "Graduate Wisdom"
    }
  ];

  useEffect(() => {
    // Rotate quotes every 5 seconds
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [quotes.length]);

  useEffect(() => {
    // Intersection Observer for scroll animations
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
      icon: "",
      title: "Share Memories",
      description: "Upload your favorite graduation photos and celebrate the achievement with friends and family."
    },
    {
      icon: "",
      title: "Leave Wishes",
      description: "Write congratulatory messages, advice, and wishes for the graduate's bright future."
    },
    {
      icon: "",
      title: "Like & Comment",
      description: "Engage with photos by liking them and leaving encouraging comments."
    },
    {
      icon: "",
      title: "Guestbook",
      description: "Sign the digital guestbook with your wishes and memories of the celebration."
    }
  ];

  return (
    <div className={styles.landingPage}>
      {/* Hero Section */}
      <section id="hero" className={`${styles.hero} ${isVisible.hero ? styles.visible : ''}`}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>🎓 Class of 2026</div>
          <h1 className={styles.heroTitle}>
            Celebrate Your
            <span className={styles.gradientText}> Graduation Journey</span>
          </h1>
          <p className={styles.heroSubtitle}>
            A digital gallery to capture, share, and celebrate every precious moment of your graduation day
          </p>
          
          {/* Rotating Quote */}
          <div className={styles.quoteContainer}>
            <div className={styles.quoteIcon}>"</div>
            <p className={styles.quoteText}>{quotes[currentQuoteIndex].text}</p>
            <p className={styles.quoteAuthor}>— {quotes[currentQuoteIndex].author}</p>
          </div>

          <div className={styles.heroButtons}>
            <Link href="#purpose" className={styles.secondaryBtn}>
              Learn More
            </Link>
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
            <span className={styles.sectionTag}>Our Mission</span>
            <h2 className={styles.sectionTitle}>Why We Created This Gallery</h2>
            <p className={styles.sectionSubtitle}>
              Every graduation tells a unique story of perseverance, growth, and achievement
            </p>
          </div>

          <div className={styles.purposeContent}>
            <div className={styles.purposeImage}>
              <img src="/download.jpg" alt="Graduation Celebration" />
              <div className={styles.imageCaption}>Creating memories that last a lifetime</div>
            </div>
            <div className={styles.purposeText}>
              <div className={styles.purposeCard}>
                <h3>Preserve Precious Moments</h3>
                <p>
                  Graduation day is one of life's most significant milestones. Our platform helps you 
                  capture every smile, tear of joy, and proud moment so you can relive them forever.
                </p>
              </div>
              <div className={styles.purposeCard}>
                <h3>Connect Loved Ones</h3>
                <p>
                  Bring together family and friends from around the world to share in the celebration, 
                  even if they couldn't attend in person.
                </p>
              </div>
              <div className={styles.purposeCard}>
                <h3>Inspire Future Graduates</h3>
                <p>
                  Create a legacy of inspiration for future graduates by showcasing the joy and 
                  accomplishment that comes with earning your degree.
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
            <span className={styles.sectionTag}>Features</span>
            <h2 className={styles.sectionTitle}>What You Can Do Here</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need to celebrate and share your graduation memories
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
            <h2 className={styles.ctaTitle}>Ready to Share Your Journey?</h2>
            <p className={styles.ctaText}>
              Join our community and celebrate your achievements with the world
            </p>
  
          </div>
        </div>
      </section>
    </div>
  );
}