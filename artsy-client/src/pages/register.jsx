import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import '../styles/pages/register.css';
import registerImg from "../assets/images/register.jpeg";
import logoImg from "../assets/images/logo.png";

import { createUserWithEmailAndPassword, setPersistence, inMemoryPersistence } from "firebase/auth";
import { auth } from "../firebase";

const GENDER_OPTIONS = [
  { value: "1", label: "Male" },
  { value: "2", label: "Female" },
  { value: "3", label: "Non-binary" },
  { value: "4", label: "Prefer not to say" },
];

export default function Register() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const avatarInputRef = useRef(null);

  const [username, setUsername]         = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender]             = useState("");
  const [birthday, setBirthday]         = useState("");
  const [avatarFile, setAvatarFile]     = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selected, setSelected]         = useState(new Set());
  const [error, setError]               = useState("");
  const [genres, setGenres]             = useState([]);

  useEffect(() => {
    fetch("/ad-genres")
      .then((r) => r.json())
      .then((data) => setGenres(data))
      .catch(() => {});
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const toggleInterest = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    setError("");

    // if (!avatarFile) {
    //   setError("Please upload a profile photo.");
    //   return;
    // }
    // if (!gender) {
    //   setError("Please select your gender.");
    //   return;
    // }
    // if (!birthday) {
    //   setError("Please enter your date of birth.");
    //   return;
    // }

    await setPersistence(auth, inMemoryPersistence);
    let firebaseUser = null;
    let dbRegistered = false;

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = user;
      const idToken = await user.getIdToken();

      const formData = new FormData();
      formData.append("idToken", idToken);
      formData.append("userName", username);
      formData.append("gender", gender);
      formData.append("birthday", birthday);
      formData.append("interests", JSON.stringify([...selected]));
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await fetch("/ad-users/register", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const msg = await res.text();
        // If server returned an HTML error page, show a clean message
        if (msg.trim().startsWith("<")) {
          throw new Error(msg);
        }
        throw new Error(msg);
      }

      dbRegistered = true;

      const csrfRes = await fetch("/ad-auth/csrf-token", { credentials: "include" });
      const { csrfToken } = await csrfRes.json();
      const freshToken = await user.getIdToken();
      const sessionRes = await fetch("/ad-auth/sessionLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken: freshToken, csrfToken }),
      });
      if (!sessionRes.ok) throw new Error("session_failed");

      await refreshAuth();
      navigate("/");
    } catch (err) {
      if (firebaseUser && !dbRegistered) await firebaseUser.delete();
      const firebaseErrors = {
        "auth/email-already-in-use": "This email is already registered.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-email": "Invalid email address.",
      };
      setError(firebaseErrors[err.code] || err.message);
    }
  };

  return (
    <div className="page">
      <div className="card">
        {/* ── Left: Form ── */}
        <div className="formSection">
          <div className="logoImg">
            <img src={logoImg} alt="logo" />
          </div>
          <h1 className="title">Join Artsy Dublin</h1>
          <p className="subtitle">Explore the best events in Dublin</p>

          {/* Avatar upload */}
          <div className="avatarUpload" onClick={() => avatarInputRef.current.click()}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="preview" className="avatarPreview" />
            ) : (
              <div className="avatarPlaceholder">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b6b4c" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Upload photo</span>
              </div>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>

          {/* Username */}
          <div className="formGroup">
            <label className="label">Username</label>
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
            />
          </div>

          {/* Email */}
          <div className="formGroup">
            <label className="label">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>

          {/* Password */}
          <div className="formGroup">
            <label className="label">Password</label>
            <div className="passwordWrap">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input passwordInput"
              />
              <button type="button" className="eyeBtn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <span className="hint">At least 6 characters</span>
          </div>

          {/* Birthday + Gender row */}
          <div className="nameRow">
            <div className="formGroup">
              <label className="label">Date of birth</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="input"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="formGroup">
              <label className="label">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input"
              >
                <option value="">Select</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interests */}
          <div className="interestSection">
            <span className="interestLabel">What kind of events do you enjoy?</span>
            <div className="interestGrid">
              {genres.map(({ genreId, name }) => (
                <button
                  key={genreId}
                  type="button"
                  className={`interestBtn${selected.has(genreId) ? " selected" : ""}`}
                  onClick={() => toggleInterest(genreId)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="errorMsg">{error}</p>}

          <button onClick={handleSubmit} className="signUpBtn">
            Create Account
          </button>

          <p className="loginText">
            Already have an account?{" "}
            <a href="/login" className="loginLink">Log in</a>
          </p>
        </div>

        {/* ── Right: Artwork ── */}
        <div className="imageSection">
          <img src={registerImg} alt="Event picture" className="artwork" />
        </div>
      </div>
    </div>
  );
}

