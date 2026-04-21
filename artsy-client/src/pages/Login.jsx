import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import '../styles/pages/Login.css';

import loginImg from "../assets/images/login.png";
import logoImg from "../assets/images/logo.png";

//import backend api
//const API_BASE_URL = import.meta.env.VITE_API_URL;

import {
  signInWithEmailAndPassword,
  setPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    try {
      await setPersistence(auth, inMemoryPersistence);

      // 1. get CSRF token from server
      const csrfRes = await fetch(`/ad-auth/csrf-token`, {
        credentials: "include",
      });
      const { csrfToken } = await csrfRes.json();

      // 2. sign in with Firebase to get ID token: short-lived Firebase JWT
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const idToken = await userCredential.user.getIdToken();

      // 3. exchange ID token for a session cookie (lifesapn longer)
      const sessionRes = await fetch(`/ad-auth/sessionLogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken, csrfToken }),
      });
      if (!sessionRes.ok) throw new Error(sessionRes.status);

      await refreshAuth(); //update session cookie
      navigate("/"); //to homepage after login
    } catch (err) {
      const firebaseErrors = {
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        session_failed: "Login failed. Please try again.",
      };
      setError(
        firebaseErrors[err.code] ||
          firebaseErrors[err.message] ||
          "Login failed. Please try again.",
      );
    }
  };

  return (
    <div className="page">
      <div className="card">
        {/* Left: Form */}
        <div className="formSection">
          {/* Logo */}
          <div className="logoImg">
            <img src={logoImg}></img>
          </div>

          <h1 className="title">Welcome to Artsy Dublin</h1>
          <p className="subtitle">Find new activities to join</p>

          <div className="formGroup">
            <label className="label">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
              className={`input${fieldErrors.email ? " input--error" : ""}`}
            />
            {fieldErrors.email && <p className="fieldError">{fieldErrors.email}</p>}
          </div>

          <div className="formGroup">
            <label className="label">Password</label>
            <div className="passwordWrap">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Input your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
                className={`input passwordInput${fieldErrors.password ? " input--error" : ""}`}
              />
              <button
                type="button"
                className="eyeBtn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#999"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#999"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <div className="passwordMeta">
              <a href="/forget-password" className="forgotLink">
                Forgot Password?
              </a>
            </div>
            {fieldErrors.password && <p className="fieldError">{fieldErrors.password}</p>}
          </div>

          {error && <p className="errorMsg">{error}</p>}
          <button onClick={handleSubmit} className="signInBtn">
            Log In
          </button>

          <p className="signupText">
            Don't you have an account?{" "}
            <a href="/register" className="signupLink">
              Sign up
            </a>
          </p>
        </div>

        {/* Right: Artwork */}
        <div className="imageSection">
          <img src={loginImg} alt="Event picture" className="artwork" />
        </div>
      </div>
    </div>
  );
}

