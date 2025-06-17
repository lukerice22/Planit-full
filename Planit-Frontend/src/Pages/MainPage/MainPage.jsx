import MainNavbar from './MainNavbar';
import Sidebar from './Sidebar.jsx';
import Map from './Map.jsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, initFirebase } from '../../lib/firebase';
import '../../App.css';

const MainPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      await initFirebase(); // ✅ Ensure Firebase is initialized

      const user = auth.currentUser;

      if (!user) {
        navigate('/signin');
        return;
      }

      await user.reload();
      if (!user.emailVerified) {
        navigate('/verify-email');
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  if (loading) return <p style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>Loading...</p>;

  return (
    <div className="main-page">
      <MainNavbar />
      <Map />
      <Sidebar />
    </div>
  );
};

export default MainPage;