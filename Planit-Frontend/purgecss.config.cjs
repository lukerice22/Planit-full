module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  css: ["./src/app.css"],
  safelist: [
    /^hero$/,
    /^navbar$/,
    /^fadein$/,
    /^start-btn$/,
    /^signincolor$/,
    /^signupcolor$/,
    /^Graphic$/,
    /^community-/,
    /^footer-/
    // Add any other class name you see is being removed wrongly
  ],
  output: "./cleaned-css"
}