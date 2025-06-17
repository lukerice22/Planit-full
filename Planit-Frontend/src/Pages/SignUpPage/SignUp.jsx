import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  initFirebase,
  firestore,
} from "../../lib/firebase";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  signInWithCredential,
  GoogleAuthProvider
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import astronautImg from "../../assets/astronaut.png";
import earthImg from "../../assets/Planit_Earth.png";
import { BASE_URL } from "../../lib/api";

const SignUp = () => {
  useEffect(() => {
    document.body.className = "signup-body";
    return () => {
      document.body.className = "";
    };
  }, []);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    symbol: false,
    uppercase: false,
  });
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const googleDivRef = useRef(null);

  const navigate = useNavigate();

  const getFriendlyError = (error) => {
    const code = error.code || "";
    switch (code) {
      case "auth/email-already-in-use":
        return "That email is already in use. Try signing in instead.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Your password is too weak. Try making it longer or adding symbols.";
      case "auth/network-request-failed":
        return "Network issue. Please check your connection.";
      default:
        return "Something went wrong. Try again.";
    }
  };

  const saveUserToFirestore = async (user, username) => {
    try {
      await setDoc(doc(firestore, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
        authProvider: "email",
        createdAt: serverTimestamp(),
      });
    } catch (err) {
    }
  };

  useEffect(() => {
    initFirebase();

    const loadGoogleScript = () => {
      if (!window.google && !document.getElementById("google-signin")) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.id = "google-signin";
        document.body.appendChild(script);
        script.onload = renderGoogleButton;
      } else {
        renderGoogleButton();
      }
    };

    const renderGoogleButton = () => {
  if (window.google && googleDivRef.current) {
    window.google.accounts.id.initialize({
      client_id: "207239909657-ru99oue2vllr7up5f9l9tdj7tqmrud8t.apps.googleusercontent.com",
      callback: handleGoogleCallback,
    });
    window.google.accounts.id.renderButton(googleDivRef.current, {
      theme: "outline",
      size: "large",
      width: "250",
    });
  }
};

const handleGoogleCallback = async (response) => {
  try {
    const credential = GoogleAuthProvider.credential(response.credential);
    const result = await signInWithCredential(auth, credential);
    const user = result.user;

    // Send verification if needed
    if (!user.emailVerified) {
      await sendEmailVerification(user);
    }

    // Check for existing Firestore username
    const userRef = doc(firestore, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists() || !snap.data().username) {
      // No username yet → send them to choose one
      navigate('/choose-username');
    } else {
      // Already has a username → go to main
      navigate('/main');
    }
  } catch (err) {
    console.error("Google sign-in error:", err);
    setError("Google Sign-In failed. Try again.");
  }
};


    loadGoogleScript();
  }, [navigate]);

  useEffect(() => {
    const rules = {
      length: password.length >= 8,
      symbol: /[!@#$%^&*_\-+=.?]/.test(password),
      uppercase: /[A-Z]/.test(password),
    };
    setPasswordRules(rules);
  }, [password]);

  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus("");
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetch(`${BASE_URL}/api/check-username?username=${encodeURIComponent(username)}`)
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Status ${res.status}: ${text}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.available) {
            setUsernameStatus("Username available");
          } else {
            setUsernameStatus("Username taken");
          }
        })
        .catch((err) => {
          console.error("Username check error:", err);
          setUsernameStatus("Error checking username");
        });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (username.length > 20) {
      setError("Username must be 20 characters or less");
      return;
    }

    try {
      const emailMethods = await fetchSignInMethodsForEmail(auth, email);
      if (emailMethods.length > 0) {
        setError("Email already in use.");
        return;
      }

      const res = await fetch(`${BASE_URL}/api/check-username?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (!data.available) {
        setError("Username already in use.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserToFirestore(userCredential.user, username);
      await sendEmailVerification(userCredential.user);

      setSuccess("Loading...");
      setEmail("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/verify-email");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(getFriendlyError(err));
    }
  };

  return (
    <div className="signup-page">

      <div className="signup-logo"><h1>Planit</h1></div>
      <div className="header-container">
        <div className="welcome-signup">
          <h2>Welcome! Create your account to start your next adventure.</h2>
        </div>
      </div>

      <div className="signup-box">
        <form onSubmit={handleSubmit} id="signup-form">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <input
            type="text"
            value={username}
            maxLength="20"
            onChange={(e) => {
              const input = e.target.value;
              const valid = input.replace(/[^a-zA-Z0-9._]/g, "");
              setUsername(valid);
            }}
            placeholder="Username"
            required
          />
          <small id="username-status">{usernameStatus}</small>

          <input
            type="password"
            value={password}
            onFocus={() => setShowPasswordRules(true)}
            onBlur={() => setTimeout(() => setShowPasswordRules(false), 200)}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            required
          />

          {showPasswordRules &&
            !(passwordRules.length && passwordRules.symbol && passwordRules.uppercase) && (
              <div id="password-rules-wrapper">
                <p id="password-header">Password must include:</p>
                <ul id="password-requirements">
                  {!passwordRules.length && <li>- At least 8 characters</li>}
                  {!passwordRules.symbol && <li>- Include a symbol: !@#$%^&*_-+=.?</li>}
                  {!passwordRules.uppercase && <li>- Include a capital letter</li>}
                </ul>
              </div>
            )}

          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}

          <button type="submit" id="submit-btn">Sign up with Email</button>
        </form>

        <div className="or"><p>or</p></div>

        <div className="google-signin-container">
          <div ref={googleDivRef}></div>
        </div>

        <p className="signup-link">
          Already have an account? <a href="/signin">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;