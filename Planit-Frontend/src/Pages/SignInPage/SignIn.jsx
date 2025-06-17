import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  firestore,
  initFirebase
} from "../../lib/firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithCredential,
  GoogleAuthProvider
} from "firebase/auth";
import {
  doc,
  getDoc
} from "firebase/firestore";
import { BASE_URL } from "../../lib/api";

const SignIn = () => {
  const navigate = useNavigate();
  const googleDivRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  // Set background styling
  useEffect(() => {
    document.body.className = "signin-body";
    return () => {
      document.body.className = "";
    };
  }, []);

  // Google Sign-In button
  useEffect(() => {
    initFirebase();
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
  }, []);

  const handleGoogleCallback = async (response) => {
    try {
      const credential = GoogleAuthProvider.credential(response.credential);
      const result = await signInWithCredential(auth, credential);
      const user = result.user;
      if (!user.emailVerified) await user.reload();

      const userRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists() || !snap.data().username) {
        navigate('/choose-username');
      } else {
        navigate('/main');
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Google Sign-In failed. Try again.");
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await initFirebase();
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      if (!user.emailVerified) {
        await user.reload();
        return setError("Please verify your email before signing in.");
      }

      const userRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists() || !snap.data().username) {
        navigate('/choose-username');
      } else {
        navigate('/main');
      }
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    }
  };

  const handlePasswordReset = async () => {
    setResetMsg("");
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMsg("Reset link sent! Check your inbox.");
    } catch (err) {
      setResetMsg("Failed to send reset link. Try again.");
    }
  };

  return (
    <div className="signin-page">
      <div className="signup-logo">
        <h1>Planit</h1>
      </div>

      <div className="header-container">
        <div className="welcome-signin">
          <h2>Welcome Back! Sign in to plan your next adventure.</h2>
        </div>
      </div>

      <div className="signup-box">
        <form onSubmit={handleEmailSignIn}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign In</button>
        </form>
        {error && <p style={{ color: 'white' }}>{error}</p>}

        <div className="or"><p>or</p></div>

        <div className="google-signin-container" style={{ marginTop: "0rem" }} ref={googleDivRef}></div>
        <p className="signin-link">
          Don’t have an account? <a href="/signup">Sign up</a>
        </p>
      </div>

      <p className="forgotpass-link">
        Forgot your password?{" "}
        <span
          onClick={() =>
            document.getElementById("reset-modal").classList.remove("hidden")
          }
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Click here
        </span>
      </p>

      {/* Password Reset Modal */}
      <div id="reset-modal" className="modal hidden">
        <div className="modal-content">
          <span
            className="close"
            onClick={() =>
              document.getElementById("reset-modal").classList.add("hidden")
            }
          >
            &times;
          </span>
          <h3>Reset Your Password</h3>
          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />
          <button onClick={handlePasswordReset}>Send Reset Link</button>
          <small>{resetMsg}</small>
        </div>
      </div>
    </div>
  );
};

export default SignIn;