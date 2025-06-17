const Footer = () => {
  return (
    <section id="footer">
      <div className="footer-container">
        <div className="footer-column brand">
          <h3><span className="pin-icon">📍</span> <strong>Planit</strong></h3>
          <p>Your world, mapped. Every journey tells a story.</p>
        </div>

        <div className="footer-column">
          <h4>Product</h4>
          <ul>
            <li><a href="#">Features</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Mobile App</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Community</h4>
          <ul>
            <li><a href="#">Explore</a></li>
            <li><a href="#">Travel Stories</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Support</h4>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Privacy</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Planit. All rights reserved.</p>
      </div>
    </section>
  );
};

export default Footer;
