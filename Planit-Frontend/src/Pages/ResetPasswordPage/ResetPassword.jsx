import { useState } from 'react';
import { confirmPasswordReset } from 'firebase/auth';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!oobCode) {
      setError('Invalid or missing reset code.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage('Password reset successful! You can now sign in.');
      setTimeout(() => navigate('/signin'), 3000);
    } catch (err) {
      console.error(err);
      setError('Reset failed. The link may have expired.');
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Your Password</h2>
      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'lightgreen' }}>{message}</p>}
    </div>
  );
};

export default ResetPassword;