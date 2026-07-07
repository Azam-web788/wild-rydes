import React, { useState } from "react";
import "./Login.css";

function Login({ onSignIn }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success or error

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Simulate sign in - in production, connect to your backend
      if (!email || !password) {
        setMessageType("error");
        setMessage("📧 Please enter email and password");
        setLoading(false);
        return;
      }

      // Call your backend auth API here
      // For now, mock success
      setTimeout(() => {
        setMessageType("success");
        setMessage("✅ Sign in successful!");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("isAuthenticated", "true");
        onSignIn(email);
      }, 1000);
    } catch (err) {
      setMessageType("error");
      setMessage("❌ Sign in failed: " + err.message);
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!email || !password || !confirmPassword) {
        setMessageType("error");
        setMessage("📝 Please fill all fields");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setMessageType("error");
        setMessage("🔒 Passwords don't match");
        setLoading(false);
        return;
      }

      if (password.length < 8) {
        setMessageType("error");
        setMessage("🔒 Password must be at least 8 characters");
        setLoading(false);
        return;
      }

      // Call your backend auth API here
      // For now, mock success
      setTimeout(() => {
        setMessageType("success");
        setMessage("✅ Account created successfully!");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("isAuthenticated", "true");
        onSignIn(email);
      }, 1000);
    } catch (err) {
      setMessageType("error");
      setMessage("❌ Sign up failed: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-card">
          <div className="logo-large">🦄</div>
          <h1>Wild Rydes</h1>
          <p className="tagline">Book a magical unicorn ride in seconds!</p>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="form-input"
              />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="form-input"
                />
              </div>
            )}

            {message && (
              <div className={`message-box ${messageType}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="btn-auth"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner">🦄</span>
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                <>
                  <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                </>
              )}
            </button>
          </form>

          <div className="toggle-auth">
            <p>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage("");
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="toggle-btn"
                disabled={loading}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>

        <div className="login-decorations">
          <div className="deco-circle deco-1"></div>
          <div className="deco-circle deco-2"></div>
        </div>
      </div>
    </div>
  );
}

export default Login;
