import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import {
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import desertBackground from '../../assets/Desert-background.png';

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  // 🔁 Listen for email verification from another tab
  useEffect(() => {
    const handleStorage = async (e) => {
      if (e.key === 'emailVerified' && e.newValue === 'true') {
        console.log("🔁 Detected email verification from another tab.");
        await auth.currentUser?.reload();
        if (auth.currentUser?.emailVerified) {
          localStorage.removeItem('emailVerified');
          navigate('/main');
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await sendEmailVerification(user);
        setMessage('Verification email resent!');
        setCooldown(60);
      } catch (error) {
        console.error(error);
        if (error.code === 'auth/too-many-requests') {
          setMessage('Too many requests. Please wait before trying again.');
          setCooldown(60);
        } else {
          setMessage('Failed to resend. Please try again.');
        }
      }
    } else {
      setMessage('No user found. Try signing in again.');
    }
  };

  const handleCheckVerified = async () => {
    const user = auth.currentUser;
    if (user) {
      console.log("Before reload:", user.emailVerified);

      await user.reload();
      const refreshedUser = auth.currentUser;

      console.log("After reload:", refreshedUser.emailVerified);

      if (refreshedUser.emailVerified) {
        navigate('/main');
      } else {
        setMessage("You're not verified yet. Please check your inbox.");
      }
    } else {
      console.warn("No user is currently signed in.");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/signup');
  };

  return (
    <div
      className="verify-email-page"
      style={{
        backgroundImage: `url(${desertBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <h2>Almost ready to start exploring!</h2>
      <p>We’ve sent a verification email to:</p>
      <p><strong>{auth.currentUser?.email}</strong></p>
      <p>Click the link in your inbox, then return here.</p>

      {message && <p className="resend-msg">{message}</p>}

      <div className="verify-buttons">
        <button onClick={handleResend} disabled={cooldown > 0}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Email'}
        </button>
        <button onClick={handleCheckVerified}>I verified my Email (Reload page)</button>
        <button onClick={() => navigate('/signin')}>Go to Sign In</button>
        <button onClick={handleSignOut}>Wrong Email?</button>
      </div>
    </div>
  );
};

export default VerifyEmail;