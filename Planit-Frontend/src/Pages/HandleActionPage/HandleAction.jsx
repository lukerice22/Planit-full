import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const HandleAction = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode');

  useEffect(() => {
    if (mode === 'resetPassword') {
      navigate(`/reset-password?${searchParams.toString()}`);
    } else if (mode === 'verifyEmail') {
      navigate(`/email-action?${searchParams.toString()}`);
    } else {
      // fallback if unknown
      navigate('/');
    }
  }, [mode, navigate, searchParams]);

  return <p>Loading...</p>;
};

export default HandleAction;