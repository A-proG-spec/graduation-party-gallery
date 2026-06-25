// pages/verify.js
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import styles from '../styles/Verify.module.css';

export default function Verify() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (status === 'loading') return <div className={styles.loader}>Loading...</div>;
  if (!session) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          username,
          password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/?view=gallery');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {!success ? (
          <>
            <h1 className={styles.title}>Complete Your Profile</h1>
            <p className={styles.subtitle}>
              Welcome, <strong>{session.user.name}</strong>. Please choose a username and password for additional security.
            </p>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  placeholder="Choose a unique username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={styles.input}
                />
              </div>
              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Submitting...' : 'Set Up Account'}
              </button>
            </form>
            <button onClick={() => signOut()} className={styles.signOutBtn}>
              Sign out
            </button>
          </>
        ) : (
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.successTitle}>Account Verified!</h2>
            <p className={styles.successMessage}>
              Your username <strong>{username}</strong> has been saved. You can now upload photos and leave wishes.
            </p>
            <button onClick={handleContinue} className={styles.continueBtn}>
              Go to Gallery
            </button>
          </div>
        )}
      </div>
    </div>
  );
}