import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth, initFirebase } from '../../lib/firebase';
import { applyActionCode } from 'firebase/auth';

const EmailActionHandler = () => {
  const [status, setStatus] = useState('Verifying...');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false); // ✅ this stops double runs

  useEffect(() => {
    const verifyEmail = async () => {
      if (hasRun.current) return; // 🛑 already ran
      hasRun.current = true;

      try {
        await initFirebase();

        const oobCode = searchParams.get('oobCode');
        console.log("Using oobCode:", oobCode);

        if (!oobCode) {
          setStatus("Invalid verification link.");
          return;
        }

        await applyActionCode(auth, oobCode);
        console.log("✅ Email verified successfully!");

        localStorage.setItem('emailVerified', 'true');
        setStatus("Email verified! You can return to the other tab.");
      } catch (error) {
        console.error("Verification error:", error);
        localStorage.removeItem('emailVerified');
        setStatus("Verification failed or link expired.");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div>
      <h2>{status}</h2>
      <p>If nothing happens in the other tab, try refreshing it.</p>
    </div>
  );
};

export default EmailActionHandler;