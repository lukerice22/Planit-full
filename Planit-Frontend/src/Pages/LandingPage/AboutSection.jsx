import aboutImg from '../../assets/About-Section.png';

const AboutSection = () => {
  return (
    <section id="about">
      <div className="about-content">
        <img src={aboutImg} alt="Travel graphic" className="about-img" />
        <div className="text">
          <h2>Your World, Mapped</h2>
          <p>
            Have you ever found a place you want to visit, whether it's from social media,
            a movie, or even an ad, just to forget it within hours? With Planit
            you can pin it, track it, and make it happen.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
