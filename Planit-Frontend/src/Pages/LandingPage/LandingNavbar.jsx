function LandingNavbar() {
  return (
    <div className="navbar">
      <a href="#top" className="logo">Planit</a>
      <div className="nav-links">
        <a href="#about">About</a>
        <a href="#features">Features</a>
        <a href="#community">Community</a>
        <div className="nav-links auth">
          <a href="/signup" className="signupcolor">Get Started</a>
          <a href="/signin" className="signincolor">Sign in</a>
        </div>
      </div>
    </div>
  )
}
export default LandingNavbar
