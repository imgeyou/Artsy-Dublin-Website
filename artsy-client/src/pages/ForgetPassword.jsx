import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import '../styles/pages/Login.css';
import logoImg from "../assets/images/logo.png";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError("");

    if (!email.trim()) {
      setFieldError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      const firebaseErrors = {
        "auth/user-not-found": "No account found with this email.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
      };
      setFieldError(firebaseErrors[err.code] || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="formSection">
          <div className="logoImg">
            <img src={logoImg} alt="logo" />
          </div>

          <h1 className="title">Reset your password</h1>
          <p className="subtitle">Enter your email and we'll send you a reset link</p>

          {success ? (
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <p style={{ color: "var(--color-green, #4caf50)", fontWeight: 600, marginBottom: "12px" }}>
                Reset email sent! Check your inbox.
              </p>
              <Link to="/login" className="signupLink">Back to Log In</Link>
            </div>
          ) : (
            <>
              <div className="formGroup">
                <label className="label">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldError(""); }}
                  className={`input${fieldError ? " input--error" : ""}`}
                />
                {fieldError && <p className="fieldError">{fieldError}</p>}
              </div>

              <button onClick={handleSubmit} className="signInBtn" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="signupText">
                Remember your password?{" "}
                <Link to="/login" className="signupLink">Log in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
