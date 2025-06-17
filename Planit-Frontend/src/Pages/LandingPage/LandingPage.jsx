import LandingNavbar from './LandingNavbar';
import Hero from './Hero';
import AboutSection from './AboutSection';
import FeaturesSection from './FeaturesSection';
import CommunitySection from './CommunitySection';
import CTA from './CTA';
import Footer from './Footer';
import { useEffect } from "react";

const LandingPage = () => {
  useEffect(() => {
    document.body.className = "landing-body";
    return () => {
      document.body.className = "";
    };
  }, []);

  return (
    <>
      <div id="top" />
      <LandingNavbar />
      <Hero />
      <AboutSection />
      <FeaturesSection />
      <CommunitySection />
      <CTA />
      <Footer />
    </>
  );
};

export default LandingPage;