import earthImg from '../../assets/Planit_Earth.png';

const Hero = () => {
  return (
    <div className="hero">
      <div className="Graphic">
        <img src={earthImg} alt="Earth" className="earth-img" />
      </div>
      <div className="information">
        <h1>See it. Save it.</h1>
        <h2>Planit.</h2>
        <p>Your travel bucket list <br /> brought to life.</p>
        <div className="buttons">
          <a href="/signup" className="start-btn">Get Started</a>
          <a href="/signin" className="sign-in-btn">Sign In</a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
