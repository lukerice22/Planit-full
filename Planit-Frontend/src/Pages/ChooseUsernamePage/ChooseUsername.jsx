import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore, initFirebase } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import desertBackground from '../../assets/Desert-background.png';
import { BASE_URL } from '../../lib/api';
import { serverTimestamp } from 'firebase/firestore';


const ChooseUsername = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const guard = async () => {
      await initFirebase();
      const u = auth.currentUser;
      if (!u) return navigate('/signin');
      await u.reload();
      if (!u.emailVerified) return navigate('/verify-email');
    };
    guard();
  }, [navigate]);

  useEffect(() => {
    if (!username.trim()) {
      setStatus('');
      return;
    }

    setStatus('checking');

    const delayDebounce = setTimeout(() => {
      const url = `${BASE_URL}/api/check-username?username=${encodeURIComponent(username)}`;
      console.log("CHECKING URL:", url);

      fetch(url)
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Status ${res.status}: ${text}`);
          }
          return res.json();
        })
        .then((data) => {
          setStatus(data.available ? 'available' : 'taken');
        })
        .catch((err) => {
          console.error("Username check error:", err);
          setStatus("error");
        });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [username]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  if (status !== 'available') {
    setError('Choose an available username.');
    return;
  }
  try {
    const user = auth.currentUser;
    await setDoc(doc(firestore, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      username,
      authProvider: "google",
      createdAt: serverTimestamp(),
    }, { merge: true });

    navigate('/main');
  } catch (err) {
    console.error(err);
    setError('Failed to save. Try again.');
  }
};


  return (
    <div className="Choose-username" style={{
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
    }}>
      <h2>Almost done!</h2>
      <h2>Create a username to start exploring!</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          maxLength={20}
          onChange={e => {
            const val = e.target.value.replace(/[^a-zA-Z0-9._]/g, '');
            setUsername(val);
          }}
          placeholder="Your username"
          required
        />
        <div>
          {status === 'checking' && <span>Checking…</span>}
          {status === 'available' && <span>Available!</span>}
          {status === 'taken' && <span>Taken</span>}
          {status === 'error' && <span>Error checking</span>}
        </div>
        <button type="submit" disabled={status !== 'available'}>
          Save & Continue
        </button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default ChooseUsername;