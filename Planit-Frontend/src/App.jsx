import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage/LandingPage';
import SignIn from './Pages/SignInPage/SignIn';
import SignUp from './Pages/SignUpPage/SignUp';
import MainPage from './Pages/MainPage/MainPage';
import HandleAction from './Pages/HandleActionPage/HandleAction';
import VerifyEmail from './Pages/VerifyEmailPage/VerifyEmail';
import EmailActionHandler from './Pages/EmailActionPage/EmailActionHandler';
import ChooseUsername from './Pages/ChooseUsernamePage/ChooseUsername';
import ResetPassword from './Pages/ResetPasswordPage/ResetPassword';

import { useEffect } from 'react';
import { initFirebase } from './lib/firebase';
import './App.css';

function App() {
  useEffect(() => {
    initFirebase();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/handle-action" element={<HandleAction />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/email-action" element={<EmailActionHandler />} />
        <Route path="/choose-username" element={<ChooseUsername />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;