import profileImg from '../../assets/profile.png';

const MainNavbar = () => {
  return (
    <div className="navbar-main">
      <div className="logo-wrapper">
        <span className="logo-main">Planit</span>
        <span className="dot">•</span>
        <span className="slogan">Where are we going?</span>
      </div>

      <div className="navlinks-main">
        <a href="?">🌍Explore</a>
        <a href="?">✈️Trips</a>
        <a href="?">💬Friends</a>
      </div>

      <div>
        <a href="?">
          <img src={profileImg} className="profile-pic" alt="profile" />
        </a>
      </div>

      <div className="menu"><span></span></div>
    </div>
  );
};

export default MainNavbar;
