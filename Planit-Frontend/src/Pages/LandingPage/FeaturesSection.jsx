import featuresImg from '../../assets/features-img.png';

const FeaturesSection = () => {
  return (
    <section id="features">
      <div className="features-content">
        <img src={featuresImg} alt="feature graphic" className="features-img" />
        <div className="features-text">
          <h2>Features</h2>
          <ul>
            <li>📍 SAVE DESTINATIONS - Drop pins anywhere! Mark your dream destinations, or places you've already been.</li>
            <li>🧠 AI PHOTO DETECTION - Seen a beautiful picture but don't know where it is? Upload a photo, get the location instantly.</li>
            <li>🏆 ACHIEVEMENTS & STATS - Track your goals, unlock badges, and remember your journey.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
