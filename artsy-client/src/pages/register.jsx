import { useState } from "react";
import './Register.css';
import registerImg from "../assets/images/register.jpeg";   // reuse same image
import logoImg from "../assets/images/logo.png";

const INTERESTS = [
  { id: "film", label: "Film" },
  { id: "theatre", label: "Theatre" },
  { id: "exhibition", label: "Exhibition" },
  { id: "music", label: "Music" },
  { id: "dance",label: "Dance" },
  { id: "comedy", label: "Comedy" },
  { id: "opera", label: "Opera" },
  { id: "sculpture", label: "Sculpture" },
  { id: "photo", label: "Photography" },
  { id: "craft",  label: "Crafts" },
  { id: "book", label: "Book Club" },
  { id: "food", label: "Food Festival" },
];

export default function Register() {
  const [firstName, setFirstName]       = useState("");
  const [lastName, setLastName]         = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selected, setSelected]         = useState(new Set());

  const toggleInterest = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    console.log("Register:", { firstName, lastName, email, password, interests: [...selected] });
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
          <p className="subtitle">Log in and explore the best events in Dublin</p>

          {/* Name */}
          <div className="nameRow">
            <div className="formGroup">
              <label className="label">First Name</label>
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="input"
              />
            </div>
            <div className="formGroup">
              <label className="label">Last Name</label>
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Email */}
          <div className="formGroup">
            <label className="label">E-mail</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
                onChange={e => setPassword(e.target.value)}
                className="input passwordInput"
              />
              <button
                type="button"
                className="eyeBtn"
                onClick={() => setShowPassword(!showPassword)}
              >
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
            <span className="hint">Use a password with the more than 8 letters and numbers</span>
          </div>

          {/* Interests */}
          <div className="interestSection">
            <span className="interestLabel">
              What genre of activity you would like?
            </span>
            <div className="interestGrid">
              {INTERESTS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`interestBtn${selected.has(id) ? " selected" : ""}`}
                  onClick={() => toggleInterest(id)}
                >
                  <span className="interestIcon">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} className="signUpBtn">
            Register
          </button>

          <div className="divider">
            <span className="dividerLine" />
            <span className="dividerText">Or</span>
            <span className="dividerLine" />
          </div>

          <button className="socialBtn">
            <GoogleIcon />
            Register with Google
          </button>
          <button className="socialBtn socialBtnSecond">
            <FacebookIcon />
            Register with Facebook
          </button>

          <p className="loginText">
            Already had an account?{" "}
            <a href="/login" className="loginLink">Log in now</a>
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 8 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
      />
    </svg>
  );
}